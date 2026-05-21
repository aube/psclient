import Handlebars from 'handlebars';
import logger from '../logger.pino.js';

// Function to render Handlebars templates
export function renderHandlebarsTemplate(templateString, data) {

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

  const template = Handlebars.compile(templateString, {noEscape: true});
  const result = template(data)

  logger.debug(
    'Render Handlebars Template',
    'templateString', templateString,
    'data', data,
    'result', result
  );

 return result;
}

