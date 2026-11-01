import logger from '../logger.pino.js';

const API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS;
const API_BASE_URL = process.env.API_BASE_URL;

// Function to forward general HTTP request to the backend API
export async function forwardRequest(method, url, body, host, authToken, originalHeaders) {
  logger.debug('Forwarding request to API', 'method', method, 'url', url, 'host', host, 'bodySize', JSON.stringify(body).length);
  
  try {
    const baseUrl = API_SERVER_ADDRESS+API_BASE_URL;
    
    if (!API_SERVER_ADDRESS || !API_BASE_URL) {
      logger.warn('API configuration is incomplete for request forwarding', 'API_SERVER_ADDRESS', API_SERVER_ADDRESS, 'API_BASE_URL', API_BASE_URL, 'url', url);
    }
    
    // Forward the request to the backend
    const apiUrl = url.startsWith('/api/') ? url : `/api${url}`;
    
    const response = await fetch(`http://${baseUrl}${apiUrl}`, {
      method: method.toLowerCase(),
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
    
    logger.debug('Request forwarded successfully', 'method', method, 'url', url, 'apiUrl', apiUrl, 'responseDataSize', JSON.stringify(data).length);
    
    return { data };
  } catch (error) {
    logger.error('Error forwarding request:', error.message);
    throw error;
  }
}