import { buildLayoutTree, parseLayout, itemKey } from './layoutParser.js'
import { handlebarsRender } from './handlebarsRender.js'
import { dataAttributesInjector } from './utils.js'

const MAX_DEPTH = 12
const ROOT_LEVEL = 2

function findRegion(regions, name) {
  return (regions || []).find(region => region.name === name)
}

function indexByKey(nodes) {
  const map = new Map()
  for (const node of nodes || []) {
    map.set(node.key, node)
  }
  return map
}

function indexRegionNodes(regions) {
  const map = new Map()
  for (const region of regions || []) {
    for (const node of region.nodes || []) {
      map.set(node.key, node)
    }
  }
  return map
}

function injectAttributes(html, node) {
  const attributes = {
    uid: node.key,
    cat: node.category,
  }

  if (node.category === 'form') {
    attributes.form_name = node.name.replace(/^~/, '')
  }

  return dataAttributesInjector(html, attributes, node.values?.anchor)
}

function wrapScript(js) {
  return `
    <script>
    (function() {

      ${js}

      // Привязываем деструктор к тегу script, если он объявлен
      if (typeof onDestroy === 'function') {
        document.currentScript.onDestroy = onDestroy;
      }
    })();
    </script>`
}

// Заменяет маркеры внутри html по их позициям (item.start/item.end), сохраняя
// окружающий текст и корректно обрабатывая повторяющиеся маркеры.
function renderMarkers(html, ctx, level, depth) {
  const items = parseLayout(html)

  if (!items.length) {
    return html
  }

  const counts = new Map()
  let out = ''
  let pos = 0

  for (const item of items) {
    out += html.slice(pos, item.start)

    let replacement = ''

    if (item.type === 'region') {
      const region = findRegion(ctx.regions, item.name)
      if (region) {
        replacement = (region.nodes || [])
          .map(node => renderNode(node, ctx, level, depth))
          .join('')
      }
    } else {
      const key = itemKey(item, ctx.parentPath, counts)
      const node = ctx.nodes.get(key)
      if (node) {
        replacement = renderNode(node, ctx, level, depth)
      }
    }

    out += replacement
    pos = item.end
  }

  out += html.slice(pos)
  return out
}

function renderNode(node, ctx, level, depth) {
  if (!node || node.deleted || depth > MAX_DEPTH) {
    return ''
  }

  const values = {
    ...ctx.globalData,
    ...node.values,
  }

  let html = handlebarsRender(node.html || '', values, level)

  html = injectAttributes(html, node)

  const childLevel = level + Number(Boolean(values.title || node.title))

  html = renderMarkers(html, {
    globalData: ctx.globalData,
    regions: node.regions,
    nodes: indexByKey(node.statics),
    parentPath: node.key,
  }, childLevel, depth + 1)

  if (node.js) {
    html += wrapScript(node.js)
  }

  return `<!--${node.key}-->${html}<!--/${node.key}-->`
}

export async function renderLayoutTree(layoutHtml, options = {}) {
  const tree = await buildLayoutTree(layoutHtml, {
    getTemplate: options.getTemplate,
    templatesData: options.templatesData || {},
  })

  return renderMarkers(layoutHtml, {
    globalData: options.globalData || {},
    regions: tree.regions,
    nodes: indexRegionNodes(tree.regions),
    parentPath: '',
  }, ROOT_LEVEL, 0)
}
