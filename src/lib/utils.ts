// import type { ClassValue } from "clsx"
// import { clsx } from "clsx"
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }


export function getWindowProperty<T = unknown>(key: string): T | undefined {
  if (typeof window === 'undefined') return undefined

  return (window as unknown as Record<string, T>)[key]
}


export const regs = {
  username: /^[a-zA-Z]+[a-zA-Z0-9-]+$/,
  domain: /^[a-zA-Z0-9]+[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/,
  domainPart: /^[a-zA-Z0-9]+[a-zA-Z0-9-]+[a-zA-Z0-9]+$/,
}