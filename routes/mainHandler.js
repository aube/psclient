import logger from '../logger.pino.js';
import { fetchSite } from '../api_client/fetchSite.js';
import { fetchURL } from '../api_client/fetchURL.js';
import { sendJSON } from '../api_client/sendJSON.js';
import { sendStringAsFile } from '../api_client/sendStringAsFile.js';
import { fetchTemplatesLast } from '../api_client/fetchTemplatesLast.js';
import { addHotReloadScript } from '../templates/addHotReloadScript.js';
import merge from 'lodash/merge.js'

import {
  TWCSS_HASH_KEY,
  TEMPLATESCSS_HASH_KEY,
  SITE_THEME_HASH_KEY,
} from "../const/index.js"

import {
  getLayout,
  injectENTITY,
  injectSnippets,
  injectSections,
  injectScriptsBody,
  injectStylesHead,
  renderURLContent,
  renderHandlebarsTemplate,
  buildTemplatesTree,
} from '../templates/index.js'

import {
  getString,
  setString,
  getStringCached,
  setStringCached,
  getHostTemplatesCSSClasses,
  getHostTemplatesCSS,
} from '../redis/index.js'

import {
  hashString,
} from '../utils/index.js'

import {
  TW_BASE_THEME,
  TW_DEFAULT_THEME,
  TW_CLASSES_SAFELIST,
  TW_BASE_CSS,
} from '../const/base.tailwind.js'

const TWCSS_SERVER_ADDRESS = process.env.TWCSS_SERVER_ADDRESS
const API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS
const isDev = process.env.NODE_ENV === 'development'


async function fullLoad(req, res, site) {
  try {
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;

    logger.debug('fullLoad', 'url', req.url, 'host', host);

    const {ENTITY, CHILDREN} = await fetchURL(host, req.url, authToken);

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
    }

    let entityTree = await buildTemplatesTree(host, ENTITY)
    
    let finalHTML = ''// await injectENTITY(host, htmlLayout, ENTITY, dynamicData)

    // finalHTML = await injectSnippets(host, finalHTML, dynamicData)
    
    finalHTML = renderHandlebarsTemplate(finalHTML, {
      ...dynamicData
    });

    if (isDev) {
      //finalHTML += `<pre>${JSON.stringify(dynamicData, null, 2)}</pre>`
      finalHTML += `<pre>${JSON.stringify(entityTree, null, 2)}</pre>`
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

    const renderedContent = await renderURLContent(host, content, dynamicData)

    res.json(renderedContent);

  } catch (error) {
    console.log(error)
    logger.error('GET * Request error', 'message', error.message, 'url', req.url, 'method', req.method, 'host', req.headers.host);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function cssTWRegenerate(host, theme = {}) {
  const templatesClasses = await getHostTemplatesCSSClasses(host);
  const hashKey = `templates:${host}:${TWCSS_HASH_KEY}`;
  
  const classes = [...templatesClasses, ...TW_CLASSES_SAFELIST()];
    
  theme = merge(TW_BASE_THEME(), TW_DEFAULT_THEME(), {extend: theme})

  const hash = hashString(classes.join(',') + JSON.stringify(theme) + TW_BASE_CSS())
  const currentHash = await getString(hashKey)
  
  if (hash != currentHash) {
    try {
      const twstyle = await sendJSON(`http://${TWCSS_SERVER_ADDRESS}/tw`, {
        classes,
        theme,
        css: TW_BASE_CSS(),
        safelist: TW_CLASSES_SAFELIST(),
        responseType: 'string',
      });
      
      if (twstyle.success) {
        await sendStringAsFile(
          `http://${API_SERVER_ADDRESS}/api/v1/upload/client`,
          twstyle.css,
          "twstyle.css",
          {
            headers: {
              'x-host': host,
            },
            mimeType: 'text/css',
          }
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

async function cssTemplatesRegenerate(host) {
  const styles = await getHostTemplatesCSS(host);
  const hashKey = `templates:${host}:${TEMPLATESCSS_HASH_KEY}`;

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
        "templates.css",
        {
          headers: {
            'x-host': host,
          },
          mimeType: 'text/css',
        }
      );

      await setString(hashKey, hash);
      return hash

    } catch (error) {
      logger.error('cssTemplatesRegenerate',
        'message', error.message,
      );
    }
  }
} 

async function isSiteThemeUpdated(host, site) {
  const theme = site.settings.theme || ""

  const hashKey = `templates:${host}:${SITE_THEME_HASH_KEY}`;
  const currentHash = await getString(hashKey);
  const hash = hashString(JSON.stringify(theme));

  if (hash != currentHash) {
    try {
      await setString(hashKey, hash);
      return true
    } catch (error) {
      logger.error('isSiteThemeUpdated',
        'message', error.message,
      );
    }
  }
  return false
}

export const mainHandler = async (req, res) => {
  if (req.path === '/health') {
    return;
  }
  if (res.writableEnded) {
    return
  }

  const host = req.headers.host;
  const site = await fetchSite(host);

  const requestedWith = req.headers['x-requested-with'];
  const isPjax = requestedWith && requestedWith.toLowerCase() === 'partial';

  const templatesUpdated = await fetchTemplatesLast(host);
  const siteThemeUpdated = await isSiteThemeUpdated(host, site);

  if (isPjax) {
    partialLoad(req, res, site)
  } else {

    if (templatesUpdated || siteThemeUpdated || isDev) {
      await cssTWRegenerate(host, site.settings.theme);
      await cssTemplatesRegenerate(host);
    }

    fullLoad(req, res, site)
  }
};
