// Vanilla ESM parser + tree builder for page.html (backend-friendly, no deps).
//
// Marker grammar:
//   node:     [{ [!][~]NAME #id [ @global ] ( ...children... )}]
//   no-id:    [{ [!][~]NAME      [ @global ]}]
//   region:   [[NAME #id ( ... )]]   (#id optional and ignored)
//
// Modifiers:
//   !        -> marked as deleted (soft delete)
//   ~        -> "changable" (template can be switched)
//   @global  -> global template: values live in the template (site-wide),
//               only the chosen template name is stored on the page.
//
// Key (path) rules — segments joined by '::', repeats of the same name at one
// level get a '№N' suffix (N >= 2):
//   - has #id  -> `${NAME}#${id}`
//   - no #id   -> `${parentPath}::${NAME}` (or just NAME at the root)
//
// Storage:
//   - id nodes / no-id statics without @global -> values (+ optional name) in page data
//   - @global -> values in the global template; page data holds only { override } when
//     the template was switched.
// Note: `templateName()` strips a leading '~' before resolving a template.

const START_NODE = '[{'
const START_REGION = '[['
const END_NODE = '}]'
const END_REGION = ']]'

const MARKER_RE = /^\s*([^\s#@(]+)\s*(?:#([\w.-]+))?\s*(@global)?\s*(?:\(([\s\S]*)\))?\s*$/

function matchMarkerEnd(html, start) {
  const stack = []
  let i = start

  while (i < html.length) {
    if (html.startsWith(START_NODE, i)) {
      stack.push('node')
      i += 2
      continue
    }
    if (html.startsWith(START_REGION, i)) {
      stack.push('region')
      i += 2
      continue
    }
    if (html.startsWith(END_NODE, i)) {
      stack.pop()
      i += 2
      if (!stack.length) return i
      continue
    }
    if (html.startsWith(END_REGION, i)) {
      stack.pop()
      i += 2
      if (!stack.length) return i
      continue
    }
    i++
  }

  return html.length
}

function parseMarker(raw, kind) {
  const inner = raw.slice(2, -2)
  const match = inner.match(MARKER_RE)

  if (!match) {
    throw new Error('Invalid layout marker: ' + raw)
  }

  const id = match[2]
  const isGlobal = match[3] === '@global'
  const body = match[4]
  let name = match[1]
  let deleted = false

  if (name.startsWith('!')) {
    deleted = true
    name = name.slice(1)
  }

  const changable = name.startsWith('~')
  const children = body != null ? parseLayout(body) : []

  if (kind === 'region') {
    return { type: 'region', name, id, children, raw }
  }

  if (!id) {
    return { type: 'global', name, changable, isGlobal, deleted, raw }
  }

  return { type: 'node', name, id, changable, isGlobal, deleted, children, raw }
}

export function parseLayout(html) {
  const items = []
  let i = 0

  while (i < html.length) {
    if (html.startsWith(START_NODE, i)) {
      const start = i
      const end = matchMarkerEnd(html, i)
      const item = parseMarker(html.slice(i, end), 'node')
      item.start = start
      item.end = end
      items.push(item)
      i = end
    } else if (html.startsWith(START_REGION, i)) {
      const start = i
      const end = matchMarkerEnd(html, i)
      const item = parseMarker(html.slice(i, end), 'region')
      item.start = start
      item.end = end
      items.push(item)
      i = end
    } else {
      i++
    }
  }

  return items
}

function stringifyItem(item) {
  if (item.type === 'global') {
    const global = item.isGlobal ? ' @global' : ''
    return `[{${item.deleted ? '!' : ''}${item.name}${global}}]`
  }

  if (item.type === 'node') {
    const global = item.isGlobal ? ' @global' : ''
    const body = item.children.length ? ` (${stringifyLayout(item.children)})` : ''
    return `[{${item.deleted ? '!' : ''}${item.name} #${item.id}${global}${body}}]`
  }

  const id = item.id ? ` #${item.id}` : ''
  const body = item.children.length ? ` (${stringifyLayout(item.children)})` : ''
  return `[[${item.name}${id}${body}]]`
}

export function stringifyLayout(items) {
  return items.map(stringifyItem).join(',')
}

export function nodeKey(name, id) {
  return `${name}#${id}`
}

export const LAYOUT_ROOT = ''

function templateName(name) {
  return name.replace(/^~/, '')
}

function takeSegment(name, counts) {
  const next = (counts.get(name) || 0) + 1
  counts.set(name, next)
  return next > 1 ? `${name}№${next}` : name
}

export function itemKey(item, parentPath, counts) {
  if (item.type === 'node' && item.id) return nodeKey(item.name, item.id)
  const segment = takeSegment(item.name, counts)
  return parentPath ? `${parentPath}::${segment}` : segment
}

async function buildNode(item, ctx, parentPath, key) {
  if (item.type === 'region') return null

  const isGlobal = Boolean(item.isGlobal)
  const entry = ctx.templatesData ? ctx.templatesData[key] : undefined
  const override = entry && entry.override
  const name = override && override !== item.name ? override : item.name
  const template = await ctx.getTemplate(templateName(name))
  const html = template ? template.html || '' : ''

  const node = {
    key,
    id: item.type === 'node' ? item.id : '',
    name,
    slot: item.name,
    raw: item.raw,
    title: template ? template.title || '' : '',
    category: template ? template.category : '',
    changable: item.changable,
    global: isGlobal,
    deleted: Boolean(item.deleted),
    html,
    js: template ? template.js || '' : '',
    fields: template ? template.fields || [] : [],
    values: {
      ...(template ? template.values || {} : {}),
      ...(isGlobal || !entry || !entry.values ? {} : entry.values),
    },
    parentUid: parentPath,
    regions: [],
    statics: await buildStaticNodes(html, ctx, key, new Set([name])),
  }

  if (item.type !== 'global') {
    node.regions = await buildRegions(item.children, ctx, key)
  }

  return node
}

async function buildStaticNodes(html, ctx, parentPath, seen) {
  const nodes = []
  const counts = new Map()

  for (const item of parseLayout(html)) {
    if (item.type === 'region') continue

    const key = itemKey(item, parentPath, counts)
    const isGlobal = Boolean(item.isGlobal)
    const entry = ctx.templatesData ? ctx.templatesData[key] : undefined
    const override = entry && entry.override
    const name = override && override !== item.name ? override : item.name
    if (seen.has(name)) continue

    const template = await ctx.getTemplate(templateName(name))
    if (!template) continue

    nodes.push({
      key,
      id: item.type === 'node' ? item.id : '',
      name,
      slot: item.name,
      raw: item.raw,
      title: template.title || '',
      category: template.category || '',
      changable: item.changable,
      global: isGlobal,
      deleted: Boolean(item.deleted),
      html: template.html || '',
      js: template.js || '',
      fields: template.fields || [],
      values: {
        ...(template.values || {}),
        ...(isGlobal || !entry || !entry.values ? {} : entry.values),
      },
      parentUid: parentPath,
      regions: [],
      statics: await buildStaticNodes(template.html || '', ctx, key, new Set([...seen, name])),
    })
  }

  return nodes
}

async function buildRegions(items, ctx, parentPath) {
  const regions = []
  let loose = null
  const counts = new Map()

  for (const item of items) {
    if (item.type === 'region') {
      loose = null

      const childCounts = new Map()
      const nodes = (await Promise.all(item.children.map(child =>
        buildNode(child, ctx, parentPath, itemKey(child, parentPath, childCounts)),
      ))).filter(node => node !== null)

      regions.push({ kind: 'region', name: item.name, id: item.id, parentUid: parentPath, raw: item.raw, nodes })
      continue
    }

    const node = await buildNode(item, ctx, parentPath, itemKey(item, parentPath, counts))
    if (!node) continue

    if (!loose) {
      loose = { kind: 'region', name: '', loose: true, parentUid: parentPath, nodes: [] }
      regions.push(loose)
    }
    loose.nodes.push(node)
  }

  return regions
}

export async function buildLayoutTree(html, options) {
  const ctx = {
    getTemplate: options.getTemplate,
    templatesData: options.templatesData || {},
  }

  const regions = await buildRegions(parseLayout(html), ctx, LAYOUT_ROOT)

  return { uid: LAYOUT_ROOT, name: '', html, regions }
}
