import fs from 'fs/promises';
import fsOrig from 'fs';
import express from 'express';
import logger from './logger.pino.js';
import { healthHandler } from './routes/healthHandler.js';
import { hotReloadHandler, broadcastReloadEvent, connections } from './routes/hotReloadHandler.js';
import { mainHandler } from './routes/mainHandler.js';
import { initRedis, flushDb } from './redis/index.js';
import { fetchTemplatesLast } from './api_client/fetchTemplatesLast.js';

// прочие методы, пока не используются
// import { otherHandler, postHandler } from './routes/otherHandler.js';

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

  logger.debug("Server configuration",
    "PORT", process.env.PORT,
    "API_SERVER_ADDRESS", process.env.API_SERVER_ADDRESS,
    "API_BASE_URL", process.env.API_BASE_URL
  )
  logger.debug("Hot reload enabled");

  // Constants
  PORT = process.env.PORT || 9000
  API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS
  API_BASE_URL = process.env.API_BASE_URL

  if (!API_SERVER_ADDRESS || !API_BASE_URL) {
    logger.warn('API base URL is not configured properly',
      'API_SERVER_ADDRESS', API_SERVER_ADDRESS,
      'API_BASE_URL', API_BASE_URL
    );
    throw new Error('API ADDRESS is not configured');
  }

}

// Initialize Redis connection
await initialize().catch(logger.error);

await initRedis();

await flushDb();

await fetchTemplatesLast("SHARED");

const app = express();

// Middleware для логирования запросов
app.use((req, res, next) => {
  if (
    req.path === "/health"
    || req.path === "/hot-reload"
    || req.path.startsWith("/static")
  ) {
    next();
    return;
  }

  logger.debug("Request start", "Method", req.method, "URL", req.url, "ip", req.ip, "userAgent", req.get('User-Agent'), "contentType", req.get('Content-Type'));
  
  // Логируем время выполнения запроса
 const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.debug("Request finish", "Method", req.method, "URL", req.url, "code", res.statusCode, "duration", duration + 'ms', "ip", req.ip, "userAgent", req.get('User-Agent'));
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

// Serve static files from ./static directory
app.use('/static', express.static('./static'));

// Hot Reload functionality is now handled in routes/hotReload.js
// Import the connections set from the hotReload module

// Watch for file changes in common directories
function setupFileWatcher() {
 const watchPaths = ['./static', '.'];
  
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
      logger.debug('Watching for changes', 'path', watchPath);
    }
  });
}

// Initialize file watcher
setupFileWatcher();

// SSE endpoint for hot reload
app.get('/hot-reload', hotReloadHandler);

// Health check endpoint
app.get('/health', healthHandler);

// Main request handler
app.get('*', mainHandler);


// POST handler for forms and other methods
// app.post('*', postHandler);
// PUT, DELETE, and other HTTP methods
// app.all('*', otherHandler);


// Use the PORT constant
app.listen(PORT, () => {
  logger.debug(`Proxy server listening at http://localhost:${PORT}`);
});
