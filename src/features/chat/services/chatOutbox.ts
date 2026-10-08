import type { QueryClient } from '@tanstack/react-query';
import { generateClientMessageId } from './chatIdentifiers';
import { chatService, isOfflineError } from './chatService';
import { chatSocket } from './chatSocket';
import { invalidateChatLists, upsertMessageInCache } from './chatCache';
import { useChatStore } from '../store';
import type { ChatMessage, OutboxMessage, SendMessagePayload, SocketAck } from '../types';
import { CHAT_SOCKET_EVENTS } from '../types';

type DeliveryResult = 'delivered' | 'offline' | 'failed';

class ChatDeliveryError extends Error {}

const NETWORK_FAILURE_PATTERN = /network|internet|offline|timed out|timeout|SOCKET_/i;

const isNetworkFailure = (error: unknown): boolean =>
  isOfflineError(error) ||
  error instanceof TypeError ||
  (error instanceof Error &&
    !(error instanceof ChatDeliveryError) &&
    NETWORK_FAILURE_PATTERN.test(error.message));

const getErrorMessage = (error: unknown): string =>
  error instanceof Error && error.message
    ? error.message
    : 'Không thể gửi tin nhắn. Vui lòng thử lại.';

let isFlushing = false;
let isFlushRequested = false;

const sendPayload = async (payload: SendMessagePayload): Promise<ChatMessage> => {
  if (!chatSocket.isConnected()) {
    return chatService.sendMessage(payload);
  }

  const ack: SocketAck<ChatMessage> = await chatSocket.emitWithAck<ChatMessage>(
    CHAT_SOCKET_EVENTS.SEND_MESSAGE,
    payload
  );

  if (!ack.status || !ack.data) {
    const messages = Array.isArray(ack.messages) ? ack.messages.join(', ') : ack.messages;

    throw new ChatDeliveryError(messages);
  }

  return ack.data;
};

const uploadPendingImages = async (item: OutboxMessage): Promise<string[]> => {
  const { updateOutbox } = useChatStore.getState();
  const imageKeys = [...item.imageKeys];
  const pendingUris = item.imageUris.slice(imageKeys.length);
  const results = await Promise.allSettled(pendingUris.map((uri) => chatService.uploadImage(uri)));
  let firstFailure: unknown;

  for (const result of results) {
    if (result.status === 'rejected') {
      firstFailure ??= result.reason;

      break;
    }

    imageKeys.push(result.value);
  }

  if (imageKeys.length > item.imageKeys.length) {
    updateOutbox(item.clientMessageId, { imageKeys: [...imageKeys] });
  }

  if (firstFailure !== undefined) throw firstFailure;

  return imageKeys;
};

const deliver = async (queryClient: QueryClient, item: OutboxMessage): Promise<DeliveryResult> => {
  const { updateOutbox, removeFromOutbox } = useChatStore.getState();

  updateOutbox(item.clientMessageId, { status: 'sending', errorMessage: undefined });

  try {
    const imageKeys = await uploadPendingImages(item);

    const message = await sendPayload({
      conversationId: item.conversationId,
      clientMessageId: item.clientMessageId,
      content: item.content ?? undefined,
      imageKeys: imageKeys.length > 0 ? imageKeys : undefined,
    });

    removeFromOutbox(item.clientMessageId);
    upsertMessageInCache(queryClient, message);
    invalidateChatLists(queryClient);

    return 'delivered';
  } catch (error) {
    if (isNetworkFailure(error)) {
      updateOutbox(item.clientMessageId, { status: 'queued' });

      return 'offline';
    }

    updateOutbox(item.clientMessageId, { status: 'failed', errorMessage: getErrorMessage(error) });

    return 'failed';
  }
};

export const enqueueOutboxMessage = (params: {
  conversationId: string;
  senderId: string;
  content: string | null;
  imageUris?: string[];
}): OutboxMessage => {
  const message: OutboxMessage = {
    clientMessageId: generateClientMessageId(),
    conversationId: params.conversationId,
    senderId: params.senderId,
    content: params.content,
    imageUris: params.imageUris ?? [],
    imageKeys: [],
    createdAt: new Date().toISOString(),
    status: 'queued',
  };

  useChatStore.getState().enqueue(message);

  return message;
};

const drainOutbox = async (queryClient: QueryClient, userId: string): Promise<void> => {
  const processedIds = new Set<string>();

  for (;;) {
    const nextItem = useChatStore
      .getState()
      .outbox.filter(
        (item) =>
          item.senderId === userId &&
          item.status !== 'failed' &&
          !processedIds.has(item.clientMessageId)
      )
      .sort((first, second) => first.createdAt.localeCompare(second.createdAt))[0];

    if (!nextItem) {
      return;
    }

    processedIds.add(nextItem.clientMessageId);

    if ((await deliver(queryClient, nextItem)) === 'offline') {
      return;
    }
  }
};

export const flushOutbox = async (queryClient: QueryClient, userId: string): Promise<void> => {
  if (isFlushing) {
    isFlushRequested = true;

    return;
  }

  isFlushing = true;

  try {
    do {
      isFlushRequested = false;
      await drainOutbox(queryClient, userId);
    } while (isFlushRequested);
  } finally {
    isFlushing = false;
  }
};

export const discardOutboxMessage = (clientMessageId: string): void => {
  useChatStore.getState().removeFromOutbox(clientMessageId);
};

export const retryOutboxMessage = (
  queryClient: QueryClient,
  userId: string,
  clientMessageId: string
): Promise<void> => {
  useChatStore
    .getState()
    .updateOutbox(clientMessageId, { status: 'queued', errorMessage: undefined });

  return flushOutbox(queryClient, userId);
};
