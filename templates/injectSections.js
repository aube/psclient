import {
  injectHTML,
  renderHandlebarsTemplate,
  dynamicIncludes2HTMLComments,
} from './index.js'

import {
  getTemplatesByCategory,
} from '../redis/index.js'


// TODO: optimize it
export async function injectSections(host, finalHTML, dynamicData) {

  const footer = await getTemplatesByCategory(host, 'footer');
  
  for (const [name, snippet] of Object.entries(footer)) {
    if (finalHTML.includes(`<!--${name}-->`) || finalHTML.includes(`<!--!${name}-->`)) {
      let html = dynamicIncludes2HTMLComments(snippet.html);
      html = renderHandlebarsTemplate(html, {
        ...snippet.data,
        ...dynamicData
      });
      finalHTML = injectHTML(name, finalHTML, html)
    }
  }

  const header = await getTemplatesByCategory(host, 'header');
  
  for (const [name, snippet] of Object.entries(header)) {
    if (finalHTML.includes(`<!--${name}-->`) || finalHTML.includes(`<!--!${name}-->`)) {
      let html = dynamicIncludes2HTMLComments(snippet.html);
      html = renderHandlebarsTemplate(html, {
        ...snippet.data,
        ...dynamicData
      });
      finalHTML = injectHTML(name, finalHTML, html)
    }
  }

  const sections = await getTemplatesByCategory(host, 'section');

  for (const [name, snippet] of Object.entries(sections)) {
    if (finalHTML.includes(`<!--${name}-->`) || finalHTML.includes(`<!--!${name}-->`)) {
      let html = dynamicIncludes2HTMLComments(snippet.html);
      html = renderHandlebarsTemplate(html, {
        ...snippet.data,
        ...dynamicData
      });
      finalHTML = injectHTML(name, finalHTML, html)
    }
  }
  
  const blocks = await getTemplatesByCategory(host, 'block');
  
  for (const [name, snippet] of Object.entries(blocks)) {
    if (finalHTML.includes(`<!--${name}-->`) || finalHTML.includes(`<!--!${name}-->`)) {
      let html = dynamicIncludes2HTMLComments(snippet.html);
      html = renderHandlebarsTemplate(html, {
        ...snippet.data,
        ...dynamicData
      });
      finalHTML = injectHTML(name, finalHTML, html)
    }
  }
  
  return finalHTML
}
