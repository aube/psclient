import axios from 'axios';
import logger from '../logger.pino.js';

const API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS;
const API_BASE_URL = process.env.API_BASE_URL;

export async function fetchSnippets(host) {
  try {
    const baseUrl = API_SERVER_ADDRESS+API_BASE_URL;
    
    if (!baseUrl) {
      logger.warn('API base URL is not configured properly', 'API_SERVER_ADDRESS', API_SERVER_ADDRESS, 'API_BASE_URL', API_BASE_URL);
      throw new Error('API base URL is not configured');
    }
    
    const URL = `http://${baseUrl}/site/${host}/templates`
    logger.debug('api_client request', 'URL', URL);

    const response = await axios.get(URL, {
      headers: {
        'x-host': host,
      }
    });
    const templates = response.data?.reduce((res, tpl) => {
      res[tpl.name] = tpl
      res[tpl.name].data = JSON.parse(tpl.data || "{}")
      return res
    }, {}) || {};

    logger.debug('Templates fetched from API successfully', 'host', host, "templates", templates);
    
    return templates;
  } catch (error) {
    throw error;
 }
}