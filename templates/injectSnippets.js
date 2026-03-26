import {
  injectHTML,
  renderHandlebarsTemplate,
} from './index.js'

import {
  getTemplatesByCategory,
} from '../redis/index.js'

const MAX_LEVEL = 3

export async function injectSnippets(host, finalHTML, dynamicData, snippets, level = 0) {

  if (!snippets) {
    snippets = await getTemplatesByCategory(host, 'snippet');
  }
  
  for (const [name, snippet] of Object.entries(snippets)) {
    if (finalHTML.includes(`<!--${name}-->`) || finalHTML.includes(`<!--!${name}-->`)) {
      const html = renderHandlebarsTemplate(snippet.html, {
        ...snippet.data,
        ...dynamicData
      });
      finalHTML = injectHTML(name, finalHTML, html)
    }
  }

  if (level < MAX_LEVEL) {
    finalHTML = injectSnippets(host, finalHTML, dynamicData, snippets, ++level)
  }

  return finalHTML
}
