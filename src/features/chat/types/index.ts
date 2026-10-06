export * from './constants';

export type MessageType = 'text' | 'image';

export type ConversationFilter = 'all' | 'unread';

export type DeliveryState = 'sent' | 'sending' | 'queued' | 'failed';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  clientMessageId: string;
  type: MessageType;
  content: string | null;
  imageUrls: string[];
  isRecalled: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface ChatCounterpart {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeenAt: string | null;
}

export interface ChatListingSummary {
  id: string;
  title: string;
  price: number;
  status: string;
  coverImageUrl: string | null;
}

export interface ChatLastMessage {
  senderId: string;
  type: MessageType;
  content: string | null;
  imageCount: number;
  isRecalled: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  listing: ChatListingSummary;
  counterpart: ChatCounterpart;
  lastMessage: ChatLastMessage | null;
  unreadCount: number;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface ConversationSummary {
  totalConversations: number;
  unreadConversations: number;
  unreadMessages: number;
}

export interface ConversationsPage {
  items: Conversation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface MessagesPage {
  items: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface MarkReadResult {
  conversationId: string;
  readerId: string;
  readAt: string | null;
  updatedCount: number;
}

export interface SendMessagePayload {
  conversationId: string;
  clientMessageId: string;
  content?: string;
  imageKeys?: string[];
}

export interface OutboxMessage {
  clientMessageId: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  imageUris: string[];
  imageKeys: string[];
  createdAt: string;
  status: Exclude<DeliveryState, 'sent'>;
  errorMessage?: string;
}

export interface DisplayMessage {
  key: string;
  id: string | null;
  clientMessageId: string;
  senderId: string;
  isMine: boolean;
  type: MessageType;
  content: string | null;
  imageUrls: string[];
  isRecalled: boolean;
  readAt: string | null;
  createdAt: string;
  deliveryState: DeliveryState;
  errorMessage?: string;
}

export interface SocketAck<T> {
  status: boolean;
  data: T | null;
  error: string | null;
  messages: string | string[];
}
