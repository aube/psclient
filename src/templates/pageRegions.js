import { parseLayout, stringifyLayout } from './layoutParser.js'

function regionKey(name, counts) {
  const occurrence = (counts.get(name) || 0) + 1
  counts.set(name, occurrence)

  return occurrence > 1 ? `${name}№${occurrence}` : name
}

function collectRootRegions(html) {
  const counts = new Map()
  const regions = new Map()

  for (const item of parseLayout(html || '')) {
    if (item.type !== 'region') continue

    regions.set(regionKey(item.name, counts), stringifyLayout(item.children))
  }

  return regions
}

export function normalizePageRegions(regions) {
  if (regions == null) {
    return undefined
  }

  if (typeof regions === 'string') {
    try {
      regions = JSON.parse(regions)
    } catch {
      return {}
    }
  }

  if (regions == null) {
    return undefined
  }

  if (typeof regions !== 'object' || Array.isArray(regions)) {
    return {}
  }

  return regions
}

// Replaces the content of root-level regions with page.data.regions values.
// Regions are matched by name and position among same-named regions (NAME, NAME№2, ...).
export function applyPageRegions(templateHtml, regions) {
  const html = templateHtml || ''
  const items = parseLayout(html)

  if (!items.length) {
    return html
  }

  const counts = new Map()
  let out = ''
  let pos = 0

  for (const item of items) {
    out += html.slice(pos, item.start)

    if (item.type === 'region') {
      const key = regionKey(item.name, counts)

      if (regions && Object.prototype.hasOwnProperty.call(regions, key)) {
        out += stringifyLayout([{
          ...item,
          children: parseLayout(regions[key] || ''),
        }])
      } else {
        out += item.raw
      }
    } else {
      out += item.raw
    }

    pos = item.end
  }

  out += html.slice(pos)

  return out
}

// Extracts only root regions that differ from the template. Explicit empty
// regions are preserved, as are previous keys without a matching template region.
export function extractPageRegions(layoutHtml, templateHtml, previous = {}) {
  const layoutRegions = collectRootRegions(layoutHtml)
  const templateRegions = collectRootRegions(templateHtml)
  const result = {}

  for (const [key, content] of layoutRegions) {
    if (!templateRegions.has(key) || templateRegions.get(key) !== content) {
      result[key] = content
    }
  }

  for (const [key, content] of Object.entries(previous || {})) {
    if (!templateRegions.has(key)) {
      result[key] = content
    }
  }

  return result
}

// One-time migration from legacy page.html to page.data.regions.
export function migratePageRegions(legacyPageHtml, templateHtml) {
  return extractPageRegions(legacyPageHtml, templateHtml, {})
}
