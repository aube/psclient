import { createClient } from 'redis';
import logger from '../logger.pino.js';

const REDIS_SERVER_ADDRESS = process.env.REDIS_SERVER_ADDRESS;

let redisClient;

// Initialize Redis client
export async function initRedis() {
  if (!redisClient && REDIS_SERVER_ADDRESS) {
    try {
      redisClient = createClient({
        url: REDIS_SERVER_ADDRESS
      });
      await redisClient.connect();
      logger.info('Connected to Redis server', { url: REDIS_SERVER_ADDRESS });
    } catch (error) {
      logger.error('Failed to connect to Redis', { error: error.message });
    }
  }
}

// Get Redis client instance
export function getRedisClient() {
  return redisClient;
}

// Get last updated template timestamp from Redis
export async function getLastUpdatedTemplate(host) {
  const client = getRedisClient();
  if (client) {
    try {
      const key = `${host}.lastUpdatedTemplate`;
      const value = await client.get(key);
      return value ? parseInt(value) : 0;
    } catch (error) {
      logger.error('Error reading from Redis', { error: error.message });
    }
  }
  
  // Fallback to 0 if Redis is not available
  return 0;
}

// Save last updated template timestamp to Redis
export async function saveLastUpdatedTemplate(host, timestamp) {
  const client = getRedisClient();
  if (client) {
    try {
      const key = `${host}.lastUpdatedTemplate`;
      await client.set(key, timestamp.toString());
    } catch (error) {
      logger.error('Error writing to Redis', { error: error.message });
    }
  }
}