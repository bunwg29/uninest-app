import { useCallback, useEffect, useMemo } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import {
  chatService,
  chatSocket,
  discardOutboxMessage,
  invalidateChatLists,
  markMessagesReadInCache,
  retryOutboxMessage,
} from '../services';
import { useChatStore } from '../store';
import type { ChatMessage, DisplayMessage, OutboxMessage } from '../types';
import { CHAT_SOCKET_EVENTS } from '../types';
import { useMessages } from './useChatQueries';
import { useSendMessage } from './useSendMessage';

const toSentDisplayMessage = (message: ChatMessage, userId: string): DisplayMessage => ({
  key: message.id,
  id: message.id,
  clientMessageId: message.clientMessageId,
  senderId: message.senderId,
  isMine: message.senderId === userId,
  type: message.type,
  content: message.content,
  imageUrls: message.imageUrls,
  isRecalled: message.isRecalled,
  readAt: message.readAt,
  createdAt: message.createdAt,
  deliveryState: 'sent',
});

const toPendingDisplayMessage = (item: OutboxMessage): DisplayMessage => ({
  key: `pending-${item.clientMessageId}`,
  id: null,
  clientMessageId: item.clientMessageId,
  senderId: item.senderId,
  isMine: true,
  type: item.imageUris.length > 0 ? 'image' : 'text',
  content: item.content,
  imageUrls: item.imageUris,
  isRecalled: false,
  readAt: null,
  createdAt: item.createdAt,
  deliveryState: item.status,
  errorMessage: item.errorMessage,
});

export const useChatRoom = (conversationId: string, userId: string) => {
  const queryClient = useQueryClient();
  const isFocused = useIsFocused();
  const messagesQuery = useMessages(conversationId);
  const outbox = useChatStore((state) => state.outbox);

  const serverMessages = useMemo(
    () => messagesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [messagesQuery.data]
  );

  const pendingItems = useMemo(
    () =>
      outbox
        .filter((item) => item.conversationId === conversationId && item.senderId === userId)
        .sort((first, second) => second.createdAt.localeCompare(first.createdAt)),
    [outbox, conversationId, userId]
  );

  const messages = useMemo<DisplayMessage[]>(() => {
    const deliveredIds = new Set(
      serverMessages
        .filter((message) => message.senderId === userId)
        .map((message) => message.clientMessageId)
    );

    const pending = pendingItems
      .filter((item) => !deliveredIds.has(item.clientMessageId))
      .map(toPendingDisplayMessage);

    return [...pending, ...serverMessages.map((message) => toSentDisplayMessage(message, userId))];
  }, [serverMessages, pendingItems, userId]);

  const waitingCount = useMemo(
    () => pendingItems.filter((item) => item.status !== 'failed').length,
    [pendingItems]
  );

  const latestUnreadIncomingId = useMemo(
    () =>
      serverMessages.find(
        (message) => message.senderId !== userId && !message.readAt && !message.isRecalled
      )?.id,
    [serverMessages, userId]
  );

  useEffect(() => {
    if (!latestUnreadIncomingId || !isFocused) {
      return;
    }

    markMessagesReadInCache(queryClient, conversationId, userId, new Date().toISOString());

    const markRead = chatSocket.isConnected()
      ? chatSocket.emitWithAck(CHAT_SOCKET_EVENTS.MARK_READ, { conversationId })
      : chatService.markRead(conversationId);

    void markRead.then(() => invalidateChatLists(queryClient)).catch(() => undefined);
  }, [latestUnreadIncomingId, isFocused, conversationId, userId, queryClient]);

  const sendMessage = useSendMessage(conversationId, userId);

  const retryMessage = useCallback(
    (clientMessageId: string) => {
      void retryOutboxMessage(queryClient, userId, clientMessageId);
    },
    [queryClient, userId]
  );

  return {
    messages,
    waitingCount,
    isLoading: messagesQuery.isLoading,
    isError: messagesQuery.isError,
    isFetchingNextPage: messagesQuery.isFetchingNextPage,
    hasNextPage: messagesQuery.hasNextPage,
    fetchNextPage: messagesQuery.fetchNextPage,
    refetch: messagesQuery.refetch,
    sendMessage,
    retryMessage,
    discardMessage: discardOutboxMessage,
  };
};
