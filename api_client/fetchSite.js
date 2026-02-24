import axios from 'axios';
import logger from '../logger.pino.js';

const API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS;
const API_BASE_URL = process.env.API_BASE_URL;

export async function fetchSite(host) {
  try {
    const baseUrl = API_SERVER_ADDRESS+API_BASE_URL;
    
    if (!baseUrl) {
      logger.warn('API base URL is not configured properly', 'API_SERVER_ADDRESS', API_SERVER_ADDRESS, 'API_BASE_URL', API_BASE_URL);
      throw new Error('API base URL is not configured');
    }
    
    const URL = `http://${baseUrl}/site/${host}/html`
    logger.debug('api_client request', 'URL', URL);

    const response = await axios.get(URL, {
      headers: {
        'x-host': host,
      }
    });
    const site = response.data;

    logger.debug('Site fetched from API successfully', 'host', host, "site", site);
    
    return site;
  } catch (error) {
    throw error;
 }
}