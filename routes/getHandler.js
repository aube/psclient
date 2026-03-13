import logger from '../logger.pino.js';
import { fetchSite } from '../api_client/fetchSite.js';
import { fetchPageData } from '../api_client/fetchPageData.js';
import { addClientScript } from '../utils/addClientScript.js';
import { addHotReloadScript } from '../utils/addHotReloadScript.js';

import {
  getLayout,
  getSnippets,
  getRenderedSnippets,
  getRenderedPage,
  replacePartialSections,
} from '../templates/index.js'



async function firstLoad(req, res) {
  try {
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;

    logger.debug('firstLoad', 'url', req.url, 'host', host);

    const site = await fetchSite(host);
    const htmlLayout = await getLayout(site)

    const pageData = await fetchPageData(req.url, host, authToken);
    const renderedPagePartials = await getRenderedPage(pageData, htmlLayout);

    const snippets = await getSnippets(host);

    const renderedSnippetsPartials = await getRenderedSnippets(snippets, htmlLayout, site.settings);

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

  } catch (error) {
    console.log(error)
    logger.error('GET * Request error', 'message', error.message, 'url', req.url, 'method', req.method, 'host', req.headers.host);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function partialLoad(req, res) {
  try {
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;

    logger.debug('Processing GET request', 'url', req.url, 'isPjax', isPjax, 'host', host);

    const site = await fetchSite(host);
    const htmlLayout = await getLayout(site)

    const pageData = await fetchPageData(req.url, host, authToken);
    const renderedPagePartials = await getRenderedPage(pageData, htmlLayout);

    res.json(renderedPagePartials);

  } catch (error) {
    console.log(error)
    logger.error('GET * Request error', 'message', error.message, 'url', req.url, 'method', req.method, 'host', req.headers.host);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Main request handler
export const getHandler = async (req, res) => {
  if (req.path === '/health') {
    return;
  }
  if (res.writableEnded) {
    return
  }

  const requestedWith = req.headers['x-requested-with'];
  const isPjax = requestedWith && requestedWith.toLowerCase() === 'partial';

  if (isPjax) {
    partialLoad(req, res)
  } else {
    firstLoad(req, res)
  }
};
