export const CHAT_LIMITS = {
  MAX_CONTENT_LENGTH: 2000,
  MAX_IMAGES_PER_MESSAGE: 10,
  SEARCH_DEBOUNCE_MS: 400,
  MESSAGE_PAGE_SIZE: 30,
  CONVERSATION_PAGE_SIZE: 20,
  SOCKET_ACK_TIMEOUT_MS: 8000,
} as const;

export const CHAT_SOCKET_NAMESPACE = 'chat';

export const CHAT_SOCKET_EVENTS = {
  SEND_MESSAGE: 'message.send',
  MARK_READ: 'conversation.read',
  NEW_MESSAGE: 'message.new',
  MESSAGE_RECALLED: 'message.recalled',
  MESSAGES_READ: 'conversation.read',
  CONVERSATION_DELETED: 'conversation.deleted',
  BOOKING_UPDATED: 'booking.updated',
  LISTING_AVAILABILITY_CHANGED: 'listing.availability_changed',
} as const;

export const CHAT_QUERY_KEYS = {
  ALL: ['chat'] as const,
  CONVERSATIONS: ['chat', 'conversations'] as const,
  SUMMARY: ['chat', 'summary'] as const,
  conversationList: (filter: string, keyword: string) =>
    ['chat', 'conversations', filter, keyword] as const,
  conversation: (conversationId: string) => ['chat', 'conversation', conversationId] as const,
  messages: (conversationId: string) => ['chat', 'messages', conversationId] as const,
};

export const CHAT_STORAGE_KEY = 'uninest_chat_state';

export const QUICK_REPLIES = ['Giá điện nước?', 'Còn trống không ạ?', 'Xin thêm ảnh'] as const;

export const CHAT_TIPS = [
  'Giới thiệu ngắn: bạn học trường nào, dự kiến ở mấy người, thời gian dọn vào.',
  'Hỏi rõ giá điện nước và tiền cọc ngay từ đầu để khỏi mất công đi xem.',
  'Không chuyển cọc ngoài ứng dụng, kể cả khi chủ trọ hứa giữ phòng.',
] as const;
