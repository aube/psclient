# AGENTS.md

## Project: PJAX proxy server

ESM Node.js Express proxy (`server.js`) that renders HTML pages server-side using Handlebar templates stored in Redis. Uses PJAX (partial page loads) for navigation.

## Quick start

```sh
# dev with Docker (requires SERVICE_NAME in .env.local)
make dev

# or without Docker
node server.js
```

## Architecture

- **`server.js`** — entrypoint. Express app, static files from `/static`, hot-reload SSE at `/hot-reload`, all GET requests handled by `mainHandler`.
- **`routes/mainHandler.js`** — core logic. `fullLoad` renders full HTML, `partialLoad` returns JSON fragment for PJAX.
- **`api_client/`** — fetch functions that call an external API. No DB, API is source of truth.
- **`redis/`** — Redis is a cache/template store. Required at startup (`initRedis` + `flushDb`). Templates, site data, layout cache all stored here with 10-day TTL.
- **`templates/`** — HTML template pipeline: layout assembly, script/style injection, Handlebar rendering, entity tree building.
- **Styling docs**: `STYLES.md` — full reference for CSS architecture, class system, SAFELIST rules, and form styling.

## Key conventions

- **Forms**: Add `class="form"`. Submission is auto-bound in `/static/main.js` via `POST /api/v1/interactions`.
- **Styling**: See `STYLES.md` for CSS architecture, component classes, SAFELIST rules, forms, and icons.
- **Client globals**: `window.__SITE_SETTINGS` (injected in `<head>`), `window.PJAX` (PJAX client instance).
- **Cookie banner**: Built-in in `/static/main.js`. Reads `window.__SITE_SETTINGS.cookieBannerText`, `.cookieBannerBtn`, `.cookieBannerTemplate`. Sets `cookie_accepted`.
- **Logger**: Custom pino wrapper with key-value pair API: `logger.debug('msg', 'key1', val1, 'key2', val2)`.

## Gotchas

- **`fetchTemplatesLast` bug**: `if (Array.isArray(templates) && templates.length > 0)` — empty array `[]` is truthy in JS, don't use bare `if (templates)`.
- **CSS regen on every F5**: Fixed. `fetchTemplatesLast` now returns `false` for `[]`. Hash comparison in `cssTWRegenerate` / `cssTemplatesRegenerate` (on the TWCSS server) prevents actual regen.
- **`const/base.tailwind.js`** — this file lives on the TWCSS server, not in this repo.
- **`REDIS_CACHE_TTL_SECOUNDS`** env var: controls how often `fetchSite` re-fetches from API. Not set in `.env.production` — layout cache then never expires via TTL check.
- **`REDIS_DEFAULT_EXPIRE_TIME`** = 10 days. All `setString` and hash keys expire after 10 idle days.
- **`.env.*` files** are gitignored. Sensitive config (API addresses, ports) must be set at deploy.
- **Handlebar templates**: Rendered with `noEscape: true`. Custom helpers: `gt` (greater-than), `loop` (iteration).
- **No tests exist**. ESLint config references vitest but no test files.
- **Lint**: `npx eslint .` (ESLint flat config, warns on 2-space indent, no-unused-vars, no-console, etc.)
