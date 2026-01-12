import fs from 'fs/promises';
import express from 'express';
import axios from 'axios';
import Handlebars from 'handlebars';
import dotenv from 'dotenv';

// Initialize environment and constants
let packageJson;
let PORT, API_SERVER_ADDRESS, API_BASE_URL;

async function initialize() {
  try {
    packageJson = await fs.readFile('./package.json', 'utf-8').then(JSON.parse);
  } catch (error) {
    console.error('Error reading package.json:', error.message);
    process.exit(1);
  }

  const isProduction = process.env.NODE_ENV === 'production'
  dotenv.config({ path: isProduction ? '.env' : '.env.local' })

  console.log("PORT", process.env.PORT)
  console.log("API_SERVER_ADDRESS", process.env.API_SERVER_ADDRESS)
  console.log("API_BASE_URL", process.env.API_BASE_URL)

  // Constants
  PORT = process.env.PORT || 9000
  API_SERVER_ADDRESS = process.env.API_SERVER_ADDRESS
  API_BASE_URL = process.env.API_BASE_URL
}

await initialize().catch(console.error);

const app = express();

// Parse cookies
app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = {};
  
  if (cookieHeader) {
    const cookies = cookieHeader.split(';');
    cookies.forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        req.cookies[name] = value;
      }
    });
  }
  
  next();
});

// Cache for HTML templates by domain
const htmlCache = new Map();

// Get cache TTL from environment variable (default 10 minutes)
const HTML_CACHE_TTL = parseInt(process.env.HTML_CACHE) || 10 * 60 * 1000; // 10 minutes in milliseconds

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: "ok",
    service: packageJson.name,
    timestamp: Date.now()
  });
});

// Function to get cached HTML template or fetch it
async function getCachedHtmlTemplate(host, authToken) {
  const cacheKey = host;
  const cached = htmlCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < HTML_CACHE_TTL) {
    return cached.template;
  }
  
  try {
    const baseUrl = API_SERVER_ADDRESS+API_BASE_URL;
    
    // Fetch HTML template from backend's /api/html endpoint
    const response = await axios.get(`http://${baseUrl}/api/html`, {
      headers: {
        'x-host': host,
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      }
    });
    
    const template = response.data;
    
    // Store in cache
    htmlCache.set(cacheKey, {
      template,
      timestamp: Date.now()
    });
    
    return template;
  } catch (error) {
    console.error('Error fetching HTML template:', error.message);
    throw error;
  }
}

// Function to fetch page data from corresponding backend API endpoint
async function fetchPageData(url, host, authToken) {
  try {
    // Determine the API endpoint based on the URL
    // For example: /profile -> /api/profile
    const apiPath = url.startsWith('/api/') ? url : `/api${url}`;
    
    const baseUrl = API_SERVER_ADDRESS+API_BASE_URL;
    
    const response = await axios.get(`http://${baseUrl}${apiPath}`, {
      headers: {
        'x-host': host,
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching page data:', error.message);
    throw error;
  }
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
app.get('*', async (req, res) => {
  try {
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
      
      res.setHeader('Content-Type', 'text/html');
      res.send(finalHtml);
    }
  } catch (error) {
    console.error('Request error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST handler for forms and other methods
app.post('*', async (req, res) => {
  try {
    const requestedWith = req.headers['x-requested-with'];
    const isPjax = requestedWith && requestedWith.toLowerCase() === 'pjax';
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;
    
    const baseUrl = API_SERVER_ADDRESS+API_BASE_URL;
    
    // Forward the POST request to the backend
    const apiUrl = req.url.startsWith('/api/') ? req.url : `/api${req.url}`;
    
    const response = await axios({
      method: 'post',
      url: `http://${baseUrl}${apiUrl}`,
      data: req.body,
      headers: {
        'x-host': host,
        'Authorization': authToken ? `Bearer ${authToken}` : '',
        ...req.headers
      }
    });
    
    if (isPjax) {
      // For PJAX requests, return the response as-is (usually JSON)
      res.json(response.data);
    } else {
      // For regular requests, redirect or return appropriate response
      if (response.headers.location) {
        res.redirect(response.headers.location);
      } else {
        res.json(response.data);
      }
    }
  } catch (error) {
    console.error('POST request error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT, DELETE, and other HTTP methods
app.all('*', async (req, res) => {
  try {
    const requestedWith = req.headers['x-requested-with'];
    const isPjax = requestedWith && requestedWith.toLowerCase() === 'pjax';
    const authToken = req.cookies.auth_token;
    const host = req.headers.host;
    
    const baseUrl = API_SERVER_ADDRESS+API_BASE_URL;
    
    // Forward the request to the backend
    const apiUrl = req.url.startsWith('/api/') ? req.url : `/api${req.url}`;
    
    const response = await axios({
      method: req.method.toLowerCase(),
      url: `http://${baseUrl}${apiUrl}`,
      data: req.body,
      headers: {
        'x-host': host,
        'Authorization': authToken ? `Bearer ${authToken}` : '',
        ...req.headers
      }
    });
    
    if (isPjax) {
      // For PJAX requests, return the response as-is (usually JSON)
      res.json(response.data);
    } else {
      // For regular requests, return the response
      res.json(response.data);
    }
  } catch (error) {
    console.error(`${req.method} request error:`, error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Use the PORT constant
app.listen(PORT, () => {
  console.log(`Proxy server listening at http://localhost:${PORT}`);
});