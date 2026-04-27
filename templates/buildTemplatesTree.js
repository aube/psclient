// import {
//   wrapHbVars,
// } from '../static/wrapHbVars.js'

// import {
//   injectHTML3,
//   renderHandlebarsTemplate,
//   dynamicIncludes2HTMLComments,
// } from './index.js'

import {
  getTemplateByName,
} from '../redis/index.js'


// export async function injectENTITY(host, layoutHTML, ENTITY) {
//   var templatesTree = await getTemplatesTree(host, ENTITY);
//   var html = buildHTML(templatesTree)
//   return layoutHTML.replace('<!--ENTITY--><!--/ENTITY-->', `<!--ENTITY-->${html}<!--/ENTITY-->`)
//   // TODO CHILDREN
// }



import {extractTemplateIncludes, dataAttributesInjector, handlebarsRender} from './utils.js'


export async function buildTemplatesTree(host, page) {
  let defaultValues = {}
  let fields = page.fields || []
  let html = page.html || ""
  let name = "page" + page.id

  if (!page.use_html) {
    let template = await getTemplateByName(host, page.template)
    if (!template) {
      console.error(page.template)
      throw new Error("No found Page template:")
    }

    html = template.html || ""
    fields = template.fields || []
    defaultValues = template.values || defaultValues;
    name = page.template;
  }

  const templateMarkers = extractTemplateIncludes(html, 'page' + page.id, page.use_html)
  const templatesData = page.data?.templates || {}
  const nodes = await getEntityRootBranches(host, templateMarkers|| [], templatesData)

  return {
    id: name,
    uid: name,
    name,
    changable: true,
    category: "template",
    html,
    fields,
    defaultValues,
    nodes,
  }
}

async function getEntityRootBranches(host, markers, templatesData) {
  const nodes = []

  for (const marker of markers) {
    if (marker.multiple) {
      const html = templatesData[marker.uid]?.html || ''
      const multipleSectionMarkers = extractTemplateIncludes(html, marker.uid)
      const branches = await getEntityRootBranches(host, multipleSectionMarkers, templatesData)
      nodes.push({
        name: marker.name,
        changable: marker.changable,
        id: marker.id,
        uid: marker.uid,
        category: '',
        fields: [],
        defaultValues: {},
        html,
        nodes: branches,
        multiple: true,
      })
    } else {
      const branch = await getTemplateBranch(host, marker, marker.uid, templatesData)
      nodes.push({
        ...branch,
        multiple: false,
      })
    }
  }

  return nodes
}

async function getTemplateBranch(host, marker, parentId, templatesData) {
  const { name, id, changable } = marker

  let template

  const tplData = templatesData[marker.uid]

  if (changable) {
    // Для динамического слота [{~NAME}] в интерфейсе может быть выбран другой шаблон, а не NAME
    // Поэтому приоритетно проверяем выбраный блок из данных страницы
    const nodeName = tplData?.name
    if (nodeName && nodeName !== name) {
      template = await getTemplateByName(host, nodeName)
    }
  }

  if (!template)
    template = await getTemplateByName(host, name)

  if (!template) {
    throw new Error('Template not found: ' + name)
  }

  template.html = dataAttributesInjector(template.html, { uid: marker.uid, cat: template.category })

  const values = {
    ...template.values, // default template values
    ...(tplData?.values || {}),
  }
  template.html = handlebarsRender(template.html, values)

  const nodes = []
  const includes = extractTemplateIncludes(template.html, parentId)

  if (includes.length) {
    let idx = 0

    for await (const include of includes) {

      const tplId = (include.id || ('idx' + idx))

      const branch = await getTemplateBranch(
        host,
        {
          ...include,
          id: tplId,
        },
        marker.uid,
        templatesData,
      )

      // готовим html
      template.html = template.html.replace(include.placeholder, branch.html)

      nodes.push(branch)

      idx++
    }
  }

  return {
    id,
    uid: marker.uid,
    name: template.name,
    title: template.title,
    description: template.description,
    changable,
    category: template.category,
    html: template.html,
    fields: template.fields,
    defaultValues: template.values,
    nodes,
  }
}
