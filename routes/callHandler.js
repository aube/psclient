import logger from '../logger.pino.js';
import { fetchSite } from '../api_client/fetchSite.js';
import { addHotReloadScript } from '../templates/addHotReloadScript.js';
import {
  buildLayoutHTML,
  injectSiteSettings,
  injectHTML,
  renderHandlebarsTemplate,
} from '../templates/index.js';

const isDev = process.env.NODE_ENV === 'development';

function getCallContainerHTML(uuid) {
  return `<div id="app" data-call-uuid="${uuid}"></div>`;
}

async function callLoad(req, res, site) {
  try {
    const host = req.headers.host;
    const { uuid } = req.params;

    logger.debug('callLoad', 'url', req.url, 'host', host, 'uuid', uuid);

    let htmlLayout = await buildLayoutHTML(host, site);
    htmlLayout = injectSiteSettings(htmlLayout, site.settings);

    const dynamicData = {
      ...site.settings,
      ...site.meta,
    };

    let finalHTML = await injectHTML('ENTITY', htmlLayout, getCallContainerHTML(uuid));

    finalHTML = renderHandlebarsTemplate(finalHTML, {
      ...dynamicData,
    });

    const config = JSON.stringify({ uuid }).replace(/</g, '\\u003C');
    finalHTML = finalHTML.replace('</head>', `<script>window.__CALL_CONFIG = ${config};<\/script></head>`);

    finalHTML = finalHTML.replace('</body>', '<script src="/static/call.js" type="module"></script></body>');

    if (isDev) {
      finalHTML = addHotReloadScript(finalHTML);
    }

    logger.debug(
      'Final HTML generated',
      'url', req.url,
      'htmlLength', finalHTML.length
    );

    res.setHeader('Content-Type', 'text/html');
    res.send(finalHTML);

  } catch (error) {
    console.log(error);
    logger.error('GET /call/:uuid error', 'message', error.message, 'url', req.url, 'method', req.method, 'host', req.headers.host);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const callHandler = async (req, res) => {
  if (res.writableEnded) {
    return;
  }

  const host = req.headers.host;
  const { site, cookies } = await fetchSite(host);

  if (cookies) {
    res.setHeader('Set-Cookie', cookies);
  }

  callLoad(req, res, site);
};
