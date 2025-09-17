import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { regs } from '../../lib/utils'

export default () => [
  {
    type: "input",
    name: "name",
    label: "Имя сайта",
    help: "Имя сайта предназначено для отображения сайта по адресу: ИМЯ.d404.ru",
    resolver: zodResolver(
      z.string()
        .trim()
        .min(4, { message: 'Минимальная длина 4 символа' })
        .max(32, { message: 'Максимальная длина 32 символа' })
        .refine(value => regs.domainPart.test(value), {
          message: 'Только латинские символы и числа',
        })
        .refine((value:string) => !value || regs.alphadigits.test(value[0]), {
          message: 'Первый знак только латинские символы и числа',
        })
        .refine((value:string) => !value || regs.alphadigits.test(value.slice(-1)), {
          message: 'Последний знак только латинские символы и числа',
        })
    ),
  },
  {
    type: "input",
    name: "domain",
    label: "Домен",
    help: "Регистрация домена описана в инструкции: /help/domains",
    resolver: zodResolver(
      z.string()
        .optional()
        .refine(value => !value || regs.domain.test(value), {
          message: 'Имя домена не корректно',
        })
    ),
  },
  {
    type: "input",
    name: "title",
    label: "Заголовок сайта",
    help: "",
    resolver: zodResolver(
      z.string()
        .trim()
        .min(3, { message: 'Минимальная длина 3 символа' })
    ),
  },
  {
    type: "textarea",
    name: "meta",
    label: "Метатэги",
    help: "Нужно использовать JSON-формат",
  },
  {
    type: "textarea",
    name: "settings",
    label: "Настройки",
    help: "Нужно использовать JSON-формат. Список настроек /help/site-settings",
  },
  {
    type: "input",
    name: "category",
    label: "Категория сайта",
    help: "Для чего нужны категории: /help/site-category",
  },
  {
    type: "textarea",
    name: "template",
    label: "Шаблон сайта",
    help: "Редактирование шаблона сайта: /help/site-template",
  },
]