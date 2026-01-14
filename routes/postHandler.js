import logger from '../logger.pino.js';
import { forwardPostRequest } from '../api_client/forwardPostRequest.js';

// POST handler for forms and other methods
export const postHandler = async (req, res) => {
  try {
    logger.debug('Processing POST request', 'url', req.url, 'isPjax', !!req.headers['x-requested-with'], 'host', req.headers.host, 'bodySize', JSON.stringify(req.body).length);
    
    const requestedWith = req.headers['x-requested-with'];
    const isPjax = requestedWith && requestedWith.toLowerCase() === 'pjax';
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;
    
    const response = await forwardPostRequest(req.url, req.body, host, authToken, req.headers);
    
    if (isPjax) {
      // For PJAX requests, return the response as-is (usually JSON)
      res.json(response.data);
    } else {
      // For regular requests, redirect or return appropriate response
      if (response.headers.location) {
        res.redirect(response.headers.location);
      } else {
        res.json(response.data);
      }
    }
 } catch (error) {
    logger.error('POST * Request error', 'message', error.message, 'url', req.url, 'method', req.method, 'host', req.headers.host);
    res.status(500).json({ error: 'Internal server error' });
  }
};