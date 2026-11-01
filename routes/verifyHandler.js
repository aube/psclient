import logger from '../logger.pino.js';
import { fetchSite } from '../api_client/fetchSite.js';
import { addHotReloadScript } from '../templates/addHotReloadScript.js';

import {
  buildLayoutHTML,
  injectSiteSettings,
  injectHTML,
  handlebarsRender,
} from '../templates/index.js';

const isDev = process.env.NODE_ENV === 'development';
const SITE_NOT_FOUND_ADDRESS = process.env.SITE_NOT_FOUND_ADDRESS;

function getVerifyContainerHTML() {
  return `<div id="verify-app" class="card p-4">
  <p id="verify-status" role="status" aria-live="polite">Подтверждаем e-mail…</p>
</div>`;
}

async function verifyLoad(req, res, site) {
  try {
    const host = req.headers.host;

    logger.debug('verifyLoad', 'url', req.url, 'host', host);

    let htmlLayout = await buildLayoutHTML(host, site);
    htmlLayout = injectSiteSettings(htmlLayout, site.settings);

    const dynamicData = {
      ...site.settings,
      ...site.meta,
    };

    let finalHTML = await injectHTML('ENTITY', htmlLayout, getVerifyContainerHTML());

    finalHTML = handlebarsRender(finalHTML, {
      ...dynamicData,
    });

    if (isDev) {
      finalHTML = addHotReloadScript(finalHTML);
    }

    finalHTML = finalHTML.replace('</body>', '<script src="/static/verify.js" type="module"></script></body>');

    logger.debug(
      'Final HTML generated',
      'url', req.url,
      'htmlLength', finalHTML.length
    );

    res.setHeader('Content-Type', 'text/html');
    res.send(finalHTML);

  } catch (error) {
    console.log(error);
    logger.error('GET /verify error', 'message', error.message, 'url', req.url, 'method', req.method, 'host', req.headers.host);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const verifyHandler = async (req, res) => {
  if (res.writableEnded) {
    return;
  }

  const host = req.headers.host;
  let site, cookies;

  try {
    ({ site, cookies } = await fetchSite(host));
  } catch (error) {
    logger.error('GET /verify site error', 'message', error.message, 'host', host);
    res.redirect(SITE_NOT_FOUND_ADDRESS);
    return;
  }

  if (cookies) {
    res.setHeader('Set-Cookie', cookies);
  }

  verifyLoad(req, res, site);
};
