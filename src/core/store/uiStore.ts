import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  message: string;
  title?: string;
  type?: ToastVariant;
  durationMs?: number;
}

interface UIState {
  isGlobalLoading: boolean;
  activeModal: string | null;
  toast: ToastConfig | null;
  setGlobalLoading: (isLoading: boolean) => void;
  setActiveModal: (modalId: string | null) => void;
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
  resetUI: () => void;
}

const INITIAL_UI_STATE = {
  isGlobalLoading: false,
  activeModal: null,
  toast: null,
};

export const useUIStore = create<UIState>((set) => ({
  ...INITIAL_UI_STATE,

  setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),

  setActiveModal: (activeModal) => set({ activeModal }),

  showToast: (config) => set({ toast: config }),

  hideToast: () => set({ toast: null }),

  resetUI: () => set(INITIAL_UI_STATE),
}));
