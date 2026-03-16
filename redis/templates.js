import logger from '../logger.pino.js';
import { getRedisClient } from './index.js'

export async function getHostCSSClasses(host) {
  const classes = new Set()
  const client = getRedisClient();

  const mapSharedKey = `templates:${host}:_map`;
  const mapHostKey = `templates:${host}:_map`;

  const sharedTemplates = await client.zRange(mapSharedKey, 0, -1);
  for (let tplName of sharedTemplates) {
    const css = await client.json.get(`templates:SHARED:${tplName}_classes`);
    css?.forEach(c => classes.add);
  }
  
  const hostTemplates = await client.zRange(mapHostKey, 0, -1);
  for (let tplName of hostTemplates) {
    const css = await client.json.get(`templates:${host}:${tplName}_classes`);
    css?.forEach(c => classes.add);
  }

  return [...classes];
}

export async function getHostCSSStyles(host) {
  const styles = new Array()
  const client = getRedisClient();

  const mapSharedKey = `templates:${host}:_map`;
  const mapHostKey = `templates:${host}:_map`;

  const sharedTemplates = await client.zRange(mapSharedKey, 0, -1);
  for (let tplName of sharedTemplates) {
    const css = await client.json.get(`templates:SHARED:${tplName}_classes`);
    css.forEach(c => styles.push);
  }
  
  const hostTemplates = await client.zRange(mapHostKey, 0, -1);
  for (let tplName of hostTemplates) {
    const css = await client.json.get(`templates:${host}:${tplName}_classes`);
    css.forEach(c => styles.push);
  }

  return styles;
}

export async function getTemplatesByCategory(host, category) {
  const templates = {}
  const client = getRedisClient();

  const sharedKey = `templates:SHARED:_cat_${category}`;
  const hostKey = `templates:${host}:_cat_${category}`;

  const sharedTemplates = await client.zRange(sharedKey, 0, -1);
  for (let tplName of sharedTemplates) {
    templates[tplName] = await client.json.get(`templates:SHARED:${tplName}`);
  }

  const hostTemplates = await client.zRange(hostKey, 0, -1);
  for (let tplName of hostTemplates) {
    templates[tplName] = await client.json.get(`templates:${host}:${tplName}`);
  }

  return templates;
}

export async function getTemplateByName(host, name, category = "") {
  const client = getRedisClient();
  const key = `templates:${host}:${name}`;

  try {
    const value = await client.get(key);

    if (!value && host !== "SHARED") {
      return await getTemplateByName("SHARED", name, category)
    } else {
      return value
    }
  } catch (error) {
    logger.error('Error reading from Redis', { error: error.message });
  }
}


async function setTemplate(host, item) {
  const client = getRedisClient();
  const key = `templates:${host}:${item.name}`;
  const mapKey = `templates:${host}:_map`;
  const categoryKey = `templates:${host}:_cat_` + item.category;
  const classesKey = key + "_classes";

  const promises = [
    client.zAdd(categoryKey, { score: 0, value: item.name }),
    client.zAdd(mapKey, { score: 0, value: item.name }),
  ]

  try {
  if (item.classes?.length) {
    for (let cls of item.classes) {
      console.log(cls, classesKey)
      const t = await client.zAdd(classesKey, { score: 0, value: cls })
      console.log(t)

    }
    // item.classes.forEach(async cls => {
    //     // promises.push(t)
    //   })
    }
  } catch(e)  {

    console.log(classesKey, e)
  }
    delete item.classes;

  promises.push(client.json.set(key, "$", item))

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
