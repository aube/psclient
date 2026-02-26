import Handlebars from 'handlebars';
import logger from '../logger.pino.js';
// import { getHtmlLayout, setHtmlLayout } from '../utils/cacheHTML.js';
// import { fetchHtmlLayout } from '../api_client/fetchHtmlLayout.js';
import { fetchSite } from '../api_client/fetchSite.js';
import { fetchSnippets } from '../api_client/fetchSnippets.js';
import { fetchPageData } from '../api_client/fetchPageData.js';
import { addClientScript } from '../utils/addClientScript.js';
import { addHotReloadScript } from '../utils/addHotReloadScript.js';
import { wrapHbVars } from '../static/wrapHbVars.js';

// [{NAME}] => <!--NAME--><!--/NAME-->
function updateDynamicIncludes(htmlLayout) {
  return htmlLayout.replace(/\[{([^\]]+)}\]/g, '<!--$1--><!--/$1-->');
}

function replacePartialSections(name, htmlLayout, partialHTML) {
  const regex = new RegExp(`<!--${name}-->.*<!--/${name}-->`, 'gs');
  const resultString = `<!--${name}-->${partialHTML}<!--/${name}-->`
  return htmlLayout.replace(regex, resultString);
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

async function getLayout(site) {
  site.settings = site.settings ? JSON.parse(site.settings) : {}
  let htmlLayout = site?.html ? site.html : "empty template";

  if (site?.html) {
    let layoutData = {
      settings: site.settings,
      meta: site.meta ? JSON.parse(site.meta) : {},
      entity: {},
    }
    htmlLayout = updateDynamicIncludes(htmlLayout)
    htmlLayout = wrapHbVars(htmlLayout)
    htmlLayout = renderHandlebarsTemplate(htmlLayout, layoutData)
    htmlLayout += "<pre>" + JSON.stringify(layoutData, null, 2) + "</pre>"
  }
  return htmlLayout
} 

async function getSnippets(host) {
  const snippets = await fetchSnippets(host);

  for (const [snippetName, snippet] of Object.entries(snippets)) {
    snippets[snippetName] = {
      ...snippet,
      html: wrapHbVars(snippet.html),
    }
  }
  return snippets
} 

async function getRenderedSnippets(snippets, htmlLayout, siteSettings) {
  const renderedPartials = {};
  for (const [sectionName, section] of Object.entries(snippets)) {
    if (htmlLayout.includes(`<!--${sectionName}-->`)) {
      renderedPartials[sectionName] = renderHandlebarsTemplate(section.html, {
        ...section.data,
        settings: {
          ...siteSettings,
          ...(section.data.settings || {})
        }
      });
    }
  }
  return renderedPartials
}

async function getRenderedPage(pageData, htmlLayout) {
  const renderedPartials = {};
  for (const [sectionName, section] of Object.entries(pageData)) {
    if (htmlLayout.includes(`<!--${sectionName}-->`)) {
      const data = {
        ...section,
        ...JSON.parse(section.data),
        data: null,
      }
      renderedPartials[sectionName] = renderHandlebarsTemplate(section.template, data);
    }
  }
  return renderedPartials
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
    const requestedWith = req.headers['x-requested-with'];
    const isPjax = requestedWith && requestedWith.toLowerCase() === 'partial';
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;

    logger.debug('Processing GET request', 'url', req.url, 'isPjax', isPjax, 'host', host);

    const site = await fetchSite(host);
    const htmlLayout = await getLayout(site)

    const pageData = await fetchPageData(req.url, host, authToken);
    const renderedPagePartials = await getRenderedPage(pageData, htmlLayout);


    if (isPjax) {
      // For PJAX requests, return JSON with rendered partial content
      res.json(renderedPagePartials);
    } else {
      
      const snippets = await getSnippets(host);

      const renderedSnippetsPartials = await getRenderedSnippets(snippets, htmlLayout, site.settings);

      // For regular requests, render the full HTML with partials inserted
      let finalHTML = htmlLayout

      for (const [sectionName, HTML] of Object.entries(snippets)) {
        finalHTML = replacePartialSections(sectionName, finalHTML, renderedSnippetsPartials[sectionName] || HTML);
      }

      for (const [sectionName, HTML] of Object.entries(pageData)) {
        finalHTML = replacePartialSections(sectionName, finalHTML, renderedPagePartials[sectionName] || HTML);
      }

      finalHTML = addClientScript(finalHTML)
      
      if (process.env.NODE_ENV !== 'production') {
        finalHTML = addHotReloadScript(finalHTML)
      }

      logger.debug(
        'Final HTML generated',
        'url', req.url,
        'pagePartialsCount', Object.keys(renderedPagePartials).length,
        'snippetsPartialsCount', Object.keys(renderedSnippetsPartials).length,
        'htmlLength', finalHTML.length
      );
      res.setHeader('Content-Type', 'text/html');
      res.send(finalHTML);
    }

  } catch (error) {
    console.log(error)
    logger.error('GET * Request error', 'message', error.message, 'url', req.url, 'method', req.method, 'host', req.headers.host);
    res.status(500).json({ error: 'Internal server error' });
  }
};
