import logger from '../logger.pino.js';
import { getRedisClient } from './index.js'
import { REDIS_DEFAULT_EXPIRE_TIME } from '../const/index.js';

export async function getHostCSSClasses(host) {
  const classes = new Set()
  const client = getRedisClient();

  for (let h of ['SHARED', host]) {
    const key = `templates:${h}:_map`;
    const templates = await client.zRange(key, 0, -1);
    for (let tplName of templates) {
      const css = await client.zRange(`templates:${h}:${tplName}_classes`, 0, -1);
        css?.forEach(c => classes.add(c));
      }
    }
  
  return [...classes];
}

export async function getHostCSSStyles(host) {
  const styles = new Array()
  const client = getRedisClient();

  for (let h of ['SHARED', host]) {
    const key = `templates:${h}:_map`;
    const templates = await client.zRange(key, 0, -1);

    for (let tplName of templates) {
      const tpl = await client.json.get(`templates:${h}:${tplName}`);
      if (tpl && tpl.css) {
        styles.push(tpl.css);
      }
    }
  }

  return styles;
}

export async function getTemplatesByCategory(host, category) {
  const templates = {};
  const client = getRedisClient();

  for (let h of ['SHARED', host]) {
    const key = `templates:${h}:_cat_${category}`;
    const tplNames = await client.zRange(key, 0, -1);
    for (let tplName of tplNames) {
      const tpl = await client.json.get(`templates:${h}:${tplName}`);
      
      if (tpl) {
        templates[tpl.name] = tpl;
      }
    }
  }
  return templates;
}

export async function getTemplateByName(host, name, category = "") {
  const client = getRedisClient();
  const key = `templates:${host}:${name}`;
  try {
    const value = await client.json.get(key);

    if (!value && host !== "SHARED") {
      return await getTemplateByName("SHARED", name, category)
    } else {
      return value
    }
  } catch (error) {
    logger.error('Error reading from Redis 1', { error: error.message });
  }
}

async function setTemplate(host, item) {
  const client = getRedisClient();
  const key = `templates:${host}:${item.name}`;
  const mapKey = `templates:${host}:_map`;
  const categoryKey = `templates:${host}:_cat_` + item.category;
  const classesKey = key + "_classes";

  const map = await client.zRange(mapKey, 0, -1)
  
  const promises = [
    client.zAdd(categoryKey, { score: 0, value: item.name }),
    client.zAdd(mapKey, { score: 0, value: item.name }),
  ]
  
  if (item.classes?.length) {
    for (let cls of item.classes) {
      promises.push(client.zAdd(classesKey, { score: 0, value: cls }));
    }
  }
  delete item.classes;

  promises.push(client.json.set(key, "$", item));

  return Promise.all(promises).catch(error => {
    logger.error('Error writing to Redis',
      'function', "setTemplate",
      'error', error.message,
      'template', item.name,
    );
  })
}

export async function saveTemplates(host, templates = []) {  
  let maxUpdatedDate = await getLastUpdatedTemplate(host)
  
  try {
    for (const item of templates) {
      const res = await setTemplate(host, item)
      if (res)
      maxUpdatedDate = maxUpdatedDate > item.updated_at ? maxUpdatedDate : item.updated_at;
    }
    saveLastUpdatedTemplate(host, maxUpdatedDate)

  } catch (error) {
    logger.error('Error writing to Redis',
      'error', error.message,
    );
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
    logger.error('Error reading from Redis 2', { error: error.message });
  }
}

export async function getLastUpdatedTemplate(host) {
  const client = getRedisClient();
  try {
    const key = `templates:${host}:lastTemplate`;
    const value = await client.get(key);
    return value || (new Date(0)).toISOString();
  } catch (error) {
    logger.error('Error reading from Redis 3', { error: error.message });
  }
  
  return 0;
}

export async function saveLastUpdatedTemplate(host, dateString) {
  const client = getRedisClient();
  try {
    const key = `templates:${host}:lastTemplate`;
    await client.set(key, dateString, {
      EX: REDIS_DEFAULT_EXPIRE_TIME
    });
  } catch (error) {
    logger.error('Error writing to Redis', { error: error.message });
  }
}
