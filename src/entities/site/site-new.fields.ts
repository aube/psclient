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
        .min(4, { message: 'Минимальная длина 4 символа' })
        .max(32, { message: 'Максимальная длина 32 символа' })
        .refine((value:string) => regs.domainPart.test(value), {
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
  // {
  //   type: "input",
  //   name: "domain",
  //   label: "Домен",
  // },
]