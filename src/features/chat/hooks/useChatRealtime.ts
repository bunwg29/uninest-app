import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import {
  chatSocket,
  flushOutbox,
  invalidateChatLists,
  markMessagesReadInCache,
  upsertMessageInCache,
} from '../services';
import { useChatStore } from '../store';
import type { ChatMessage, MarkReadResult } from '../types';
import { CHAT_QUERY_KEYS, CHAT_SOCKET_EVENTS } from '../types';

export const useChatRealtime = (userId: string | null): void => {
  const queryClient = useQueryClient();
  const hasHydrated = useChatStore((state) => state.hasHydrated);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    const socket = chatSocket.connect();
    const { setSocketConnected } = useChatStore.getState();

    const handleConnect = () => {
      setSocketConnected(true);
      void queryClient.invalidateQueries({ queryKey: [...CHAT_QUERY_KEYS.ALL, 'messages'] });
      invalidateChatLists(queryClient);
      void flushOutbox(queryClient, userId);
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    const handleMessageChanged = (message: ChatMessage) => {
      upsertMessageInCache(queryClient, message);
      invalidateChatLists(queryClient);
    };

    const handleMessagesRead = (result: MarkReadResult) => {
      if (result.readAt) {
        markMessagesReadInCache(queryClient, result.conversationId, result.readerId, result.readAt);
      }

      invalidateChatLists(queryClient);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(CHAT_SOCKET_EVENTS.NEW_MESSAGE, handleMessageChanged);
    socket.on(CHAT_SOCKET_EVENTS.MESSAGE_RECALLED, handleMessageChanged);
    socket.on(CHAT_SOCKET_EVENTS.MESSAGES_READ, handleMessagesRead);

    const unsubscribeNetwork = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        chatSocket.connect();
        void flushOutbox(queryClient, userId);
      }
    });

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      unsubscribeNetwork();
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(CHAT_SOCKET_EVENTS.NEW_MESSAGE, handleMessageChanged);
      socket.off(CHAT_SOCKET_EVENTS.MESSAGE_RECALLED, handleMessageChanged);
      socket.off(CHAT_SOCKET_EVENTS.MESSAGES_READ, handleMessagesRead);
      chatSocket.disconnect();
      setSocketConnected(false);
      queryClient.removeQueries({ queryKey: CHAT_QUERY_KEYS.ALL });
    };
  }, [userId, queryClient]);

  useEffect(() => {
    if (userId && hasHydrated) {
      void flushOutbox(queryClient, userId);
    }
  }, [userId, hasHydrated, queryClient]);
};
