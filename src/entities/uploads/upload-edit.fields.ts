import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

export default () => [
  {
    type: "input",
    name: "url",
    label: "Публичная ссылка",
    resolver: zodResolver(
      z.string()
        .trim()
        .refine(val => val === "" || (val.length >= 2 && val.length <= 512), {
          message: "От 2 до 512 символов",
        })
    ),
  },
  {
    type: "input",
    name: "category",
    label: "Категория",
    resolver: zodResolver(
      z.string()
        .trim()
        .max(32, { message: 'Максимальная длина 32 символа' })
    ),
  },
  {
    type: "textarea",
    name: "description",
    label: "Описание или метаданные",
    resolver: zodResolver(
      z.string()
        .trim()
        .max(1024, { message: 'Максимальная длина 1024 символа' })
    ),
  },
]