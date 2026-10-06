import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'uninest.search.recent';
const MAX_RECENT_SEARCHES = 8;

const persist = async (terms: string[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(terms));
  } catch {
    // Lịch sử tìm kiếm chỉ là tiện ích, lỗi lưu không được làm gián đoạn việc tìm phòng.
  }
};

export const useRecentSearches = () => {
  const [terms, setTerms] = useState<string[]>([]);

  useEffect(() => {
    let isActive = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!isActive || !stored) return;

        const parsed: unknown = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setTerms(parsed.filter((item): item is string => typeof item === 'string'));
        }
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, []);

  const addTerm = useCallback((term: string) => {
    const normalized = term.trim();

    if (!normalized) return;

    setTerms((current) => {
      const next = [
        normalized,
        ...current.filter((item) => item.toLowerCase() !== normalized.toLowerCase()),
      ].slice(0, MAX_RECENT_SEARCHES);

      void persist(next);

      return next;
    });
  }, []);

  const removeTerm = useCallback((term: string) => {
    setTerms((current) => {
      const next = current.filter((item) => item !== term);

      void persist(next);

      return next;
    });
  }, []);

  const clearTerms = useCallback(() => {
    setTerms([]);
    void persist([]);
  }, []);

  return { terms, addTerm, removeTerm, clearTerms };
};
