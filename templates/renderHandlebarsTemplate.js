import Handlebars from 'handlebars';
import logger from '../logger.pino.js';

// Function to render Handlebars templates
export function renderHandlebarsTemplate(templateString, data) {
  const template = Handlebars.compile(templateString);
  const result = template(data)

  logger.debug(
    'Render Handlebars Template',
    'templateString', templateString,
    'data', data,
    'result', result
  );

 return result;
}

