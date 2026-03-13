import { createClient } from 'redis';
import logger from '../logger.pino.js';
export * from './templates.js'

const REDIS_SERVER_ADDRESS = process.env.REDIS_SERVER_ADDRESS;

let redisClient;

// Get Redis client instance
export function getRedisClient() {
  return redisClient;
}

// Initialize Redis client
export async function initRedis() {
  if (!redisClient && REDIS_SERVER_ADDRESS) {
    try {
      redisClient = createClient({
        url: REDIS_SERVER_ADDRESS
      });
      await redisClient.connect();
      const modules = await redisClient.info('modules');

      logger.info('Connected to Redis server',
        "config", { url: REDIS_SERVER_ADDRESS  },
        "modules", modules
      );
    } catch (error) {
      logger.error('Failed to connect to Redis', { error: error.message });
    }
  }
}
