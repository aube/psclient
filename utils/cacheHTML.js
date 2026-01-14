import logger from '../logger.pino.js';

// Cache for HTML templates by domain
const htmlCache = new Map();

// Get cache TTL from environment variable (default 10 minutes)
const HTML_CACHE_TTL = parseInt(process.env.HTML_CACHE) || 10 * 60 * 1000; // 10 minutes in milliseconds

export function getHtmlTemplate(host) {
  const cacheKey = host;
  logger.debug('Checking HTML template in cache', 'host', host);
  
  const cached = htmlCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < HTML_CACHE_TTL) {
    logger.debug('HTML template found in cache', 'cacheKey', cacheKey);
    return cached.template;
  }
  
  logger.debug('HTML template not found in cache or expired', 'cacheKey', cacheKey);
  return ''; // Return empty string if not in cache or expired
}

export function setHtmlTemplate(host, template) {
  const cacheKey = host;
  htmlCache.set(cacheKey, {
    template,
    timestamp: Date.now()
  });
  
  logger.debug('HTML template stored in cache', 'cacheKey', cacheKey, 'templateLength', template.length);
}