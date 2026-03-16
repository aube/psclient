import logger from '../logger.pino.js';

const API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS;

// Function to fetch page data from corresponding backend API endpoint
export async function fetchURL(host, url, authToken) {
  logger.debug('Fetching page data from API',
    'url', url,
    'host', host,
    'hasAuthToken', !!authToken
  );
  
  try {
    const baseUrl = API_SERVER_ADDRESS;
    
    const response = await fetch(`http://${baseUrl}${url}`, {
      headers: {
        'x-host': host,
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    logger.info(
      'Page data fetched successfully',
      'host', host,
      'url', url,
      'dataSize', JSON.stringify(data).length,
    );
    
    logger.debug(
      'Page data fetched successfully',
      'host', host,
      'url', url,
      'dataSize', JSON.stringify(data).length,
      "data", data
    );
    
    return data;
  } catch (error) {
    logger.error('Error fetching page data:', error.message);
    throw error;
  }
}