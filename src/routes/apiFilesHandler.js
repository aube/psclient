import { Readable } from 'stream';
import logger from '../logger.pino.js';

const API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS;

export const apiFilesHandler = async (req, res) => {
  try {
    const host = req.headers.host;

    logger.debug('Proxying static file request', 'url', req.url, 'host', host);

    const response = await fetch(`http://${API_SERVER_ADDRESS}${req.url}`, {
      method: 'GET',
      headers: {
        'x-host': host,
      },
    });

    if (!response.ok) {
      logger.error('Static file proxy error', 'url', req.url, 'status', response.status);
      res.status(response.status);
      res.send(await response.text());
      return;
    }

    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    res.status(response.status);
    Readable.fromWeb(response.body).pipe(res);
  } catch (error) {
    logger.error('Static file proxy error', 'message', error.message, 'url', req.url);
    res.status(502).send('Bad gateway');
  }
};
