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
  username: /^[a-zA-Z]+[a-zA-Z0-9-]+[a-zA-Z0-9]+$/,
  pagename: /^[a-zA-Z0-9-_]+$/,
  alphadigits: /^[a-zA-Z0-9]+$/,
  domain: /^[a-zA-Z0-9]+[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/,
  domainPart: /^[a-zA-Z0-9]+[a-zA-Z0-9-]?[a-zA-Z0-9]+$/,
}



export const translitRu2En = (text:string) => {
  if(!text) return '';

  let result = '';
  let curent = '';

  const translitMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h',
    'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh','ъ': '\'', 'ы': 'y', 'ь': '\'',
    'э': 'e', 'ю': 'yu', 'я': 'ya', '№':'#',
    // Uppercase quick fix
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H',
    'Ц': 'C', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sh','Ъ': '\'', 'Ы': 'Y', 'Ь': '\'',
    'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
  };

  for(let i = 0; i < text.length; i++) {
    if(translitMap[text[i]] != undefined) {
      if(curent != translitMap[text[i]] || curent != ' '){
        result += translitMap[text[i]];
        curent = translitMap[text[i]];
      }
    } else {
      result += text[i];
      curent = text[i];
    }
  }

  return result;
}
