import { wrapHbVars } from '../static/wrapHbVars.js';
import {
  dynamicIncludes2HTMLComments,
  renderHandlebarsTemplate,
} from './index.js'


export async function getLayout(site) {
  site.settings = site.settings ? JSON.parse(site.settings) : {}
  let htmlLayout = site?.html ? site.html : "empty template";

  if (site?.html) {
    let layoutData = {
      settings: site.settings,
      meta: site.meta ? JSON.parse(site.meta) : {},
      entity: {},
    }
    htmlLayout = dynamicIncludes2HTMLComments(htmlLayout)
    htmlLayout = wrapHbVars(htmlLayout)
    htmlLayout = renderHandlebarsTemplate(htmlLayout, layoutData)
    htmlLayout += "<pre>" + JSON.stringify(layoutData, null, 2) + "</pre>"
  }
  return htmlLayout
} 