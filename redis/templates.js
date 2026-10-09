import logger from '../logger.pino.js';
import { getRedisClient } from './index.js'
import { fetchTemplates, fetchSharedTemplates } from '../api_client/fetchTemplates.js';
import { REDIS_DEFAULT_EXPIRE_TIME, REDIS_MISS_EXPIRE_TIME } from '../const/index.js';

function normalizeTemplate(template) {
  if (!template) {
    return template;
  }

  if (typeof template.values === 'string') {
    try {
      template.values = JSON.parse(template.values || '{}');
    } catch (e) {
      template.values = {};
    }
  } else if (!template.values) {
    template.values = {};
  }

  if (typeof template.fields === 'string') {
    try {
      template.fields = JSON.parse(template.fields || '[]');
    } catch (e) {
      template.fields = [];
    }
  }

  return template;
}

function stripTilde(name) {
  return name.startsWith('~') ? name.substring(1) : name;
}

async function readTemplateFromRedis(client, host, name) {
  try {
    const value = await client.json.get(`templates:${host}:${name}`);
    return value ? normalizeTemplate(value) : undefined;
  } catch (error) {
    logger.error('Error reading template from Redis', 'host', host, 'name', name, 'error', error.message);
    return undefined;
  }
}

async function isNegativeCached(client, host, name) {
  try {
    return (await client.get(`templates:miss:${host}:${name}`)) !== null;
  } catch (error) {
    logger.error('Error reading negative cache', 'error', error.message);
    return false;
  }
}

async function setNegativeCache(client, host, names) {
  try {
    await Promise.all(names.map(name =>
      client.set(`templates:miss:${host}:${name}`, '1', { EX: REDIS_MISS_EXPIRE_TIME })
    ));
  } catch (error) {
    logger.error('Error writing negative cache', 'host', host, 'error', error.message);
  }
}

async function cacheTemplates(client, host, rows) {
  try {
    await Promise.all(rows.map(async (template) => {
      const key = `templates:${host}:${template.name}`;
      await client.json.set(key, "$", template);
      await client.expire(key, REDIS_DEFAULT_EXPIRE_TIME);
    }));
  } catch (error) {
    logger.error('Error writing templates to Redis', 'host', host, 'error', error.message);
  }
}

// Resolution priority: host cache > host API > shared cache > shared API.
export async function getTemplatesByNames(host, names = []) {
  const unique = [...new Set(names.filter(n => typeof n === 'string').map(stripTilde))];
  const result = new Map();

  if (!unique.length) {
    return result;
  }

  const client = getRedisClient();

  // 1. host cache
  const hostNeedApi = [];
  for (const name of unique) {
    const value = await readTemplateFromRedis(client, host, name);
    if (value) {
      result.set(name, value);
    } else if (!(await isNegativeCached(client, host, name))) {
      hostNeedApi.push(name);
    }
  }

  // 2. host API
  if (hostNeedApi.length) {
    const { rows } = await fetchTemplates(host, hostNeedApi);
    await cacheTemplates(client, host, rows);

    const returned = new Set(rows.map(t => stripTilde(t.name)));
    for (const template of rows) {
      result.set(stripTilde(template.name), template);
    }

    const notFound = hostNeedApi.filter(name => !returned.has(name));
    if (notFound.length) {
      await setNegativeCache(client, host, notFound);
    }
  }

  // 3. shared cache
  const sharedNeedApi = [];
  for (const name of unique) {
    if (result.has(name)) {
      continue;
    }

    const value = await readTemplateFromRedis(client, 'SHARED', name);
    if (value) {
      result.set(name, value);
    } else if (!(await isNegativeCached(client, 'SHARED', name))) {
      sharedNeedApi.push(name);
    }
  }

  // 4. shared API
  if (sharedNeedApi.length) {
    const { rows } = await fetchSharedTemplates(sharedNeedApi);
    await cacheTemplates(client, 'SHARED', rows);

    const returned = new Set(rows.map(t => stripTilde(t.name)));
    for (const template of rows) {
      result.set(stripTilde(template.name), template);
    }

    const notFound = sharedNeedApi.filter(name => !returned.has(name));
    if (notFound.length) {
      await setNegativeCache(client, 'SHARED', notFound);
    }
  }

  return result;
}

export async function getTemplateByName(host, name) {
  if (typeof name !== 'string') {
    return undefined;
  }

  const templates = await getTemplatesByNames(host, [name]);
  return templates.get(stripTilde(name));
}

