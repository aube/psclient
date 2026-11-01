import Handlebars from 'handlebars';
import { cloneDeep } from 'lodash-es';
import logger from '../logger.pino.js';

function resolveImageUrl(url, domain) {
  if (typeof url !== 'string' || !url || !domain) return url;

  const trimmed = url.trim();
  if (!trimmed) return url;
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(trimmed)) return url;
  if (trimmed.startsWith('/')) return url;

  return `//${domain}/${trimmed.replace(/^\.?\//, '')}`;
}

// Resolve src/srcset of top-level object values only.
function resolveImages(values, domain) {
  if (!domain) return values;

  for (const value of Object.values(values)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;

    if (typeof value.srcset === 'string') {
      value.srcset = value.srcset
        .split(',')
        .map(part => resolveImageUrl(part.trim(), domain))
        .join(', ');
    }

    if (typeof value.src === 'string') {
      value.src = resolveImageUrl(value.src, domain);
    }
  }

  return values;
}

// Function to render Handlebars templates
export function handlebarsRender(templateString, data, headingLevel = 2, domain = '') {

  Handlebars.registerHelper('gt', function(a, b) {
    return a > b;
  });

  Handlebars.registerHelper('or', function(...args) {
    const vals = Array.prototype.slice.call(args, 0, -1);
    return vals.find(Boolean) || '';
  });

  // Возвращаем trueValue, если условие истинно, иначе falseValue (или пустую строку, если falseValue не передан)
  Handlebars.registerHelper('ifElse', function(condition, trueValue, falseValue) {
    return condition ? trueValue : (falseValue || '');
  });

  Handlebars.registerHelper('loop', function(n, options) {
    let accum = '';

    for (let i = 0; i < n; i++) {
      accum += options.fn({ _idx: i });
    }
    return accum;
  });

  Handlebars.registerHelper('split', function(string) {
    if (typeof string !== 'string') return [];
    const separator = ',';

    return string.split(separator).map(item => {
      return item.trim()
    });
  });

  // Нумерованые списки в циклах
  Handlebars.registerHelper('increment', function(value) {
    return parseInt(value) + 1;
  });

  // Увеличение заголовка в зависимости от родителя и заголовка текущего блока
  Handlebars.registerHelper('incrementHeading', function(baseLevel, hasTitle) {
    // baseLevel может прийти как строка "h3" или число 3
    let currentNum = typeof baseLevel === 'number'
      ? baseLevel
      : parseInt(baseLevel.replace('h', ''), 10);

    currentNum -= Number(!hasTitle)

    const nextNum = currentNum >= 6 ? 6 : currentNum + 1;

    return 'h' + nextNum;
  });

  // Считаем количество переменных, которые существуют и не пусты (для колонок)
  Handlebars.registerHelper('countTrue', function(...args) {
    const variables = args.slice(0, -1);
    return variables.filter(val => !!val).length;
  });

  // Записываем переменную прямо в текущий контекст
  Handlebars.registerHelper('assign', function(name, value, options) {
    options.data.root[name] = value; 
  });

  const prepared = resolveImages(cloneDeep(data || {}), domain);
  const template = Handlebars.compile(String(templateString ?? ''), {noEscape: true});

  const result = template({
    ...prepared,
    headingLevel,
  })

  logger.debug(
    'Render Handlebars Template',
    'templateString', templateString,
    'data', data,
    'headingLevel', headingLevel,
    'result', result
  );

 return result;
}
