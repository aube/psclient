/**
 * PJAX Navigation System
 * Client-side implementation for partial page loads with history management
 */

import {
  buildHbAttrMap,
  buildHbTextMap,
  updateHbTexts,
  updateHbAttrs
} from "/static/varsMap.js"

export class PJAXClient {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      selectors: ['a[href^="/"]:not([data-pjax-exclude])', 'form[data-pjax]'],
      containerSelectors: {},
      loadingClass: 'pjax-loading',
      errorClass: 'pjax-error',
      excludePatterns: [/^javascript:/, /^mailto:/, /^tel:/, /\/#/, /\.html$/],
      ...options
    };

    // State management
    this.isActive = false;
    this.isProcessing = false;
    this.currentUrl = window.location.href;
    this.abortController = null;
    this.requestId = 0;
    this.scrollSaveTimer = null;

    this.hbAttrMap = buildHbAttrMap();
    this.hbTextMap = buildHbTextMap();

    // Bind event handlers
    this.handleLinkClick = this.handleLinkClick.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handlePopState = this.handlePopState.bind(this);
    this.handleScroll = this.handleScroll.bind(this);

    // Initialize
    this.init();
  }

  /**
   * Initialize the PJAX system
   */
  init() {
    if (!this.supportsPJAX()) {
      console.warn('PJAX is not supported in this browser');
      return;
    }

    this.isActive = true;

    // PJAX restores scroll position itself
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Attach event listeners
    document.addEventListener('click', this.handleLinkClick);
    document.addEventListener('submit', this.handleFormSubmit);
    window.addEventListener('popstate', this.handlePopState);
    window.addEventListener('scroll', this.handleScroll, { passive: true });

    // Mark the initial entry as PJAX-managed without creating a duplicate
    window.history.replaceState(
      {
        url: window.location.href,
        scrollY: window.scrollY,
        timestamp: Date.now()
      },
      document.title,
      window.location.href
    );

    console.log('PJAX Client initialized');
  }

  /**
   * Check if the browser supports required features for PJAX
   */
  supportsPJAX() {
    return (
      window.history.pushState &&
      window.history.replaceState &&
      typeof window.history.state === 'object'
    );
  }

  /**
   * Handle link clicks
   */
  handleLinkClick(event) {
    // Skip if PJAX is inactive or processing
    if (!this.isActive || this.isProcessing) return;

    // Get the clicked element
    const target = event.target.closest('a');
    if (!target) return;

    // Check if it's an internal link and not excluded
    if (!this.shouldProcessLink(target)) return;

    event.preventDefault();
    this.navigate(target.href).catch(() => {});
  }

  /**
   * Handle form submissions
   */
  handleFormSubmit(event) {
    // Skip if PJAX is inactive or processing
    if (!this.isActive || this.isProcessing) return;

    const form = event.target;
    if (!form.matches('[data-pjax]')) return;

    event.preventDefault();
    this.submitForm(form).catch(() => {});
  }

  /**
   * Check if a link should be processed by PJAX
   */
  shouldProcessLink(link) {

    // Check if link has href
    if (!link.href) return false;

    // Check if it's an external link
    const url = new URL(link.href, window.location.origin);
    if (url.origin !== window.location.origin) return false;

    // Check exclusion patterns
    for (const pattern of this.config.excludePatterns) {
      if (pattern.test(link.href)) return false;        
    }

    // Check for data-pjax-exclude attribute
    if (link.hasAttribute('data-pjax-exclude')) return false;

    // Check if it's a download link
    if (link.hasAttribute('download')) return false;

    // Check if it's a link with special targets
    if (link.target && link.target !== '_self') return false;

    return true;
  }

  /**
   * Navigate to a new URL using PJAX
   */
  async navigate(url, options = {}) {
    const { historyMode = 'push', restoreScrollY = null } = options;
    const targetUrl = new URL(url, window.location.href).href;
    const isSameUrl = targetUrl === window.location.href;

    // Cancel any in-flight navigation so the latest one wins
    if (this.abortController) this.abortController.abort();
    const controller = new AbortController();
    this.abortController = controller;
    const requestId = ++this.requestId;

    try {
      this.isProcessing = true;
      this.setLoadingState(true);

      // Fetch the partial content
      const response = await this.fetchContent(targetUrl, {
        signal: controller.signal
      });
      const data = await response.json();

      // A newer navigation has started; discard this response
      if (requestId !== this.requestId) return;

      // Remember where the user was before leaving the current entry
      if (historyMode === 'push') {
        this.saveScrollPosition();
      }

      // Update the content
      this.updateContent(data, targetUrl);

      if (historyMode === 'push') {
        if (!isSameUrl) {
          this.pushHistoryState(targetUrl);
        }
        window.scrollTo(0, 0);
      } else {
        // popstate: the browser already changed the URL
        this.restoreScrollPosition(restoreScrollY);
      }

      // Reinitialize Petite-Vue in the updated content
      this.reinitializePetiteVue();

      // Сброс анимаций на обновленной странице
      if (window.AOS) {
        window.AOS.refreshHard();
      }
      
    } catch (error) {
      // Aborted or superseded navigation - ignore silently
      if (error.name === 'AbortError' || requestId !== this.requestId) return;

      console.error('PJAX navigation error:', error);
      this.handleError(error.message);
      throw error;
    } finally {
      if (requestId === this.requestId) {
        this.isProcessing = false;
        this.setLoadingState(false);
      }
    }
  }

  /**
   * Submit a form using PJAX
   */
  async submitForm(form) {
    const action = new URL(form.action || window.location.href, window.location.href).href;
    const method = (form.method || 'GET').toUpperCase();
    const trackHistory = form.hasAttribute('data-pjax-history');
    const isSameUrl = action === window.location.href;

    // Cancel any in-flight navigation so the latest one wins
    if (this.abortController) this.abortController.abort();
    const controller = new AbortController();
    this.abortController = controller;
    const requestId = ++this.requestId;

    try {
      this.isProcessing = true;
      this.setLoadingState(true);

      // Prepare form data
      const formData = new FormData(form);

      // Fetch the partial content
      const response = await this.fetchContent(action, {
        method,
        headers: {
          'X-Requested-With': 'partial'
        },
        body: method === 'POST' ? formData : undefined,
        signal: controller.signal
      });
      const data = await response.json();

      // A newer navigation has started; discard this response
      if (requestId !== this.requestId) return;

      // Remember where the user was before leaving the current entry
      if (trackHistory) {
        this.saveScrollPosition();
      }

      // Update the content
      this.updateContent(data, action);

      // Update browser history if the form has a data-pjax-history attribute
      if (trackHistory && !isSameUrl) {
        this.pushHistoryState(action);
        window.scrollTo(0, 0);
      }

      // Reinitialize Petite-Vue in the updated content
      this.reinitializePetiteVue();

    } catch (error) {
      // Aborted or superseded navigation - ignore silently
      if (error.name === 'AbortError' || requestId !== this.requestId) return;

      console.error('PJAX form submission error:', error);
      this.handleError(error.message);
      throw error;
    } finally {
      if (requestId === this.requestId) {
        this.isProcessing = false;
        this.setLoadingState(false);
      }
    }
  }

  /**
   * Fetch content from the server
   */
  async fetchContent(url, options = {}) {
    const fetchOptions = {
      ...options,
      headers: {
        'X-Requested-With': 'partial',
        ...options.headers
      }
    };

    return fetch(url, fetchOptions);
  }

  /**
   * Update page content with partial HTML
   */
  updateContent(data, url) {
    // Process each section in the response data
    for (const [sectionName, htmlContent] of Object.entries(data)) {
      if (sectionName === sectionName.toLocaleUpperCase()) {
        this.updateContainer(sectionName, htmlContent);
      }
    }
    
    updateHbTexts(this.hbTextMap, data)
    updateHbAttrs(this.hbAttrMap, data)

    // Update current URL
    this.currentUrl = url;
  }


  /**
  * Call script destructor function onDestroy
  */
  callDestructors(node) {

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    try {

      if (node.nodeName === "SCRIPT" && typeof node.onDestroy === "function") {
        node.onDestroy();
        return;
      }

      const oldScripts = node.querySelectorAll("script");
      oldScripts.forEach(script => {
        if (typeof script.onDestroy === "function") {
          script.onDestroy();
        }
      });
    } catch(e) {
      console.error('Error on call onDestroy()', e)
    }
  }

   /**
    * Update a specific container with new content
    */
   updateContainer(sectionName, htmlContent) {
     const startCommentPattern = `${sectionName}`;
     const endCommentPattern = `/${sectionName}`;
     
     // Find the start and end comment nodes in the current document
     const walker = document.createTreeWalker(
       document.body,
       NodeFilter.SHOW_COMMENT,
       {
         acceptNode: node => {
           if (node.textContent.trim() === startCommentPattern || node.textContent.trim() === endCommentPattern) {
             return NodeFilter.FILTER_ACCEPT;
           }
           return NodeFilter.FILTER_REJECT;
         }
       }
     );

     let startNode = null;
     let endNode = null;

     let node;
     while (node = walker.nextNode()) {
       if (node.textContent.trim() === startCommentPattern && !startNode) {
         startNode = node;
       } else if (node.textContent.trim() === endCommentPattern && startNode && !endNode) {
         endNode = node;
         break;
       }
     }

     if (!startNode || !endNode) {
       console.warn(`Could not find container for section: ${sectionName}`);
       return;
     }

     // Remove existing content between the comments
     let currentNode = startNode.nextSibling;
     while (currentNode && currentNode !== endNode) {
       this.callDestructors(currentNode)
       const nextNode = currentNode.nextSibling;
       currentNode.remove();
       currentNode = nextNode;
     }

     // Insert new content
     const tempDiv = document.createElement('div');
     tempDiv.innerHTML = htmlContent.trim();

     // При вставке через innerHTML скрипты блокируются брайзером.
     // Их надо пересоздать через createElement("script")
     const scripts = tempDiv.querySelectorAll("script");
     scripts.forEach(oldScript => {
       const newScript = document.createElement("script");
       
       // 1. Копируем код
       newScript.textContent = oldScript.textContent;
       
       // 2. Копируем атрибуты
       Array.from(oldScript.attributes).forEach(attr => {
         newScript.setAttribute(attr.name, attr.value);
       });
       
       // 3. Заменяем старый скрипт новым прямо внутри tempDiv
       oldScript.parentNode.replaceChild(newScript, oldScript);
     });

     // Insert the new content between the comments
     while (tempDiv.firstChild) {
       startNode.parentNode.insertBefore(tempDiv.firstChild, endNode);
     }
   }

  /**
   * Reinitialize Petite-Vue in the updated content areas
   */
  reinitializePetiteVue() {
    // If Petite-Vue is loaded, reinitialize it in the updated content
    if (window.PetiteVue) {
      try {
        // Find all elements that need Petite-Vue initialization
        const vueElements = document.querySelectorAll('[v-scope], [v-if], [v-for], [v-show], [v-model]');
        
        // Reinitialize Petite-Vue for each scope found in the updated content
        for (const el of vueElements) {
          if (el._petiteVueApp) {
            // If already initialized, unmount first
            el._petiteVueApp.unmount();
          }
          
          // Find the closest parent with v-scope or the element itself
          let scopeEl = el.closest('[v-scope]');
          if (!scopeEl && el.hasAttribute('v-scope')) {
            scopeEl = el;
          }
          
          if (scopeEl && !scopeEl._petiteVueApp) {
            // Initialize Petite-Vue for this scope
            const scopeData = scopeEl.getAttribute('v-scope');
            if (scopeData) {
              try {
                const scopeObj = eval(`(${scopeData})`);
                scopeEl._petiteVueApp = window.PetiteVue.createApp(scopeObj).mount(scopeEl);
              } catch (e) {
                console.error('Error initializing Petite-Vue scope:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error reinitializing Petite-Vue:', error);
      }
    }
  }

  /**
   * Handle browser back/forward buttons
   */
  async handlePopState(event) {
    if (!this.isActive) return;

    // The entry has already changed - do not overwrite the previous
    // entry's state with the scroll position of the page we are leaving
    clearTimeout(this.scrollSaveTimer);
    this.scrollSaveTimer = null;

    const state = event.state;
    const url = (state && state.url) || window.location.href;
    const restoreScrollY = state && typeof state.scrollY === 'number'
      ? state.scrollY
      : 0;

    try {
      // Do not push a new history entry: the browser already moved
      await this.navigate(url, { historyMode: 'none', restoreScrollY });
    } catch {
      // Keep URL and content in sync even if the partial request failed
      window.location.assign(url);
    }
  }

  /**
   * Track scroll position so Back/Forward can restore it
   */
  handleScroll() {
    if (!this.isActive) return;

    clearTimeout(this.scrollSaveTimer);
    this.scrollSaveTimer = setTimeout(() => {
      this.saveScrollPosition();
    }, 100);
  }

  /**
   * Persist the scroll position of the current history entry
   */
  saveScrollPosition() {
    const state = window.history.state || {};

    window.history.replaceState(
      {
        ...state,
        url: window.location.href,
        scrollY: window.scrollY,
        timestamp: state.timestamp || Date.now()
      },
      document.title,
      window.location.href
    );
  }

  /**
   * Restore scroll position after a popstate navigation
   */
  restoreScrollPosition(scrollY) {
    const target = Number.isFinite(scrollY) ? scrollY : 0;

    requestAnimationFrame(() => {
      window.scrollTo(0, target);
    });
  }

  /**
   * Add a new state to browser history
   */
  pushHistoryState(url) {
    const state = {
      url: url,
      scrollY: 0,
      timestamp: Date.now()
    };

    window.history.pushState(state, document.title, url);
  }

  /**
   * Set loading state UI
   */
  setLoadingState(isLoading) {
    if (isLoading) {
      document.body.classList.add(this.config.loadingClass);
    } else {
      document.body.classList.remove(this.config.loadingClass);
    }
  }

  /**
   * Handle errors during PJAX operations
   */
  handleError(message) {
    // Show error class on body temporarily
    document.body.classList.add(this.config.errorClass);
    
    // Log the error
    console.error('PJAX Error:', message);
    
    // Remove error class after delay
    setTimeout(() => {
      document.body.classList.remove(this.config.errorClass);
    }, 3000);
    
    // Optionally redirect to the full page if partial load fails
    // window.location.reload();
  }

  /**
   * Destroy the PJAX instance and clean up event listeners
   */
  destroy() {
    document.removeEventListener('click', this.handleLinkClick);
    document.removeEventListener('submit', this.handleFormSubmit);
    window.removeEventListener('popstate', this.handlePopState);
    window.removeEventListener('scroll', this.handleScroll);

    clearTimeout(this.scrollSaveTimer);
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    
    this.isActive = false;
    this.isProcessing = false;
    
    console.log('PJAX Client destroyed');
  }
}
