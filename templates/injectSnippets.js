import {
  injectHTML,
  renderHandlebarsTemplate,
} from './index.js'

import {
  getTemplatesByCategory,
} from '../redis/index.js'

export async function injectSnippets(host, finalHTML, dynamicData) {

  const snippets = await getTemplatesByCategory(host, 'snippet');
  
  for (const [name, snippet] of Object.entries(snippets)) {
    if (finalHTML.includes(`<!--${name}-->`)) {
      const html = renderHandlebarsTemplate(snippet.html, {
        ...snippet.data,
        ...dynamicData
      });
      finalHTML = injectHTML(name, finalHTML, html)
    }
  }
  
  return finalHTML
}
