import {
  injectHTML,
  renderHandlebarsTemplate,
} from './index.js'

import {
  getTemplatesByCategory,
} from '../redis/index.js'

const MAX_LEVEL = 3

export async function injectSnippets(host, html, dynamicData, snippets, level = 0) {

  if (!snippets) {
    snippets = await getTemplatesByCategory(host, 'snippet');
  }
  
  for (const [name, snippet] of Object.entries(snippets)) {
    if (html.includes(`<!--${name}-->`) || html.includes(`<!--!${name}-->`)) {
      const snippetHTML = renderHandlebarsTemplate(snippet.html, {
        ...snippet.data,
        ...dynamicData
      });
      html = injectHTML(name, html, snippetHTML)
    }
  }

  if (level < MAX_LEVEL) {
    html = injectSnippets(host, html, dynamicData, snippets, ++level)
  }

  return html
}
