import { fetchTemplatesSite } from '../api_client/fetchTemplates.js';
import { wrapHbVars } from '../static/wrapHbVars.js';


export async function getSnippets(host) {
  const snippets = await fetchTemplatesSite(host);

  for (const [snippetName, snippet] of Object.entries(snippets)) {
    snippets[snippetName] = {
      ...snippet,
      html: wrapHbVars(snippet.html),
    }
  }
  return snippets
} 
