import {
  renderHandlebarsTemplate,
} from './index.js'

export async function getRenderedPage(pageData, htmlLayout) {
  const renderedPartials = {};
  for (const [sectionName, section] of Object.entries(pageData)) {
    if (htmlLayout.includes(`<!--${sectionName}-->`)) {
      const data = {
        ...section,
        ...JSON.parse(section.data),
        data: null,
      }
      renderedPartials[sectionName] = renderHandlebarsTemplate(section.template, data);
    }
  }
  return renderedPartials
}