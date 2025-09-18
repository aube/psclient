import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { regs } from '../../lib/utils'

export default () => [
  {
    type: "input",
    name: "name",
    label: "Имя шаблона",
    resolver: zodResolver(
      z.string()
        .trim()
        .min(1, { message: 'Минимальная длина 1 символ' })
        .max(256, { message: 'Максимальная длина 256 символа' })
        .refine((value:string) => regs.pagename.test(value), {
          message: 'Латинские символы, числа, дефис и нижн.подчеркивание',
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
    type: "textarea",
    name: "html",
    label: "HTML разметка",
  },
  {
    type: "textarea",
    name: "json",
    label: "JSON структура полей",
  },
  {
    type: "textarea",
    name: "css",
    label: "CSS",
  },
  {
    type: "textarea",
    name: "js",
    label: "javascript",
  },
]