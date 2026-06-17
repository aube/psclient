# Styling principles

## Architecture

The style system is split between two services:

**PJAX Proxy (this server)**
- Serves `static/core.css` (icon mask class).
- Injects CSS `<link>` tags into `<head>` via `templates/injectStyles.js`.
- Renders server-side HTML templates using Tailwind and component classes.

**TWCSS server (external — not in this repo)**
- Contains `base.tailwind.js` with `TW_CLASSES_SAFELIST`, `TW_BASE_CSS` (component classes), and the Tailwind theme config.
- Generates `twstyle.css` (Tailwind utility classes) and `templates.css` (component class styles).
- Uploads generated CSS to the API via `sendStringAsFile.js` with `category: 'css'`.

**API** — stores CSS files and provides hashes through `site.settings.hashes`.

## CSS files (load order)

```html
<link rel="stylesheet" href="/static/core.css?h=0">
<link rel="stylesheet" href="/style.css?h=0">
<link rel="stylesheet" href="/twstyle.css?h={twhash}">
<link rel="stylesheet" href="/templates.css?h={tplcsshash}">
```

| File | Source | Description |
|------|--------|-------------|
| `static/core.css` | This repo | `.icon` class for SVG masks |
| `style.css` | API (via admin) | Site-specific CSS |
| `twstyle.css` | TWCSS server | Generated Tailwind utilities |
| `templates.css` | TWCSS server | Generated component classes |

Hashes for `twstyle.css` and `templates.css` come from `site.settings.hashes`. The injection happens in `templates/injectStyles.js` → `injectStylesHead(hashes, htmlLayout)`.

CSS generation is cached: the TWCSS server compares hashes before regenerating (`cssTWRegenerate` / `cssTemplatesRegenerate`).

## Class system

### Component classes (defined in TW_BASE_CSS)

| Class | Purpose |
|-------|---------|
| `.btn-primary` | Primary action button |
| `.btn-secondary` | Secondary action button |
| `.btn-submit` | Form submit button |
| `.card` | Card/panel container |
| `.form-input` | Text input / textarea / select |
| `.form-label` | Field label |
| `.form-group` | Field wrapper |
| `.checkbox-label` | Checkbox label |
| `.checkbox-input` | Hidden checkbox input |
| `.checkbox-custom` | Custom checkbox visual |
| `.checkbox-text` | Checkbox text |
| `.radio-label` | Radio label |
| `.radio-input` | Hidden radio input |
| `.radio-custom` | Custom radio visual |
| `.radio-text` | Radio text |
| `.contact-form-wrapper` | Outer form wrapper |
| `.inverted` | Dark/inverted section background |

### Tailwind utility classes

Used directly in templates and dynamic DOM. Examples:
`space-y-3`, `space-y-6`, `p-4`, `px-6`, `m-4`, `gap-4`, `text-xs`, `text-base`, `font-medium`, `hidden`, `underline`, `mt-1`, `fixed`, `bottom-4`, `z-50`, `left-1/2`, `-translate-x-1/2`, `items-center`, `justify-between`, `break-words`, `shadow-elevated`, `md:-translate-x-1/2`, `border-border-subtle`.

### Prefix-style variables

Convention: `text-*`, `bg-*`, `border-*` with semantic name resolve to CSS variables:
- `text-action-primary` → `var(--action-primary)`
- `text-content-secondary` → `var(--content-secondary)`
- `border-border-subtle` → `var(--border-subtle)`

Defined in the TWCSS `base.tailwind.js` theme config.

## SAFELIST

Classes used in **dynamically created DOM** (JS in `static/main.js`) or in **form HTML templates** must be added to `TW_CLASSES_SAFELIST` in `base.tailwind.js` on the TWCSS server, otherwise they will be purged.

Dynamic classes currently in the cookie banner (`static/main.js`):
```
inverted card p-4 px-6 m-4 gap-4 shadow-elevated
fixed bottom-4 z-50 left-1/2 -translate-x-1/2
items-center justify-between md:-translate-x-1/2 break-words
btn-primary mt-4
```

Classes used in form templates (see `forms/`):
```
space-y-3 space-y-6 text-xs text-base font-medium hidden
underline mt-1 border-border-subtle
```

Classes used in server-side templates that pass through `@apply` in `TW_BASE_CSS` are safe from purging.

**Important**: `base.tailwind.js` does NOT live in this repo — it lives on the TWCSS server.

## Forms

Add `class="form"` to the `<form>` element to enable auto-binding in `static/main.js` — the form will submit via `POST /api/v1/interactions` as FormData.

Typical form structure:
```html
<form class="form contact-form-wrapper space-y-6">
  <div class="form-group">
    <label class="form-label">Field name</label>
    <input class="form-input" name="field" type="text">
  </div>
  <div class="checkbox-label">
    <input class="checkbox-input" type="checkbox" name="opt" id="opt">
    <div class="checkbox-custom"></div>
    <span class="checkbox-text">Option</span>
  </div>
  <button class="btn-submit" type="submit">Send</button>
</form>
```

## Client-side styling (static/main.js)

- **Cookie banner**: Created dynamically with `className = [...]`. Template can be overridden via `window.__SITE_SETTINGS.cookieBannerTemplate`. All classes must be in SAFELIST.
- **PJAX**: Navigation states set `pjax-loading` / `pjax-error` classes on `<body>`.
- **Inline styles**: `background-color: var(--color-surface-main)` used on the cookie banner button.

## Icons

Use the `.icon` class from `static/core.css`:
```html
<div class="icon" style="--icon-url: url(/path/to/icon.svg)"></div>
```
Uses CSS `mask-image` with `currentColor`.

## Gotchas

- `base.tailwind.js` is on the TWCSS server, not in this repo.
- Any new Tailwind class used in JS or form templates → add to SAFELIST.
- CSS hashes come from `site.settings.hashes` — missing hashes silently skip the corresponding `<link>` tag.
- Theme CSS variables (colors, spacing) are configured in `base.tailwind.js` theme config.
