import { chat } from '/static/chat.js';
import { toast } from '/static/toast.js';

const CHAT_PATH = '/client/chat';
const MAX_DETAIL_LENGTH = 180;

function truncate(value, maxLength = MAX_DETAIL_LENGTH) {
  const text = String(value ?? '').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export function initChatNotifications() {
  return chat.API.on('message', ({ message } = {}) => {
    if (!message || !message.conversationUuid) return;
    if (chat.API.isOwnMessage(message)) return;
    if (chat.API.isViewingConversation(message.conversationUuid) && document.visibilityState === 'visible') {
      return;
    }

    toast.add({
      id: `chat:${message.conversationUuid}`,
      group: 'chat',
      severity: 'info',
      summary: 'Новое сообщение',
      detail: truncate(message.content),
      href: CHAT_PATH,
      onClick: () => chat.API.setPreferredConversation(message.conversationUuid),
    });
  });
}
