export function addClientScript(finalHTML) {
  const clientScript = `
    <script src="/static/main.js" type="module"></script>
    <script type='module'>
    // import {wrapHbVars} from "/static/wrapHbVars.js"
    // console.log(wrapHbVars("<img src='{{qwe}}'/>{{123}}"))
    </script>
    `;
  
  // Inject the script before the closing body tag
  finalHTML = finalHTML.includes('</body>')
    ? finalHTML.replace('</body>', clientScript + '</body>')
    : finalHTML + clientScript;

  return finalHTML
}
