import logger from '../logger.pino.js';
import { getRedisClient } from './index.js'

const OLD_HOSTS_EXPIRE_TIME = 3600 * 240  // 10 days

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
      await client.expire(key, OLD_HOSTS_EXPIRE_TIME);
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
      EX: OLD_HOSTS_EXPIRE_TIME
    });
  } catch (error) {
    logger.error('Error writing to Redis', { error: error.message });
  }
}
