import { handlebarsRender } from './handlebarsRender.js'
import { getTemplatesByNames } from '../redis/index.js'

function parseDataPreview(dataPreview) {
  if (!dataPreview) return {}
  if (typeof dataPreview !== 'string') return dataPreview
  try {
    return JSON.parse(dataPreview)
  } catch (e) {
    return {}
  }
}

export async function buildChildrenHTML(host, children, globalData = {}) {
  const rows = Array.isArray(children) ? children : (children?.rows || [])
  
  if (!rows.length) {
    return ''
  }

  const names = rows.map(row => row.template_preview).filter(Boolean)
  const templates = await getTemplatesByNames(host, names)

  let html = ''
  for (const row of rows) {
    const template = templates.get(row.template_preview)

    if (!template?.html) {
      continue
    }

    const values = {
      ...globalData,
      ...(template.values || {}),
      ...row,
      ...parseDataPreview(row.data_preview),
      url: globalData.url + '/' + row.name
    }
    
    html += handlebarsRender(template.html, values)
  }

  return html
}
