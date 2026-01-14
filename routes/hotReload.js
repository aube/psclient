import logger from '../logger.pino.js';

// Hot Reload functionality
const connections = new Set();

// Function to broadcast reload event to all connected clients
export function broadcastReloadEvent() {
  logger.info('Detected file change', 'broadcasting', 'reload event');
  connections.forEach(connection => {
    try {
      connection.write(`data: reload\n\n`);
    } catch (error) {
      // Remove connection if sending failed (client disconnected)
      connections.delete(connection);
    }
  });
}

// SSE endpoint for hot reload
export const hotReloadHandler = (req, res) => {
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
};

export { connections };