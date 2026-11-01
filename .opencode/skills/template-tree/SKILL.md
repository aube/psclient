---
name: template-tree
description: Алгоритмы парсинга page.html и построения дерева нод psadmin: AST, UID/path, регионы, static includes, loose-регионы, materialize и структурные действия. Use when porting or debugging parseLayout, buildLayoutTree, key generation, materialize or layout mutations.
---

# Дерево нод: алгоритмы

Навык для переписывания/портирования построителя дерева. Описание модели — в `template-system`, сборка HTML — в `template-render`. Здесь только входы, алгоритмы, инварианты и тест-векторы. Код дан псевдокодом; конкретные имена функций и файлов — в приложении.

## Входы и выходы

```text
Вход:
  html: string                 // page.html или Template.html
  ctx.getTemplate(name) -> Template | null
  ctx.getTemplatesData() -> Record<uid, { override?, values? }>

Выход:
  LayoutTree {
    uid: '',
    name: '',
    html,
    regions: TreeRegion[]
  }
```

`getTemplate` получает имя **без** ведущего `~`; `getTemplatesData` — данные `page.data.template2`.

## Структуры данных

AST после парсинга:

```ts
interface LayoutNode {
  type: 'node'
  name: string          // как написано, включая ведущий '~'
  id?: string
  changable: boolean    // name.startsWith('~')
  isGlobal: boolean
  deleted?: boolean
  children: LayoutItem[]
}

interface LayoutRegion {
  type: 'region'
  name: string
  id?: string
  children: LayoutItem[]
}

type LayoutItem = LayoutNode | LayoutRegion
```

Дерево:

```ts
interface LayoutTree {
  uid: ''               // LAYOUT_ROOT
  name: ''
  html: string
  regions: TreeRegion[]
}

interface TreeRegion {
  kind: 'region'
  name: string
  id?: string
  loose?: boolean       // true для контейнера узлов вне регионов
  parentUid: string     // UID узла-владельца; '' на корне
  nodes: TreeNode[]
}

interface TreeNode {
  kind: 'node'
  id: string            // '' если #id не было
  uid: string           // path-ключ
  name: string          // имя с учётом override
  slot: string          // исходное имя маркера (с '~')
  title?: string
  description?: string
  category: string
  changable: boolean
  global: boolean
  deleted?: boolean
  html: string          // Template.html
  fields: FormField[]
  defaultValues: Record<string, any>  // Template.values
  parentUid: string
  regions: TreeRegion[]
  statics?: TreeNode[]
}
```

Важно: `defaultValues` — значения шаблона. Значения страницы (`template2[uid].values`) в дерево можно не мержить; их применяет рендер. Некоторые реализации (vanilla-парсер) мержат сразу в `values` — это допустимая оптимизация, но тогда нужно сохранить разделение global/non-global.

---

## Шаг 0. Парсинг маркеров

### 0.1. Границы маркера

Константы: `START_NODE = "[{"`, `START_REGION = "[["`, `END_NODE = "}]"`, `END_REGION = "]]"`.

```text
function matchMarkerEnd(html, start):
  stack = []
  i = start
  while i < len(html):
    if html.startsWith(START_NODE, i):   stack.push('node');   i += 2; continue
    if html.startsWith(START_REGION, i): stack.push('region'); i += 2; continue
    if html.startsWith(END_NODE, i):
      stack.pop(); i += 2
      if stack.empty(): return i
      continue
    if html.startsWith(END_REGION, i):
      stack.pop(); i += 2
      if stack.empty(): return i
      continue
    i += 1
  return len(html)          // незакрытый маркер съедает остаток строки
```

Стек нужен, потому что `children` содержит вложенные `[{...}]`/`[[...]]` и закрывающие пары могут чередоваться.

### 0.2. Разбор тела маркера

Тело — `raw[2:-2]`. Регулярка:

```text
^\s*([^\s#@(]+)\s*(?:#([\w.-]+))?\s*(@global)?\s*(?:\(([\s\S]*)\))?\s*$
```

Группы: `1 = name`, `2 = id`, `3 = @global`, `4 = children`.

```text
function parseMarker(raw, kind):
  inner = raw[2:-2]
  m = match(inner, MARKER_RE)
  if not m: throw "Invalid layout marker: " + raw

  name = m[1]
  id = m[2]
  isGlobal = (m[3] == '@global')
  body = m[4]                 // null, если скобок не было
  deleted = false

  if name.startsWith('!'):
    deleted = true
    name = name[1:]           // '!' не входит в ключ

  changable = name.startsWith('~')   // '~' остаётся в name
  children = body != null ? parseLayout(body) : []

  if kind == 'region':
    return { type:'region', name, id, children }
  return { type:'node', name, id, changable, isGlobal, deleted, children }
```

Свойства:

- `!` и `~` могут стоять вместе: `!~NAME` → `deleted = true`, `name = "~NAME"`, `changable = true`.
- `@global` не зависит от `#id`; допустимы оба.
- `children` — результат рекурсивного `parseLayout` над содержимым скобок.

### 0.3. Обход HTML

```text
function parseLayout(html):
  items = []
  i = 0
  while i < len(html):
    if html.startsWith(START_NODE, i):
      end = matchMarkerEnd(html, i)
      items.push(parseMarker(html[i:end], 'node'))
      i = end
    else if html.startsWith(START_REGION, i):
      end = matchMarkerEnd(html, i)
      items.push(parseMarker(html[i:end], 'region'))
      i = end
    else:
      i += 1
  return items
```

Это текстовый скан, а не HTML-парсер: маркеры распознаются в любом месте строки (в тексте, атрибутах, script/comment), кроме случая, когда последовательность не совпала. Если нужно игнорировать маркеры внутри `<script>`/`<style>`, это отдельная предобработка, которой в эталонной реализации нет.

### 0.4. Стрингификация и замена

```text
function stringifyItem(item):
  if item.type == 'node':
    id     = item.id ? ' #' + item.id : ''
    global = item.isGlobal ? ' @global' : ''
    body   = item.children.length ? ' (' + stringifyLayout(item.children) + ')' : ''
    return '[{' + (item.deleted ? '!' : '') + item.name + id + global + body + '}]'

  id   = item.id ? ' #' + item.id : ''
  body = item.children.length ? ' (' + stringifyLayout(item.children) + ')' : ''
  return '[[' + item.name + id + body + ']]'

function stringifyLayout(items):
  return items.map(stringifyItem).join(',')
```

```text
function replaceLayoutMarkers(html, replacer):
  out = ''
  i = 0
  while i < len(html):
    if html.startsWith(START_NODE, i):
      end = matchMarkerEnd(html, i)
      raw = html[i:end]
      out += replacer(parseMarker(raw, 'node'), raw)
      i = end
    else if html.startsWith(START_REGION, i):
      end = matchMarkerEnd(html, i)
      raw = html[i:end]
      out += replacer(parseMarker(raw, 'region'), raw)
      i = end
    else:
      out += html[i]
      i += 1
  return out
```

`replaceLayoutMarkers` сохраняет всю статическую разметку и whitespace; `stringifyLayout` нормализует пробелы **внутри** маркеров.

### Edge-cases парсера

- Невалидное тело → исключение (а не тихий пропуск).
- Незакрытый маркер → `matchMarkerEnd` возвращает конец строки; маркер будет разобран как «до конца».
- Пустые `children` `()` → `body != null`, `children = []`; при стрингификации пустые скобки исчезнут.
- `#id` региона парсится, но в ключах и поиске не участвует.
- `name` не нормализуется: регистр, `~`, подчёркивания сохраняются.

---

## Шаг 1. Ключ (UID/path)

```text
LAYOUT_ROOT = ''

function layoutUid(name, id):
  return name + '#' + id

function layoutItemKey(item, parentUid, counts):
  if item.type == 'node' and item.id:
    segment = layoutUid(item.name, item.id)    // counts НЕ увеличивается
  else:
    n = (counts[item.name] or 0) + 1
    counts[item.name] = n
    segment = n > 1 ? item.name + '№' + n : item.name

  return parentUid ? parentUid + '::' + segment : segment
```

Правила:

- `counts` — на один список (`children` одного региона/шаблона/корня). Для каждого региона счётчики начинаются заново.
- Узел с `#id` не увеличивает счётчик своего имени.
- Повторные no-id маркеры на одном уровне: `NAME`, `NAME№2`, `NAME№3`, …
- Вложенность: `PARENT::CHILD`.
- Регион не добавляет сегмент: дети региона используют UID узла-владельца как `parentUid`.
- `#id` в начале `name` не хранится; `layoutUid` сама добавляет `#`.

### Legacy

```text
function layoutLegacyUid(item):
  if item.type == 'node' and item.id:
    return item.name + '#' + item.id
  return null

function getLayoutEntry(data, key, legacyKey):
  if data == null: return undefined
  if data[key] != undefined: return data[key]
  if legacyKey != null and legacyKey != key: return data[legacyKey]
  return undefined
```

Старые ключи вложенных узлов были плоскими (`NAME#id`). Новый ключ имеет приоритет; legacy читается только как fallback.

### Известное ограничение

Два одноимённых региона на одном уровне с одинаковыми именами детей дают одинаковые ключи: счётчики сбрасываются на каждом регионе, а `parentUid` у них общий. Регионы сопоставляются позиционно, но ключи детей могут совпасть. Если это критично для порта, добавьте номер региона в `parentUid` или в счётчик.

### Примеры ключей

```text
[{HERO_DEFAULT #hero}]                         -> HERO_DEFAULT#hero
[{BLOCK_ONE}]                                  -> BLOCK_ONE
[{BLOCK_ONE}],[{BLOCK_ONE}]                    -> BLOCK_ONE, BLOCK_ONE№2
[[SECTIONS ([{SECTION_DEFAULT #s1
  ([[BLOCKS ([{BLOCK_ONE #b1}])]])}])]]
  section                                      -> SECTION_DEFAULT#s1
  block                                        -> SECTION_DEFAULT#s1::BLOCK_ONE#b1
шаблон STATIC_ID_HOST: [{STATIC_WITH_ID #fixed}]
  при подключении [{STATIC_ID_HOST #host}]    -> STATIC_ID_HOST#host::STATIC_WITH_ID#fixed
```

---

## Шаг 2. Resolve имени и override

```text
function resolveName(item, key, ctx):
  entry = getLayoutEntry(ctx.getTemplatesData(), key, layoutLegacyUid(item))
  override = entry?.override
  return (override and override != item.name) ? override : item.name

function loadTemplate(name, ctx):
  return ctx.getTemplate(name.replace(/^~/, ''))
```

- `slot` — исходное имя маркера (`~NAME`), `name` — разрешённое (с override).
- `override` применяется и к `@global`, и к static include.
- Ведущий `~` срезается **только** при поиске шаблона; в `template2` ключ содержит `~`.

---

## Шаг 3. Построение дерева

### 3.1. Корень и регионы

```text
function buildLayoutTree(html, ctx):
  return { uid:'', name:'', html, regions: buildRegions(parseLayout(html), ctx, '') }

function buildRegions(items, ctx, parentUid, seen = null):
  regions = []
  loose = null
  counts = {}

  for item in items:
    if item.type == 'region':
      loose = null
      childCounts = {}
      nodes = []
      for child in item.children:
        if child.type == 'region': continue      // регион внутри региона здесь пропускается
        key = layoutItemKey(child, parentUid, childCounts)
        nodes.push(buildNode(child, ctx, parentUid, key, seen))
      regions.push({ kind:'region', name:item.name, id:item.id, parentUid, nodes })
      continue

    key = layoutItemKey(item, parentUid, counts)
    node = buildNode(item, ctx, parentUid, key, seen)
    if loose == null:
      loose = { kind:'region', name:'', loose:true, parentUid, nodes:[] }
      regions.push(loose)
    loose.nodes.push(node)

  return regions
```

Ключевое:

- Узлы **вне** регионов группируются в loose-регион (`name: ''`, `loose: true`).
- Любой именованный регион сбрасывает `loose`; следующие за ним узлы снова образуют новый loose.
- Порядок регионов — порядок маркеров в HTML, с loose вкраплениями.
- `parentUid` у региона и его детей — UID узла-владельца, а не имя региона.

### 3.2. Узел

```text
function buildNode(item, ctx, parentUid, key, seen):
  name = resolveName(item, key, ctx)
  template = loadTemplate(name, ctx)

  return {
    kind:'node',
    id: item.id or '',
    uid: key,
    name,
    slot: item.name,
    title: template?.title,
    description: template?.description,
    category: template?.category or '',
    changable: item.changable,
    global: item.isGlobal == true,
    deleted: item.deleted,
    html: template?.html or '',
    fields: template?.fields or [],
    defaultValues: template?.values or {},
    parentUid,
    regions: buildRegions(item.children, ctx, key, seen),
    statics: buildStaticNodes(template?.html or '', ctx, key, union(seen, {name}))
  }
```

Если шаблон не найден: `html = ''`, `fields = []`, `defaultValues = {}`, regions из явных children всё равно строятся, statics пустые.

### 3.3. Static includes

Static include — node-маркер внутри `Template.html`. Регионы внутри `Template.html` обрабатываются отдельно.

```text
function buildStaticNodes(html, ctx, parentUid, seen):
  nodes = []
  counts = {}

  for item in parseLayout(html):
    if item.type == 'region': continue

    key = layoutItemKey(item, parentUid, counts)
    name = resolveName(item, key, ctx)
    if name in seen: continue                 // защита от циклов по разрешённому имени
    template = loadTemplate(name, ctx)
    if template == null: continue

    nextSeen = union(seen, {name})
    explicitRegions = buildRegions(item.children, ctx, key, nextSeen)
    templateRegions = buildTemplateRegions(template.html, ctx, key, nextSeen)

    nodes.push({
      kind:'node',
      id: item.id or '',
      uid: key,
      name,
      slot: item.name,
      title: template.title,
      description: template.description,
      category: template.category or '',
      changable: item.changable,
      global: item.isGlobal == true,
      deleted: item.deleted,
      html: template.html or '',
      fields: template.fields or [],
      defaultValues: template.values or {},
      parentUid,
      regions: mergeRegions(templateRegions, explicitRegions),
      statics: buildStaticNodes(template.html or '', ctx, key, nextSeen)
    })

  return nodes
```

```text
function buildTemplateRegions(html, ctx, parentUid, seen):
  regions = []
  for item in parseLayout(html):
    if item.type != 'region': continue
    regions.push(...buildRegions([item], ctx, parentUid, seen))
  return regions
```

Особенности:

- `seen` содержит разрешённые имена (`name`) по цепочке. Если шаблон снова включает сам себя — static пропускается, цикл обрывается.
- Static include с `#id` получает ключ с родительским префиксом: `HOST_UID::NAME#id`.
- Static include может быть `@global`; флаг сохраняется, значения берутся из шаблона.
- `deleted` static include сохраняется в дереве. Эталонный рендер пропускает `deleted` только у детей регионов, но не у static include — учитывайте это при порте.

### 3.4. Merge регионов шаблона и явных children

```text
function mergeRegions(templateRegions, explicitRegions):
  result = copy(templateRegions)
  for region in explicitRegions:
    if not region.name: continue            // loose не мержится
    idx = result.findIndex(r => r.name == region.name)
    if idx == -1: result.push(region)
    else: result[idx] = region
  return result
```

Правила:

- Порядок — сначала регионы из `Template.html`, затем явные регионы, которых нет в шаблоне.
- Явный регион с тем же именем **заменяет** шаблонный (приоритет `page.html`).
- Loose-регионы явных children отбрасываются при merge; их содержимое не попадает в итоговые регионы. Поэтому для показа детей используйте `getLayoutNodeRegions` (см. ниже), а не только `regions`.

---

## Шаг 4. Порядок отображения (statics + regions)

`TreeNode.regions` — это результат merge, где statics хранятся отдельно в `node.statics`. Чтобы получить реальный порядок, нужно снова пройти по `node.html`:

```text
function getLayoutNodeRegions(node):
  staticsBySlot = group(node.statics by stat.slot)
  staticCounts = {}
  usedStatics = set()
  usedRegions = set()
  pendingStatics = []
  regions = []

  flushStatics():
    if pendingStatics.empty(): return
    regions.push({ kind:'region', name:'', loose:true, parentUid:node.uid,
                   nodes: pendingStatics })
    pendingStatics = []

  for item in parseLayout(node.html):
    if item.type == 'region':
      flushStatics()
      region = first node.regions where name == item.name and not used
      if region == null:
        regions.push({ kind:'region', name:item.name, id:item.id,
                       parentUid:node.uid, nodes:[] })
      else:
        usedRegions.add(region)
        regions.push(region)
      continue

    idx = (staticCounts[item.name] or 0)
    staticCounts[item.name] = idx + 1
    stat = staticsBySlot[item.name]?.[idx]
    if stat == null or stat in usedStatics: continue
    usedStatics.add(stat)
    pendingStatics.push(stat)

  flushStatics()

  leftover = node.statics where not in usedStatics
  if leftover: regions.push({ name:'', loose:true, parentUid:node.uid, nodes:leftover })

  for region in node.regions where not in usedRegions:
    regions.push(region)

  return regions

function getLayoutNodeChildren(node):
  return getLayoutNodeRegions(node).flatMap(r => r.nodes)
```

Правила сопоставления:

- Static ищется по `slot` (исходное имя с `~`), а не по `name` (override).
- При повторах одного `slot` — по позиции: первый маркер → первый static, второй → второй.
- Если static не найден в `node.statics` — маркер игнорируется при показе.
- Неиспользованные statics и регионы не теряются: добавляются в конец (statics — loose-регионом).
- Пустые регионы из шаблона тоже попадают в выдачу — это нужно редактору.

---

## Шаг 5. Materialize

Materialize добавляет в `page.html` отсутствующие регионы, объявленные в `Template.html`. Он **не** разворачивает static includes и **не** трогает `@global`.

```text
function materializeLayout(html, ctx):
  items = parseLayout(html)
  out = materializeList(items, ctx, '')

  idx = 0
  return replaceLayoutMarkers(html, () => stringifyLayout([out[idx++]]))

function materializeList(items, ctx, parentUid):
  counts = {}
  result = []
  for item in items:
    if item.type == 'region':
      result.push(materializeItem(item, ctx, parentUid, ''))
    else:
      key = layoutItemKey(item, parentUid, counts)
      result.push(materializeItem(item, ctx, parentUid, key))
  return result

function materializeItem(item, ctx, parentUid, key):
  if item.type == 'region':
    return { ...item, children: materializeList(item.children, ctx, parentUid) }

  if item.isGlobal:
    return item                       // @global не материализуется

  children = materializeList(item.children, ctx, key)
  template = loadTemplate(resolveName(item, key, ctx), ctx)
  if template == null or template.html is empty:
    return { ...item, children }

  return { ...item, children: withMissingRegions(children, template.html) }

function withMissingRegions(children, templateHtml):
  existing = children.filter(type == 'region')
  used = set()
  result = copy(children)

  for item in parseLayout(templateHtml):
    if item.type != 'region': continue

    same = first existing region with name == item.name and not used
    if same != null:
      used.add(same)
      continue

    result.push({ type:'region', name:item.name, id:item.id, children:[] })

  return result
```

Правила:

- Регион добавляется в конец `children` узла, пустым.
- Существующий регион с тем же именем не дублируется; при повторах в шаблоне добавляются позиционные копии.
- Материализация рекурсивна по странице: узлы внутри регионов и явных children тоже обрабатываются.
- `@global` и его явные children не материализуются.
- Static includes внутри `Template.html` не попадают в `page.html`: они остаются в шаблоне и разворачиваются при рендере.
- Если шаблон не найден или `html` пуст — добавлять нечего, но рекурсия по existing children выполняется.
- `replaceLayoutMarkers` + `stringifyLayout` сохраняют статическую разметку; пробелы внутри маркеров нормализуются.

---

## Шаг 6. Структурные действия

Все действия работают поверх AST и пересобирают HTML через `replaceLayoutMarkers`, поэтому UID вычисляется тем же `layoutItemKey`, что и в дереве.

```text
function updateLayout(html, visit):
  counts = {}
  return replaceLayoutMarkers(html, item => {
    updated = item.type == 'region'
      ? visitRegion(item, '', visit)
      : visitNode(item, layoutItemKey(item, '', counts), visit)
    return updated ? stringifyLayout([updated]) : ''
  })

function visitRegion(item, parentUid, visit):
  return visit({ ...item, children: visitList(item.children, parentUid, visit) }, null)

function visitNode(item, uid, visit):
  return visit({ ...item, children: visitList(item.children, uid, visit) }, uid)

function visitList(items, parentUid, visit):
  counts = {}
  result = []
  for item in items:
    updated = item.type == 'region'
      ? visitRegion(item, parentUid, visit)
      : visitNode(item, layoutItemKey(item, parentUid, counts), visit)
    if updated != null: result.push(updated)
  return result
```

UID региона для visitor — `null` (регион не адресуется ключом).

### `insertItem(html, rootUid, options)`

Опции: `parentUid`, `regionName`, `item`, `index?`, `createMissingRegion?`.

```text
if current is region:
  if parentUid == rootUid and current.name == regionName:
    return insertAt(current, item, index)
  return current

if current is node and uid == parentUid:
  idx = index of region child with name == regionName
  if idx == -1:
    if not createMissingRegion: return current
    return { ...current, children: [..., makeRegion(regionName) with item] }
  replace region at idx with insertAt(region, item, index)
```

`insertAt` делает `children.splice(index ?? children.length, 0, item)`.

### `moveItem(html, rootUid, options)`

Опции: `ownerUid`, `regionName`, `from`, `to`. Перемещение внутри одного региона; невалидные индексы — no-op. Для корня условие `ownerUid == rootUid`; для узла — ищется дочерний регион по имени.

### `removeItem(html, uid)`

Visitor возвращает `null` для совпавшего UID; `updateLayout` превращает это в `''` (маркер удаляется вместе с детьми).

### `setItemDeleted(html, uid, deleted)`

Visitor возвращает `{ ...current, deleted }`; `!` появится/исчезнет при стрингификации.

### `copyItem(html, rootUid, uid, options)`

1. `findLayoutItem(parseLayout(html), uid)`.
2. `cloneWithNewIds(source)`:
   - рекурсивно клонировать детей;
   - если у node был `id` — выдать новый случайный id;
   - если `id` не было — оставить без id;
   - регионы клонируются как есть.
3. Вставить клон через `insertItem`.

### `findLayoutItem(items, uid)`

```text
function findInList(items, parentUid, uid):
  counts = {}
  for item in items:
    if item.type == 'region':
      found = findInList(item.children, parentUid, uid)
      if found: return found
      continue
    key = layoutItemKey(item, parentUid, counts)
    if key == uid: return item
    found = findInList(item.children, key, uid)
    if found: return found
  return null
```

- Ключи no-id узлов адресуются по path (`PARENT::NAME`), поэтому действия над ними работают.
- После `insertItem` с `createMissingRegion`/изменением структуры имеет смысл вызвать `materializeLayout`, иначе дочерние регионы шаблона не появятся в `page.html`.
- При удалении узла UI должен удалить и новый, и legacy-ключ из `template2`.

---

## Инварианты и edge-cases

- `name` в AST содержит `~`; `!` удалён из `name` и хранится в `deleted`.
- `#id` не влияет на регионы, children и materialize.
- `@global` не отменяет `#id` и не отменяет children.
- Регион не входит в UID; его `#id` не используется для поиска.
- Счётчики `№N` — на список, не глобальные.
- Узлы с `#id` не увеличивают счётчик имени.
- No-id узел может иметь собственные регионы и children.
- Static include ищется по `slot` (с `~`), а не по `name`.
- `override` применяется до загрузки шаблона; ключ для поиска override — path-ключ.
- Legacy-ключ читается только как fallback; запись — всегда новый ключ.
- `seen` защищает только static-рекурсию; цикл через page-маркеры теоретически возможен при ручном редактировании HTML.
- Шаблон может отсутствовать: узел остаётся в дереве с пустым `html`.
- `deleted` узел остаётся в дереве и в `page.html`; рендер его пропускает.
- `deleted` static include рендерится эталонной реализацией (проверяется только у детей регионов).
- Одноимённые регионы сопоставляются позиционно; ключи их детей могут совпасть.

---

## Тест-векторы

1. **Парсинг/стрингификация**

```text
вход:  [{~HEADER_DEFAULT #h}]
AST:   node { name:'~HEADER_DEFAULT', id:'h', changable:true, isGlobal:false }
выход: [{~HEADER_DEFAULT #h}]
```

2. **Флаги**

```text
вход:  [{FOOTER_FULL #f @global}]
AST:   node { name:'FOOTER_FULL', id:'f', isGlobal:true, deleted:false }
вход:  [{!~SECTION_MONO #s1 ([[BLOCKS]])}]
AST:   node { name:'~SECTION_MONO', id:'s1', deleted:true, changable:true }
```

3. **Ключи**

```text
[{BLOCK_ONE}],[{BLOCK_ONE}]              -> BLOCK_ONE, BLOCK_ONE№2
[[SECTIONS ([{SECTION_DEFAULT #s1
  ([[BLOCKS ([{BLOCK_ONE #b1}])]])}])]]  -> SECTION_DEFAULT#s1
                                            SECTION_DEFAULT#s1::BLOCK_ONE#b1
```

4. **Loose-регионы**

```text
вход: [{~HEADER_DEFAULT #h}]<main>[{HERO_DEFAULT #hero}]</main>
      [[SECTIONS (...)]]
      [{WIDGET_CALENDAR @global}][{~FOOTER_FULL #f}]
регионы: ['', 'SECTIONS', '']
         [0].loose = true, узлы [~HEADER_DEFAULT, HERO_DEFAULT]
         [2].узлы [WIDGET_CALENDAR, ~FOOTER_FULL]
```

5. **Override раскрывает регионы шаблона**

```text
template2: { '~SECTION_MONO#tzBdqD': { override: 'SECTION_COLUMNS' } }
SECTION_COLUMNS.html = '<div>[[BLOCKS0]][[BLOCKS1]][[BLOCKS2]]</div>'
результат: node.name = SECTION_COLUMNS,
           node.regions = [BLOCKS0, BLOCKS1, BLOCKS2] (пустые)
```

6. **Явный регион перекрывает шаблонный**

```text
вход:  [{~SECTION_MONO #tzBdqD ([[BLOCKS0 ([{BLOCK_ONE #b1}])]])}]
результат: регионы [BLOCKS0, BLOCKS1, BLOCKS2],
           BLOCKS0.nodes = [BLOCK_ONE]
```

7. **Static includes**

```text
STATIC_HOST.html = '<div>[{STATIC_INC}]</div>'
вход:  [{STATIC_HOST #sh}]
результат: node.statics = [STATIC_INC]
           STATIC_INC.uid = 'STATIC_HOST#sh::STATIC_INC'

MIXED_HOST.html = '<div>[{~STATIC_INC}][[BLOCKS]]</div>'
вход:  [{MIXED_HOST #m ([[BLOCKS ([{BLOCK_ONE #b1}])]])}]
getLayoutNodeChildren -> [STATIC_INC, BLOCK_ONE]
```

8. **Static с id**

```text
STATIC_ID_HOST.html = '<div>[{STATIC_WITH_ID #fixed}]</div>'
вход:  [{STATIC_ID_HOST #host}]
результат: uid = 'STATIC_ID_HOST#host::STATIC_WITH_ID#fixed'
```

9. **Legacy override**

```text
template2: { 'BLOCK_ONE#b1': { override: 'BLOCK_TWO' } }
вход: [[SECTIONS ([{SECTION_DEFAULT #s1
        ([[BLOCKS ([{BLOCK_ONE #b1}])]])}])]]
результат: block.uid = 'SECTION_DEFAULT#s1::BLOCK_ONE#b1'
           block.name = 'BLOCK_TWO'
```

10. **Materialize**

```text
SECTION_GRID.html = '<div>[[BLOCKS]]</div>'
вход:  [{~SECTION_GRID #s1}]
выход: [{~SECTION_GRID #s1 ([[BLOCKS]])}]

вход:  [{~SECTION_DOUBLE #s1 ([[BLOCKS ([{BLOCK_ONE #b1}])]])}]
SECTION_DOUBLE.html = '<div>[[BLOCKS]][[BLOCKS]]</div>'
выход: два региона BLOCKS: первый с BLOCK_ONE, второй пустой

вход:  [{~HEADER @global}],[{HEADER}]
выход: [{~HEADER @global}],[{HEADER ([[BLOCKS]])}]
```

11. **Действия**

```text
insertItem в SECTIONS с index=0 -> новый узел перед остальными
removeItem('BLOCK_ONE') для [[SECTIONS ([{BLOCK_ONE}],[{BLOCK_TWO}])]]
  -> [[SECTIONS ([{BLOCK_TWO}])]]
removeItem('SECTION_DEFAULT#s1::BLOCK_ONE') для вложенного no-id узла
copyItem(section) -> копия секции с новым id, дети с прежними id
```

---

## Приложение: reference-реализация

| Файл | Что смотреть |
|---|---|
| `src/lib/templates/layout.ts` | `parseLayout`, `stringifyLayout`, `replaceLayoutMarkers` |
| `src/lib/templates/layoutTree.ts` | `layoutUid`, `layoutItemKey`, `buildLayoutTree`, `buildStaticNodes`, `mergeRegions`, `getLayoutNodeRegions` |
| `src/lib/templates/layoutMaterialize.ts` | `materializeLayout`, `materializeLayoutItems` |
| `src/lib/templates/layoutActions.ts` | `updateLayout`, insert/move/remove/copy/find |
| `src/lib/templates/layoutParser.js` | vanilla-парсер для бэкенда (те же ключи) |
| `src/lib/templates/__tests__/layout*.test.ts` | эталонные тест-векторы |

Проверка:

```bash
pnpm exec vitest run src/lib/templates/__tests__
pnpm exec vue-tsc --noEmit
pnpm exec eslint src/
```
