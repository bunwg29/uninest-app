import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { enqueueOutboxMessage, flushOutbox } from '../services';

export const useSendMessage = (conversationId: string, userId: string, listingId?: string) => {
  const queryClient = useQueryClient();

  return useCallback(
    (content: string, imageUris: string[] = []) => {
      const trimmed = content.trim();

      if (!trimmed && imageUris.length === 0) {
        return;
      }

      enqueueOutboxMessage({
        conversationId,
        listingId,
        senderId: userId,
        content: trimmed || null,
        imageUris,
      });

      void flushOutbox(queryClient, userId);
    },
    [conversationId, listingId, userId, queryClient]
  );
};
