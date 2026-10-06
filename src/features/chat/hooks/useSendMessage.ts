import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { enqueueOutboxMessage, flushOutbox } from '../services';

export const useSendMessage = (conversationId: string, userId: string) => {
  const queryClient = useQueryClient();

  return useCallback(
    (content: string, imageUris: string[] = []) => {
      const trimmed = content.trim();

      if (!trimmed && imageUris.length === 0) {
        return;
      }

      enqueueOutboxMessage({
        conversationId,
        senderId: userId,
        content: trimmed || null,
        imageUris,
      });

      void flushOutbox(queryClient, userId);
    },
    [conversationId, userId, queryClient]
  );
};
