import { apiClient, AppError } from '@core';
import { listingService } from '@features/listings/services';
import type {
  ChatMessage,
  Conversation,
  ConversationFilter,
  ConversationsPage,
  ConversationSummary,
  MarkReadResult,
  MessagesPage,
  SendMessagePayload,
} from '../types';
import { CHAT_LIMITS } from '../types';

const unwrapData = <T>(payload: unknown): T => {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    (payload as { status?: boolean }).status !== undefined
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

export const isOfflineError = (error: unknown): boolean =>
  error instanceof AppError && error.data === undefined;

const resolveImageContentType = (uri: string): string => {
  const extension = uri.split('?')[0].split('.').pop()?.toLowerCase();

  if (extension === 'png') return 'image/png';

  return 'image/jpeg';
};

export const chatService = {
  async startConversation(listingId: string): Promise<Conversation> {
    const response = await apiClient.post('/conversations', { listingId });

    return unwrapData<Conversation>(response.data);
  },

  async getConversations(
    filter: ConversationFilter,
    page: number,
    keyword: string
  ): Promise<ConversationsPage> {
    const response = await apiClient.get('/conversations', {
      params: {
        filter,
        page,
        limit: CHAT_LIMITS.CONVERSATION_PAGE_SIZE,
        keyword: keyword || undefined,
      },
    });

    return unwrapData<ConversationsPage>(response.data);
  },

  async getSummary(): Promise<ConversationSummary> {
    const response = await apiClient.get('/conversations/summary');

    return unwrapData<ConversationSummary>(response.data);
  },

  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await apiClient.get(`/conversations/${conversationId}`);

    return unwrapData<Conversation>(response.data);
  },

  async getMessages(conversationId: string, cursor?: string): Promise<MessagesPage> {
    const response = await apiClient.get(`/conversations/${conversationId}/messages`, {
      params: { cursor, limit: CHAT_LIMITS.MESSAGE_PAGE_SIZE },
    });

    return unwrapData<MessagesPage>(response.data);
  },

  async sendMessage(payload: SendMessagePayload): Promise<ChatMessage> {
    const { conversationId, ...body } = payload;
    const response = await apiClient.post(`/conversations/${conversationId}/messages`, body);

    return unwrapData<ChatMessage>(response.data);
  },

  async markRead(conversationId: string): Promise<MarkReadResult> {
    const response = await apiClient.patch(`/conversations/${conversationId}/read`);

    return unwrapData<MarkReadResult>(response.data);
  },

  async recallMessage(conversationId: string, messageId: string): Promise<ChatMessage> {
    const response = await apiClient.delete(
      `/conversations/${conversationId}/messages/${messageId}`
    );

    return unwrapData<ChatMessage>(response.data);
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`/conversations/${conversationId}`);
  },

  async uploadImage(uri: string): Promise<string> {
    const contentType = resolveImageContentType(uri);
    const fileName = `chat.${contentType.split('/')[1] ?? 'jpg'}`;

    const { uploadUrl, key } = await listingService.getPresignedUploadUrl({
      fileName,
      contentType,
      folder: 'chat',
    });

    await listingService.uploadImageToR2(uploadUrl, uri, contentType);

    return key;
  },
};
