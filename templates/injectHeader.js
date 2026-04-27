import {
  injectHTML,
  renderHandlebarsTemplate,
  dynamicIncludes2HTMLComments,
} from './index.js'

import {
  getTemplatesByCategory,
} from '../redis/index.js'


// TODO: optimize it
export async function injectSections(host, finalHTML, dynamicData) {

  const header = await getTemplatesByCategory(host, 'header');
  
  for (const [name, snippet] of Object.entries(header)) {
    if (finalHTML.includes(`<!--${name}-->`) || finalHTML.includes(`<!--~${name}-->`)) {
      let html = dynamicIncludes2HTMLComments(snippet.html);
      html = renderHandlebarsTemplate(html, {
        ...snippet.data,
        ...dynamicData
      });
      finalHTML = injectHTML(name, finalHTML, html)
    }
  }

  return finalHTML
}
