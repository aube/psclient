import logger from '../logger.pino.js';
import { forwardRequest } from '../api_client/forwardRequest.js';

// PUT, DELETE, and other HTTP methods
export const allHandler = async (req, res) => {
  if (req.path === '/health') {
    return; // Не обрабатываем /health
  }
  if (res.writableEnded) {
    return
  }
  try {
    logger.debug(`Processing ${req.method} request`, { url: req.url, isPjax: !!req.headers['x-requested-with'], host: req.headers.host });
    
    const requestedWith = req.headers['x-requested-with'];
    const isPjax = requestedWith && requestedWith.toLowerCase() === 'pjax';
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;
    
    const response = await forwardRequest(req.method, req.url, req.body, host, authToken, req.headers);
    
    if (isPjax) {
      // For PJAX requests, return the response as-is (usually JSON)
      res.json(response.data);
    } else {
      // For regular requests, return the response
      res.json(response.data);
    }
  } catch (error) {
    logger.error('ALL * Request error', 'message', error.message, 'url', req.url, 'method', req.method, 'host', req.headers.host );
    res.status(500).json({ error: 'Internal server error' });
  }
};