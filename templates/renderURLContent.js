import {
  wrapHbVars,
} from '../static/wrapHbVars.js'

import {
  renderHandlebarsTemplate,
  dynamicIncludes2HTMLComments,
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

  html = dynamicIncludes2HTMLComments(html)
  html = wrapHbVars(html)

  content.ENTITY = renderHandlebarsTemplate(html, {
    ...ENTITY,
    ...dynamicData,
  });

  // TODO CHILDREN

  return content;
}