import logger from '../logger.pino.js';
import { fetchSite } from '../api_client/fetchSite.js';
import { fetchURL } from '../api_client/fetchURL.js';
import { sendJSON } from '../api_client/sendJSON.js';
import { sendStringAsFile } from '../api_client/sendStringAsFile.js';
import { fetchTemplatesLast } from '../api_client/fetchTemplatesLast.js';
import { addHotReloadScript } from '../templates/addHotReloadScript.js';
import { TWCSS_HASH_KEY, STYLECSS_HASH_KEY } from "../const/index.js"

import {
  getLayout,
  injectURLContent,
  injectSnippets,
  injectScriptsBody,
  injectStylesHead,
  renderURLContent,
} from '../templates/index.js'

import {
  getString,
  setString,
  getStringCached,
  setStringCached,
  getHostCSSClasses,
  getHostCSSStyles,
} from '../redis/index.js'

import {
  hashString,
} from '../utils/index.js'


const TWCSS_SERVER_ADDRESS = process.env.TWCSS_SERVER_ADDRESS
const API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS

async function fullLoad(req, res) {
  try {
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;

    logger.debug('fullLoad', 'url', req.url, 'host', host);

    const site = await fetchSite(host);

    const content = await fetchURL(host, req.url, authToken);

    let htmlLayout = await getStringCached(`layouts:${host}`);

    if (!htmlLayout) {
      htmlLayout = await getLayout(host, site);

      htmlLayout = injectScriptsBody(htmlLayout)

      htmlLayout = await injectStylesHead(host, htmlLayout)

      await setStringCached(`layouts:${host}`, htmlLayout);
    }

    const dynamicData = {
      ...site.settings,
      ...site.meta,
      ...content.ENTITY.data,
    }

    let finalHTML = htmlLayout

    finalHTML = await injectURLContent(host, finalHTML, content, dynamicData)

    finalHTML = await injectSnippets(host, finalHTML, dynamicData)

    if (process.env.NODE_ENV !== 'production') {
      finalHTML += `
      <pre>${JSON.stringify(dynamicData, null, 2)}</pre>
      `
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

async function cssTWRegenerate(host) {
  const classes = await getHostCSSClasses(host);
  const hashKey = `templates:${host}:${TWCSS_HASH_KEY}`;

  if (!classes.length) {
    await setString(hashKey, '');
    return
  } 
  
  const hash = hashString(classes.join(','))
  const currentHash = await getString(hashKey)

  if (hash != currentHash) {
    try {
      const twstyle = await sendJSON(`http://${TWCSS_SERVER_ADDRESS}/tw`, {
        classes,
        responseType: 'string',
      });

      if (twstyle.success) {
        await sendStringAsFile(
          `http://${API_SERVER_ADDRESS}/api/v1/upload/client`,
          twstyle.css,
          "twstyle.css",
          {headers: {
            'x-host': host,
          }}
        );
  
        await setString(hashKey, hash);
        return hash
      }

    } catch (error) {
      logger.error('cssTWRegenerate',
        'message', error.message,
      );
    }
  }
} 

async function cssStylesRegenerate(host) {
  const styles = await getHostCSSStyles(host);
  const hashKey = `templates:${host}:${STYLECSS_HASH_KEY}`;

if (!styles.length) {
  await setString(hashKey, '');
  return
} 

  const currentHash = await getString(hashKey)
  const CSS = styles.join('\n');
  const hash = hashString(CSS);

  if (hash != currentHash) {
    try {
      await sendStringAsFile(
        `http://${API_SERVER_ADDRESS}/api/v1/upload/client`,
        CSS,
        "style.css",
        {headers: {
          'x-host': host,
        }}
      );

      await setString(hashKey, hash);
      return hash

    } catch (error) {
      logger.error('cssStylesRegenerate',
        'message', error.message,
      );
    }
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
  const templatesUpdated = await fetchTemplatesLast(host);

  if (isPjax) {
    partialLoad(req, res)
  } else {

    if (templatesUpdated) {
      await cssTWRegenerate(host);
      await cssStylesRegenerate(host);
    }

    fullLoad(req, res)
  }
};
