import {
  wrapHbVars,
} from '../static/wrapHbVars.js'

import {
  injectHTML,
  renderHandlebarsTemplate,
  dynamicIncludes2HTMLComments,
} from './index.js'

import {
  getTemplateByName,
} from '../redis/index.js'

export async function injectURLContent(host, finalHTML, content, dynamicData) {

  const { ENTITY, CHILDREN} = content

  let html = ENTITY.html;
  let template = {};
  if (!ENTITY.use_html) {
    template = await getTemplateByName(host, ENTITY.template)

    html = template.html
    
  }

  html = dynamicIncludes2HTMLComments(html)
  html = wrapHbVars(html)
  
  html = renderHandlebarsTemplate(html, {
    ...(template?.data || {}),
    ...ENTITY,
    html: null,
    data: null,
    fields: null,
    ...dynamicData,
  });
  
  return injectHTML('ENTITY', finalHTML, html)

  // TODO CHILDREN
}