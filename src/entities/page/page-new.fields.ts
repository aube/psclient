import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { regs } from '../../lib/utils'

export default () => [
  {
    type: "input",
    name: "h1",
    label: "Заголовок (H1)",
    help: "Главный заголовок страницы",
    resolver: zodResolver(
      z.string()
        .min(1, { message: 'Минимальная длина 1 символ' })
        .max(512, { message: 'Максимальная длина 512 символа' })
    ),
  },
  {
    type: "input",
    name: "title",
    label: "Заголовок (title)",
    help: "Выводится в окне браузера или вкладке",
    resolver: zodResolver(
      z.string()
        .max(1024, { message: 'Максимальная длина 1024 символа' })
    ),
  },
  {
    type: "input",
    name: "name",
    label: "Имя страницы",
    resolver: zodResolver(
      z.string()
        .min(1, { message: 'Минимальная длина 1 символ' })
        .max(256, { message: 'Максимальная длина 256 символа' })
        .refine((value:string) => regs.domainPart.test(value), {
          message: 'Только латинские символы и числа',
        })
    ),
  },
  {
    type: "input",
    name: "menu",
    label: "Название в меню",
    help: "Текст ссылки на страницу",
    resolver: zodResolver(
      z.string()
        .max(64, { message: 'Максимальная длина 64 символа' })
    ),
  },
  {
    type: "input",
    name: "tags",
    label: "Тэги",
    help: "Список тэгов разделённых запятыми",
    resolver: zodResolver(
      z.string()
        .max(64, { message: 'Максимальная длина 64 символа' })
    ),
  },
  {
    type: "input",
    name: "template",
    label: "Шаблон",
    help: "Шаблон вёрстки полной страницы",
    resolver: zodResolver(
      z.string()
        .max(32, { message: 'Максимальная длина 32 символа' })
    ),
  },

  {
    type: "textarea",
    name: "content",
    label: "Содержимое страницы",
  },
  {
    type: "input",
    name: "template_anons",
    label: "Шаблон",
    help: "Шаблон анонса страницы для вывода в списках страниц",
    resolver: zodResolver(
      z.string()
        .max(32, { message: 'Максимальная длина 32 символа' })
    ),
  },
  {
    type: "textarea",
    name: "anons",
    label: "Анонс содержимого",
    help: "Выводится в списках страниц",
    resolver: zodResolver(
      z.string()
        .max(1024, { message: 'Максимальная длина 1024 символа' })
    ),
  },
]