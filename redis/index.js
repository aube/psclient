import { createClient } from 'redis';
import logger from '../logger.pino.js';
import { REDIS_DEFAULT_EXPIRE_TIME } from '../const/index.js';
export * from './templates.js'
export * from './sites.js'

const REDIS_SERVER_ADDRESS = process.env.REDIS_SERVER_ADDRESS;
const REDIS_CACHE_TTL_SECOUNDS = process.env.REDIS_CACHE_TTL_SECOUNDS;

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

      logger.debug('Connected to Redis server',
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
    logger.error('Error getString', { error: error.message });
  }
  return "";
}

export async function setString(key, value, { EX } = {}) {
  const client = getRedisClient();
  EX = EX || REDIS_DEFAULT_EXPIRE_TIME;
  try {
    await client.set(key, value, { EX });
  } catch (error) {
    logger.error('Error setString', { error: error.message });
  }
}

export async function delString(key) {
  const client = getRedisClient();
  try {
    await client.del(key);
  } catch (error) {
    logger.error('Error delString', { error: error.message });
  }
}

export async function getStringCached(key) {
  try {
    const cacheTime = await getString(key + "_cache");
    if (+cacheTime < Date.now()) {
      delString(key + "_cache")
      await delString(key)
      return null
    }
    return await getString(key)
  } catch (error) {
    logger.error('Error getStringCached', { error: error.message, key });
  }
  return "";
}

export async function setStringCached(key, value, rate = 1) {
  try {
    await setString(key, value);
    await setString(key + "_cache", Date.now() + rate * REDIS_CACHE_TTL_SECOUNDS * 1000);
  } catch (error) {
    logger.error('Error setStringCached', { error: error.message });
  }
}
