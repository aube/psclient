import xxhash from 'xxhashjs';
import Handlebars from 'handlebars';
import { cloneDeep } from 'lodash-es'

const SEED = 0x888;


export function extractTemplateIncludes(html, hashPrefix, use_html = false) {
  const regex = /(\[[\[\{](?:[^}\]]+)[\}\]]\])/g;
  const result = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const placeholder = match[1];
    const starts = placeholder.substring(0, 2)
    const ends = placeholder.substring(-2)

    if (starts === '[[' && ends === '}]' || starts === '[{' && ends === ']]') continue

    const content = placeholder.substring(2, placeholder.length - 2)

    const uid = xxhash.h32(hashPrefix + content.trim(), SEED).toString(16)
    const [name, id = ''] = content.trim().split('#')
    const mark = {
      placeholder,
      name: name.trim(),
      id: id.trim(),
      uid,
      multiple: starts === '[[',
      changable: use_html && name.startsWith('~'),
    }
    result.push(mark)
  }

  return result;
}


export function dataAttributesInjector(html, values) {
  const firstTagMatch = html.match(/<[^>]+>/);
  if (!firstTagMatch) return html;

  const attributes = Object.entries(values)
    .map(([key, value]) => `data-${key}="${value}"`)
    .join(' ');

  const newTag = firstTagMatch[0].replace(/>$/, ` ${attributes}>`);

  return html.replace(firstTagMatch[0], newTag);
}


export function handlebarsRender(html, v) {
  const values = cloneDeep(v)
  const template = Handlebars.compile(html);
  const result = template(values)
  return result;
}
