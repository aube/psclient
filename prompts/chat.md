Техническое задание: Чат-виджет для посетителей сайта (клиентская часть)
1. Общее описание
Чат-виджет — встраиваемый скрипт для сайтов, созданных на платформе psy. Позволяет посетителю сайта общаться в реальном времени с психологом через WebSocket. Виджет работает на другом домене (сайт клиента), реализован на nativeJS (vanilla JS, без фреймворков) с использованием Tailwind CSS для стилизации.
Виджет поставляется в виде единого JS-файла, подключаемого через <script>-тег.
---
2. Подключение виджета
2.1. Способ подключения
<script
  src="https://cdn.psy.rest/chat-widget.js"
  data-site-uuid="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  data-position="bottom-right"
  defer
></script>

Поддерживаемые data-атрибуты:
Атрибут	Тип	Обязательный	Описание
data-site-uuid	string	да	UUID сайта на платформе psy
data-position	bottom-right | bottom-left	нет	Позиция кнопки (по умолчанию bottom-right)
data-title	string	нет	Заголовок окна чата (по умолчанию «Чат с психологом»)
data-greeting	string	нет	Приветствие в пустом чате (по умолчанию «Здравствуйте! Чем я могу вам помочь?»)
2.2. Инициализация
При загрузке скрипт:
1. Создаёт DOM-элементы виджета (кнопку + окно чата)
2. Получает или создаёт session_uuid через API:
   - Проверяет localStorage/sessionStorage на наличие существующего session_uuid
   - Если нет — вызывает POST /api/v1/session (или получает через cookie) и сохраняет полученный UUID
3. Подключается к WebSocket
4. Готов к приёму/отправке сообщений
---
3. API-эндпоинты
3.1. REST API (HTTP)
Все REST-запросы отправляются на VITE_API_FRONTEND_ADDRESS (бэкенд psy).  
Базовый путь: /api/v1.
POST /api/v1/ws-token
Создаёт short-lived code для WebSocket-подключения (аналог JWT через URL shortener).
Аутентификация: Cookie (автоматическая для браузера)
Параметры запроса: нет
Ответ (200):
{
  "code": "aB3xY...K9mZ2"
}
POST /api/v1/session
Создаёт или возвращает существующую guest-сессию посетителя.
Аутентификация: Не требуется
Параметры запроса: { "site_uuid": "..." } (обязательно)
Ответ (200):
{
  "session_uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "expires_at": "2026-05-14T12:00:00Z"
}
> Примечание: если endpoint /session не реализован на бэкенде, session_uuid может создаваться автоматически при первом WS-подключении с ?session=UUID, где UUID генерируется на клиенте (crypto.randomUUID()).
POST /api/v1/conversations
Создаёт чат-комнату от имени гостя (посетителя).
Аутентификация: Cookie или ?session= в query
Тело запроса:
{
  "participant_type": "guest",
  "participant_id": "session_uuid_посетителя"
}
Ответ (200):
{
  "uuid": "conv-uuid",
  "created_by": "guest",
  "participant_type": "guest",
  "participant_id": "session-uuid",
  "status": "active",
  "created_at": "2026-05-13T10:00:00Z"
}
GET /api/v1/conversations/:uuid/messages
История сообщений (последние 100).
Аутентификация: Cookie или ?session=
Ответ (200):
{
  "rows": [
    {
      "id": 1,
      "conversation_uuid": "conv-uuid",
      "sender_type": "user",
      "sender_id": "1",
      "content": "Здравствуйте!",
      "message_type": "text",
      "created_at": "2026-05-13T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 100,
    "total": 1
  }
}
3.2. WebSocket
URL: wss://<api-host>/api/v1/ws-chat?session=<session_uuid>
Аутентификация через query-параметр:  
Гости подключаются через ?session=<session_uuid>.  
Психолог через ?code=<short_code> (полученный через POST /api/v1/ws-token).
Протокол (Client → Server):
// Подписаться на комнату
{"type":"subscribe", "conversation_uuid":"..."}
// Отписаться
{"type":"unsubscribe", "conversation_uuid":"..."}
// Отправить сообщение
{"type":"message", "conversation_uuid":"...", "content":"...", "message_type":"text"}
// Пинг (keepalive)
{"type":"ping"}
Протокол (Server → Client):
// Новое сообщение
{"type":"message", "data":{"id":1,"conversation_uuid":"...","sender_type":"user","content":"...","created_at":"..."}}
// Ошибка
{"type":"error", "data":{"message":"..."}}
// Понг
{"type":"pong"}
3.3. DTO (TypeScript-типы для справки)
interface Conversation {
  uuid: string
  created_by: string
  participant_type: 'client' | 'guest'
  participant_id: string
  status: string
  created_at: string
}
interface Message {
  id: number
  conversation_uuid: string
  sender_type: string   // "user" — психолог, "guest" — посетитель
  sender_id: string
  content: string
  message_type: string
  created_at: string
}
---
4. Архитектура виджета
4.1. Структура JS-кода
ChatWidget
├── config           // site-uuid, position, title, greeting
├── state            // connected, sessionUuid, conversation, messages, open
├── api
│   ├── getSession()
│   ├── createConversation()
│   ├── getMessages(uuid)
│   └── getWsToken()
├── ws
│   ├── connect()
│   ├── disconnect()
│   ├── send(payload)
│   └── reconnect logic
├── ui
│   ├── render()
│   ├── button       // плавающая круглая кнопка-иконка
│   ├── window       // окно чата (header + messages + input)
│   ├── message(msg) // одно сообщение
│   └── toggle()     // открыть/закрыть окно
└── lifecycle
    ├── init()
    ├── onMessage(data)
    └── destroy()
4.2. Стилизация (Tailwind)
Виджет использует заранее скомпилированный CSS (Tailwind в standalone-режиме, без конфликтов с основными стилями сайта). Все классы имеют префикс .cw- (chat-widget) для изоляции.
Цветовая схема (фиксированная):
- Основной цвет (кнопка, заголовок): #4f46e5 (indigo-600)
- Фон окна: #ffffff
- Текст: #1e293b (slate-800)
- Сообщение психолога: светло-серый фон, слева
- Сообщение посетителя: indigo-600/белый текст, справа
4.3. DOM-структура
<div id="cw-root" class="cw-fixed cw-bottom-4 cw-right-4 cw-z-50">
  <!-- Кнопка открытия -->
  <button class="cw-w-14 cw-h-14 cw-rounded-full cw-bg-indigo-600 cw-shadow-lg cw-flex cw-items-center cw-justify-center cw-cursor-pointer">
    <svg><!-- иконка чата --></svg>
  </button>
  <!-- Окно чата (скрыто по умолчанию) -->
  <div class="cw-absolute cw-bottom-20 cw-right-0 cw-w-96 cw-h-[32rem] cw-bg-white cw-rounded-2xl cw-shadow-2xl cw-flex cw-flex-col">
    <!-- Header -->
    <div class="cw-bg-indigo-600 cw-text-white cw-px-4 cw-py-3 cw-rounded-t-2xl cw-font-medium cw-flex cw-items-center cw-justify-between">
      <span>Чат с психологом</span>
      <button class="cw-text-white/80">✕</button>
    </div>
    <!-- Messages -->
    <div class="cw-flex-1 cw-overflow-y-auto cw-p-4 cw-space-y-3">
      <!-- Message: psychologist -->
      <div class="cw-flex cw-justify-start">
        <div class="cw-max-w-[75%] cw-bg-gray-100 cw-rounded-2xl cw-px-4 cw-py-2">
          <p class="cw-text-sm">Здравствуйте!</p>
          <span class="cw-text-xs cw-text-gray-400">10:00</span>
        </div>
      </div>
      <!-- Message: visitor -->
      <div class="cw-flex cw-justify-end">
        <div class="cw-max-w-[75%] cw-bg-indigo-600 cw-text-white cw-rounded-2xl cw-px-4 cw-py-2">
          <p class="cw-text-sm">Здравствуйте! Нужна помощь</p>
          <span class="cw-text-xs cw-text-white/70">10:01</span>
        </div>
      </div>
    </div>
    <!-- Input -->
    <div class="cw-border-t cw-p-4 cw-flex cw-gap-2">
      <textarea class="cw-flex-1 cw-border cw-rounded-xl cw-px-3 cw-py-2 cw-text-sm cw-resize-none" rows="1" placeholder="Напишите сообщение…"></textarea>
      <button class="cw-bg-indigo-600 cw-text-white cw-rounded-xl cw-px-4 cw-py-2">→</button>
    </div>
  </div>
</div>
---
5. Логика работы
5.1. Инициализация
1. Парсинг data-атрибутов скрипта
2. Генерация/получение session_uuid:
   a. Проверить localStorage: 'psy_chat_session'
   b. Если есть и не истёк — использовать
   c. Если нет — POST /api/v1/session { site_uuid }
   d. Сохранить session_uuid с TTL в localStorage
3. Подключение WebSocket к /api/v1/ws-chat?session=<session_uuid>
4. Рендер DOM-элементов
5. Навешивание обработчиков событий
6. Start ping-интервал (30s)
5.2. Первое сообщение (создание чата)
1. Посетитель пишет сообщение
2. Виджет проверяет: есть ли activeConversation?
3. Если нет — POST /api/v1/conversations { participant_type: "guest", participant_id: session_uuid }
4. WS: subscribe к conversation_uuid
5. WS: отправляет message
6. Сохраняет conversation_uuid в state
5.3. Получение новых сообщений
1. WS получает { type: "message", data: {...} }
2. Проверка: совпадает sender_type (не своё же сообщение дублировать)
3. Добавление сообщения в state.messages
4. Ререндер списка сообщений
5. Авто-скролл вниз
5.4. Загрузка истории
1. При открытии существующего чата (conversation_uuid уже есть):
2. GET /api/v1/conversations/:uuid/messages
3. Добавление сообщений в state
4. Ререндер
5.5. Переподключение
1. При разрыве WS (onclose):
   a. Установить connected = false
   b. Показать индикатор "Нет соединения" (опционально)
   c. Exponential backoff: 3s, 6s, 12s, 20s, 30s (max)
   d. Переподключиться с тем же session_uuid
   e. Если был активный conversation — повторный subscribe
5.6. Закрытие/открытие окна
1. При клике на кнопку:
   - Если окно закрыто → показать с анимацией, render сообщений
   - Если окно открыто → скрыть
2. При открытии:
   - Если есть activeConversation → GET messages
   - Иначе → показать приветствие
3. При закрытии: ничего не сбрасывается, WS остаётся подключён
   (уведомления о новых сообщениях через заголовок страницы)
---
6. Описание модулей (nativeJS)
6.1. api.js
const API_HOST = '__API_ADDRESS__' // подставляется при сборке
export const chatAPI = {
  async getSession(siteUuid) {
    const res = await fetch(`${API_HOST}/api/v1/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_uuid: siteUuid })
    })
    if (!res.ok) throw new Error('Session creation failed')
    return res.json()
  },
  async createConversation(sessionUuid) {
    const res = await fetch(`${API_HOST}/api/v1/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participant_type: 'guest',
        participant_id: sessionUuid
      })
    })
    if (!res.ok) throw new Error('Create conversation failed')
    return res.json()
  },
  async getMessages(conversationUuid) {
    const res = await fetch(`${API_HOST}/api/v1/conversations/${conversationUuid}/messages`)
    if (!res.ok) throw new Error('Get messages failed')
    return res.json()
  }
}
6.2. ws.js
export function createWebSocket(sessionUuid, handlers) {
  const WS_HOST = '__WS_ADDRESS__'
  let ws = null
  let reconnectTimer = null
  let reconnectAttempts = 0
  let shouldReconnect = true
  function connect() {
    ws = new WebSocket(`${WS_HOST}/api/v1/ws-chat?session=${sessionUuid}`)
    ws.onopen = () => {
      reconnectAttempts = 0
      handlers.onConnected?.()
    }
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'pong') return
      if (msg.type === 'message') handlers.onMessage?.(msg.data)
      if (msg.type === 'error') handlers.onError?.(msg.data)
    }
    ws.onclose = () => {
      handlers.onDisconnected?.()
      if (shouldReconnect) scheduleReconnect()
    }
  }
  function scheduleReconnect() {
    const delays = [3000, 6000, 12000, 20000, 30000]
    const delay = delays[Math.min(reconnectAttempts, delays.length - 1)]
    reconnectAttempts++
    reconnectTimer = setTimeout(connect, delay)
  }
  function send(payload) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload))
    }
  }
  function disconnect() {
    shouldReconnect = false
    clearTimeout(reconnectTimer)
    ws?.close()
    ws = null
  }
  return { connect, disconnect, send }
}
6.3. ui.js
Создаёт DOM-элементы с использованием Tailwind-классов (с префиксом cw-).
Методы:
- render() — создаёт корневой элемент #cw-root с кнопкой и окном
- toggle() — показать/скрыть окно
- addMessage(msg) — добавляет сообщение в список
- clearMessages() — очищает список
- setGreeting(text) — устанавливает приветствие
- setConnected(status) — обновляет индикатор соединения
Сообщения рендерятся как пузырьки:
- sender_type === 'user' (психолог) — слева, серый фон
- sender_type === 'guest' (посетитель) — справа, indigo-600 фон
6.4. main.js
Точка входа. Парсит data-атрибуты, инициализирует state, связывает модули.
(function() {
  const script = document.currentScript
  const config = {
    siteUuid: script.dataset.siteUuid,
    position: script.dataset.position || 'bottom-right',
    title: script.dataset.title || 'Чат с психологом',
    greeting: script.dataset.greeting || 'Здравствуйте! Чем я могу вам помочь?'
  }
  // State
  const state = {
    sessionUuid: null,
    conversationUuid: null,
    messages: [],
    connected: false,
    windowOpen: false
  }
  // Init
  ;(async function() {
    // 1. Session
    const stored = localStorage.getItem('psy_chat_session')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Date.now() < parsed.expires) {
        state.sessionUuid = parsed.sessionUuid
      }
    }
    if (!state.sessionUuid) {
      const session = await chatAPI.getSession(config.siteUuid)
      state.sessionUuid = session.session_uuid
      localStorage.setItem('psy_chat_session', JSON.stringify({
        sessionUuid: session.session_uuid,
        expires: Date.parse(session.expires_at)
      }))
    }
    // 2. WebSocket
    const ws = createWebSocket(state.sessionUuid, {
      onConnected: () => { state.connected = true; ui.setConnected(true) },
      onDisconnected: () => { state.connected = false; ui.setConnected(false) },
      onMessage: (data) => {
        state.messages.push(data)
        ui.addMessage(data)
      },
      onError: (data) => { console.warn('[chat]', data.message) }
    })
    ws.connect()
    // 3. UI
    ui.render(config, {
      onSend: (content) => {
        // Create conversation if needed
        if (!state.conversationUuid) {
          chatAPI.createConversation(state.sessionUuid).then(conv => {
            state.conversationUuid = conv.uuid
            ws.send({ type: 'subscribe', conversation_uuid: conv.uuid })
            ws.send({ type: 'message', conversation_uuid: conv.uuid, content, message_type: 'text' })
          })
        } else {
          ws.send({ type: 'message', conversation_uuid: state.conversationUuid, content, message_type: 'text' })
        }
      },
      onOpen: () => {
        if (state.conversationUuid) {
          chatAPI.getMessages(state.conversationUuid).then(data => {
            state.messages = data.rows
            ui.clearMessages()
            data.rows.forEach(m => ui.addMessage(m))
          })
        }
      }
    })
  })()
})()
---
7. Сборка и доставка
7.1. Инструменты сборки
- esbuild — быстрая сборка единого JS-бандла
- Tailwind CSS — standalone CLI для генерации CSS с префиксом cw-
7.2. Команды сборки
# CSS
npx tailwindcss -i ./src/widget.css -o ./dist/chat-widget.css --minify
# JS (esbuild с инлайном CSS)
npx esbuild ./src/main.js \
  --bundle \
  --minify \
  --target=es2020 \
  --outfile=./dist/chat-widget.js \
  --define:__API_ADDRESS__='"https://api.psy.rest"' \
  --define:__WS_ADDRESS__='"wss://api.psy.rest"'
7.3. Итоговые артефакты
- dist/chat-widget.js — единый файл (~20-30 KB gzip), содержит весь JS + инлайновый CSS
- CDN-доставка: https://cdn.psy.rest/chat-widget.js
---
8. Адаптация под мобильные
1. На экранах < 640px:
   - Окно чата раскрывается на полный экран (без оверлея)
   - Кнопка закрытия в хедере
   - Высота окна: 100vh - env(safe-area-inset-top)
2. Поле ввода:
   - Enter — отправка (на desktop Shift+Enter — новая строка)
   - На мобильных — иконка отправки рядом с полем
3. Safe area insets для iPhone X+
---
9. Обработка ошибок
Ситуация	Действие
401 при создании conversation	Пересоздать session_uuid
WS не отвечает > 10s	Показать «Нет соединения», авто-переподключение
500 при getSession	Сгенерировать UUID на клиенте (crypto.randomUUID())
Сообщение не отправилось	Показать (!) возле сообщения, auto-retry
---
## 10. Защита от конфликтов
- Все CSS-классы с префиксом `cw-` (настраивается в tailwind.config.js через `prefix: 'cw-'`)
- Все DOM-элементы внутри `#cw-root`
- Отсутствие глобальных переменных (IIFE / module pattern)
- `window.__PSY_CHAT__` — точка доступа для внешнего API (опционально: `window.__PSY_CHAT__.open()` / `.close()`)
---
Интеграция с админ-панелью (существующая)
В админ-панели психолога (построена ранее):
- ViewChat — двухпанельная страница со списком чатов
- ComChatList — список conversation (и клиентов, и гостей)
- ComChatMessages — сообщения и поле ввода
- Ответ на обращение (interaction) → создаёт чат с participant_type: "guest"
- Написать клиенту → создаёт чат с participant_type: "client"
Психолог видит сообщения от гостей в реальном времени через WebSocket.