import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Device from 'expo-device';

export type PushPermissionState = 'granted' | 'denied' | 'unsupported' | 'checking';

export const usePushPermission = () => {
  const [state, setState] = useState<PushPermissionState>('checking');

  const check = useCallback(async () => {
    if (Platform.OS === 'web' || !Device.isDevice) {
      setState('unsupported');

      return;
    }

    try {
      const Notifications = require('expo-notifications') as typeof import('expo-notifications');
      const permission = await Notifications.getPermissionsAsync();

      setState(permission.granted ? 'granted' : 'denied');
    } catch {
      setState('unsupported');
    }
  }, []);

  useEffect(() => {
    void check();

    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') void check();
    });

    return () => subscription.remove();
  }, [check]);

  return state;
};
