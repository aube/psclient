import { handlebarsRender } from './handlebarsRender.js'
import { getTemplatesByNames } from '../redis/index.js'

const MAX_LEVEL = 5

// [{name}] / [{~name}] — server-side template includes.
// Output keeps paired anchors <!--name-->...<!--/name--> for client-side PJAX updates.
export async function resolveIncludes(host, html, data = {}, level = 0) {
  if (!html || level > MAX_LEVEL) {
    return html;
  }

  const regex = /\[\{(~?[A-Z0-9_]+)\}\]/g;
  const names = new Set();
  let match;

  while ((match = regex.exec(html)) !== null) {
    names.add(match[1]);
  }

  if (!names.size) {
    return html;
  }

  const templates = await getTemplatesByNames(host, [...names]);

  for (const name of names) {
    const lookupName = name.startsWith('~') ? name.substring(1) : name;
    const template = templates.get(lookupName);
    if (!template) {
      continue;
    }

    const values = template.values || {};
    const innerData = { ...values, ...data };

    const inner = await resolveIncludes(host, template.html || "", innerData, level + 1);
    const rendered = handlebarsRender(inner, innerData);

    html = html.replaceAll(`[{${name}}]`, `<!--${name}-->${rendered}<!--/${name}-->`);
  }

  return html;
}
