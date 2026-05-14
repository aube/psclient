import xxhash from 'xxhashjs';
import Handlebars from 'handlebars';
import { cloneDeep } from 'lodash-es'

const SEED = 0x888;


export function extractTemplateIncludes(html, hashPrefix) {
  const regex = /(\[[\[\{](?:[^}\]]+)[\}\]]\])/g;
  const result = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const placeholder = match[1];
    const starts = placeholder.substring(0, 2)
    const ends = placeholder.substring(-2)

    if (starts === '[[' && ends === '}]' || starts === '[{' && ends === ']]') continue

    const placeholderText = placeholder.substring(2, placeholder.length - 2).replaceAll(/[\s\[\]{}]/g, '')

    const uid = xxhash.h32(hashPrefix + placeholderText, SEED).toString(16)
    const [name, id = ''] = placeholderText.split('#')
    const mark = {
      placeholder,
      name: name.trim(),
      id: id.trim(),
      uid,
      multiple: starts === '[[',
      changable: name.startsWith('~'),
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
