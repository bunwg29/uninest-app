export * from './uiStore';
export * from './maintenanceStore';

export type StoreResetter = () => void;

const storeResetters = new Set<StoreResetter>();

export const registerStoreResetter = (resetter: StoreResetter): (() => void) => {
  storeResetters.add(resetter);

  return () => {
    storeResetters.delete(resetter);
  };
};

export const resetAllStores = (): void => {
  storeResetters.forEach((resetter) => {
    try {
      resetter();
    } catch {}
  });
};
