import axios from 'axios';
import logger from '../logger.pino.js';

const API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS;

// Function to fetch page data from corresponding backend API endpoint
export async function fetchPageData(url, host, authToken) {
  logger.debug('Fetching page data from API', 'url', url, 'host', host, 'hasAuthToken', !!authToken);
  
  try {    
    const baseUrl = API_SERVER_ADDRESS;
    
    const response = await axios.get(`http://${baseUrl}${url}`, {
      headers: {
        'x-host': host,
      }
    });
    
    logger.info(
      'Page data fetched successfully',
      'host', host,
      'url', url,
      'dataSize', JSON.stringify(response.data).length,
    );
    
    logger.debug(
      'Page data fetched successfully',
      'host', host,
      'url', url,
      'dataSize', JSON.stringify(response.data).length,
      "data", response.data
    );
    
    return response.data;
  } catch (error) {
    logger.error('Error fetching page data:', error.message);
    throw error;
  }
}