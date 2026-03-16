import logger from '../logger.pino.js';

import {
  getSite,
  getLastSiteRequestTime,
  setSite,
  setLastSiteRequestTime,
} from '../redis/index.js';


const API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS;
const API_BASE_URL = process.env.API_BASE_URL;
const API_CACHE_TTL_SECOUNDS = process.env.API_CACHE_TTL_SECOUNDS;

export async function fetchSite(host) {
  try {
    let site = null
    const baseUrl = API_SERVER_ADDRESS+API_BASE_URL;

    const lastRequestTime = await getLastSiteRequestTime(host);
    if (API_CACHE_TTL_SECOUNDS * 1000 + lastRequestTime > Date.now()) {
      site = await getSite(host);
      if (site) {
        return site;
      }
    }
    
    const URL = `http://${baseUrl}/site/${host}/html`
    logger.debug('api_client request', 'URL', URL);

    const response = await fetch(URL, {
      headers: {
        'x-host': host,
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    site = await response.json();

    if (site) {
      try {
        site.data = JSON.parse(site.data)
      } catch(e) {
        site.data = {}
      }
      try {
        site.meta = JSON.parse(site.meta)
      } catch(e) {
        site.meta = {}
      }

      await setSite(host, site);
      await setLastSiteRequestTime(host);
    }

    logger.info('Site fetched from API successfully', 'host', host, "site", site);
    
    return site;
  } catch (error) {
    throw error;
 }
}