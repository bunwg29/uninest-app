import { apiClient, unwrapApiData } from '@core';
import {
  AI_CONVERSATIONS_PAGE_SIZE,
  type AiChatReply,
  type AiConversationDetail,
  type AiConversationPage,
  type SendAiMessagePayload,
} from '../types';

export const aiChatService = {
  async sendMessage(payload: SendAiMessagePayload, signal?: AbortSignal): Promise<AiChatReply> {
    const response = await apiClient.post('/ai/chat', payload, { signal });

    return unwrapApiData<AiChatReply>(response.data);
  },

  async listConversations(page: number): Promise<AiConversationPage> {
    const response = await apiClient.get('/ai/conversations', {
      params: { page, limit: AI_CONVERSATIONS_PAGE_SIZE },
    });

    return unwrapApiData<AiConversationPage>(response.data);
  },

  async getConversation(id: string): Promise<AiConversationDetail> {
    const response = await apiClient.get(`/ai/conversations/${id}`);

    return unwrapApiData<AiConversationDetail>(response.data);
  },

  async deleteConversation(id: string): Promise<void> {
    await apiClient.delete(`/ai/conversations/${id}`);
  },

  async deleteAllConversations(): Promise<void> {
    await apiClient.delete('/ai/conversations');
  },
};
