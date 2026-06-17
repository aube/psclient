import logger from '../logger.pino.js';
import { fetchSite } from '../api_client/fetchSite.js';
import { fetchURL } from '../api_client/fetchURL.js';
import { fetchTemplatesLast } from '../api_client/fetchTemplatesLast.js';
import { addHotReloadScript } from '../templates/addHotReloadScript.js';

import {
  buildLayoutHTML,
  injectSiteSettings,
  injectEntityTreeNodes,
  injectHTML,
  injectScriptsBody,
  injectStylesHead,
  renderHandlebarsTemplate,
  buildTemplatesTree,
} from '../templates/index.js'

const isDev = process.env.NODE_ENV === 'development'


async function fullLoad(req, res, site) {
  try {
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;

    logger.debug('fullLoad', 'url', req.url, 'host', host);

    const {ENTITY, CHILDREN} = await fetchURL(host, req.url, authToken);

    let htmlLayout = await buildLayoutHTML(host, site);
    htmlLayout = injectSiteSettings(htmlLayout, site.settings);

    const dynamicData = {
      settings: { ...site.settings},
      meta: { ...site.meta},
    }
    
    let entityTemplatesTree = await buildTemplatesTree(host, ENTITY, site)
    
    htmlLayout = injectHTML('ENTITY', htmlLayout, entityTemplatesTree.html)
    let finalHTML = await injectEntityTreeNodes(host, htmlLayout, entityTemplatesTree.nodes)
    
    finalHTML = renderHandlebarsTemplate(finalHTML, dynamicData);

    if (isDev) {
      // finalHTML += `<pre>${JSON.stringify(entityTemplatesTree.nodes, null, 2)}</pre>`
      // finalHTML += `<pre>${JSON.stringify(ENTITY.data.templates, null, 2)}</pre>`
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

async function partialLoad(req, res, site) {
  try {
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;

    logger.debug('Processing PJAX request', 'url', req.url, 'host', host);

    const content = await fetchURL(host, req.url, authToken);

    const dynamicData = {
      ...site.settings,
      ...site.meta,
      ...content.ENTITY.data,
    }

    let entityTemplatesTree = await buildTemplatesTree(host, content.ENTITY, site)

    let finalHTML = await injectEntityTreeNodes(host, entityTemplatesTree.html, entityTemplatesTree.nodes)
    
    finalHTML = renderHandlebarsTemplate(finalHTML, dynamicData );

    // TODO: оптимизация - отправлять данные по секциям/блокам,
    // клиент найдёт изменённые секции, блоки и обновит только их
    res.json({
      ENTITY:finalHTML
    });

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

  const host = req.headers.host;
  const {site, cookies} = await fetchSite(host);

  if (cookies) {
    res.setHeader('Set-Cookie', cookies);
  }

  const requestedWith = req.headers['x-requested-with'];
  const isPjax = requestedWith && requestedWith.toLowerCase() === 'partial';

  await fetchTemplatesLast(host);

  if (isPjax) {
    partialLoad(req, res, site)
  } else {
    fullLoad(req, res, site)
  }
};
