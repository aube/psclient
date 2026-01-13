import fs from 'fs/promises';
import fsOrig from 'fs';
import path from 'path';
import express from 'express';
import axios from 'axios';
import Handlebars from 'handlebars';
import dotenv from 'dotenv';
import logger from './logger.js';

// Initialize environment and constants
let packageJson;
let PORT, API_SERVER_ADDRESS, API_BASE_URL;

async function initialize() {
  try {
    packageJson = await fs.readFile('./package.json', 'utf-8').then(JSON.parse);
  } catch (error) {
    logger.error('Error reading package.json:', error.message);
    process.exit(1);
  }

  const isProduction = process.env.NODE_ENV === 'production'
  dotenv.config({ path: isProduction ? '.env' : '.env.local' })

  logger.info("PORT", process.env.PORT)
  logger.info("API_SERVER_ADDRESS", process.env.API_SERVER_ADDRESS)
  logger.info("API_BASE_URL", process.env.API_BASE_URL)
 logger.info("Hot reload enabled");

  // Constants
  PORT = process.env.PORT || 9000
  API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS
 API_BASE_URL = process.env.API_BASE_URL
}

await initialize().catch(logger.error);

const app = express();

// Middleware для логирования запросов
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type')
  });
  
  // Логируем время выполнения запроса
 const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
 });
  
  next();
});

// Parse cookies
app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = {};
  
  if (cookieHeader) {
    const cookies = cookieHeader.split(';');
    cookies.forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        req.cookies[name] = value;
      }
    });
  }
  
  next();
});

// Cache for HTML templates by domain
const htmlCache = new Map();

// Get cache TTL from environment variable (default 10 minutes)
const HTML_CACHE_TTL = parseInt(process.env.HTML_CACHE) || 10 * 60 * 1000; // 10 minutes in milliseconds

// Hot Reload functionality
const connections = new Set();

// SSE endpoint for hot reload
app.get('/hot-reload', (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Send initial connection event
  res.write(`data: connected\n\n`);

  // Add connection to the set
  connections.add(res);

  // Remove connection when client disconnects
  req.on('close', () => {
    connections.delete(res);
  });
});

// Function to broadcast reload event to all connected clients
function broadcastReloadEvent() {
  logger.info('Detected file change, broadcasting reload event...');
  connections.forEach(connection => {
    try {
      connection.write(`data: reload\n\n`);
    } catch (error) {
      // Remove connection if sending failed (client disconnected)
      connections.delete(connection);
    }
  });
}

// Watch for file changes in common directories
function setupFileWatcher() {
 const watchPaths = ['./views', './public', './templates', '.'];
  
  watchPaths.forEach(watchPath => {
    if (fsOrig.existsSync(watchPath)) {
      fsOrig.watch(watchPath, { recursive: true }, (eventType, filename) => {
        if (eventType === 'change' || eventType === 'rename') {
          // Filter out temporary files and irrelevant changes
          if (!filename.endsWith('~') && !filename.startsWith('.')) {
            broadcastReloadEvent();
          }
        }
      });
      logger.info(`Watching for changes in: ${watchPath}`);
    }
  });
}

// Initialize file watcher
setupFileWatcher();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: "ok",
    service: packageJson.name,
    timestamp: Date.now()
  });
  return;
});
// Function to get cached HTML template or fetch it
async function getCachedHtmlTemplate(host, authToken) {
  const cacheKey = host;
  logger.debug('Fetching HTML template from cache or API', { host, hasAuthToken: !!authToken });
  
  const cached = htmlCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < HTML_CACHE_TTL) {
    return cached.template;
  }
  try {
    const baseUrl = API_SERVER_ADDRESS+API_BASE_URL;
    
    if (!baseUrl) {
      logger.warn('API base URL is not configured properly', { API_SERVER_ADDRESS, API_BASE_URL });
      throw new Error('API base URL is not configured');
    }
    
    
    // Fetch HTML template from backend's /api/html endpoint
    const response = await axios.get(`http://${baseUrl}/api/html`, {
      headers: {
        'x-host': host,
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      }
    });
    
    const template = response.data;
    
    // Store in cache
    htmlCache.set(cacheKey, {
      template,
      timestamp: Date.now()
    });
    
    logger.debug('HTML template fetched and cached successfully', { cacheKey, templateLength: template.length });
    
    return template;
  } catch (error) {
    logger.error('Error fetching HTML template:', error.message);
    throw error;
  }
}

// Function to fetch page data from corresponding backend API endpoint
async function fetchPageData(url, host, authToken) {
  logger.debug('Fetching page data from API', { url, host, hasAuthToken: !!authToken });
  
  try {
    // Determine the API endpoint based on the URL
    // For example: /profile -> /api/profile
    const apiPath = url.startsWith('/api/') ? url : `/api${url}`;
    
    if (!API_SERVER_ADDRESS || !API_BASE_URL) {
      logger.warn('API configuration is incomplete for page data fetch', { API_SERVER_ADDRESS, API_BASE_URL, url });
    }
    
    const baseUrl = API_SERVER_ADDRESS+API_BASE_URL;
    
    const response = await axios.get(`http://${baseUrl}${apiPath}`, {
      headers: {
        'x-host': host,
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      }
    });
    
    logger.debug('Page data fetched successfully', { url, apiPath, dataSize: JSON.stringify(response.data).length });
    
    return response.data;
  } catch (error) {
    logger.error('Error fetching page data:', error.message);
    throw error;
  }
}

// Function to extract partial sections from HTML template
function extractPartialSections(htmlTemplate) {
  const sections = {};
  const regex = /<!--\s*pjax-start:\s*(\w+)\s*-->([\s\S]*?)<!--\s*pjax-end:\s*\1\s*-->/g;
  let match;
  
  while ((match = regex.exec(htmlTemplate)) !== null) {
    const sectionName = match[1];
    const sectionContent = match[2];
    sections[sectionName] = sectionContent;
  }
  
  return sections;
}

// Function to render Handlebars templates
function renderHandlebarsTemplate(templateString, data) {
  const template = Handlebars.compile(templateString);
  return template(data);
}

// Function to replace partial sections in HTML template
function replacePartialSections(htmlTemplate, partials) {
  let result = htmlTemplate;
  
  for (const [sectionName, content] of Object.entries(partials)) {
    const startComment = `<!-- pjax-start: ${sectionName} -->`;
    const endComment = `<!-- pjax-end: ${sectionName} -->`;
    
    const regex = new RegExp(
      `${startComment}[\\s\\S]*?${endComment}`,
      'g'
    );
    
    result = result.replace(regex, `${startComment}${content}${endComment}`);
  }
  
  return result;
}

// Main request handler
app.get('*', async (req, res) => {
  if (req.path === '/health') {
    return; // Не обрабатываем /health
  }
  if (res.writableEnded) {
    return
  }
  try {
    logger.debug('Processing GET request', { url: req.url, isPjax: !!req.headers['x-requested-with'], host: req.headers.host });
    
    const requestedWith = req.headers['x-requested-with'];
    const isPjax = requestedWith && requestedWith.toLowerCase() === 'pjax';
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;
    
    // Fetch the main HTML template
    const htmlTemplate = await getCachedHtmlTemplate(host, authToken);
    
    // Fetch page data from corresponding backend API endpoint
    const pageData = await fetchPageData(req.url, host, authToken);
    
    // Extract partial sections from HTML template
    const partialSections = extractPartialSections(htmlTemplate);
    
    // Prepare partials by rendering each section with page data
    const renderedPartials = {};
    for (const [sectionName, sectionTemplate] of Object.entries(partialSections)) {
      renderedPartials[sectionName] = renderHandlebarsTemplate(sectionTemplate, pageData);
    }
    
    if (isPjax) {
      // For PJAX requests, return JSON with rendered partial content
      res.json(renderedPartials);
    } else {
      // For regular requests, render the full HTML with partials inserted
      const finalHtml = replacePartialSections(htmlTemplate, renderedPartials);
      
      logger.debug('Final HTML generated', { url: req.url, partialCount: Object.keys(renderedPartials).length, htmlLength: finalHtml.length });
      
      // Inject hot reload script if not in production
      if (process.env.NODE_ENV !== 'production') {
        const hotReloadScript = `
          <script>
            // Hot Reload Client Script
            const eventSource = new EventSource('/hot-reload');
            
            eventSource.onmessage = function(event) {
              if (event.data === 'connected') {
                console.log('Hot reload connected');
              } else if (event.data === 'reload') {
                console.log('File changed, reloading...');
                eventSource.close();
                window.location.reload();
              }
            };
            
            eventSource.onerror = function(event) {
              console.log('Hot reload connection error:', event);
            };
          </script>`;
        
        // Inject the script before the closing body tag
        const finalHtmlWithScript = finalHtml.includes('</body>')
          ? finalHtml.replace('</body>', hotReloadScript + '</body>')
          : finalHtml + hotReloadScript;
          
        res.setHeader('Content-Type', 'text/html');
        res.send(finalHtmlWithScript);
      } else {
        res.setHeader('Content-Type', 'text/html');
        res.send(finalHtml);
      }
    }
  } catch (error) {
    logger.error('Request error:', error.message, { url: req.url, method: req.method, host: req.headers.host });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST handler for forms and other methods
app.post('*', async (req, res) => {
  try {
    logger.debug('Processing POST request', { url: req.url, isPjax: !!req.headers['x-requested-with'], host: req.headers.host, bodySize: JSON.stringify(req.body).length });
    
    const requestedWith = req.headers['x-requested-with'];
    const isPjax = requestedWith && requestedWith.toLowerCase() === 'pjax';
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;
    
    const baseUrl = API_SERVER_ADDRESS+API_BASE_URL;
    
    // Forward the POST request to the backend
    const apiUrl = req.url.startsWith('/api/') ? req.url : `/api${req.url}`;
    
    const response = await axios({
      method: 'post',
      url: `http://${baseUrl}${apiUrl}`,
      data: req.body,
      headers: {
        'x-host': host,
        'Authorization': authToken ? `Bearer ${authToken}` : '',
        ...req.headers
      }
    });
    
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
    logger.error('POST request error:', error.message, { url: req.url, method: req.method, host: req.headers.host });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT, DELETE, and other HTTP methods
app.all('*', async (req, res) => {
  if (res.writableEnded) {
    return
  }
  try {
    logger.debug(`Processing ${req.method} request`, { url: req.url, isPjax: !!req.headers['x-requested-with'], host: req.headers.host });
    
    const requestedWith = req.headers['x-requested-with'];
    const isPjax = requestedWith && requestedWith.toLowerCase() === 'pjax';
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;
    
    const baseUrl = API_SERVER_ADDRESS+API_BASE_URL;
    
    // Forward the request to the backend
    const apiUrl = req.url.startsWith('/api/') ? req.url : `/api${req.url}`;
    
    const response = await axios({
      method: req.method.toLowerCase(),
      url: `http://${baseUrl}${apiUrl}`,
      data: req.body,
      headers: {
        'x-host': host,
        'Authorization': authToken ? `Bearer ${authToken}` : '',
        ...req.headers
      }
    });
    
    if (isPjax) {
      // For PJAX requests, return the response as-is (usually JSON)
      res.json(response.data);
    } else {
      // For regular requests, return the response
      res.json(response.data);
    }
  } catch (error) {
    logger.error(`${req.method} request error:`, error.message, { url: req.url, method: req.method, host: req.headers.host });
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Use the PORT constant
app.listen(PORT, () => {
  logger.info(`Proxy server listening at http://localhost:${PORT}`);
});