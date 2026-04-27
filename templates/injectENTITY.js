import {
  wrapHbVars,
} from '../static/wrapHbVars.js'

import {
  injectHTML3,
  renderHandlebarsTemplate,
  dynamicIncludes2HTMLComments,
} from './index.js'

import {
  getTemplateByName,
} from '../redis/index.js'


export async function injectENTITY(host, layoutHTML, ENTITY) {
  var templatesTree = await getTemplatesTree(host, ENTITY);
  var html = buildHTML(templatesTree)
  return layoutHTML.replace('<!--ENTITY--><!--/ENTITY-->', `<!--ENTITY-->${html}<!--/ENTITY-->`)
  // TODO CHILDREN
}


function buildHTML(node) {
  let html = node.html;
  
  if (node.nodes && node.nodes.length) {
    for (const child of node.nodes) {
      const childHtml = buildHTML(child);
      html = injectHTML3(html, childHtml)
    }
  }
  
  return html;
}

async function generateTemplatesTree(
  host,
  html,
  name,
  category,
  nodeValuesTree,
  defaultValues
) {

  const templateNames = extractTemplateNames(html);
  const nodes = [];
  let values = { };

  // html = dynamicIncludes2HTMLComments(html);
  html = wrapHbVars(html)
  html = renderHandlebarsTemplate(html, {
    ...defaultValues,
    ...nodeValuesTree.values
  });

  if (templateNames.length) {
    let idx = 0
    for await (let nodeName of templateNames) {
      // может быть несоответствие количества нод в данных при переключении режима разметки use_html
      // после редактирования или сортировки секций
      // TODO: нужно или убирать переключение или дополнительно редактировать данные после переключения
      const currentNode = nodeValuesTree.nodes[idx]

      // Для динамического слота [{~NAME}] в интерфейсе может быть выбран другой шаблон, а не NAME
      // Поэтому приоритетно проверяем блок из данных страницы
      nodeName = currentNode?.name || nodeName
      nodeName = nodeName.startsWith('~') ? nodeName.substring(1) : nodeName;

      const tpl = await getTemplateByName(host, nodeName)
      
      if (tpl) {
        values = {
          ...defaultValues,
          ...tpl.values,
          ...currentNode?.values,
        }
        
        const node = await generateTemplatesTree(host, tpl.html, nodeName, tpl.category, currentNode, tpl.values)

        nodes.push({
          ...node,
          name: nodeName,
          values,
        })

        idx++
      }
    }
  }

  return {
    name,
    category,
    html,
    values,
    nodes,
  }
}

async function getTemplatesTree(host, page) {
  let pageValuesTree = page.data || {}
  let defaultValues = {}
  let html = ""
  let name = "ENTITY"
  if (page.use_html) {
    html = page.html
  } else {
    let tpl = await getTemplateByName(host, page.template)
    if (!tpl) {
      console.error("No found Page template:", page.template)
      tpl = {}
    }
    html = tpl.html || html
    fields = tpl.fields || fields
    defaultValues = tpl.values || defaultValues;
    name = page.template;
  }
  return await generateTemplatesTree(host, html, name, "template", pageValuesTree, defaultValues)
}


function extractTemplateNames(html) {
  const regex = /\[\{~?([^}]+)\}\]/g;
  const result= [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const content = match[1];
    result.push(content.trim());
  }

  return result;
}