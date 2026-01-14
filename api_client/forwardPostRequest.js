import axios from 'axios';
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
    
    const response = await axios({
      method: 'post',
      url: `http://${baseUrl}${apiUrl}`,
      data: body,
      headers: {
        'x-host': host,
        'Authorization': authToken ? `Bearer ${authToken}` : '',
        ...originalHeaders
      }
    });
    
    logger.debug('POST request forwarded successfully', 'url', url, 'apiUrl', apiUrl, 'responseDataSize', JSON.stringify(response.data).length);
    
    return response;
  } catch (error) {
    logger.error('Error forwarding POST request:', error.message);
    throw error;
  }
}