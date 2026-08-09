import logger from '../logger.pino.js';

const API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS;

// Function to fetch page data from corresponding backend API endpoint
export async function fetchURL(host, url, authToken) {
  logger.debug('Fetching page data from API',
    'url', url,
    'host', host,
    'hasAuthToken', !!authToken
  );
  
  try {
    const baseUrl = API_SERVER_ADDRESS;
    
    const response = await fetch(`http://${baseUrl}${url}`, {
      headers: {
        'x-host': host,
      }
    });
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.statusCode = response.status;
      throw error;
    }
    
    const data = await response.json();

    logger.debug(
      'Page data fetched successfully',
      'host', host,
      'url', url,
      'dataSize', JSON.stringify(data).length,
      "data", data
    );
    
    if (data.ENTITY) {
      try {
        data.ENTITY.data = JSON.parse(data.ENTITY.data)
      } catch(e) {
        data.ENTITY.data = {}
      }
    }

    return data;
  } catch (error) {
    logger.error('Error fetching page data:', error.message);
    throw error;
  }
}

export async function fetchPageEntity(host, url, authToken) {
  try {
    return await fetchURL(host, url, authToken);
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return {
      ENTITY: {
        id: 2,
        parent_id: 1,
        name: 'error',
        meta: '',
        title: '',
        header: 'Произошла ошибка',
        img: '',
        menu: '',
        icon: '',
        template: 'PAGE_ERROR',
        html: '',
        fields: '',
        data: {
          error: { [`code${statusCode}`]: true },
          values: {
            message: error.message,
            code: statusCode,
          }
        },

        data_preview: '',
        use_html: false,
        sort: 2100,
        pinned: 0,
        children: 0,
        show_children: 0,
        published: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      CHILDREN: [],
      statusCode,
    };
  }
}
