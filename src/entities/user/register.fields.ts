import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { regs } from '../../lib/utils'

export default (formData : Record<string,string>) => [
  {
    type: "input",
    name: "username",
    label: "Имя",
    resolver: zodResolver(
      z.string()
        .min(4, { message: 'Минимальная длина 4 символа' })
        .max(32, { message: 'Максимальная длина 32 символа' })
        .refine((value:string) => regs.username.test(value), {
          message: 'Только латинские символы и числа',
        })
    ),
  },
  {
    type: "input",
    name: "email",
    label: "Email",
    resolver: zodResolver(
      z.email('Неверный формат эл.почты')
        .min(1, 'Email обязателен')
    ),
  },
  {
    type: "password",
    name: "password",
    label: "Пароль",
    resolver: zodResolver(
      z.string()
        .min(4, { message: 'Минимальная длина 6 символов' })
        .max(32, { message: 'Максимальная длина 32 символа' })
    ),
  },
  {
    type: "password",
    name: "password_confirmation",
    label: "Повторите пароль",
    resolver: zodResolver(
      z.string()
        .refine(() => formData.password === formData.password_confirmation, {
          message: 'Пароли должны совпадать',
        })
    ),
  },
]