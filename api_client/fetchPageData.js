import axios from 'axios';
import logger from '../logger.pino.js';

const API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS;
const API_BASE_URL = process.env.API_BASE_URL;

// Function to fetch page data from corresponding backend API endpoint
export async function fetchPageData(url, host, authToken) {
  logger.debug('Fetching page data from API', 'url', url, 'host', host, 'hasAuthToken', !!authToken);
  
  try {
    // Determine the API endpoint based on the URL
    // For example: /profile -> /api/profile
    const apiPath = url.startsWith('/api/') ? url : `/api${url}`;
    
    if (!API_SERVER_ADDRESS || !API_BASE_URL) {
      logger.warn('API configuration is incomplete for page data fetch', 'API_SERVER_ADDRESS', API_SERVER_ADDRESS, 'API_BASE_URL', API_BASE_URL, 'url', url);
    }
    
    const baseUrl = API_SERVER_ADDRESS+API_BASE_URL;
    
    const response = await axios.get(`http://${baseUrl}${apiPath}`, {
      headers: {
        'x-host': host,
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      }
    });
    
    logger.debug('Page data fetched successfully', 'url', url, 'apiPath', apiPath, 'dataSize', JSON.stringify(response.data).length);
    
    return response.data;
  } catch (error) {
    logger.error('Error fetching page data:', error.message);
    throw error;
  }
}