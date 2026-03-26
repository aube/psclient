import {
  getString,
} from '../redis/index.js'

import { TWCSS_HASH_KEY, STYLECSS_HASH_KEY } from "../const/index.js"


export async function injectStylesHead(host, finalHTML) {
  if (!finalHTML.includes('</head>')) {
    return
  }

  const twhash = await getString(`templates:${host}:${TWCSS_HASH_KEY}`);
  const csshash = await getString(`templates:${host}:${STYLECSS_HASH_KEY}`);

  if (!twhash && !csshash) {
    return finalHTML
  }

  let styles = ""

  if (twhash) {
    styles += `
      <link rel="stylesheet" href="/twstyle.css?h=${twhash}">
    `;
  }
  
  if (csshash) {
    styles += `
      <link rel="stylesheet" href="/style.css?h=${csshash}">
    `;
  }

  return finalHTML.replace('</head>', styles + '</head>');
}
