function generateStyles(hashes = {}) {

  const twhash = hashes['twstyle.css'];
  const tplcsshash = hashes['templates.css'];

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

  return styles;
}

function generateFavicon(favicon = "") {

  if (!favicon) return ""

  const mimeTypes = {
    'png': 'image/png',
    'ico': 'image/x-icon',
    'svg': 'image/svg+xml',
    'gif': 'image/gif',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg'
  };

  const ext = favicon.split('.').pop().toLowerCase();

  return `<link rel="icon" type="image/${mimeTypes[ext]}" href="/${favicon}" />`
}


export function injectHead(settings = {}, finalHTML = '') {
  if (!finalHTML.includes('</head>')) {
    return
  }

  let favicon = generateFavicon(settings.favicon);
  let styles = generateStyles(settings.hashes || {});

  return finalHTML.replace('</head>', favicon + styles + '</head>');
}
