import { useCallback, useMemo } from 'react';
import { useUIStore, ToastConfig } from '@core';

export const useToast = () => {
  const showToast = useUIStore((state) => state.showToast);
  const hideToast = useUIStore((state) => state.hideToast);

  const show = useCallback(
    (config: ToastConfig) => {
      showToast(config);
    },
    [showToast]
  );

  const hide = useCallback(() => {
    hideToast();
  }, [hideToast]);

  const success = useCallback(
    (message: string, title?: string) => {
      showToast({ type: 'success', message, title });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      showToast({ type: 'error', message, title });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      showToast({ type: 'warning', message, title });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      showToast({ type: 'info', message, title });
    },
    [showToast]
  );

  return useMemo(
    () => ({
      show,
      hide,
      success,
      error,
      warning,
      info,
    }),
    [show, hide, success, error, warning, info]
  );
};
