import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { chatService, invalidateChatLists, upsertMessageInCache } from '../services';
import type { ConversationFilter, ConversationsPage, MessagesPage } from '../types';
import { CHAT_QUERY_KEYS } from '../types';

const SUMMARY_STALE_TIME_MS = 30 * 1000;

export const useConversations = (filter: ConversationFilter, keyword: string) =>
  useInfiniteQuery<
    ConversationsPage,
    Error,
    InfiniteData<ConversationsPage, number>,
    ReturnType<typeof CHAT_QUERY_KEYS.conversationList>,
    number
  >({
    queryKey: CHAT_QUERY_KEYS.conversationList(filter, keyword),
    queryFn: ({ pageParam }) => chatService.getConversations(filter, pageParam, keyword),
    placeholderData: keepPreviousData,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 0,
  });

export const useChatSummary = (isEnabled = true) =>
  useQuery({
    queryKey: CHAT_QUERY_KEYS.SUMMARY,
    queryFn: () => chatService.getSummary(),
    enabled: isEnabled,
    staleTime: SUMMARY_STALE_TIME_MS,
  });

export const useConversation = (conversationId: string) =>
  useQuery({
    queryKey: CHAT_QUERY_KEYS.conversation(conversationId),
    queryFn: () => chatService.getConversation(conversationId),
    staleTime: SUMMARY_STALE_TIME_MS,
    refetchInterval: 60 * 1000,
  });

export const useMessages = (conversationId: string) =>
  useInfiniteQuery<
    MessagesPage,
    Error,
    InfiniteData<MessagesPage, string | undefined>,
    ReturnType<typeof CHAT_QUERY_KEYS.messages>,
    string | undefined
  >({
    queryKey: CHAT_QUERY_KEYS.messages(conversationId),
    queryFn: ({ pageParam }) => chatService.getMessages(conversationId, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 0,
  });

export const useRecallMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => chatService.recallMessage(conversationId, messageId),
    onSuccess: (message) => {
      upsertMessageInCache(queryClient, message);
      invalidateChatLists(queryClient);
    },
  });
};

export const useStartConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => chatService.startConversation(listingId),
    onSuccess: (conversation) => {
      queryClient.setQueryData(CHAT_QUERY_KEYS.conversation(conversation.id), conversation);
    },
  });
};

export const useEditMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      chatService.editMessage(conversationId, messageId, content),
    onSuccess: (message) => {
      upsertMessageInCache(queryClient, message);
      invalidateChatLists(queryClient);
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => chatService.deleteConversation(conversationId),
    onSuccess: (_result, conversationId) => {
      queryClient.removeQueries({ queryKey: CHAT_QUERY_KEYS.messages(conversationId) });
      queryClient.removeQueries({ queryKey: CHAT_QUERY_KEYS.conversation(conversationId) });
      invalidateChatLists(queryClient);
    },
  });
};
