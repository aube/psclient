
// Transform tempate:
// <img src="{{imgsrc}}"/>
// {{title}}
// <p>Hello, {{userName}}!</p>

// To:
// <img src="{{imgsrc}}" data-hb-src="imgsrc"/>
// <!--var:title-->{{title}}<!--/var:title-->
// <p>Hello, <!--var:userName-->{{userName}}<!--/var:userName-->!</p>

export function wrapHbVars(html) {
  const ignoredTags = ['textarea', 'script', 'style', 'noscript'];
  
  let result = '';
  let buffer = '';
  let insideTag = false;
  let insideIgnoredContent = false;
  let ignoredStack = [];
  
  // === Обработка буфера тега ===
  function tagProcessing(tag) {
    // Проверяем открывающий тег
    const openMatch = tag.match(/^<\s*([a-zA-Z][a-zA-Z0-9-]*)/i);
    if (openMatch) {
      const tagName = openMatch[1].toLowerCase();
      if (ignoredTags.includes(tagName)) {
        ignoredStack.push(tagName);
        insideIgnoredContent = true;
      }
    }
    
    // Проверяем закрывающий тег
    const closeMatch = tag.match(/^<\s*\/\s*([a-zA-Z][a-zA-Z0-9-]*)/i);
    if (closeMatch) {
      const tagName = closeMatch[1].toLowerCase();
      const stackIndex = ignoredStack.lastIndexOf(tagName);
      if (stackIndex !== -1) {
        ignoredStack.splice(stackIndex, 1);
        if (ignoredStack.length === 0) {
          insideIgnoredContent = false;
        }
      }
      return tag
    }
    
    return tag.replace(
      /([a-zA-Z0-9-]+)=\s*(["'])\{\{([a-zA-Z0-9\.]+)\}\}\2/g,
      '$1=$2{{$3}}$2 data-hb-$1="$3"'
    );
  }
  
  // === Обработка буфера текста ===
  function textProcessing(text) {
    if (insideIgnoredContent) {
      return text;
    }
    return text.replace(/\{\{([a-zA-Z0-9\.]+)\}\}/g, (match, varName) => {
      return `<!--var:${varName}-->${match}<!--/var:${varName}-->`;
    });
  }
  
  // === Основной цикл ===
  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    
    if (char === '<' && !insideTag) {
      // Переход: текст → тег
      if (buffer) {
        result += textProcessing(buffer);
        buffer = '';
      }
      insideTag = true;
    }
    
    if (char === '>' && insideTag) {
      // Переход: тег → текст
      buffer += char;
      result += tagProcessing(buffer);
      buffer = '';
      insideTag = false;
      continue;
    }
    
    buffer += char;
  }
  
  // Обработка остатка буфера
  if (buffer) {
    result += insideTag ? tagProcessing(buffer) : textProcessing(buffer);
  }
  
  return result;
}


// const test = `<nav class="fixed top-0 left-0 right-0 z-50 flex justify-center p-6"  aria-label="Основная навигация" test="{{test}}">
//     <div class="w-full max-w-7xl flex justify-between items-center font-display">
//         <div class="text-2xl font-medium tracking-tighter">d404<span class="opacity-30">.ru</span></div>
//         <div class="hidden md:flex space-x-12 text-[10px] uppercase tracking-[0.4em] font-medium">
//             <a href="#" class="hover:opacity-50 transition">Кейсы</a>
//             <a href="#" class="hover:opacity-50 transition">Студия</a>
//   {{#each mainMenu}}
//   <a href="{{this.src}}">{{this.title}}</a>
//   {{/each}}
//         </div>
// {{settings.logo}}
//         <a href="mailto:hello@d404.ru" class="hover:scale-110 transition-transform">
//             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><path d="M22 6l-10 7L2 6"></path></svg>
//         </a>
//     </div>
// </nav>`

// console.log(wrapHbVars(test))