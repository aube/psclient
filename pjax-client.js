/**
 * PJAX Navigation System
 * Client-side implementation for partial page loads with history management
 */

class PJAXClient {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      selectors: ['a[href^="/"]:not([data-pjax-exclude])', 'form[data-pjax]'],
      containerSelectors: {},
      loadingClass: 'pjax-loading',
      errorClass: 'pjax-error',
      excludePatterns: [/^javascript:/, /^mailto:/, /^tel:/],
      ...options
    };

    // State management
    this.isActive = false;
    this.isProcessing = false;
    this.currentUrl = window.location.href;

    // Bind event handlers
    this.handleLinkClick = this.handleLinkClick.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handlePopState = this.handlePopState.bind(this);

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
    
    // Attach event listeners
    document.addEventListener('click', this.handleLinkClick);
    document.addEventListener('submit', this.handleFormSubmit);
    window.addEventListener('popstate', this.handlePopState);

    // Initial setup
    this.addHistoryState(window.location.href, document.title);
    
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
    this.navigate(target.href);
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
    this.submitForm(form);
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
  async navigate(url) {
    if (this.isProcessing) return;

    try {
      this.isProcessing = true;
      this.setLoadingState(true);

      // Fetch the partial content
      const response = await this.fetchContent(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update the content
      this.updateContent(data, url);
      
      // Update browser history
      this.addHistoryState(url, data.title || '');
      
      // Reinitialize Petite-Vue in the updated content
      this.reinitializePetiteVue();
      
    } catch (error) {
      console.error('PJAX navigation error:', error);
      this.handleError(error.message);
    } finally {
      this.isProcessing = false;
      this.setLoadingState(false);
    }
  }

  /**
   * Submit a form using PJAX
   */
  async submitForm(form) {
    if (this.isProcessing) return;

    try {
      this.isProcessing = true;
      this.setLoadingState(true);

      // Prepare form data
      const formData = new FormData(form);
      const action = form.action || window.location.href;
      const method = (form.method || 'GET').toUpperCase();

      // Fetch the partial content
      const response = await this.fetchContent(action, {
        method,
        headers: {
          'X-Requested-With': 'partial'
        },
        body: method === 'POST' ? formData : undefined
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update the content
      this.updateContent(data, action);
      
      // Update browser history if the form has a data-pjax-history attribute
      if (form.hasAttribute('data-pjax-history')) {
        this.addHistoryState(action, data.title || '');
      }
      
      // Reinitialize Petite-Vue in the updated content
      this.reinitializePetiteVue();
      
    } catch (error) {
      console.error('PJAX form submission error:', error);
      this.handleError(error.message);
    } finally {
      this.isProcessing = false;
      this.setLoadingState(false);
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
      if (sectionName !== 'title' && htmlContent) { // Skip title field
        this.updateContainer(sectionName, htmlContent);
      }
    }

    // Update page title if provided
    if (data.title) {
      document.title = data.title;
    }

    // Update current URL
    this.currentUrl = url;
  }

   /**
    * Update a specific container with new content
    */
   updateContainer(sectionName, htmlContent) {
     // Use the same comment pattern as the server: <!-- pjax-start: ${sectionName} --> and <!-- pjax-end: ${sectionName} -->
     const startCommentPattern = `<!-- pjax-start: ${sectionName} -->`;
     const endCommentPattern = `<!-- pjax-end: ${sectionName} -->`;

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
       const nextNode = currentNode.nextSibling;
       currentNode.remove();
       currentNode = nextNode;
     }

     // Insert new content
     const tempDiv = document.createElement('div');
     tempDiv.innerHTML = htmlContent.trim();

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
  handlePopState(event) {
    if (!this.isActive || this.isProcessing) return;

    const state = event.state;
    if (state && state.url) {
      // We don't want to make another request for popstate events
      // since the content should already be in the browser cache
      // Just update the current URL
      this.currentUrl = state.url;
    }
  }

  /**
   * Add a new state to browser history
   */
  addHistoryState(url, title) {
    const state = {
      url: url,
      timestamp: Date.now()
    };
    
    window.history.pushState(state, title, url);
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
    
    this.isActive = false;
    this.isProcessing = false;
    
    console.log('PJAX Client destroyed');
  }
}

// Auto-initialize if the script is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Allow customization via data attributes on the script tag or global config
  const config = window.PJAX_CONFIG || {};
  
  // Create the PJAX client instance
  window.PJAX = new PJAXClient(config);
});

// Export for module systems (if applicable)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PJAXClient;
}