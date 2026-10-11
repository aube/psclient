import { wrapHbVars } from '../static/wrapHbVars.js';

import {
  injectScriptsBody,
  injectHead,
} from './index.js'

import {
  getTemplateByName,
} from '../redis/index.js'


export async function buildLayoutHTML(host, site) {
  let htmlLayout = await getLayout(host, site);

  htmlLayout = injectScriptsBody(htmlLayout)

  htmlLayout = await injectHead(site.settings, htmlLayout)

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
