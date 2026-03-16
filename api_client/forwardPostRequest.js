import logger from '../logger.pino.js';

const API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS;
const API_BASE_URL = process.env.API_BASE_URL;

// Function to forward POST request to the backend API
export async function forwardPostRequest(url, body, host, authToken, originalHeaders) {
  logger.debug('Forwarding POST request to API', 'url', url, 'host', host, 'bodySize', JSON.stringify(body).length);
  
  try {
    const baseUrl = API_SERVER_ADDRESS+API_BASE_URL;
    
    if (!API_SERVER_ADDRESS || !API_BASE_URL) {
      logger.warn('API configuration is incomplete for POST request', 'API_SERVER_ADDRESS', API_SERVER_ADDRESS, 'API_BASE_URL', API_BASE_URL, 'url', url);
    }
    
    // Forward the POST request to the backend
    const apiUrl = url.startsWith('/api/') ? url : `/api${url}`;
    
    const response = await fetch(`http://${baseUrl}${apiUrl}`, {
      method: 'post',
      body: body,
      headers: {
        'x-host': host,
        'Authorization': authToken ? `Bearer ${authToken}` : '',
        ...originalHeaders
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    logger.debug('POST request forwarded successfully', 'url', url, 'apiUrl', apiUrl, 'responseDataSize', JSON.stringify(data).length);
    
    return { data };
  } catch (error) {
    logger.error('Error forwarding POST request:', error.message);
    throw error;
  }
}