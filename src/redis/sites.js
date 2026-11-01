import logger from '../logger.pino.js';
import { getRedisClient } from './index.js'
import { REDIS_DEFAULT_EXPIRE_TIME } from '../const/index.js';

export async function getSite(host) {
  const client = getRedisClient();
  const key = `sites:${host}`;

  try {
    const value = await client.json.get(key, "$");
    return value
  } catch (error) {
    logger.error('Error reading from Redis', { error: error.message });
  }
}

export async function setSite(host, site) {
  const client = getRedisClient();
  const key = `sites:${host}`;

  try {
      await client.json.set(key, "$", site);
      await client.expire(key, REDIS_DEFAULT_EXPIRE_TIME);
  } catch (error) {
    logger.error('Error writing to Redis', 'error', error.message, 'site', site );
  }
}

export async function getLastSiteRequestTime(host) {
  const client = getRedisClient();
  
  try {
    const key = `sites:${host}:lastRequest`;
    const value = await client.get(key);
    return value || 0;
  } catch (error) {
    logger.error('Error reading from Redis', { error: error.message });
  }
  
  return 0;
}

export async function setLastSiteRequestTime(host) {
  const client = getRedisClient();
  try {
    const key = `sites:${host}:lastRequest`;
    await client.set(key, Date.now(), {
      EX: REDIS_DEFAULT_EXPIRE_TIME
    });
  } catch (error) {
    logger.error('Error writing to Redis', { error: error.message });
  }
}
