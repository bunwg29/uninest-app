import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'uninest_access_token';
const REFRESH_TOKEN_KEY = 'uninest_refresh_token';

// In-memory fallback for environments where SecureStore is unavailable
const memoryStorage = new Map<string, string>();

async function getStorageItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return memoryStorage.get(key) ?? null;
    }

    const available = await SecureStore.isAvailableAsync();
    if (!available) {
      return memoryStorage.get(key) ?? null;
    }

    return await SecureStore.getItemAsync(key);
  } catch {
    return memoryStorage.get(key) ?? null;
  }
}

async function setStorageItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
      memoryStorage.set(key, value);
      return;
    }

    const available = await SecureStore.isAvailableAsync();
    if (!available) {
      memoryStorage.set(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  } catch {
    memoryStorage.set(key, value);
  }
}

async function deleteStorageItem(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
      memoryStorage.delete(key);
      return;
    }

    const available = await SecureStore.isAvailableAsync();
    if (!available) {
      memoryStorage.delete(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  } catch {
    memoryStorage.delete(key);
  }
}

export const tokenStorage = {
  getAccessToken: (): Promise<string | null> => getStorageItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string): Promise<void> => setStorageItem(ACCESS_TOKEN_KEY, token),
  removeAccessToken: (): Promise<void> => deleteStorageItem(ACCESS_TOKEN_KEY),

  getRefreshToken: (): Promise<string | null> => getStorageItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string): Promise<void> => setStorageItem(REFRESH_TOKEN_KEY, token),
  removeRefreshToken: (): Promise<void> => deleteStorageItem(REFRESH_TOKEN_KEY),

  clearAllTokens: async (): Promise<void> => {
    await deleteStorageItem(ACCESS_TOKEN_KEY);
    await deleteStorageItem(REFRESH_TOKEN_KEY);
  },
};
