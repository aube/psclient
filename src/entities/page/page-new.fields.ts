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
        .trim()
        .min(1, { message: 'Минимальная длина 1 символ' })
        .max(512, { message: 'Максимальная длина 512 символа' })
    ),
  },
  {
    type: "input",
    name: "name",
    label: "Имя страницы",
    help: "Внимание! Имя страницы устанавливается только при её создании",
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
]