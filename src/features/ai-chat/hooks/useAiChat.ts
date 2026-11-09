import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@hooks';
import { aiChatService } from '../services/aiChatService';
import type { SendAiMessagePayload } from '../types';

export const AI_CONVERSATIONS_QUERY_KEY = ['ai-conversations'] as const;
export const AI_CONVERSATION_QUERY_KEY = ['ai-conversation'] as const;

export const useAiConversations = () =>
  useInfiniteQuery({
    queryKey: AI_CONVERSATIONS_QUERY_KEY,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => aiChatService.listConversations(pageParam),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });

export const useAiConversation = (conversationId: string | null) =>
  useQuery({
    queryKey: [...AI_CONVERSATION_QUERY_KEY, conversationId],
    queryFn: () => aiChatService.getConversation(conversationId ?? ''),
    enabled: Boolean(conversationId),
    staleTime: 0,
  });

export const useSendAiMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, signal }: { payload: SendAiMessagePayload; signal: AbortSignal }) =>
      aiChatService.sendMessage(payload, signal),
    onSuccess: (reply) => {
      if (reply.type === 'service_error') return;

      void queryClient.invalidateQueries({ queryKey: AI_CONVERSATIONS_QUERY_KEY });
    },
  });
};

export const useDeleteAiConversation = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (conversationId: string) => aiChatService.deleteConversation(conversationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: AI_CONVERSATIONS_QUERY_KEY });
      toast.success('Đã xoá cuộc trò chuyện');
    },
    onError: (error) => toast.error(error.message),
  });
};

export const useDeleteAllAiConversations = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: () => aiChatService.deleteAllConversations(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: AI_CONVERSATIONS_QUERY_KEY });
      toast.success('Đã xoá toàn bộ lịch sử trò chuyện');
    },
    onError: (error) => toast.error(error.message),
  });
};
