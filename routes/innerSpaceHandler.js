import fs from 'fs/promises';
import logger from '../logger.pino.js';
import { fetchSite } from '../api_client/fetchSite.js';
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


async function getInnerHTMLLayout() {
  const files = await fs.readdir('./static/inner-space');
  const fileName = files.find(name => name.startsWith('index-'));
  if (!fileName) return '';

  return `<div id="app"></div>
  <script type="module" src="/static/inner-space/${fileName}"></script>`;
}


async function innerSpaceLoad(req, res, site) {
  try {
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;

    logger.debug('innerSpaceLoad', 'url', req.url, 'host', host);

    let htmlLayout = await buildLayoutHTML(host, site);
    htmlLayout = injectSiteSettings(htmlLayout, site.settings);

    const dynamicData = {
      ...site.settings,
      ...site.meta,
    }

    let finalHTML = await injectHTML('ENTITY', htmlLayout, await getInnerHTMLLayout())
    
    finalHTML = renderHandlebarsTemplate(finalHTML, {
      ...dynamicData
    });

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



export const innerSpaceHandler = async (req, res) => {
  if (res.writableEnded) {
    return
  }

  const host = req.headers.host;
  const {site, cookies} = await fetchSite(host);

  if (cookies) {
    res.setHeader('Set-Cookie', cookies);
  }

  innerSpaceLoad(req, res, site)
};