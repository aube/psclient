export function replacePartialSections(name, htmlLayout, partialHTML) {
  const regex = new RegExp(`<!--${name}-->.*<!--/${name}-->`, 'gs');
  const resultString = `<!--${name}-->${partialHTML}<!--/${name}-->`
  return htmlLayout.replace(regex, resultString);
}

