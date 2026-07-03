import {
  injectHTML,
  handlebarsRender,
  dynamicIncludes2HTMLComments,
} from './index.js'

import {
  getTemplatesByCategory,
} from '../redis/index.js'


// TODO: optimize it
export function injectEntityTreeNodes(host, layoutHTML = '', nodes) {

  let finalHTML = layoutHTML

  nodes.forEach(node => {
    // if (node.uid === "a172fbfe")
    //   console.log(node)
    if (node.multiple) {
      finalHTML = injectEntityTreeNodes(host, finalHTML, node.nodes)
    } else {
      finalHTML = injectHTML(node.uid, finalHTML, node.html)
    }
  })

  // const sections = await getTemplatesByCategory(host, 'section');

  // for (const [name, snippet] of Object.entries(sections)) {
  //   if (finalHTML.includes(`<!--${name}-->`) || finalHTML.includes(`<!--~${name}-->`)) {
  //     let html = dynamicIncludes2HTMLComments(snippet.html);
  //     html = handlebarsRender(html, {
  //       ...snippet.data,
  //       ...dynamicData
  //     });
  //     finalHTML = injectHTML(name, finalHTML, html)
  //   }
  // }
  
  // const blocks = await getTemplatesByCategory(host, 'block');
  
  // for (const [name, snippet] of Object.entries(blocks)) {
  //   if (finalHTML.includes(`<!--${name}-->`) || finalHTML.includes(`<!--~${name}-->`)) {
  //     let html = dynamicIncludes2HTMLComments(snippet.html);
  //     html = handlebarsRender(html, {
  //       ...snippet.data,
  //       ...dynamicData
  //     });
  //     finalHTML = injectHTML(name, finalHTML, html)
  //   }
  // }
  
  return finalHTML
}
