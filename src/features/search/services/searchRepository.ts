import type { SearchListingsPage, SearchRepository } from '../types';
import { MOCK_SEARCH_LISTINGS } from './mockSearchData';
import { searchMockListings } from './searchEngine';

const MOCK_DELAY_MS = 350;

const waitForMockResponse = (signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(resolve, MOCK_DELAY_MS);

    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timeoutId);
        reject(new Error('Yêu cầu tìm kiếm đã được thay thế.'));
      },
      { once: true }
    );
  });

export const mockSearchRepository: SearchRepository = {
  async search(filters, signal): Promise<SearchListingsPage> {
    await waitForMockResponse(signal);

    if (filters.keyword.trim() === '__error__') {
      throw new Error('Không thể tải dữ liệu tìm kiếm mô phỏng.');
    }

    // TODO(TSK-S2-01): Replace client-side mock filtering with server-side PostGIS search.
    return searchMockListings(MOCK_SEARCH_LISTINGS, filters);
  },
};

export const searchRepository: SearchRepository = mockSearchRepository;
