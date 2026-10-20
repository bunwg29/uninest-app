import { registerStoreResetter } from '@core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { OutboxMessage } from '../types';
import { CHAT_STORAGE_KEY } from '../types';

interface ChatState {
  outbox: OutboxMessage[];
  drafts: Record<string, string>;
  isSocketConnected: boolean;
  hasHydrated: boolean;
  enqueue: (message: OutboxMessage) => void;
  updateOutbox: (clientMessageId: string, patch: Partial<OutboxMessage>) => void;
  removeFromOutbox: (clientMessageId: string) => void;
  setDraft: (conversationId: string, text: string) => void;
  setSocketConnected: (isConnected: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      outbox: [],
      drafts: {},
      isSocketConnected: false,
      hasHydrated: false,

      enqueue(message) {
        set((state) => ({ outbox: [...state.outbox, message] }));
      },

      updateOutbox(clientMessageId, patch) {
        set((state) => ({
          outbox: state.outbox.map((item) =>
            item.clientMessageId === clientMessageId ? { ...item, ...patch } : item
          ),
        }));
      },

      removeFromOutbox(clientMessageId) {
        set((state) => ({
          outbox: state.outbox.filter((item) => item.clientMessageId !== clientMessageId),
        }));
      },

      setDraft(conversationId, text) {
        set((state) => {
          const drafts = { ...state.drafts };

          if (text) {
            drafts[conversationId] = text;
          } else {
            delete drafts[conversationId];
          }

          return { drafts };
        });
      },

      setSocketConnected(isConnected) {
        set({ isSocketConnected: isConnected });
      },
    }),
    {
      name: CHAT_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ outbox: state.outbox, drafts: state.drafts }),
      onRehydrateStorage: () => () => {
        useChatStore.setState({ hasHydrated: true });
      },
    }
  )
);

registerStoreResetter(() => useChatStore.setState({ outbox: [], drafts: {} }));
