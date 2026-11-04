import logger from '../logger.pino.js';
import { fetchSite } from '../api_client/fetchSite.js';
import { fetchPageEntity as fetchURL } from '../api_client/fetchURL.js';
import { addHotReloadScript } from '../templates/addHotReloadScript.js';
import { getTemplateByName } from '../redis/index.js';

import {
  buildLayoutHTML,
  buildPageHTML,
  injectSiteSettings,
  injectHTML,
  handlebarsRender,
  buildChildrenHTML,
  renderLayoutTree,
} from '../templates/index.js'

const isDev = process.env.NODE_ENV === 'development'
const SITE_NOT_FOUND_ADDRESS = process.env.SITE_NOT_FOUND_ADDRESS;
const CLIENT_LOGIN_PATH = '/client/login';

function isProtectedClientPath(path) {
  return (path === '/client' || path.startsWith('/client/'))
    && path !== CLIENT_LOGIN_PATH;
}

async function buildEntityHTML(host, ENTITY, dynamicData, CHILDREN) {
  const layoutHtml = await buildPageHTML(host, ENTITY)

  let html = await renderLayoutTree(layoutHtml, {
    getTemplate: (name) => getTemplateByName(host, name),
    templatesData: ENTITY.data?.template2 || {},
    globalData: dynamicData,
    domain: host,
  })

  if (html.includes('%CHILDREN%')) {
    const childrenHTML = await buildChildrenHTML(host, CHILDREN, dynamicData)
    html = html.replaceAll('%CHILDREN%', childrenHTML)
  }

  return html
}


async function fullLoad(req, res, site) {
  try {
    const authToken = req.cookies.auth_token;
    const clientToken = req.cookies.client_token;
    const host = req.headers.host;

    logger.debug('fullLoad', 'url', req.url, 'host', host);

    const {ENTITY, CHILDREN, statusCode} = await fetchURL(host, req.url, authToken, clientToken);

    if (statusCode === 403 && isProtectedClientPath(req.path)) {
      return res.redirect(CLIENT_LOGIN_PATH);
    }

    let htmlLayout = await buildLayoutHTML(host, site, { url: ENTITY.url });

    htmlLayout = injectSiteSettings(htmlLayout, {
      ...site.settings,
      siteUuid: site.uuid,
      chatClientEnabled: Boolean(clientToken),
    });

    const dynamicData = {
      settings: { ...site.settings},
      meta: { ...site.meta},
      url: ENTITY.url
    }

    const entityHTML = await buildEntityHTML(host, ENTITY, dynamicData, CHILDREN)

    htmlLayout = injectHTML('ENTITY', htmlLayout, entityHTML)

    let finalHTML = handlebarsRender(htmlLayout, dynamicData, 2, host);

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

    res.status(statusCode || 200);
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
    const clientToken = req.cookies.client_token;
    const host = req.headers.host;

    logger.debug('Processing PJAX request', 'url', req.url, 'host', host);

    const {ENTITY, CHILDREN, statusCode} = await fetchURL(host, req.url, authToken, clientToken);

    if (statusCode === 403 && isProtectedClientPath(req.path)) {
      return res.status(200).json({ redirect: CLIENT_LOGIN_PATH });
    }

    const dynamicData = {
      settings: { ...site.settings},
      meta: { ...site.meta},
      ...ENTITY.data,
      url: ENTITY.url
    }

    let finalHTML = await buildEntityHTML(host, ENTITY, dynamicData, CHILDREN)

    finalHTML = handlebarsRender(finalHTML, dynamicData, 2, host);

    res.status(statusCode || 200);

    // TODO: оптимизация - отправлять данные по секциям/блокам,
    // клиент найдёт изменённые секции, блоки и обновит только их
    res.json({
      ENTITY: finalHTML,
      ...(statusCode ? { statusCode: statusCode } : {}),
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
  let site, cookies
  try {
    ({site, cookies} = await fetchSite(host));
  } catch(e) {
    // res.status(404)
    res.redirect(SITE_NOT_FOUND_ADDRESS)
    return
  }

  if (cookies) {
    res.setHeader('Set-Cookie', cookies);
  }

  const requestedWith = req.headers['x-requested-with'];
  const isPjax = requestedWith && requestedWith.toLowerCase() === 'partial';

  if (isPjax) {
    partialLoad(req, res, site)
  } else {
    fullLoad(req, res, site)
  }

};
