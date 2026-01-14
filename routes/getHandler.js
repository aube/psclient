import axios from 'axios';
import Handlebars from 'handlebars';
import logger from '../logger.pino.js';
import { getHtmlTemplate, setHtmlTemplate } from '../utils/cacheHTML.js';
import { fetchHtmlTemplate } from '../api_client/fetchHtmlTemplate.js';
import { fetchPageData } from '../api_client/fetchPageData.js';

// Function to get cached HTML template or fetch it
async function getCachedHtmlTemplate(host, authToken) {
  const cacheKey = host;
  
  // First try to get from cache
  let template = getHtmlTemplate(host);
  
  // If not in cache, fetch from API
  if (template === '') {
    try {
      template = await fetchHtmlTemplate(host, authToken);
      
      setHtmlTemplate(host, template);
      
    } catch (error) {
      logger.error('Error fetching HTML ' + host, error.message);
      throw error;
    }
  }
  
  return template;
}

// Function to extract partial sections from HTML template
function extractPartialSections(htmlTemplate) {
  const sections = {};
  const regex = /<!--\s*pjax-start:\s*(\w+)\s*-->([\s\S]*?)<!--\s*pjax-end:\s*\1\s*-->/g;
  let match;
  
  while ((match = regex.exec(htmlTemplate)) !== null) {
    const sectionName = match[1];
    const sectionContent = match[2];
    sections[sectionName] = sectionContent;
  }
  
  return sections;
}

// Function to render Handlebars templates
function renderHandlebarsTemplate(templateString, data) {
  const template = Handlebars.compile(templateString);
 return template(data);
}

// Function to replace partial sections in HTML template
function replacePartialSections(htmlTemplate, partials) {
  let result = htmlTemplate;
  
  for (const [sectionName, content] of Object.entries(partials)) {
    const startComment = `<!-- pjax-start: ${sectionName} -->`;
    const endComment = `<!-- pjax-end: ${sectionName} -->`;
    
    const regex = new RegExp(
      `${startComment}[\\s\\S]*?${endComment}`,
      'g'
    );
    
    result = result.replace(regex, `${startComment}${content}${endComment}`);
  }
  
  return result;
}

// Main request handler
export const getHandler = async (req, res) => {
  if (req.path === '/health') {
    return; // Не обрабатываем /health
  }
  if (res.writableEnded) {
    return
  }
  try {
      logger.debug('Processing GET request', 'url', req.url, 'isPjax', !!req.headers['x-requested-with'], 'host', req.headers.host);
    
    const requestedWith = req.headers['x-requested-with'];
    const isPjax = requestedWith && requestedWith.toLowerCase() === 'pjax';
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;
    
    // Fetch the main HTML template
    const htmlTemplate = await getCachedHtmlTemplate(host, authToken);
    
    // Fetch page data from corresponding backend API endpoint
    const pageData = await fetchPageData(req.url, host, authToken);
    
    // Extract partial sections from HTML template
    const partialSections = extractPartialSections(htmlTemplate);
    
    // Prepare partials by rendering each section with page data
    const renderedPartials = {};
    for (const [sectionName, sectionTemplate] of Object.entries(partialSections)) {
      renderedPartials[sectionName] = renderHandlebarsTemplate(sectionTemplate, pageData);
    }
    
    if (isPjax) {
      // For PJAX requests, return JSON with rendered partial content
      res.json(renderedPartials);
    } else {
      // For regular requests, render the full HTML with partials inserted
      const finalHtml = replacePartialSections(htmlTemplate, renderedPartials);
      
      logger.debug('Final HTML generated', 'url', req.url, 'partialCount', Object.keys(renderedPartials).length, 'htmlLength', finalHtml.length);
      
      // Inject hot reload script if not in production
      if (process.env.NODE_ENV !== 'production') {
        const hotReloadScript = `
          <script>
            // Hot Reload Client Script
            const eventSource = new EventSource('/hot-reload');
            
            eventSource.onmessage = function(event) {
              if (event.data === 'connected') {
                console.log('Hot reload connected');
              } else if (event.data === 'reload') {
                console.log('File changed, reloading...');
                eventSource.close();
                window.location.reload();
              }
            };
            
            eventSource.onerror = function(event) {
              console.log('Hot reload connection error:', event);
            };
          </script>`;
        
        // Inject the script before the closing body tag
        const finalHtmlWithScript = finalHtml.includes('</body>')
          ? finalHtml.replace('</body>', hotReloadScript + '</body>')
          : finalHtml + hotReloadScript;
          
        res.setHeader('Content-Type', 'text/html');
        res.send(finalHtmlWithScript);
      } else {
        res.setHeader('Content-Type', 'text/html');
        res.send(finalHtml);
      }
    }
  } catch (error) {
    logger.error('GET * Request error', 'message', error.message, 'url', req.url, 'method', req.method, 'host', req.headers.host);
    res.status(500).json({ error: 'Internal server error' });
  }
};