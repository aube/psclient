// Ищем пробел после коротких слов (1-3 символа) или чисел и заменяем на неразрывный пробел
export const typographyText = (text, lang = "") => {
  if (!text) return "";

  // 1. Короткие слова (1-3 симв.) + пробел -> неразрывный пробел
  const shortWordsRegex = /(^|\s)([a-zа-яё]{1,3})\s+/gi;
  
  // 2. Числа + пробел + слово -> неразрывный пробел
  // \d+ — одна или более цифр
  // \s+ — один или более пробелов
  // [a-zа-яё] — первая буква следующего слова
  const numbersRegex = /(^|\s)(\d+)\s+(?=[a-zа-яё])/gi;
  
  // Применяем правила последовательно
  text = text.replace(shortWordsRegex, '$1$2\u00A0');
  text = text.replace(numbersRegex, '$1$2\u00A0');

  if (lang === "fr") { // Во французском языке неразрывный пробел нужен еще и перед некоторыми знаками пунктуации
    text = text.replace(/\s+([!?%&:;])/g, '\u00A0$1')
  }

  return text
};


export const typographyDOM = (node, lang = "") => {
  if (!node) return;

  const walk = (node) => {
    node.childNodes.forEach(child => {
      if (child.nodeType === 3) { // Текстовый узел
        let text = typographyText(child.nodeValue, lang);

        if (text !== child.nodeValue) {
          child.nodeValue = text;
        }
      } else if (child.nodeType === 1 && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
        walk(child); // Рекурсия по элементам, пропуская служебные теги
      }
    });
  };

  walk(node);
};


