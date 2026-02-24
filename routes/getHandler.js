import Handlebars from 'handlebars';
import logger from '../logger.pino.js';
// import { getHtmlLayout, setHtmlLayout } from '../utils/cacheHTML.js';
// import { fetchHtmlLayout } from '../api_client/fetchHtmlLayout.js';
import { fetchSite } from '../api_client/fetchSite.js';
import { fetchSnippets } from '../api_client/fetchSnippets.js';
import { fetchPageData } from '../api_client/fetchPageData.js';


// [{NAME}] => <!--NAME--><!--/NAME-->
function updateDynamicIncludes(template) {
  return template.replace(/\[{([^\]]+)}\]/g, '<!--$1--><!--/$1-->');
}

// Function to get cached HTML template or fetch it
async function getCachedHtmlLayout(host) {
  const cacheKey = host;
  
  // First try to get from cache
  let template = getHtmlLayout(host);

  // If not in cache, fetch from API
  if (template === '') {
    try {
      template = await fetchHtmlLayout(host);
      
      setHtmlLayout(host, template);
      
    } catch (error) {
      logger.error('Error fetching HTML ' + host, error.message);
      throw error;
    }
  }
  
  // Вернулась какая-то хрень вместо строки
  if (typeof template !== 'string') return "wrong template"

  logger.debug('HTML template', 'template', template);

  return template ? updateDynamicIncludes(template) : "empty template";
}

async function getSite(host) {
  const cacheKey = host;
  
  let site = ""
    try {
      site = await fetchSite(host);
    } catch (error) {
      logger.error('Error fetching HTML ' + host, error.message);
      throw error;
    }
  
  logger.debug('getSite', 'site', site);

  return site
}

async function getSnippets(host) {
  const cacheKey = host;
  
  let snippets = {}
    try {
      snippets = await fetchSnippets(host);
    } catch (error) {
      logger.error('Error fetching HTML ' + host, error.message);
      throw error;
    }
  
  logger.debug('getSnippets', 'snippets', snippets);

  return snippets
}

function replacePartialSections(name, htmlLayout, partialHTML) {
  const regex = new RegExp(`<!--${name}-->.*<!--/${name}-->`, 'gs');
  const resultStriong = `<!--${name}-->${partialHTML}<!--/${name}-->`
  return htmlLayout.replace(regex, resultStriong);
}

// Function to render Handlebars templates
function renderHandlebarsTemplate(templateString, data) {
  const template = Handlebars.compile(templateString);
  const result = template(data)

  logger.debug(
    'Render Handlebars Template',
    'templateString', templateString,
    'data', data,
    'result', result
  );

 return result;
}

function addHotReloadScript(finalHTML) {
  const hotReloadScript = `
    <script>
      // Hot Reload Client Script
      const eventSource = new EventSource('/hot-reload');
      
      eventSource.onmessage = function(event) {
        if (event.data === 'connected') {
          console.log('Hot reload connected');
        } else if (event.data === 'reload') {
          console.log('File changed, reloading...');
          eventSource.close();
          window.location.reload();
        }
      };
      
      eventSource.onerror = function(event) {
        console.log('Hot reload connection error:', event);
      };
    </script>`;
  
  // Inject the script before the closing body tag
  finalHTML = finalHTML.includes('</body>')
    ? finalHTML.replace('</body>', hotReloadScript + '</body>')
    : finalHTML + hotReloadScript;

  return finalHTML
}

// Main request handler
export const getHandler = async (req, res) => {
  if (req.path === '/health') {
    return; // Не обрабатываем /health
  }
  if (res.writableEnded) {
    return
  }
  try {
      logger.debug('Processing GET request', 'url', req.url, 'isPjax', !!req.headers['x-requested-with'], 'host', req.headers.host);
    
    const requestedWith = req.headers['x-requested-with'];
    const isPjax = requestedWith && requestedWith.toLowerCase() === 'pjax';
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;
    
    // Fetch the main HTML template
    // const htmlLayout = await getCachedHtmlLayout(host, authToken);

    const snippets = await getSnippets(host);
    const site = await getSite(host);
    site.settings = site.settings ? JSON.parse(site.settings) : {}
    let htmlLayout = site?.html ? site.html : "empty template";

    if (site?.html) {
      let layoutData = {
        settings: site.settings,
        meta: site.meta ? JSON.parse(site.meta) : {},
        entity: {},
      }
      htmlLayout = updateDynamicIncludes(htmlLayout)
      htmlLayout = renderHandlebarsTemplate(htmlLayout, layoutData)
      htmlLayout += "<pre>" + JSON.stringify(layoutData, null, 2) + "</pre>"
    }

    // Fetch page data from corresponding backend API endpoint
    const pageData = await fetchPageData(req.url, host, authToken);
    

    // Тут нужно сделать рендер сниппетов с данными страницы
    // Тут нужно сделать рендер сниппетов с данными страницы
    // Тут нужно сделать рендер сниппетов с данными страницы
    // Тут нужно сделать рендер сниппетов с данными страницы
    // Тут нужно сделать рендер сниппетов с данными страницы
    const renderedPartials = {};
    for (const [sectionName, section] of Object.entries(snippets)) {
      if (htmlLayout.includes(`<!--${sectionName}-->`)) {
        renderedPartials[sectionName] = renderHandlebarsTemplate(section.html, {
          ...section.data,
          settings: {
            ...site.settings,
            ...(section.data.settings || {})
          }
        });
      }
    }
    for (const [sectionName, section] of Object.entries(pageData)) {
      if (htmlLayout.includes(`<!--${sectionName}-->`)) {
        renderedPartials[sectionName] = renderHandlebarsTemplate(section.html, section);
      }
    }

    if (isPjax) {
      // For PJAX requests, return JSON with rendered partial content
      res.json(renderedPartials);
    } else {
      // For regular requests, render the full HTML with partials inserted
      let finalHTML = htmlLayout

      for (const [sectionName, HTML] of Object.entries(snippets)) {
        finalHTML = replacePartialSections(sectionName, finalHTML, renderedPartials[sectionName] || HTML);
      }

      for (const [sectionName, HTML] of Object.entries(pageData)) {
        finalHTML = replacePartialSections(sectionName, finalHTML, renderedPartials[sectionName] || HTML);
      }

      if (process.env.NODE_ENV !== 'production') {
        finalHTML = addHotReloadScript(finalHTML)
      }

      logger.debug(
        'Final HTML generated',
        'url', req.url,
        'partialCount', Object.keys(renderedPartials).length,
        'htmlLength', finalHTML.length
      );
      res.setHeader('Content-Type', 'text/html');
      res.send(finalHTML);
    }

  } catch (error) {
    logger.error('GET * Request error', 'message', error.message, 'url', req.url, 'method', req.method, 'host', req.headers.host);
    res.status(500).json({ error: 'Internal server error' });
  }
};