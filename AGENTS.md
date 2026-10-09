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
- **`redis/`** — Redis is a template/site store. Required at startup (`initRedis`). The main backend writes templates directly into Redis (`templates:{host}:{name}`, `templates:SHARED:{name}`). The client resolves templates by name from Redis, batching cache misses to the API (`GET /api/v1/service/templates?names=...` for host, `GET /api/v1/service/shared-templates?names=...` for shared) and caching positive results with a 10-day TTL, misses with a 60s TTL.
- **`templates/`** — HTML template pipeline: layout assembly, script/style injection, `[{name}]`/`[{~name}]` include resolution, Handlebar rendering, entity tree building.
- **Styling docs**: `STYLES.md` — full reference for CSS architecture, class system, SAFELIST rules, and form styling.

## Key conventions

- **Forms**: Add `class="form"`. Submission is auto-bound in `/static/main.js` via `POST /api/v1/interactions`.
- **Styling**: See `STYLES.md` for CSS architecture, component classes, SAFELIST rules, forms, and icons.
- **Client globals**: `window.__SITE_SETTINGS` (injected in `<head>`), `window.PJAX` (PJAX client instance).
- **Cookie banner**: Built-in in `/static/main.js`. Reads `window.__SITE_SETTINGS.cookieBannerText`, `.cookieBannerBtn`, `.cookieBannerTemplate`. Sets `cookie_accepted`.
- **Logger**: Custom pino wrapper with key-value pair API: `logger.debug('msg', 'key1', val1, 'key2', val2)`.

## Gotchas

- **Template includes**: server resolves `[{name}]` / `[{~name}]` via `templates/resolveIncludes.js`. Output keeps paired anchors `<!--name-->...<!--/name-->` for client-side PJAX. `ENTITY` is a naming exception — it is replaced with the page template (placeholder for `injectHTML('ENTITY', ...)`).
- **Template cache**: read-by-name from Redis; miss resolution priority is host cache → host API → shared cache → shared API. `getTemplatesByNames` batches by `names=...` (`GET /api/v1/service/templates` with `x-host`; `GET /api/v1/service/shared-templates` without, both with `x-client-service-key: $CLIENT_SERVICE_API_KEY`), caches positives with `REDIS_DEFAULT_EXPIRE_TIME`, and caches API misses under `templates:miss:{host}:{name}` and `templates:miss:SHARED:{name}` with `REDIS_MISS_EXPIRE_TIME` (60s). No `_map`/`_cat_*`/`lastTemplate` sync. `layouts:{host}` aggregate cache and recursive layout assembly were removed.
- **`REDIS_DEFAULT_EXPIRE_TIME`** = 10 days. Template/site cache entries expire after 10 idle days.
- **Site cache**: `fetchSite` caches site data in Redis (`sites:{host}`) and re-fetches when `REDIS_CACHE_TTL_SECOUNDS` elapses. Not set in `.env.production` (`API_CACHE_TTL_SECOUNDS` there instead), so the site cache does not expire via TTL check.
- **`.env.*` files** are gitignored. Sensitive config (API addresses, ports) must be set at deploy.
- **Handlebar templates**: Rendered with `noEscape: true`. Custom helpers: `gt` (greater-than), `loop` (iteration).
- **No tests exist**. ESLint config references vitest but no test files.
- **Lint**: `npx eslint .` (ESLint flat config, warns on 2-space indent, no-unused-vars, no-console, etc.)
