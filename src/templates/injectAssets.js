import { ASSETS } from './assets.js';

export function injectAssets(html, assets = ASSETS) {
  if (!html.includes('</head>')) {
    return html;
  }

  const json = JSON.stringify(assets).replace(/</g, '\\u003C');
  const script = `<script>window.ASSETS = Object.freeze(${json});<\/script>`;

  return html.replace('</head>', script + '</head>');
}
