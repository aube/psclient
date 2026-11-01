import logger from '../logger.pino.js';

const API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS;
const API_BASE_URL = process.env.API_BASE_URL;
const CLIENT_SERVICE_API_KEY = process.env.CLIENT_SERVICE_API_KEY;

function parseNotFound(notFound) {
  if (Array.isArray(notFound)) {
    return notFound.map(name => String(name).trim()).filter(Boolean);
  }
  if (typeof notFound === 'string') {
    return notFound.split(',').map(name => name.trim()).filter(Boolean);
  }
  return [];
}

function normalizeTemplate(template) {
  try {
    template.values = JSON.parse(template.values || '{}');
  } catch (e) {
    template.values = {};
  }

  try {
    template.fields = JSON.parse(template.fields || '[]');
  } catch (e) {
    template.fields = [];
  }

  return template;
}

async function requestTemplates(path, names, headers = {}) {
  if (!names.length) {
    return { rows: [], notFound: [] };
  }

  try {
    const baseUrl = API_SERVER_ADDRESS + API_BASE_URL;
    const query = names.map(encodeURIComponent).join(',');
    const URL = `http://${baseUrl}${path}?names=${query}`;

    logger.debug('api_client request', 'URL', URL, 'headers', headers);

    const response = await fetch(URL, {
      headers: {
        'x-client-service-key': CLIENT_SERVICE_API_KEY,
        ...headers,
      }
    });

    if (!response.ok) {
      return { rows: [], notFound: [...names] };
    }

    const data = await response.json();
    const rows = (data.rows || []).map(normalizeTemplate);

    return { rows, notFound: parseNotFound(data.not_found) };
  } catch (error) {
    logger.error('Error fetching templates', 'path', path, 'error', error.message);
    return { rows: [], notFound: [...names] };
  }
}

export async function fetchTemplates(host, names) {
  return requestTemplates('/service/templates', names, { 'x-host': host });
}

export async function fetchSharedTemplates(names) {
  return requestTemplates('/service/shared-templates', names);
}
