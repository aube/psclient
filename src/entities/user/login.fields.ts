import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { regs } from '../../lib/utils'

export default () => [
  {
    type: "input",
    name: "username",
    label: "Имя",
    resolver: zodResolver(
      z.string()
        .max(32, { message: 'Максимальная длина 32 символа' })
        .refine((value:string) => regs.username.test(value), {
          message: 'Только латинские символы и числа',
        })
    ),
  },
  {
    type: "password",
    name: "password",
    label: "Пароль",
    resolver: zodResolver(
      z.string()
        .max(32, { message: 'Максимальная длина 32 символа' })
    ),
  },
]