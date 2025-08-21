// src/shims-vue.d.ts
import { User } from './types'

export {}

declare global {

  interface Window {
    user?: User
  }

}