import { fetchTemplatesLast } from '../api_client/fetchTemplatesLast.js';
import { wrapHbVars } from '../static/wrapHbVars.js';


export async function getSnippets(host) {
  const snippets = await fetchTemplatesLast(host);

  for (const [snippetName, snippet] of Object.entries(snippets)) {
    snippets[snippetName] = {
      ...snippet,
      html: wrapHbVars(snippet.html),
    }
  }
  return snippets
} 
