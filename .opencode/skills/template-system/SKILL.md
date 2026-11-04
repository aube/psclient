---
name: template-system
description: Устройство шаблонной системы psadmin: уровни и категории, модель Template, page.template + page.data.regions, грамматика маркеров, UID/template2, регионы, @global, Handlebars и pipeline. Use when explaining the template model or deciding where a change belongs; алгоритмы дерева — template-tree, рендера — template-render.
---

# Шаблонная система psadmin

Обзорный навык: словарь, модель данных и контракты. Конкретные алгоритмы вынесены:

| Навык | Когда нужен | Что внутри |
|---|---|---|
| `template-system` | понять устройство, выбрать место изменения, объяснить `@global`/регионы/категории | модель, хранение `page.data.regions`, грамматика, UID/template2, pipeline |
| `template-tree` | парсинг, построение дерева, UID/path, regions/statics, materialize, структурные действия | псевдокод алгоритмов + тест-векторы |
| `template-render` | сборка HTML, приоритет values, Handlebars, inline-edit, preview | псевдокод рендера + тест-векторы |

## Где лежат шаблоны и данные

- `Template` — запись в БД/API: `name`, `html`, `category`, `title`, `description`, `fields`, `values`.
- `Template.html` может содержать вложенные маркеры: `[{...}]`, `[[...]]`.
- Общие шаблоны (`site_id = 0`) и шаблоны конкретного сайта (`site_id > 0`) различаются только владельцем; для рендера это не важно.
- `page.template` — имя выбранного шаблона страницы; это единственный источник базовой разметки страницы.
- `page.data.regions` — содержимое root-регионов страницы: `Record<regionKey, markerHtml>`.
- `page.data.template2` — данные инстансов страницы: `override` и `values`.
- `page.html` и `page.use_html` — legacy-поля; админка их больше не использует и не записывает.
- На фронтенде `page.data` — объект; API-модуль сериализует его в JSON при сохранении.
- В клиенте-прокси страница приходит как `ENTITY`: `ENTITY.template`, `ENTITY.data.regions`, `ENTITY.data.template2`, legacy `ENTITY.html`.

`page.data.regions`:

```json
{
  "SECTIONS": "[{~SECTION_MONO #s1 ([[BLOCKS ([{BLOCK_ONE #b1}])]])}]",
  "SIDEBAR": "",
  "SECTIONS№2": "[{...}]"
}
```

- Ключ — имя региона (`NAME`); повторные упоминания получают суффикс `№2`, `№3`, …
- Значение — содержимое региона в marker-формате «как есть».
- Сопоставление при сборке страницы — по имени и позиции среди одноимённых регионов, не по `#id`.
- Регионы переиспользуются в другом шаблоне, если совпадают имена.
- Отсутствующий ключ — используется содержимое региона из шаблона; `""` — явная очистка.
- Ключи без соответствующего региона в текущем шаблоне сохраняются и могут примениться позже.
- Вложенные регионы отдельно не хранятся: они остаются внутри marker-строки секции.
- `regions` не часть `template2`; значения и override по-прежнему живут в `template2`.

## Уровни и категории

Категория — метаданные шаблона; на построение дерева и рендер она не влияет (кроме конвенций и `data-cat`).

| Уровень | Категории | Назначение |
|---|---|---|
| 0 | `layout` | Разметка до тега `<body>` |
| 1 | `template` | Шаблон страницы внутри `<body>` |
| 1 | `widget`, `snippet` | Универсальные шаблоны: размещаются в любом месте, могут быть глобальными |
| 2 | `header`, `footer`, `hero`, `section`, `document`, `preview`, `errors` | Структурные элементы для разделов и сетки блоков |
| 3 | `block`, `form` | Контентные блоки с данными внутри структурных |
| 4 | `brick` | Системные примитивы для сборки `block` |

Кратко:

- `layout` — обвязка сайта; содержит `%ENTITY%` вместо маркера страницы.
- `template` — страница целиком.
- `header`, `footer` — структурные элементы, чаще всего `@global`.
- `hero` — выделенная секция с `h1`.
- `section` — секция для вывода блоков по сетке.
- `document` — секция юридически значимой информации.
- `preview` — анонс подчинённой страницы.
- `errors` — секция для страниц ошибок.
- `block` — основная единица контента.
- `form` — блок формы; дополняется скриптом валидации и сниппетом персональных данных.
- `widget` — самодостаточный элемент с визуальным представлением.
- `snippet` — встраиваемый фрагмент/скрипт.
- `brick` — «кирпич» конструктора блоков: ровно одно типовое поле, без обвязки и регионов.

Bricks: `BRICK_TEXT`, `BRICK_HTML`, `BRICK_LINK`, `BRICK_IMAGE`, `BRICK_ICON`, `BRICK_CONTACTS`, `BRICK_SOCIALS`. Bricks не размещаются на странице напрямую и по умолчанию не глобальные.

По конвенции `@global` используется для `header`, `footer`, `widget`, `snippet` и общих вставок, но технически от категории не зависит.

## Имена

- `NAME` — совпадает с именем шаблона, верхний регистр, слова через `_`: `BLOCK_ICON_TEXT`, `PAGE_DEFAULT`.
- Имя уникально в пределах сайта (для shared — глобально).
- `~` входит в имя маркера и в ключ `template2`, но срезается при поиске шаблона.
- `!` в имя не входит: это отдельный флаг soft-delete.

## Грамматика маркеров

Маркеры допускают пробелы и переводы строк внутри:

```ebnf
node   ::= "[{" ["!"] ["~"] NAME [" #" ID] [" @global"] [" (" children ")"] "}]"
region ::= "[[" NAME [" #" ID] [" (" children ")"] "]]"
```

Примеры:

```text
[{HERO_DEFAULT #hero}]
[{~HEADER_DEFAULT #h}]
[{~HEADER_DEFAULT @global}]
[{!~SECTION_MONO #s1 ([[BLOCKS ([{BLOCK_ONE #b1}])]])}]
[[SECTIONS ([{SECTION_DEFAULT #s1}])]]
```

- `children` — вложенные node/region маркеры, разделённые запятыми.
- `NAME` хранится как написан, включая ведущий `~`; `!` разбирается отдельно.
- `#id` — необязательная метка инстанса для UID и `template2`; на дерево не влияет.
- `@global` — независимый флаг источника значений.
- `(children)` допустимы у любого node, в том числе без `#id`.
- Регион синтаксически допускает `#id`, но поиск и действия сопоставляют регионы по имени.

## Виды маркеров

| Маркер | UID | Values | `(children)` |
|---|---|---|---|
| `[{NAME #id}]` | `NAME#id` / `PARENT::NAME#id` | страница | да |
| `[{NAME #id @global}]` | `NAME#id` / `PARENT::NAME#id` | шаблон, страница только `override` | да |
| `[{NAME}]` | `NAME` / `PARENT::NAME` | страница по path | да |
| `[{NAME @global}]` | `NAME` / `PARENT::NAME` | шаблон, страница только `override` | да |
| `[[NAME (…)]]` | — | — | регион |

`#id`, `@global`, `~` и `!` — независимые признаки. В модели нет `type: 'global'`: любой `[{...}]` — это node.

Для страницы содержимое root-регионов фактически берётся из `page.data.regions`: перед `buildLayoutTree` шаблон прогоняется через `applyPageRegions`. Node-level `(children)` внутри `Template.html` при этом обрабатываются как раньше.

## Идентичность и UID

- `layoutUid(name, id) => "name#id"` — сегмент.
- Ключ (path) — сегменты через `::`:
  - `NAME#id` — node с `#id`;
  - `NAME` — node без `#id`;
  - `PARENT_UID::…` — вложенный node;
  - повторные no-id маркеры на одном уровне получают `№2`, `№3`, …;
  - `""` — корень дерева (`LAYOUT_ROOT`).
- Регион в UID не входит: родитель — UID узла-владельца, а не региона.
- Static include внутри `Template.html` получает ключ от UID хоста: `HOST_UID::NAME` или `HOST_UID::NAME#id`.
- Legacy-совместимость: старые ключи вложенных узлов были плоскими (`NAME#id`). Чтение: сначала новый ключ, затем legacy (`getLayoutEntry`); запись — новый ключ.

Точный алгоритм счётчиков, `№N` и legacy — в `template-tree`.

## `template2`

```ts
template2[uid] = {
  override?: string,
  values?: Record<string, any>,
}
```

- Non-global node: `values` — значения страницы поверх дефолтов шаблона.
- `@global` node: допустим только `override`; `values` игнорируются.
- Static include: `override` и `values` по path-ключу `<parentUid>::NAME`, а не по имени.
- `override` заменяет имя шаблона; при поиске шаблона ведущий `~` срезается.

## Регионы

- Регион — контейнер дочерних узлов: `[[BLOCKS ([{BLOCK_ONE #b1}])]]`.
- Page-level регионы хранятся не в `template2`, а в `page.data.regions` в виде marker-строк.
- Перед `buildLayoutTree` базовая разметка `page.template` прогоняется через `materializeLayout` и `applyPageRegions`; только после этого строится дерево.
- `applyPageRegions` заменяет содержимое root-регионов шаблона по ключам `NAME` / `NAME№N`, сохраняя статическую разметку и node-маркеры.
- Если ключа нет — используется содержимое региона из шаблона; `""` — явная очистка.
- Ключи без соответствующего региона в текущем шаблоне сохраняются и могут примениться при возврате региона.
- `Template.html` может содержать регионы при любой форме подключения; `#id` на это не влияет.
- Node-level регионы наполняются из эффективного HTML (после `applyPageRegions`) и `Template.html`.
- `materializeLayout` добавляет отсутствующие регионы шаблона как пустые.
- Явные `(children)` маркера имеют приоритет над одноимённым регионом шаблона.
- `@global` не материализуется, но его регионы присутствуют в дереве и рендере.
- Сопоставление регионов — по имени; повторные одноимённые регионы сопоставляются позиционно.
- Вложенные регионы не хранятся отдельными ключами: они остаются внутри marker-строки родительской секции.
- Лишние static/region-элементы складываются в loose-регион (`loose: true`, `name: ''`).

Алгоритмы сборки page HTML из `page.data.regions` — в `template-render` (`applyPageRegions`, `extractPageRegions`, `migratePageRegions`). Алгоритмы построения, merge и materialize — в `template-tree`.

## `@global`

- Источник значений — `Template.values` (site-wide), а не `template2`.
- Страница хранит только `override` выбранного шаблона.
- При рендере используются live-значения шаблона (`getTemplateValues`), а не устаревшие дефолты из дерева.
- Inline-правки `@global` сохраняются в шаблон (`aPatchTemplate`) и требуют пересборки.

## Приоритет значений при рендере

```text
settings: siteSettings
Template.values (defaultValues)
live global values (только @global)
template2[uid].values (только non-global)
```

Следствия:

- Значения страницы перекрывают дефолты только у non-global узлов.
- Для `@global` значения страницы не используются.
- `settings` доступен в шаблонах как `{{settings.*}}`.
- Детали и точный порядок merge — в `template-render`.

## Handlebars

Шаблоны рендерятся через Handlebars с `noEscape: true`.

Поддерживаемые конструкции:

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

Helpers: `gt`, `or`, `ifElse`, `loop`, `split`, `increment`, `incrementHeading`, `countTrue`, `assign`.

Поля:

- `Template.fields` — `FormField[]`.
- Автогенерация полей из HTML: `extractTokens` → `buildTokensTree` → `controlsTree`.
- `controlsTree`: `string` → `input`, `number` → `number`, `switch` → `switch`, `icon` → `icon`, объект → `subfields`.
- Точки в именах токенов заменяются на `_`.
- Редактируемые типы: `input`, `textarea`, `html`, `link`, `image`, `icon`, `subfields`.

Детали helpers, resolve картинок и inline-разметки — в `template-render`.

## Pipeline

```text
page.template
  -> Template.html
  -> materializeLayout(template.html, ctx)          // статическая база + отсутствующие регионы
  -> applyPageRegions(baseHtml, page.data.regions)  // page-level содержимое регионов
  -> buildLayoutTree(pageHtml, ctx)                 // AST, UID, шаблоны, override, statics, regions
  -> renderLayoutTree / renderLayoutNodeEditable / renderLayoutNodeFlat / renderLayoutNodeShell
```

- Точка входа для страницы — `page.template`, а не `page.html`. В клиенте-прокси это `ENTITY.template`.
- `page.data.regions` применяется до `buildLayoutTree`; `page.html`/`use_html` не участвуют.
- Если `page.data.regions` отсутствует, выполняется одноразовая миграция из старого `page.html` (`migratePageRegions`).
- `buildLayoutTree` возвращает `LayoutTree`: loose-регионы + именованные регионы с `LayoutTreeNode`.
- `LayoutTreeNode`: `uid`, `name` (с учётом `override`), `slot` (исходное имя маркера), `global`, `changable`, `deleted`, `html`, `fields`, `defaultValues`, `regions`, `statics`.
- `renderLayoutTree` рендерит дерево по маркерам, пропускает `deleted`, подставляет static includes и `@global`.
- `renderLayoutNodeFlat` оборачивает прямых детей в `data-flat-item` / `data-flat-region`.
- `renderLayoutNodeShell` рендерит только сам узел без детей.
- `renderTemplatePreviewHtml` собирает preview-значения из полей.

## Частые ошибки системы

- Считать, что `type: 'global'` существует: все маркеры — node; глобальность — только флаг `isGlobal`.
- Считать, что `#id` управляет регионами, children или materialize.
- Считать `@global` и `#id` взаимоисключающими.
- Использовать плоский `NAME#id` для вложенного узла: UID включает родителя.
- Забывать legacy-fallback для старых ключей `template2`.
- Ожидать, что no-id маркер не имеет регионов или children.
- Писать `values` для `@global` в `template2` — они игнорируются.
- Менять `template2` для static include по имени вместо path-ключа.
- Считать, что `region#id` участвует в поиске: регионы сопоставляются по имени.
- Забывать, что `~` входит в ключ `template2`, но срезается при поиске шаблона.
- Хранить динамические секции в `page.html` или использовать `page.use_html`.
- Считать `page.data.regions` частью `template2`.
- Искать page-level регионы по `#id` вместо имени и порядка (`NAME`, `NAME№N`).
- Удалять ключи `regions`, для которых нет региона в текущем шаблоне.
- Считать, что вложенные регионы хранятся отдельными ключами: они остаются внутри marker-строки секции.
- Забывать применить `page.data.regions` до `buildLayoutTree`.

## Проверка

```bash
npx eslint src/
node --input-type=module /tmp/opencode/page-regions-smoke.mjs
```
