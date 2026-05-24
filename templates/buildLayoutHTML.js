import { wrapHbVars } from '../static/wrapHbVars.js';

import {
  dynamicIncludes2HTMLComments,
  injectScriptsBody,
  injectStylesHead,
} from './index.js'

import {
  getStringCached,
  setStringCached,
  getTemplatesByCategory,
} from '../redis/index.js'


export async function buildLayoutHTML(host, site) {
  let htmlLayout = await getStringCached(`layouts:${host}`);

  if (!htmlLayout) {
    htmlLayout = await getLayout(host, site);
    
    htmlLayout = injectScriptsBody(htmlLayout)

    htmlLayout = await injectStylesHead(site.settings.hashes, htmlLayout)
    
    await setStringCached(`layouts:${host}`, htmlLayout);
  }

  return htmlLayout
}


function extractContentWithPrefix(text, prefix) {
  const pattern = `\\[\\[(${prefix}_[^\\]]*)\\]\\]`;
  const regex = new RegExp(pattern, 'g');
  const matches = [...text.matchAll(regex)].map(m => m[1]);
  return matches 
}


function getTemplate(tplsMap, html, prefix) {
  const tags = extractContentWithPrefix(html, prefix)

  tags.forEach(tag => {
    if (!tplsMap[tag]?.html) return
    const subtpl = getTemplate(tplsMap, tplsMap[tag].html, tag)
    html = html.replace("[[" + tag + "]]", subtpl)
  })

  return html
}


async function getLayout(host, {settings, meta}) {
  const templates = await getTemplatesByCategory(host, 'layout');

  let htmlLayout = "empty template"
  if (templates["HTML"]) {
    htmlLayout = getTemplate(templates, templates["HTML"].html, "HTML");
  }
  
  let layoutData = {
    settings,
    meta,
    entity: {},
  }

  htmlLayout = dynamicIncludes2HTMLComments(htmlLayout)
  htmlLayout = wrapHbVars(htmlLayout)

  return htmlLayout
} 