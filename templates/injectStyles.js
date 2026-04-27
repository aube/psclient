import {
  getString,
} from '../redis/index.js'

import { TWCSS_HASH_KEY, TEMPLATESCSS_HASH_KEY } from "../const/index.js"


export async function injectStylesHead(host, finalHTML) {
  if (!finalHTML.includes('</head>')) {
    return
  }

  const twhash = await getString(`templates:${host}:${TWCSS_HASH_KEY}`);
  const tplcsshash = await getString(`templates:${host}:${TEMPLATESCSS_HASH_KEY}`);

  if (!twhash && !tplcsshash) {
    return finalHTML
  }


  // TODO: /style.css - пишется из формы настроек сайта в админке
  // нужно получить его время последнего изменения и использовать в хэше
  // возможно для twstyle.css можно использовать этот же механизм,
  // птмчт он также хранится в uploads => тоже имеет updated_at
  let styles = `
  <link rel="stylesheet" href="/static/core.css?h=0">
  <link rel="stylesheet" href="/style.css?h=0">
  `

  if (twhash) {
    styles += `
      <link rel="stylesheet" href="/twstyle.css?h=${twhash}">
    `;
  }
  
  if (tplcsshash) {
    styles += `
      <link rel="stylesheet" href="/templates.css?h=${tplcsshash}">
    `;
  }

  return finalHTML.replace('</head>', styles + '</head>');
}
