import {
  renderHandlebarsTemplate,
} from './index.js'


export async function getRenderedSnippets(snippets, htmlLayout, siteSettings) {
  const renderedPartials = {};
  for (const [sectionName, section] of Object.entries(snippets)) {
    if (htmlLayout.includes(`<!--${sectionName}-->`)) {
      renderedPartials[sectionName] = renderHandlebarsTemplate(section.html, {
        ...section.data,
        settings: {
          ...siteSettings,
          ...(section.data.settings || {})
        }
      });
    }
  }
  return renderedPartials
}