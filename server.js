import fs from 'node:fs/promises'
import express from 'express'
import http from 'http'
import dotenv from 'dotenv'
import {readNodeCookie} from './src/lib/cookies.node.js'
// import { setActiveSiteID } from './src/lib/restapi.ts'

const packageJson = await fs.readFile('./package.json', 'utf-8').then(JSON.parse);

const isProduction = process.env.NODE_ENV === 'production'
dotenv.config({ path: isProduction ?`.env` : `.env.local` })
console.log("NODE_ENV", process.env.NODE_ENV) 
console.log("VITE_API_BASE_URL", process.env.VITE_API_BASE_URL) 

// Constants
const port = process.env.PORT || 9000
const base = process.env.BASE || '/'
const API = process.env.VITE_API_BASE_URL

const defaultTemplateHtml = await fs.readFile('./index.html', 'utf-8')

// Create http server
const app = express()

// Add Vite or respective production middlewares
/** @type {import('vite').ViteDevServer | undefined} */
let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv('./dist/client', { extensions: [] }))
}

async function getToken(req) {
  return readNodeCookie(req.headers.cookie, "auth_token")
}

async function getUser(token) {
  if (!token) return null
  const user = await makeRequestWithAuth(API + "/api/v1/profile", token)
  return user?.data
}

function getHost(req) {
  return req.get('host') || req.get('origin').split('//')[1]
}

async function getSite(req) {
  const domain = getHost(req)
  let site = {}
  try {
    site = await makeRequest(API + "/api/v1/site/" + domain, domain)
  } catch(e) {
    console.error(e, API + "/api/v1/site/" + domain)
  }
  return site.data || {}
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: "ok",
    service: packageJson.name,
    timestamp: Date.now()
  });
});

// Serve HTML
app.use('*all', async (req, res) => {
  console.log("req.path", req.path)
  try {
    const url = req.originalUrl.replace(base, '')
    if (url.includes("logout")) {
      res.clearCookie('auth_token');
      res.redirect("/login")
      return
    }

    const token = await getToken(req)
    const user = await getUser(token)

    const site = await getSite(req, token)
    // setActiveSiteID(site.uuid)

    /** @type {string} */
    let template = site?.template || defaultTemplateHtml

    /** @type {import('./src/entry-server.ts').render} */
    let render
    if (!isProduction) {
      // Always read fresh template in development
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/src/entry-server.ts')).render
    } else {
      render = (await import('./dist/server/entry-server.js')).render
    }

    const { stream, statusCode, serializedState } = await render(url, user || null, site, token || '')
  
    if (user) {
      const headAnchor = "<!--app-head-->"
      const userScript = `<script>window.__PINIA_STATE__ = ${serializedState}</script>`
      template = template.replace(headAnchor, headAnchor + userScript)
    }

    const [htmlStart, htmlEnd] = template.split('<!--app-html-->')

    res.status(statusCode).set({ 'Content-Type': 'text/html' })

    res.write(htmlStart)

    for await (const chunk of stream) {
      if (res.closed) break
      res.write(chunk)
    }
    res.write(htmlEnd)
    res.end()
  } catch (e) {

    const statusCode = parseInt(e.message) || 0
    if (statusCode >= 400 && statusCode < 500) {
      console.log("HTTP Error", statusCode)
      res.status(statusCode).set({ 'Content-Type': 'text/html' })

      res.write(statusCode)
      res.end()

      return
    }

    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})

function makeRequest(url, host = '', method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js/HTTPClient',
        'x-forwarded-host': host,
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      const postData = JSON.stringify(data);
      req.setHeader('Content-Length', Buffer.byteLength(postData));
      req.write(postData);
    }

    req.end();
  });
}

function makeRequestWithAuth(url, authToken, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        // 'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js/HTTPClient'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      const postData = JSON.stringify(data);
      req.setHeader('Content-Length', Buffer.byteLength(postData));
      req.write(postData);
    }

    req.end();
  });
}
