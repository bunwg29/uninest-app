import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { ChatMessage, MessagesPage } from '../types';
import { CHAT_QUERY_KEYS } from '../types';

type MessagesData = InfiniteData<MessagesPage, string | undefined>;

const isSameMessage = (existing: ChatMessage, incoming: ChatMessage) =>
  existing.id === incoming.id ||
  (existing.senderId === incoming.senderId &&
    existing.clientMessageId === incoming.clientMessageId);

export const upsertMessageInCache = (queryClient: QueryClient, message: ChatMessage): void => {
  queryClient.setQueryData<MessagesData>(
    CHAT_QUERY_KEYS.messages(message.conversationId),
    (data) => {
      if (!data) {
        return data;
      }

      const hasMessage = data.pages.some((page) =>
        page.items.some((item) => isSameMessage(item, message))
      );

      if (hasMessage) {
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((item) => (isSameMessage(item, message) ? message : item)),
          })),
        };
      }

      const [firstPage, ...otherPages] = data.pages;

      return {
        ...data,
        pages: [{ ...firstPage, items: [message, ...firstPage.items] }, ...otherPages],
      };
    }
  );
};

export const markMessagesReadInCache = (
  queryClient: QueryClient,
  conversationId: string,
  readerId: string,
  readAt: string
): void => {
  queryClient.setQueryData<MessagesData>(CHAT_QUERY_KEYS.messages(conversationId), (data) => {
    if (!data) {
      return data;
    }

    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map((item) =>
          item.senderId !== readerId && !item.readAt ? { ...item, readAt } : item
        ),
      })),
    };
  });
};

export const invalidateChatLists = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.CONVERSATIONS });
  void queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.SUMMARY });
};
