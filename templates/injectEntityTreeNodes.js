import {
  injectHTML,
} from './index.js'


// TODO: optimize it
export function injectEntityTreeNodes(host, layoutHTML = '', nodes) {

  let finalHTML = layoutHTML

  nodes.forEach(node => {
    if (node.multiple) {
      finalHTML = injectEntityTreeNodes(host, finalHTML, node.nodes)
    } else {
      finalHTML = injectHTML(node.uid, finalHTML, node.html)
    }
  })

  return finalHTML
}
