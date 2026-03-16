import { createClient } from 'redis';
import logger from '../logger.pino.js';
export * from './templates.js'
export * from './sites.js'

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

export async function flushDb() {
  await getRedisClient().flushDb();
}


export async function flushAll() {
  await getRedisClient().flushAll();
}

export async function getString(key) {
  const client = getRedisClient();
  try {
    const value = await client.get(key);
    return value
  } catch (error) {
    logger.error('Error reading from Redis', { error: error.message });
  }
  
  return 0;
}

export async function setString(key, value) {
  const client = getRedisClient();
  try {
    await client.set(key, hash);
  } catch (error) {
    logger.error('Error writing to Redis', { error: error.message });
  }
}
