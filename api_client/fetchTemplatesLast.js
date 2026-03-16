import axios from 'axios';
import logger from '../logger.pino.js';
import {
  saveTemplates,
  getLastUpdatedTemplate,
} from '../redis/index.js';

const API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS;
const API_BASE_URL = process.env.API_BASE_URL;


function getAllClasses(html) {
  const classRegex = /\bclass=["']([^"']*)["']/g;
  const classes = new Set();
  let match;
  
  while ((match = classRegex.exec(html)) !== null) {
    match[1].split(/\s+/).forEach(cls => {
      if (cls) classes.add(cls);
    });
  }
  
  return [...classes];
}

export async function fetchTemplatesLast(host) {
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

    let templates = response.data

    if (templates) {
      templates.forEach(item => {
        item.data = JSON.parse(item.data || "{}")
        item.classes = getAllClasses(item.html || "")
      })
      await saveTemplates(host, templates)

      return true
    }
    
    return false
  } catch (error) {
    throw error;
  }
}