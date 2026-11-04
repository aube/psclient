const WS_PATH = '/api/v1/ws/chat';
const CONVERSATIONS_PATH = '/api/v1/conversations';
const SELF_CONVERSATIONS_PATH = '/api/v1/conversations/self';
const MESSAGES_PATH = (uuid) => `/api/v1/conversations/${encodeURIComponent(uuid)}/messages`;
const MAX_WS_BYTES = 4096;
const PING_INTERVAL_MS = 45000;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;
const TYPING_STOP_MS = 2500;
const TYPING_SEND_THROTTLE_MS = 1500;
const PREFERRED_CONVERSATION_KEY = 'chat:conversationUuid';

function wsUrl() {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${location.host}${WS_PATH}`;
}

function byteLength(value) {
  return new TextEncoder().encode(value).length;
}

function hasClientCookie() {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((part) => {
    const separator = part.indexOf('=');
    if (separator < 1) return false;
    return part.slice(0, separator).trim() === 'client_token' && part.slice(separator + 1).trim() !== '';
  });
}

function isEnabled() {
  const settings = window.__SITE_SETTINGS || {};
  if (settings.chatClientEnabled === true) return true;
  return hasClientCookie();
}

function readPreferredConversation() {
  try {
    return localStorage.getItem(PREFERRED_CONVERSATION_KEY) || '';
  } catch {
    return '';
  }
}

function writePreferredConversation(uuid) {
  try {
    if (uuid) {
      localStorage.setItem(PREFERRED_CONVERSATION_KEY, uuid);
    } else {
      localStorage.removeItem(PREFERRED_CONVERSATION_KEY);
    }
  } catch {
    // localStorage may be unavailable in private mode
  }
}

function normalizeMessage(raw) {
  const data = raw && raw.data ? raw.data : raw || {};
  return {
    id: data.id ?? data.ID ?? null,
    conversationUuid: data.conversation_uuid ?? data.ConversationUUID ?? '',
    senderType: data.sender_type ?? data.SenderType ?? '',
    senderId: data.sender_id ?? data.SenderID ?? '',
    content: data.content ?? data.Content ?? '',
    messageType: data.message_type ?? data.MessageType ?? 'text',
    createdAt: data.created_at ?? data.CreatedAt ?? '',
  };
}

function normalizeConversation(raw) {
  const data = raw && raw.data ? raw.data : raw || {};
  return {
    uuid: data.uuid ?? data.UUID ?? '',
    topic: data.topic ?? data.Topic ?? '',
    status: data.status ?? data.Status ?? '',
    participantType: data.participant_type ?? data.ParticipantType ?? '',
    participantId: data.participant_id ?? data.ParticipantID ?? '',
    createdAt: data.created_at ?? data.CreatedAt ?? '',
  };
}

function messageKey(message) {
  if (message.id !== null && message.id !== undefined) return `id:${message.id}`;
  return [
    message.conversationUuid,
    message.createdAt,
    message.senderType,
    message.senderId,
    message.content,
  ].join('|');
}

function compareMessages(left, right) {
  const leftTime = new Date(left.createdAt).getTime();
  const rightTime = new Date(right.createdAt).getTime();
  if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) return 0;
  return leftTime - rightTime;
}

function createEmitter() {
  const listeners = new Map();

  function on(type, handler) {
    if (typeof handler !== 'function') return () => {};
    let handlers = listeners.get(type);
    if (!handlers) {
      handlers = new Set();
      listeners.set(type, handlers);
    }
    handlers.add(handler);
    return () => off(type, handler);
  }

  function off(type, handler) {
    const handlers = listeners.get(type);
    if (!handlers) return;
    handlers.delete(handler);
    if (!handlers.size) listeners.delete(type);
  }

  function once(type, handler) {
    const wrapped = (payload) => {
      off(type, wrapped);
      handler(payload);
    };
    return on(type, wrapped);
  }

  function emit(type, payload) {
    const handlers = listeners.get(type);
    if (!handlers) return;
    [...handlers].forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.error('Chat listener error:', error);
      }
    });
  }

  return { on, off, once, emit };
}

const emitter = createEmitter();

const state = {
  started: false,
  enabled: false,
  status: 'idle',
  ws: null,
  conversations: [],
  conversationUuid: readPreferredConversation(),
  messages: new Map(),
  historyLoaded: new Set(),
  messagesPromises: new Map(),
  backgroundSubscriptions: new Set(),
  viewSubscription: null,
  subscribed: new Set(),
  viewActive: false,
  reconnectAttempts: 0,
  reconnectTimer: null,
  pingTimer: null,
  typingSent: false,
  typingThrottleTimer: null,
  typingStopTimer: null,
  bootstrapPromise: null,
  lastError: null,
};

function setStatus(status, error = null) {
  state.status = status;
  state.lastError = error || null;
  emitter.emit('status', { status, error });
}

async function request(path, options = {}) {
  const headers = { Accept: 'application/json', ...(options.headers || {}) };
  const config = { credentials: 'same-origin', ...options, headers };
  const response = await fetch(path, config);

  if (!response.ok) {
    const error = new Error(response.status === 401 ? 'Требуется авторизация' : 'Ошибка загрузки чата');
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

function getConversation(uuid = state.conversationUuid) {
  return state.conversations.find((conversation) => conversation.uuid === uuid) || null;
}

function getConversations() {
  return state.conversations.map((conversation) => ({ ...conversation }));
}

function getMessages(uuid) {
  const messages = state.messages.get(uuid);
  if (!messages) return [];
  return [...messages.values()].sort(compareMessages);
}

function getState() {
  return {
    started: state.started,
    enabled: state.enabled,
    status: state.status,
    connected: isConnected(),
    conversationUuid: state.conversationUuid,
    conversation: getConversation(),
    conversations: getConversations(),
    viewActive: state.viewActive,
    error: state.lastError,
  };
}

function isConnected() {
  return Boolean(state.ws && state.ws.readyState === WebSocket.OPEN);
}

function isHistoryLoaded(uuid) {
  return state.historyLoaded.has(uuid);
}

function sendRaw(payload) {
  const data = JSON.stringify(payload);

  if (byteLength(data) > MAX_WS_BYTES) {
    const error = new Error('Сообщение слишком длинное');
    error.code = 'too-long';
    throw error;
  }

  if (!state.ws || state.ws.readyState !== WebSocket.OPEN) {
    const error = new Error('Нет соединения с чатом');
    error.code = 'no-connection';
    throw error;
  }

  state.ws.send(data);
  return true;
}

function subscribe(uuid) {
  if (!uuid || state.subscribed.has(uuid)) return;
  try {
    if (sendRaw({ type: 'subscribe', conversation_uuid: uuid })) {
      state.subscribed.add(uuid);
    }
  } catch {
    // Will be retried on the next connection open
  }
}

function unsubscribe(uuid) {
  if (!uuid) return;
  if (state.subscribed.has(uuid)) {
    try {
      sendRaw({ type: 'unsubscribe', conversation_uuid: uuid });
    } catch {
      // The socket is already closed
    }
    state.subscribed.delete(uuid);
  }
}

function getDesiredSubscriptions() {
  const desired = new Set(state.backgroundSubscriptions);
  if (state.viewSubscription) desired.add(state.viewSubscription);
  return desired;
}

function resubscribe() {
  state.subscribed.clear();
  getDesiredSubscriptions().forEach((uuid) => subscribe(uuid));
}

function syncBackgroundSubscriptions() {
  const next = new Set(
    state.conversations
      .filter((conversation) => conversation.status === 'active')
      .map((conversation) => conversation.uuid)
  );

  state.backgroundSubscriptions.forEach((uuid) => {
    if (!next.has(uuid) && uuid !== state.viewSubscription) unsubscribe(uuid);
  });

  state.backgroundSubscriptions = next;
  next.forEach((uuid) => subscribe(uuid));
}

function ensureSelectedConversation() {
  if (state.conversationUuid && getConversation(state.conversationUuid)) return;

  const preferred = getConversation(readPreferredConversation());
  const active = state.conversations.find((conversation) => conversation.status === 'active');
  const next = preferred || active || state.conversations[0] || null;
  const previousUuid = state.conversationUuid;

  state.conversationUuid = next ? next.uuid : '';
  if (previousUuid !== state.conversationUuid) {
    emitter.emit('conversation', { conversation: next, previousUuid });
  }
}

function upsertConversation(conversation) {
  if (!conversation || !conversation.uuid) return;

  const index = state.conversations.findIndex((item) => item.uuid === conversation.uuid);
  if (index === -1) {
    state.conversations.unshift(conversation);
  } else {
    state.conversations[index] = conversation;
  }

  if (conversation.status === 'active') {
    state.backgroundSubscriptions.add(conversation.uuid);
    subscribe(conversation.uuid);
  } else {
    state.backgroundSubscriptions.delete(conversation.uuid);
    if (conversation.uuid !== state.viewSubscription) unsubscribe(conversation.uuid);
  }

  emitter.emit('conversations', { conversations: getConversations() });
}

async function loadConversations() {
  try {
    const data = await request(CONVERSATIONS_PATH);
    const rows = Array.isArray(data && data.rows) ? data.rows : Array.isArray(data) ? data : [];
    state.conversations = rows
      .map(normalizeConversation)
      .filter((conversation) => conversation.uuid);

    ensureSelectedConversation();
    syncBackgroundSubscriptions();
    emitter.emit('conversations', { conversations: getConversations() });
    return getConversations();
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      state.enabled = false;
      setStatus('disabled', error);
    }
    throw error;
  }
}

function ingestMessage(raw, fallbackConversationUuid = '') {
  const message = normalizeMessage(raw);
  if (!message.conversationUuid) message.conversationUuid = fallbackConversationUuid;
  if (!message.content && message.messageType === 'text') return null;
  if (!message.conversationUuid) return null;

  let messages = state.messages.get(message.conversationUuid);
  if (!messages) {
    messages = new Map();
    state.messages.set(message.conversationUuid, messages);
  }

  const key = messageKey(message);
  if (messages.has(key)) return null;

  messages.set(key, message);
  return message;
}

async function loadMessages(uuid, options = {}) {
  if (!uuid) {
    throw new Error('Не указан диалог');
  }

  const { notify = false, force = false } = options;

  if (state.messagesPromises.has(uuid)) {
    return state.messagesPromises.get(uuid);
  }

  if (!force && state.historyLoaded.has(uuid)) {
    const messages = getMessages(uuid);
    emitter.emit('history', { conversationUuid: uuid, messages });
    return messages;
  }

  const firstLoad = !state.historyLoaded.has(uuid);
  const promise = (async () => {
    const data = await request(MESSAGES_PATH(uuid));
    const rows = Array.isArray(data && data.rows) ? data.rows : Array.isArray(data) ? data : [];
    const fresh = [];

    rows.forEach((raw) => {
      const message = ingestMessage(raw, uuid);
      if (message) fresh.push(message);
    });

    state.historyLoaded.add(uuid);
    const messages = getMessages(uuid);
    emitter.emit('history', { conversationUuid: uuid, messages });

    if (notify && !firstLoad) {
      fresh.forEach((message) => emitter.emit('message', { message }));
    }

    return messages;
  })().finally(() => {
    state.messagesPromises.delete(uuid);
  });

  state.messagesPromises.set(uuid, promise);
  return promise;
}

function stopTyping() {
  if (state.typingThrottleTimer) {
    clearTimeout(state.typingThrottleTimer);
    state.typingThrottleTimer = null;
  }
  if (state.typingStopTimer) {
    clearTimeout(state.typingStopTimer);
    state.typingStopTimer = null;
  }
  if (!state.typingSent) return;

  state.typingSent = false;
  sendTypingState(false);
}

function sendTypingState(isTyping) {
  if (!state.conversationUuid) return;
  try {
    sendRaw({
      type: 'typing',
      conversation_uuid: state.conversationUuid,
      is_typing: isTyping,
    });
  } catch {
    // Typing is best-effort and must never break the chat
  }
}

function typingHeartbeat() {
  if (!state.typingSent) return;
  sendTypingState(true);
  state.typingThrottleTimer = setTimeout(() => {
    state.typingThrottleTimer = null;
    typingHeartbeat();
  }, TYPING_SEND_THROTTLE_MS);
}

function notifyTyping() {
  if (!state.conversationUuid) return;

  const conversation = getConversation();
  if (conversation && conversation.status !== 'active') {
    stopTyping();
    return;
  }

  if (!state.typingSent) {
    state.typingSent = true;
    sendTypingState(true);
    state.typingThrottleTimer = setTimeout(() => {
      state.typingThrottleTimer = null;
      typingHeartbeat();
    }, TYPING_SEND_THROTTLE_MS);
  }

  if (state.typingStopTimer) {
    clearTimeout(state.typingStopTimer);
  }

  state.typingStopTimer = setTimeout(() => {
    state.typingStopTimer = null;
    stopTyping();
  }, TYPING_STOP_MS);
}

async function selectConversation(uuid) {
  if (!uuid) {
    throw new Error('Не указан диалог');
  }

  let conversation = getConversation(uuid);
  if (!conversation) {
    await loadConversations();
    conversation = getConversation(uuid);
  }
  if (!conversation) {
    throw new Error('Диалог не найден');
  }

  stopTyping();

  const previousUuid = state.conversationUuid;
  const previousView = state.viewSubscription;

  state.conversationUuid = uuid;
  state.viewSubscription = uuid;
  writePreferredConversation(uuid);

  if (previousView && previousView !== uuid && !state.backgroundSubscriptions.has(previousView)) {
    unsubscribe(previousView);
  }

  subscribe(uuid);
  emitter.emit('conversation', { conversation, previousUuid });

  const messages = await loadMessages(uuid);
  return { conversation, messages };
}

async function ensureConversation(options = {}) {
  const requestedUuid = options.uuid || '';

  if (!state.enabled) {
    await start({ force: true });
  } else {
    await start();
  }

  if (!state.enabled) {
    const error = new Error('Требуется авторизация');
    error.status = 401;
    error.chatStage = 'auth';
    throw error;
  }

  let conversation = getConversation(requestedUuid)
    || getConversation(state.conversationUuid)
    || getConversation(readPreferredConversation());

  if (!conversation) {
    conversation = state.conversations.find((item) => item.status === 'active')
      || state.conversations[0]
      || null;
  }

  const hasActive = state.conversations.some((item) => item.status === 'active');

  if (!conversation || (!hasActive && conversation.status !== 'active')) {
    try {
      const created = normalizeConversation(await request(SELF_CONVERSATIONS_PATH, { method: 'POST' }));
      if (created.uuid) {
        upsertConversation(created);
        conversation = created;
      }
    } catch (error) {
      error.chatStage = 'create';
      if (!conversation) throw error;
    }
  }

  if (!conversation || !conversation.uuid) {
    const error = new Error('Не удалось создать диалог');
    error.chatStage = 'create';
    throw error;
  }

  if (!isConnected()) connect();
  await selectConversation(conversation.uuid);
  return conversation;
}

async function send(content, options = {}) {
  const text = String(content ?? '').trim();
  if (!text) {
    const error = new Error('Пустое сообщение');
    error.code = 'empty';
    throw error;
  }

  const conversation = getConversation();
  if (!conversation) {
    const error = new Error('Диалог не выбран');
    error.code = 'no-conversation';
    throw error;
  }

  if (conversation.status && conversation.status !== 'active') {
    const error = new Error('Диалог закрыт');
    error.code = 'closed';
    throw error;
  }

  return sendRaw({
    type: 'message',
    conversation_uuid: state.conversationUuid,
    content: text,
    message_type: options.messageType || 'text',
  });
}

function isOwnMessage(message) {
  if (!message) return false;

  const conversation = getConversation(message.conversationUuid) || getConversation();
  if (conversation) {
    if (conversation.participantType && message.senderType === conversation.participantType) return true;
    if (conversation.participantId && message.senderId === conversation.participantId) return true;
  }

  return message.senderType === 'client';
}

function isViewingConversation(uuid) {
  return Boolean(state.viewActive && uuid && uuid === state.conversationUuid);
}

function setViewActive(active) {
  const next = Boolean(active);
  if (state.viewActive === next) return;

  state.viewActive = next;

  if (!next) {
    const view = state.viewSubscription;
    state.viewSubscription = null;
    if (view && !state.backgroundSubscriptions.has(view)) unsubscribe(view);
  }

  emitter.emit('view', { active: state.viewActive });
}

function setPreferredConversation(uuid) {
  if (typeof uuid !== 'string' || !uuid) return;
  writePreferredConversation(uuid);
}

function startPing() {
  stopPing();
  state.pingTimer = setInterval(() => {
    if (!isConnected()) return;
    try {
      sendRaw({ type: 'ping' });
    } catch {
      // The close handler will schedule a reconnect
    }
  }, PING_INTERVAL_MS);
}

function stopPing() {
  if (!state.pingTimer) return;
  clearInterval(state.pingTimer);
  state.pingTimer = null;
}

function scheduleReconnect() {
  if (!state.enabled || state.reconnectTimer) return;

  const attempt = state.reconnectAttempts;
  state.reconnectAttempts += 1;
  const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** attempt);

  state.reconnectTimer = setTimeout(() => {
    state.reconnectTimer = null;
    if (!state.enabled) return;

    if (getDesiredSubscriptions().size) {
      if (!isConnected()) connect();
    } else {
      start({ force: true });
    }
  }, delay);
}

function handleTyping(payload) {
  const data = payload && payload.data ? payload.data : payload || {};
  const conversationUuid = data.conversation_uuid ?? data.ConversationUUID ?? state.conversationUuid;
  if (!conversationUuid) return;

  emitter.emit('typing', {
    conversationUuid,
    senderType: data.sender_type ?? data.SenderType ?? '',
    senderId: data.sender_id ?? data.SenderID ?? '',
    isTyping: Boolean(data.is_typing ?? data.IsTyping),
  });
}

function onWsMessage(event) {
  let payload;
  try {
    payload = JSON.parse(event.data);
  } catch {
    return;
  }

  if (payload.type === 'message') {
    const message = ingestMessage(payload);
    if (message) emitter.emit('message', { message });
    return;
  }

  if (payload.type === 'typing') {
    handleTyping(payload);
    return;
  }

  if (payload.type === 'error') {
    const message = payload.data && payload.data.message
      ? payload.data.message
      : 'Ошибка соединения с чатом';
    emitter.emit('error', { error: new Error(message), stage: 'ws' });
  }
}

function catchUp() {
  getDesiredSubscriptions().forEach((uuid) => {
    loadMessages(uuid, {
      notify: state.historyLoaded.has(uuid),
      force: true,
    }).catch(() => null);
  });
}

function connect() {
  if (!state.enabled) return;
  if (state.ws && (state.ws.readyState === WebSocket.OPEN || state.ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  setStatus(state.reconnectAttempts ? 'reconnecting' : 'connecting');

  let socket;
  try {
    socket = new WebSocket(wsUrl());
  } catch (error) {
    setStatus('error', error);
    scheduleReconnect();
    return;
  }

  state.ws = socket;

  socket.addEventListener('open', () => {
    if (state.ws !== socket) return;
    state.reconnectAttempts = 0;
    setStatus('online');
    startPing();
    resubscribe();
    catchUp();
  });

  socket.addEventListener('message', onWsMessage);

  socket.addEventListener('close', () => {
    if (state.ws === socket) state.ws = null;
    stopPing();
    state.subscribed.clear();
    state.typingSent = false;
    if (state.typingThrottleTimer) {
      clearTimeout(state.typingThrottleTimer);
      state.typingThrottleTimer = null;
    }
    if (state.typingStopTimer) {
      clearTimeout(state.typingStopTimer);
      state.typingStopTimer = null;
    }
    if (!state.enabled) return;
    setStatus('offline');
    scheduleReconnect();
  });

  socket.addEventListener('error', () => {
    if (state.ws !== socket) return;
    setStatus('error', new Error('Ошибка соединения с чатом'));
  });
}

async function bootstrap() {
  setStatus(state.reconnectAttempts ? 'reconnecting' : 'connecting');

  try {
    await loadConversations();
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      state.enabled = false;
      setStatus('disabled', error);
      return;
    }
    setStatus('error', error);
    scheduleReconnect();
    return;
  }

  state.reconnectAttempts = 0;

  if (!getDesiredSubscriptions().size) {
    setStatus('idle');
    return;
  }

  connect();

  await Promise.all(
    [...getDesiredSubscriptions()].map((uuid) => loadMessages(uuid, { notify: false }).catch(() => null))
  );
}

async function start(options = {}) {
  if (state.bootstrapPromise) return state.bootstrapPromise;
  if (state.started && !options.force) return getState();

  if (!isEnabled()) {
    state.enabled = false;
    state.started = true;
    setStatus('disabled');
    return getState();
  }

  state.enabled = true;
  state.started = true;
  state.bootstrapPromise = bootstrap().finally(() => {
    state.bootstrapPromise = null;
  });

  return state.bootstrapPromise;
}

function stop() {
  state.enabled = false;
  state.started = false;
  stopPing();

  if (state.reconnectTimer) {
    clearTimeout(state.reconnectTimer);
    state.reconnectTimer = null;
  }

  if (state.typingThrottleTimer) {
    clearTimeout(state.typingThrottleTimer);
    state.typingThrottleTimer = null;
  }

  if (state.typingStopTimer) {
    clearTimeout(state.typingStopTimer);
    state.typingStopTimer = null;
  }

  state.typingSent = false;
  state.subscribed.clear();

  if (state.ws) {
    const socket = state.ws;
    state.ws = null;
    try {
      socket.close();
    } catch {
      // Already closed
    }
  }

  setStatus('idle');
}

const API = {
  start,
  stop,
  isEnabled,
  isConnected,
  loadConversations,
  ensureConversation,
  selectConversation,
  loadMessages,
  getState,
  getConversations,
  getConversation,
  getMessages,
  isHistoryLoaded,
  send,
  notifyTyping,
  stopTyping,
  isOwnMessage,
  isViewingConversation,
  setViewActive,
  setPreferredConversation,
  on: emitter.on,
  off: emitter.off,
  once: emitter.once,
};

const chat = { API };

if (typeof window !== 'undefined') {
  window.chat = chat;
}

export { chat };
export default chat;
