import { wrapHbVars } from '../../static/wrapHbVars.js';

import {
  injectAssets,
  injectScriptsBody,
  injectHead,
} from './index.js'

import { renderLayoutTree } from './renderLayoutTree.js'

import {
  getTemplateByName,
} from '../redis/index.js'


export async function buildLayoutHTML(host, site, data = {}) {
  let htmlLayout = await getLayout(host, site);

  htmlLayout = await renderLayoutTree(htmlLayout, {
    getTemplate: (name) => getTemplateByName(host, name),
    templatesData: {},
    globalData: { settings: site.settings, meta: site.meta, ...data },
    domain: host,
  })

  htmlLayout = injectScriptsBody(htmlLayout)

  htmlLayout = await injectHead(site.settings, htmlLayout)

  htmlLayout = injectAssets(htmlLayout)

  return htmlLayout
}


async function getLayout(host, site) {
  const template = await getTemplateByName(host, 'HTML', site.uuid);

  let htmlLayout = template?.html || "empty template";

  htmlLayout = wrapHbVars(htmlLayout)

  // %ENTITY% — исключение из [{name}] инклюдов: подставляем PJAX-анкеры
  htmlLayout = htmlLayout.replaceAll('%ENTITY%', '<!--ENTITY--><!--/ENTITY-->')

  return htmlLayout
} 
