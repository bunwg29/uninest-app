import { create } from 'zustand';

interface UIState {
  isGlobalLoading: boolean;
  activeModal: string | null;
  setGlobalLoading: (isLoading: boolean) => void;
  setActiveModal: (modalId: string | null) => void;
  resetUI: () => void;
}

const INITIAL_UI_STATE = {
  isGlobalLoading: false,
  activeModal: null,
};

export const useUIStore = create<UIState>((set) => ({
  ...INITIAL_UI_STATE,

  setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),

  setActiveModal: (activeModal) => set({ activeModal }),

  resetUI: () => set(INITIAL_UI_STATE),
}));
