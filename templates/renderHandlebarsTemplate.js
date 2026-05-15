import Handlebars from 'handlebars';
import logger from '../logger.pino.js';

// Function to render Handlebars templates
export function renderHandlebarsTemplate(templateString, data) {

  Handlebars.registerHelper('gt', function(a, b) {
    return a > b;
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

