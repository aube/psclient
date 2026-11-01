---
name: template-render
description: Алгоритмы сборки результирующего HTML psadmin: приоритет values, Handlebars, подстановка регионов и static includes, режимы render, inline-edit аннотации, preview и sanitize. Use when porting or debugging renderLayoutTree, Handlebars output, data-edit annotations or template preview.
---

# Рендер HTML: алгоритмы

Навык для переписывания/портирования сборки HTML. Модель — в `template-system`, построение дерева — в `template-tree`. Здесь: контекст значений, Handlebars, подстановка маркеров, режимы, inline-edit, preview, sanitize.

## Входы и выходы

```text
Вход:
  LayoutTree / TreeNode   // результат buildLayoutTree
  ctx.siteSettings: Record<string, any>
  ctx.getTemplatesData() -> Record<uid, { override?, values? }>
  ctx.getTemplate(name) -> Template | null
  ctx.getTemplateValues?(name) -> Record<string, any>   // live-значения @global

Выход:
  строка HTML
```

Рендер — строковая подстановка, а не DOM-сборка: `replaceLayoutMarkers` заменяет маркеры в уже отрендеренном Handlebars-шаблоне.

## Приоритет значений

Для каждого node контекст собирается так:

```text
values = {
  settings: { ...siteSettings },
  ...node.defaultValues,                 // Template.values
  ...liveValues,                         // только если node.global
  ...(node.global ? {} : entry?.values)  // только если non-global
}
```

- `settings` идёт первым; поле шаблона с именем `settings` может его перекрыть.
- `liveValues` = `getTemplateValues(node.name)`, только для `@global`; перекрывает `defaultValues`. Получатель должен сам срезать ведущий `~` (как и `getTemplate`/`getTemplatesData`).
- `entry.values` из `template2[uid]` применяется только к non-global и перекрывает всё.
- Для `@global` `entry.values` игнорируется.
- `getNodeEntry(node)`:

```text
key = node.uid
legacyKey = node.id ? layoutUid(node.slot, node.id) : null
entry = getLayoutEntry(ctx.getTemplatesData(), key, legacyKey)
```

Legacy-ключ строится от `slot` (исходное имя с `~`), а не от `name`.

## Базовый рендер узла

```text
function renderBuiltNode(node, ctx, withChildren, wrapChildren = false):
  entry = getNodeEntry(node, ctx)
  liveValues = node.global ? (ctx.getTemplateValues?.(node.name) or {}) : {}

  values = {
    settings: { ...ctx.siteSettings },
    ...node.defaultValues,
    ...liveValues,
    ...(node.global ? {} : (entry?.values or {}))
  }

  sourceHtml = node.html
  if editableMode: sourceHtml = annotateEditableTemplate(sourceHtml, node, editableFields(node))
  sourceHtml = injectNodeAttributes(sourceHtml, node.uid, node.category)
  html = handlebarsRender(sourceHtml, values)

  hasStatics = node.statics?.length > 0
  if not withChildren or (node.regions.empty and not hasStatics):
    return html

  counters = {}
  return replaceLayoutMarkers(html, item => {
    if item.type != 'region':
      candidates = node.statics.filter(s => s.slot == item.name)
      idx = counters[item.name] or 0
      counters[item.name] = idx + 1
      stat = candidates[idx]
      return stat ? renderBuiltNode(stat, ctx, true) : ''

    region = first node.regions where region.name == item.name
    if region == null: return ''

    inner = ''
    for child in region.nodes:
      if child.deleted: continue
      rendered = renderBuiltNode(child, ctx, true)
      inner += wrapChildren ? wrapFlatItem(child.uid, rendered) : rendered

    return wrapChildren ? wrapFlatRegion(region.name, inner) : inner
  })
```

Порядок операций для editable-режима:

```text
Template.html
  -> annotateEditableTemplate (добавить data-edit-*)
  -> injectNodeAttributes (data-uid, data-cat)
  -> handlebarsRender (подставить значения)
  -> replaceLayoutMarkers (вставить statics/regions)
```

### Подстановка static includes

- Static ищется по `slot`, а не по `name`: `candidates = statics.filter(s => s.slot == marker.name)`.
- Повторы одного `slot` берутся по позиции: первый маркер → первый static, второй → второй.
- Если static не найден — маркер заменяется на `''`.
- Static рендерится рекурсивно со своими регионами и statics.
- `deleted` у static include эталонный рендер **не** проверяет (проверяются только дети регионов).

### Подстановка регионов

- Регион ищется по имени: `first regions where name == marker.name`.
- Если регион не найден — `''`.
- Дети рендерятся по порядку; `deleted` пропускается.
- Дети соединяются без разделителей; обёртки `data-flat-*` только при `wrapChildren=true`.

Известное ограничение: при нескольких регионах с одинаковым именем эталонный рендер всегда берёт первый. Для `SECTION_DOUBLE.html = '<div>[[BLOCKS]][[BLOCKS]]</div>'` оба маркера отрендерят детей первого региона. Редактор (`getLayoutNodeRegions`) сопоставляет регионы позиционно — при порте можно сделать позиционное сопоставление и в рендере.

## Режимы рендера

### `renderLayoutTree(tree, ctx)`

Корневой HTML страницы (`tree.html`) обходится `replaceLayoutMarkers`:

```text
counts = {}
replaceLayoutMarkers(tree.html, item => {
  if item.type == 'region':
    region = first tree.regions where name == item.name
    return region ? region.nodes
      .filter(n => !n.deleted)
      .map(n => renderBuiltNode(n, ctx, true))
      .join('') : ''

  uid = layoutItemKey(item, '', counts)
  node = findBuiltNode(tree.regions, uid)   // рекурсивно по node.regions
  if node == null or node.deleted: return ''
  return renderBuiltNode(node, ctx, true)
})
```

`findBuiltNode` ищет только по `regions`, не по `statics`.

### `renderLayoutTreeFlat(tree, ctx)`

То же, но дети регионов верхнего уровня оборачиваются:

```text
<div data-flat-region="REGION_NAME"> ... </div>
  <div data-flat-item="CHILD_UID"> ... </div>
```

Глубже обёрток нет: рекурсивные вызовы идут с `wrapChildren=false`.

### `renderLayoutNode(node, ctx)`

Рендер поддерева: `renderBuiltNode(node, ctx, withChildren=true)`.

### `renderLayoutNodeShell(node, ctx)`

`renderBuiltNode(node, ctx, withChildren=false)`: только HTML самого узла (values и data-атрибуты), без statics/regions.

### `renderLayoutNodeFlat(node, ctx)`

`renderBuiltNode(node, ctx, withChildren=true, wrapChildren=true)`: прямые дети узла получают `data-flat-item`, их регионы — `data-flat-region`. Более глубокие дети не оборачиваются.

### `renderLayoutNodeEditable(node, ctx)`

Тот же обход, но перед Handlebars вызывается `annotateEditableTemplate`; flat-обёрток нет.

### Обёртки

```text
wrapFlatItem(uid, inner)      -> `<div data-flat-item="${uid}">${inner}</div>`
wrapFlatRegion(name, inner)   -> `<div data-flat-region="${name}">${inner}</div>`
```

## Handlebars

```text
handlebarsRender(templateString, values, headingLevel = 2):
  values = deepClone(values)
  for each top-level value that is an object:
    if value.srcset: split by ',', trim each, resolveImageUrl(part, domain), join ', '
    if value.src: value.src = resolveImageUrl(value.src, domain)

  register helpers (см. ниже)
  html = templateString.replaceAll('/static/icons', '/icons')
  template = Handlebars.compile(html, { noEscape: true })
  return template({ ...values, headingLevel })
```

Особенности:

- `noEscape: true` — `{{field}}` не экранируется; `{{{field}}}` эквивалентен.
- Картинки: обрабатываются только **верхнеуровневые** значения-объекты с `src`/`srcset`; вложенные объекты не обходятся.
- `resolveImageUrl` использует домен текущего сайта.
- `headingLevel` из аргумента перекрывает одноимённое значение.
- Helpers регистрируются глобально при каждом вызове.

### Helpers

| Helper | Поведение |
|---|---|
| `gt(a, b)` | `a > b` |
| `or(...args)` | первый truthy или `''` (последний аргумент — options) |
| `ifElse(condition, trueValue, falseValue)` | `condition ? trueValue : (falseValue || '')` |
| `loop(n, options)` | `options.fn({ _idx: i })` для `i = 0..n-1` |
| `split(string)` | строка по `,`, trim; не строка → `[]` |
| `increment(value)` | `parseInt(value) + 1` |
| `incrementHeading(baseLevel, hasTitle)` | `h3`/`3` → число, `-= Number(!hasTitle)`, clamp 6, вернуть `hN` |
| `countTrue(...args)` | количество truthy, кроме последнего options |
| `assign(name, value, options)` | `options.data.root[name] = value` |

### Поддерживаемые конструкции

```text
{{field}}
{{{field}}}
{{#each list}}...{{/each}}
{{#each list as |item index|}}...{{/each}}
{{this.field}}
{{#if condition}}...{{/if}}
{{#unless condition}}...{{/unless}}
{{#loop n}}...{{/loop}}
```

## Поля из HTML-токенов

Нужно для автогенерации `fields` и inline-edit.

```text
extractTokens(template):
  regex = /\{\{(.*?)\}\}/g
  пропустить: пустые; содержащие '@'; 'else', '/if', '/unless', '/with', '/loop';
             начинающиеся с '../', '_', '#with';
             helpers: assign, increment, countTrue, split, loop
  вернуть остальные токены
```

```text
buildTokensTree(tokens, pos = 0, startLevel = 0):
  section = {}
  level = startLevel
  для каждого токена:
    '/each' -> level--; если level < startLevel: return section
    '#each' -> если level == startLevel: section[token[6:]] = buildTokensTree(tokens, i+1, level)
               level++
    если level > startLevel: continue
    'or X' / 'ifElse X' -> token = X
    '#loop X' -> type = number, token = X
    '#if X' / '#unless X' -> type = switch, token = X (если начинается с '(', взять второе слово)
    'this.X' -> token = X; 'icon.name' -> type = icon, token = icon;
                'icon.*' -> continue
    token = token.replaceAll('.', '_')
    section[token] = type
  return section
```

```text
controlsTree(tokensTree):
  string -> { type:'input',    name, label }
  number -> { type:'number',   name, label }
  switch -> { type:'switch',   name, label }
  icon   -> { type:'icon',     name, label }
  object -> { type:'subfields', name, label, fields: controlsTree(child) }
```

- `label` — полное имя токена; `name` — первое слово (`#each people as |person index|` → `label = "people as |person index|"`, `name = "people"`).
- Точки заменяются на `_` из-за ограничений PrimeVue форм.

## Inline-редактирование

`annotateEditableTemplate(html, node, editableFields)` размечает `Template.html` до Handlebars-рендера.

Размечаемые типы (`isEditableTypeField`): `input`, `textarea`, `html`, `link`, `image`, `icon`, `subfields`. Исключаются имена `sectionAnimation`, `blockAnimation`, `sectionClass`, `sectionContainerClass`, `blocksContainerClass`.

### Карта полей

```text
subfields -> kind 'list' (fields = вложенная карта)
image     -> kind 'image' (category из field.params.category)
icon      -> kind 'icon'
html      -> kind 'html'
link      -> kind 'link'
input     -> kind 'text'
textarea  -> kind 'text'
```

### Контекст циклов

```text
loops = []   // стек

#each ARRAY [as |ALIAS INDEX|]
  list = resolveList(ARRAY)
  indexExpr = INDEX ? '{{INDEX}}' : '{{@index}}'
  push { arrayPath: ARRAY, indexExpr, alias: ALIAS, fields: list.fields }

/each  -> pop
#loop  -> push { arrayPath:'', indexExpr:'{{_idx}}', fields:{} }
/loop  -> pop
```

### Резолв выражения

Путь должен соответствовать `^[A-Za-z_][\w]*(\.[\w]+)*$`.

```text
this.field        -> текущий (самый внутренний) loop item
alias.field       -> loop item по alias
bare.name в loop  -> текущий loop item
top-level         -> только 1–2 сегмента, из topFields
```

`scalarKind`:

```text
image -> image
icon  -> icon
html  -> html
text  -> text
link  -> (sub == 'label') ? text : attr
иначе -> null (не размечать)
```

### Что подставляется

Текст/HTML:

```html
<span class="layout-edit" contenteditable="true"
      data-edit-text="PATH" data-edit-uid="UID" data-edit-kind="KIND">{{{EXPR}}}</span>
```

Атрибуты (маркер добавляется в тег, а не в значение):

```text
image -> data-edit-image="UID|BASE_PATH" [+ data-edit-category="CATEGORY"]
icon  -> data-edit-icon="UID|BASE_PATH"
attr  -> data-edit-attr="UID|PATH"
```

Формат: `UID|PATH`; для списков `PATH` содержит `{{index}}`/`{{@index}}`/`{{_idx}}`.

### Алгоритм сканирования

```text
inTag = false; quote = null; markers = []

для каждого символа:
  вне тега:
    '<' -> inTag = true, quote = null, markers = []
    '{{' -> readExpr (обычный или тройной)
      если expr начинается с '#' или '/' -> handleBlock, скопировать как есть
      иначе resolve(expr)
        text/html -> обернуть span'ом
        иначе     -> скопировать как есть
  внутри тега:
    если quote:
      '{{' -> resolve attrMarker, накопить marker (без дублей), скопировать expr
      закрывающая кавычка -> quote = null
    '"' / "'" -> quote = ch
    '>' -> вставить markers перед '>', inTag = false
```

Особенности:

- `{{#if}}`/`{{/if}}` не добавляют контекст: `handleBlock` отслеживает только `#each`/`#loop`.
- `{{settings.*}}`, `{{unknown}}`, helpers и неразрешённые пути остаются без изменений.
- `data-edit-category` добавляется только для image, если у поля есть категория.
- `@global` узлы размечаются так же; отличие только в сохранении.

### Сохранение inline-правок

- Non-global: писать в `template2[node.uid].values` и пересобрать (`rebuild()`).
- `@global`: `saveGlobalTemplateValues`:
  - найти шаблон по имени (`aTemplateByName`);
  - если у шаблона нет `id` — создать (`aCreateTemplate`);
  - `aPatchTemplate(id, { values: buildValues(template.values || {}) })`;
  - затем `rebuild()`.
- При удалении узла UI должен удалить и новый, и legacy-ключ `template2`.

## `dataAttributesInjector`

```text
function injectNodeAttributes(html, uid, category):
  first = html.match(/<[^>]+>/)
  if not first: return html
  attrs = ` data-uid="${uid}" data-cat="${category}"`
  newTag = first[0].replace(/>$/, attrs + '>')
  return html.replace(first[0], newTag)
```

- Атрибуты добавляются в первый тег, даже если он не корневой.
- Если в HTML нет тега — возврат без изменений.
- Значения не экранируются.

## Preview

```text
buildPreviewValues(fields, values, options):
  out = copy(values)
  для каждого field:
    icon:   если пусто -> DEFAULT_PREVIEW_ICON
    image:  если пусто -> buildImagePlaceholder(theme)
    subfields: если массив пуст -> 3 пустых элемента
               иначе рекурсивно buildPreviewValues для каждого
    data field (input/textarea/html/link): если пусто ->
      link -> { href:'//', label }
      иначе -> label (или name)
  return out
```

`DEFAULT_PREVIEW_ICON = { name:'video-conference', weight:'regular', suffix:'', height:'32px', width:'32px' }`.

```text
collectPreviewNodeValues(node, result, options):
  result[node.uid] = { values: buildPreviewValues(node.fields, node.defaultValues, options) }
  рекурсивно по node.regions.nodes
  рекурсивно по node.statics

renderTemplatePreviewHtml(template, ctx):
  tree = buildLayoutTree(template.html, ctx)
  options = { theme: ctx.theme }
  renderedRoot = handlebarsRender(template.html, {
    settings: { ...ctx.siteSettings },
    ...buildPreviewValues(template.fields, template.values, options)
  })
  previewData = collectPreviewNodeValues for all tree.regions
  return renderLayoutTree({ ...tree, html: renderedRoot }, {
    ...ctx,
    getTemplatesData: () => previewData
  })
```

Важно: корневой HTML рендерится Handlebars **до** `renderLayoutTree`; маркеры `[[...]]`/`[{...}]` переживают Handlebars и заменяются на этапе дерева.

## Sanitize (только editor shadow)

`sanitizeShadowHtml(html)` применяется к shadow-разметке редактора, не к production-рендеру. Если `DOMParser` недоступен — возвращает HTML как есть.

- Удаляет теги: `script`, `iframe`, `object`, `embed`, `base`.
- Удаляет `for` у `label`.
- `form`: `novalidate`, `autocomplete="off"`.
- `input/textarea/select`: `autocomplete/autocorrect/autocapitalize="off"`, `spellcheck="false"`.
- `button` с пустым/`submit`/`reset`/`image` type → `type="button"`.
- `input` с `submit`/`image`/`reset` → `type="button"`.
- Удаляет атрибуты, начинающиеся с `on`, и `srcdoc`.
- Удаляет `href`/`src`/`xlink:href` со значением `javascript:`.
- Возвращает `body.innerHTML`.

## Инварианты и частые ошибки

- `settings` мержится первым; поле шаблона `settings` может его перекрыть.
- Значения страницы не применяются к `@global`; для них нужны live-значения шаблона.
- `defaultValues` — дефолты шаблона; не путать с `entry.values`.
- Static ищется по `slot` (с `~`), а не по разрешённому `name`.
- Регион ищется по имени; при дублях эталонный рендер берёт первый.
- `deleted` пропускается у детей регионов, но не у static include.
- `injectNodeAttributes` вызывается до Handlebars; если Handlebars-выражение формирует первый тег, атрибут может уйти не туда.
- `annotateEditableTemplate` не размечает `{{#if}}`-контекст и `settings.*`.
- Для inline-правок non-global писать в `template2`, для `@global` — в шаблон + rebuild.
- `/static/icons` заменяется на `/icons`; `src/srcset` резолвятся только на верхнем уровне значений.
- Preview-заглушки не равны production-значениям: это только для редактора.
- Sanitize не является заменой production-фильтрации.

## Тест-векторы

1. **Приоритет values**

```text
node.defaultValues = { title: 'Template' }
template2[uid] = { values: { title: 'Page' } }
non-global -> title = 'Page'
@global    -> title = 'Template' (entry.values игнорируется)
getTemplateValues -> { title: 'Live' } у @global -> title = 'Live'
```

2. **Static include с override**

```text
BLOCK_STATIC.html = '<div><h3>{{title}}</h3>[{SNIPPET_X}]</div>', values.title='Title'
SNIPPET_X.html = '<form>snippet {{title}}</form>'
template2['BLOCK_STATIC#bs::SNIPPET_X'] = { override:'SNIPPET_Y', values:{ title:'Over' } }
SNIPPET_Y.html = '<mark>alt {{title}}</mark>'
результат: <h3>Title</h3> ... <mark data-uid="BLOCK_STATIC#bs::SNIPPET_X"
          data-cat="widget">alt Over</mark>
```

3. **Deleted**

```text
[[SECTIONS ([{!SECTION_DEFAULT #s1}],[{SECTION_DEFAULT #s2}])]]
renderLayoutTree -> ровно одна <section>
```

4. **Flat wrappers**

```text
renderLayoutNodeFlat(section):
  <div data-flat-region="BLOCKS">
    <div data-flat-item="SECTION_DEFAULT#s1::BLOCK_ONE#b1"> ... </div>
  </div>
  без data-flat-region="SECTIONS" и без обёрток у более глубоких детей
```

5. **Editable**

```text
fields: title(input), text(textarea), body(html), img(image), icon(icon), link(link)
html: <h1>{{title}}</h1><p>{{text}}</p><div>{{{body}}}</div>
      <img src="{{img.src}}"><a href="{{link.href}}">{{link.label}}</a>
результат:
  data-edit-text="title" / "text" / "body" / "link.label"
  data-edit-image="UID|img" + data-edit-category="photo"
  data-edit-icon="UID|icon"
  data-edit-attr="UID|link.href"
```

6. **Editable + списки**

```text
{{#each people as |person index|}}<p>{{person.name}}</p>{{/each}}
-> data-edit-text="people.{{index}}.name"
{{#each people}}<p>{{name}}</p>{{/each}}
-> data-edit-text="people.{{@index}}.name"
```

7. **Helpers**

```text
{{#loop 3}}<i>{{_idx}}</i>{{/loop}} -> <i>0</i><i>1</i><i>2</i>
{{increment 2}} -> 3
{{incrementHeading 'h3' true}} -> h4
{{countTrue a b c}} -> количество truthy
{{split 'a, b'}} -> ['a','b']
```

8. **Preview**

```text
field title(input) пустой -> title = 'title' (label)
field link(link) пустой   -> { href:'//', label:'link' }
field subfields people пустой -> 3 пустых элемента
field icon пустой         -> DEFAULT_PREVIEW_ICON
field image пустой        -> placeholder по теме
```

## Приложение: reference-реализация

| Файл | Что смотреть |
|---|---|
| `src/lib/templates/layoutRender.ts` | `renderLayoutTree`, `renderLayoutTreeFlat`, `renderLayoutNode*`, приоритет values, flat-обёртки |
| `src/lib/templates/handlebarsRender.ts` | `handlebarsRender`, helpers, resolve картинок, `/static/icons` |
| `src/lib/templates/handlebarsParser.ts` | `extractTokens`, `buildTokensTree` |
| `src/lib/templates/controlsTree.ts` | `controlsTree` |
| `src/lib/templates/fieldFilters.ts` | `isDataField`, `isEditableTypeField`, исключаемые имена |
| `src/lib/templates/annotateEditableTemplate.ts` | inline-разметка `data-edit-*` |
| `src/lib/templates/dataAttributesInjector.ts` | `data-uid`/`data-cat` |
| `src/lib/templates/previewValues.ts` | `buildPreviewValues`, заглушки |
| `src/lib/templates/templatePreview.ts` | `renderTemplatePreviewHtml` |
| `src/lib/templates/sanitizeShadowHtml.ts` | sanitize для shadow DOM |
| `src/lib/templates/globalTemplateSave.ts` | сохранение `@global` значений |
| `src/lib/templates/__tests__/layoutRender.test.ts`, `annotateEditableTemplate.test.ts`, `handlebarsRender.test.ts`, `templatePreview.test.ts` | эталонные тест-векторы |

Проверка:

```bash
pnpm exec vitest run src/lib/templates/__tests__
pnpm exec vue-tsc --noEmit
pnpm exec eslint src/
```
