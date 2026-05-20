# Работа с формами

## Типы полей форм: <name>.fields.json

Описание полей и структуры формы используется в генераторе форм в админке

### TypeScript типы

export interface FormField {
  type: string;
  label?: string;
  name?: string;
  fields?: FormField[];
  options?: any[];
  hidden?: boolean;
  class?: string;
  help?: string;
}

export type FormFields = FormField[]

### Описание параметра FormField.type

- input: strings
- textarea: for multiline strings
- html: wysiwyg editer
- switch: boolean
- checkbox: boolean
- subfields: для повторяющихся в цикле #each наборов полей
- number
- icon
- image

### Пример готового объекта с полями

[{
  "type": "checkbox",
  "name": "inverted",
  "label": "Выделенная секция"
},{
  "type": "input",
  "name": "companiMission",
  "label": "Слоган/миссия (текст под названием)"
},{
  "type": "subfields",
  "name": "links",
  "label": "Ссылки на соцсети",
  "fields": [
    {
      "type": "icon",
      "name": "icon",
      "label": "Иконка соцсети"
    },
    {
      "type": "input",
      "name": "link",
      "label": "Ссылка"
    }
  ]
}]