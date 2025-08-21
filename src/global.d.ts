// src/shims-vue.d.ts
import { User } from './types'

export {}

declare global {
  interface globalThis {
    user?: User
    [key: string]: unknown
  }
}