export function injectHTML(name, htmlLayout, partialHTML) {
  const regex = new RegExp(`<!--${name}-->.*?<!--/${name}-->`, 'gs');
  const resultString = `<!--${name}-->${partialHTML}<!--/${name}-->`
  return htmlLayout.replace(regex, resultString);
}

export function injectHTMLAll(html, replacements) {
    const regex = new RegExp(`<!--.*?-->.*?<!--/.*?-->`, 'gs');
    const matches = [...html.matchAll(regex)];

    replacements.forEach((part, n) => {
      if (!matches[n - 1]) return;
  
      const match = matches[n - 1][0];
      const start = matches[n - 1].index;
      const end = start + match.length;
  
      return html.slice(0, start) + part + html.slice(end);
    })
  return html
}


export function injectHTML2(html, partialHTML) {
  const regex = new RegExp(`<!--.*?-->.*?<!--/.*?-->`, 's');
  return html.replace(regex, partialHTML);
}


export function injectHTML3(html, partialHTML) {
  const regex = new RegExp(`\\[{.*?}\\]`, 's');
  return html.replace(regex, partialHTML);
}

