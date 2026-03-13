import logger from '../logger.pino.js';
import { getRedisClient } from './index.js'

export async function getTemplatesByCategory(host, category) {
  const client = getRedisClient();
  const key = `templates:${host}:${category}`;

  try {
    const value = await client.json.get(key);
    return value
  } catch (error) {
    logger.error('Error reading from Redis', { error: error.message });
  }
}

export async function getTemplateByName(host, name, category = "") {
  const client = getRedisClient();
  const keyMap = `templates:${host}:_map`;
  if (!category) {
    category = await client.json.get(keyMap, "$." + name);
  }
  const key = `templates:${host}:${category}`;

  try {
    const value = await client.json.get(key, "$." + name);
    return value
  } catch (error) {
    logger.error('Error reading from Redis', { error: error.message });
  }
}

export async function saveTemplates(host, templates = []) {
  const client = getRedisClient();
  const keyPrefix = `templates:${host}`;
  const keyMap = `templates:${host}:_map`;
  
  await client.json.set(keyMap, "$", {}, { condition: 'NX' });
  let maxUpdatedDate = await getLastUpdatedTemplate(host)
  
  try {
    for (const item of templates) {
      const category = item.category || "_nocat";
      const key = keyPrefix + ":" + category;
      const data = JSON.parse(item.data || "{}")

      await client.json.set(key, "$", {}, { condition: 'NX' });
      await client.json.set(key, "$." + item.name, {...item, data});
      await client.json.set(keyMap, "$." + item.name, category);

      maxUpdatedDate = maxUpdatedDate > item.updated_at ? maxUpdatedDate : item.updated_at
    }
    saveLastUpdatedTemplate(host, maxUpdatedDate)
  } catch (error) {
    logger.error('Error writing to Redis', 'error', error.message, 'templates', templates );
  }
}

export async function delTemplate(host, name) {
  const client = getRedisClient();
  const keyMap = `templates:${host}:_map`;
  const category = await client.json.get(keyMap, "$." + name);
  const key = `templates:${host}:${category}`;

  try {
    await client.json.del(key, "$." + name);
    return true
  } catch (error) {
    logger.error('Error reading from Redis', { error: error.message });
  }
}

export async function getLastUpdatedTemplate(host) {
  const client = getRedisClient();
  try {
    const key = `templates:${host}:lastTemplate`;
    const value = await client.get(key);
    return value || (new Date(0)).toISOString();
  } catch (error) {
    logger.error('Error reading from Redis', { error: error.message });
  }
  
  return 0;
}

export async function saveLastUpdatedTemplate(host, dateString) {
  const client = getRedisClient();
  try {
    const key = `templates:${host}:lastTemplate`;
    await client.set(key, dateString);
  } catch (error) {
    logger.error('Error writing to Redis', { error: error.message });
  }
}
