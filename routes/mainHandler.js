import logger from '../logger.pino.js';
import { fetchSite } from '../api_client/fetchSite.js';
import { fetchURL } from '../api_client/fetchURL.js';
import { fetchTemplatesLast } from '../api_client/fetchTemplatesLast.js';
import { addClientScript } from '../utils/addClientScript.js';
import { addHotReloadScript } from '../utils/addHotReloadScript.js';

import {
  getLayout,
  injectURLContent,
  injectSnippets,
  renderURLContent,
} from '../templates/index.js'




async function fullLoad(req, res) {
  try {
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;

    logger.debug('fullLoad', 'url', req.url, 'host', host);

    const site = await fetchSite(host);
    const content = await fetchURL(host, req.url, authToken);

    const htmlLayout = await getLayout(host, site);

    const dynamicData = {
      ...site.settings,
      ...site.meta,
      ...content.ENTITY.data,
    }

    let finalHTML = htmlLayout

    finalHTML = await injectURLContent(host, finalHTML, content, dynamicData)

    finalHTML = await injectSnippets(host, finalHTML, dynamicData)

    finalHTML = addClientScript(finalHTML)
    
    if (process.env.NODE_ENV !== 'production') {
      finalHTML = addHotReloadScript(finalHTML)
    }

    logger.debug(
      'Final HTML generated',
      'url', req.url,
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

    logger.debug('Processing PJAX request', 'url', req.url, 'host', host);

    const site = await fetchSite(host);
    const content = await fetchURL(host, req.url, authToken);

    const dynamicData = {
      ...site.settings,
      ...site.meta,
      ...content.ENTITY.data,
    }

    const renderedContent = await renderURLContent(host, content, dynamicData)

    res.json(renderedContent);

  } catch (error) {
    console.log(error)
    logger.error('GET * Request error', 'message', error.message, 'url', req.url, 'method', req.method, 'host', req.headers.host);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const mainHandler = async (req, res) => {
  if (req.path === '/health') {
    return;
  }
  if (res.writableEnded) {
    return
  }

  const requestedWith = req.headers['x-requested-with'];
  const isPjax = requestedWith && requestedWith.toLowerCase() === 'partial';

  const host = req.headers.host;
  await fetchTemplatesLast(host);

  if (isPjax) {
    partialLoad(req, res)
  } else {
    fullLoad(req, res)
  }
};
