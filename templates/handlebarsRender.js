import Handlebars from 'handlebars';
import logger from '../logger.pino.js';

// Function to render Handlebars templates
export function handlebarsRender(templateString, data, headingLevel = 2) {

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

  const template = Handlebars.compile(templateString, {noEscape: true});
  const result = template({
    ...data,
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
