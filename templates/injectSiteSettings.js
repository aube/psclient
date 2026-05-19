export function injectSiteSettings(html, settings) {
  const json = JSON.stringify(settings).replace(/</g, '\\u003C');
  const script = `<script>window.__SITE_SETTINGS = ${json};<\/script>`;
  return html.replace('</head>', script + '</head>');
}
