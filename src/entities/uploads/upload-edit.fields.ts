import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

export default () => [
  {
    type: "input",
    name: "url",
    label: "Публичная ссылка",
    resolver: zodResolver(
      z.string()
        .min(2, { message: 'Минимальная длина 2 символа' })
        .max(512, { message: 'Максимальная длина 512 символа' })
    ),
  },
  {
    type: "input",
    name: "category",
    label: "Категория",
    resolver: zodResolver(
      z.string()
        .max(32, { message: 'Максимальная длина 32 символа' })
    ),
  },
  {
    type: "textarea",
    name: "description",
    label: "Описание или метаданные",
    resolver: zodResolver(
      z.string()
        .max(1024, { message: 'Максимальная длина 1024 символа' })
    ),
  },
]