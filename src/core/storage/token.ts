import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'uninest_access_token',
  REFRESH_TOKEN: 'uninest_refresh_token',
  USER_PROFILE: 'uninest_user_profile',
  USER_ROLE: 'uninest_user_role',
  DEVICE_ID: 'uninest_device_id',
  ONBOARDING_COMPLETED: 'uninest_onboarding_completed',
} as const;

let memoryFallback: Record<string, string> = {};

const isSecureStoreAvailable = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

const secureGetItem = async (key: string): Promise<string | null> => {
  try {
    const isAvailable = await isSecureStoreAvailable();

    if (isAvailable) {
      return await SecureStore.getItemAsync(key);
    }

    return memoryFallback[key] ?? null;
  } catch {
    return memoryFallback[key] ?? null;
  }
};

const secureSetItem = async (key: string, value: string): Promise<void> => {
  try {
    const isAvailable = await isSecureStoreAvailable();

    if (isAvailable) {
      await SecureStore.setItemAsync(key, value);

      return;
    }

    memoryFallback[key] = value;
  } catch {
    memoryFallback[key] = value;
  }
};

const secureDeleteItem = async (key: string): Promise<void> => {
  try {
    const isAvailable = await isSecureStoreAvailable();

    if (isAvailable) {
      await SecureStore.deleteItemAsync(key);

      return;
    }

    delete memoryFallback[key];
  } catch {
    delete memoryFallback[key];
  }
};

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return secureGetItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async setAccessToken(token: string): Promise<void> {
    await secureSetItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return secureGetItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    await secureSetItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  async setTokens(tokens: StoredTokens): Promise<void> {
    await Promise.all([
      secureSetItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      secureSetItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
    ]);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      secureDeleteItem(STORAGE_KEYS.ACCESS_TOKEN),
      secureDeleteItem(STORAGE_KEYS.REFRESH_TOKEN),
      secureDeleteItem(STORAGE_KEYS.USER_PROFILE),
      secureDeleteItem(STORAGE_KEYS.USER_ROLE),
    ]);

    memoryFallback = {};
  },

  async getUser<T = unknown>(): Promise<T | null> {
    const raw = await secureGetItem(STORAGE_KEYS.USER_PROFILE);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async setUser<T = unknown>(user: T): Promise<void> {
    await secureSetItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
  },

  async getRole(): Promise<string | null> {
    return secureGetItem(STORAGE_KEYS.USER_ROLE);
  },

  async setRole(role: string): Promise<void> {
    await secureSetItem(STORAGE_KEYS.USER_ROLE, role);
  },

  async getDeviceId(): Promise<string | null> {
    return secureGetItem(STORAGE_KEYS.DEVICE_ID);
  },

  async setDeviceId(deviceId: string): Promise<void> {
    await secureSetItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  },

  async getOnboardingCompleted(): Promise<boolean> {
    const val = await secureGetItem(STORAGE_KEYS.ONBOARDING_COMPLETED);

    return val === 'true';
  },

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    await secureSetItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed ? 'true' : 'false');
  },
};
