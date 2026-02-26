// === Построение карты переменных в аттрибутах тэгов ===
export function buildHbAttrMap() {
  const hbMap = new Map(); // varName → [{el, attributeName}]
  
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT
  );
  
  let node;
  while (node = walker.nextNode()) {
    // Собираем атрибуты для удаления (чтобы не модифицировать collection во время итерации)
    const attrsToRemove = [];
    
    for (const attr of node.attributes) {
      if (attr.name.startsWith('data-hb-')) {
        const varName = attr.value.trim();
        if (!varName) continue;
        
        const originalAttrName = attr.name.replace('data-hb-', '');
        
        if (!hbMap.has(varName)) {
          hbMap.set(varName, []);
        }
        
        hbMap.get(varName).push({
          el: node,
          attributeName: originalAttrName
        });
        
        attrsToRemove.push(attr.name);
      }
    }
    
    // Очищаем data-hb-* атрибуты после обработки
    attrsToRemove.forEach(attrName => {
      node.removeAttribute(attrName);
    });
  }
  
  return hbMap;
}

// === Построение карты для текстовых переменных (комментарии) ===
export function buildHbTextMap() {
  const hbTextMap = new Map(); // varName → [{startComment, endComment, nodes}]
  
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT
  );
  
  const stack = new Map(); // Для отслеживания вложенности: varName → {startComment, nodes}
  const openComments = new Map(); // varName → startComment (для проверки дубликатов)
  
  let node;
  while (node = walker.nextNode()) {
    if (node.nodeType === Node.COMMENT_NODE) {
      const match = node.textContent.match(/^\/?var:(.+)$/);
      if (match) {
        const isClosing = match[0].startsWith('/');
        const varName = match[1].trim();
        
        if (!isClosing) {
          // Открывающий комментарий <!--var:name-->
          if (!stack.has(varName)) {
            stack.set(varName, {
              startComment: node,
              nodes: []
            });
          }
        } else {
          // Закрывающий комментарий <!--/var:name-->
          const entry = stack.get(varName);
          if (entry) {
            // Сохраняем в map
            if (!hbTextMap.has(varName)) {
              hbTextMap.set(varName, []);
            }
            
            hbTextMap.get(varName).push({
              startComment: entry.startComment,
              endComment: node,
              nodes: entry.nodes
            });
            
            stack.delete(varName);
          }
        }
      }
    } else if (node.nodeType === Node.TEXT_NODE && stack.size > 0) {
      // Текстовый узел между комментариями — добавляем ко всем активным переменным
      for (const [_, entry] of stack) {
        entry.nodes.push(node);
      }
    }
  }
  
  return hbTextMap;
}

// === Обновление текстовых значений ===
export function updateHbTexts(hbTextMap, updates) {
  // updates: { varName: newValue }
  for (const [varName, newValue] of Object.entries(updates)) {
    const entries = hbTextMap.get(varName);
    if (!entries) continue;
    
    entries.forEach(({ nodes }) => {
      nodes.forEach(node => {
        // Заменяем содержимое текстового узла
        // Если там был {{varName}}, заменяем на новое значение
        node.textContent = newValue;
      });
    });
  }
}

// === Обновление значений ===
export function updateHbAttrs(hbAttrMap, updates) {
  // updates: { varName: newValue }
  for (const [varName, newValue] of Object.entries(updates)) {
    const entries = hbAttrMap.get(varName);
    if (!entries) continue;
    
    entries.forEach(({ el, attributeName }) => {
      el.setAttribute(attributeName, newValue);
    });
  }
}
