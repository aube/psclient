import axios from 'axios';
import logger from '../logger.pino.js';
import {
  saveTemplates,
  getLastUpdatedTemplate,
} from '../redis/index.js';

const API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS;
const API_BASE_URL = process.env.API_BASE_URL;


export async function fetchTemplates(host) {
  try {
    const baseUrl = API_SERVER_ADDRESS + API_BASE_URL;
    const at = await getLastUpdatedTemplate(host);
    
    const URL = `http://${baseUrl}/templates/${host}/${at}`;
    logger.debug('api_client request', 'URL', URL);

    let options = {}
    if (host !== "SHARED") {
      options.headers = {
        'x-host': host,
      }
    }

    const response = await axios.get(URL, options);

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