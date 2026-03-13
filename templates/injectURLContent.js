import {
  injectHTML,
  renderHandlebarsTemplate,
} from './index.js'

import {
  getTemplateByName,
} from '../redis/index.js'

export async function injectURLContent(host, finalHTML, content, dynamicData) {

  const { ENTITY, CHILDREN} = content

  let html = ENTITY.html;
  if (!ENTITY.use_html) {
    const template = await getTemplateByName(host, ENTITY.template)

    html = template.html
  }
  html = renderHandlebarsTemplate(html, {
    ...ENTITY,
    html: null,
    data: null,
    fields: null,
    ...dynamicData,
  });

  return injectHTML('ENTITY', finalHTML, html)

  // TODO CHILDREN
}