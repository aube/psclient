import axios from 'axios';
import logger from '../logger.pino.js';
import {
  saveTemplates,
  getLastUpdatedTemplate,
} from '../utils/redisClient.js';

const API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS;
const API_BASE_URL = process.env.API_BASE_URL;


export async function fetchTemplatesShared() {
  try {
    const baseUrl = API_SERVER_ADDRESS + API_BASE_URL;
    const lastUpdatedTemplate = await getLastUpdatedTemplate("SHARED");
    const at = (new Date(lastUpdatedTemplate)).toISOString();

    const URL = `http://${baseUrl}/templates/shared/${at}`;
    logger.debug('api_client request', 'URL', URL);

    const response = await axios.get(URL);

    logger.debug('Templates fetched from API successfully');

    let templates = {}

    if (response.data) {
      templates = await saveTemplates('SHARED', response.data)
    }
    
    return templates;
  } catch (error) {
    throw error;
  }
}

export async function fetchTemplatesSite(host) {
  try {
    const baseUrl = API_SERVER_ADDRESS + API_BASE_URL;
    const lastUpdatedTemplate = await getLastUpdatedTemplate("SHARED");
    const at = (new Date(lastUpdatedTemplate)).toISOString();
    
    const URL = `http://${baseUrl}/templates/${host}/${at}`;
    logger.debug('api_client request', 'URL', URL);

    const response = await axios.get(URL, {
      headers: {
        'x-host': host,
      }
    });

    logger.debug('Templates fetched from API successfully', 'host', host);

    let templates = {}

    if (response.data) {
      templates = await saveTemplates(host, response.data)
    }
    
    return templates;
  } catch (error) {
    throw error;
  }
}