import fs from 'fs/promises';
import fsOrig from 'fs';
import express from 'express';
import logger from './logger.pino.js';
import { healthHandler } from './routes/health.js';
import { hotReloadHandler, broadcastReloadEvent, connections } from './routes/hotReload.js';
import { getHandler } from './routes/getHandler.js';
import { postHandler } from './routes/postHandler.js';
import { allHandler } from './routes/allHandler.js';

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

  logger.info("Server configuration",
    "PORT", process.env.PORT,
    "API_SERVER_ADDRESS", process.env.API_SERVER_ADDRESS,
    "API_BASE_URL", process.env.API_BASE_URL
  )
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
  if (req.path === "/health" || req.path === "/hot-reload") {
    return;
  }

  logger.info("Request start", "Method", req.method, "URL", req.url, "ip", req.ip, "userAgent", req.get('User-Agent'), "contentType", req.get('Content-Type'));
  
  // Логируем время выполнения запроса
 const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info("Request finish", "Method", req.method, "URL", req.url, "code", res.statusCode, "duration", duration + 'ms', "ip", req.ip, "userAgent", req.get('User-Agent'));
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

// Hot Reload functionality is now handled in routes/hotReload.js
// Import the connections set from the hotReload module

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
      logger.info('Watching for changes', 'path', watchPath);
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
app.get('*', getHandler);

// POST handler for forms and other methods
// app.post('*', postHandler);

// PUT, DELETE, and other HTTP methods
// app.all('*', allHandler);


// Use the PORT constant
app.listen(PORT, () => {
  logger.info(`Proxy server listening at http://localhost:${PORT}`);
});
