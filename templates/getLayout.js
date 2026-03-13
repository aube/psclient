import { wrapHbVars } from '../static/wrapHbVars.js';
import {
  dynamicIncludes2HTMLComments,
  renderHandlebarsTemplate,
} from './index.js'
import { getTemplatesByCategory } from '../redis/index.js'

function extractContentWithPrefix(text, prefix) {
  const pattern = `\\[\\[(${prefix}_[^\\]]*)\\]\\]`;
  const regex = new RegExp(pattern, 'g');
  const matches = [...text.matchAll(regex)].map(m => m[1]);
	return matches 
}


function getTemplate(tplsMap, html, prefix) {
	const tags = extractContentWithPrefix(html, prefix)

  tags.forEach(tag => {
    if (!tplsMap[tag]?.html) return
    const subtpl = getTemplate(tplsMap, tplsMap[tag].html, tag)
    html = html.replace("[[" + tag + "]]", subtpl)
  })

	return html
}

export async function getLayout(host, {settings, meta}) {
  const templates = await getTemplatesByCategory(host, 'layout')
  let htmlLayout = getTemplate(templates, templates["HTML"].html, "HTML") || "empty template"
  
  let layoutData = {
    settings,
    meta,
    entity: {},
  }

  htmlLayout = dynamicIncludes2HTMLComments(htmlLayout)
  htmlLayout = wrapHbVars(htmlLayout)
  htmlLayout = renderHandlebarsTemplate(htmlLayout, layoutData)
  htmlLayout += "<pre>" + JSON.stringify(layoutData, null, 2) + "</pre>"

  return htmlLayout
} 