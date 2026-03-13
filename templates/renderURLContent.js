import {
  renderHandlebarsTemplate,
} from './index.js'

import {
  getTemplateByName,
} from '../redis/index.js'

export async function renderURLContent(host, content, dynamicData) {

  const { ENTITY, CHILDREN} = content
  
  let html = ENTITY.html;
  if (!ENTITY.use_html) {
    const template = await getTemplateByName(host, ENTITY.template)

    html = template.html
  }
  content.ENTITY = renderHandlebarsTemplate(html, {
    ...ENTITY,
    ...dynamicData,
  });

  // TODO CHILDREN

  return content;
}