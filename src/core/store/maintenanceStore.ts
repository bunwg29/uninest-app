import { create } from 'zustand';

export interface MaintenanceInfo {
  statusCode: number;
  detectedAt: number;
  expectedEndAt: number | null;
}

interface MaintenanceState {
  info: MaintenanceInfo | null;
  snoozedUntil: number;
  report: (info: MaintenanceInfo) => void;
  clear: () => void;
  snooze: (durationMs: number) => void;
}

export const useMaintenanceStore = create<MaintenanceState>((set, get) => ({
  info: null,
  snoozedUntil: 0,

  report: (info) => {
    if (Date.now() < get().snoozedUntil) return;

    const current = get().info;

    set({
      info: current
        ? {
            ...info,
            detectedAt: current.detectedAt,
            expectedEndAt: info.expectedEndAt ?? current.expectedEndAt,
          }
        : info,
    });
  },

  clear: () => set({ info: null, snoozedUntil: 0 }),

  snooze: (durationMs) => set({ info: null, snoozedUntil: Date.now() + durationMs }),
}));
