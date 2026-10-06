import assert from 'node:assert/strict';
import test from 'node:test';
import { MOCK_SEARCH_LISTINGS } from '../src/features/search/services/mockSearchData.ts';
import { searchMockListings } from '../src/features/search/services/searchEngine.ts';
import { DEFAULT_SEARCH_FILTERS } from '../src/features/search/types/index.ts';

const createFilters = (overrides = {}) => ({
  ...DEFAULT_SEARCH_FILTERS,
  roomTypes: [],
  amenities: [],
  ...overrides,
});

test('chỉ trả về tin active', () => {
  const result = searchMockListings(MOCK_SEARCH_LISTINGS, createFilters({ limit: 50 }));

  assert.equal(result.items.length, 16);
  assert.ok(result.items.every((listing) => listing.status === 'active'));
});

test('tìm từ khóa không phân biệt dấu và hoa thường', () => {
  const result = searchMockListings(
    MOCK_SEARCH_LISTINGS,
    createFilters({ keyword: 'BACH KHOA', limit: 50 })
  );

  assert.ok(result.items.length > 0);
  assert.ok(result.items.every((listing) => /bách khoa/i.test(listing.title)));
});

test('lọc đúng khoảng giá', () => {
  const result = searchMockListings(
    MOCK_SEARCH_LISTINGS,
    createFilters({ minPrice: 2000000, maxPrice: 3000000, limit: 50 })
  );

  assert.ok(result.items.length > 0);
  assert.ok(result.items.every((listing) => listing.price >= 2000000 && listing.price <= 3000000));
});

test('lọc đúng khoảng diện tích', () => {
  const result = searchMockListings(
    MOCK_SEARCH_LISTINGS,
    createFilters({ minArea: 20, maxArea: 30, limit: 50 })
  );

  assert.ok(result.items.length > 0);
  assert.ok(result.items.every((listing) => listing.area >= 20 && listing.area <= 30));
});

test('lọc tiện ích theo điều kiện AND', () => {
  const result = searchMockListings(
    MOCK_SEARCH_LISTINGS,
    createFilters({ amenities: [6, 7, 14], limit: 50 })
  );

  assert.ok(result.items.length > 0);
  assert.ok(
    result.items.every((listing) => [6, 7, 14].every((id) => listing.amenityIds.includes(id)))
  );
});

test('sắp xếp giá tăng dần', () => {
  const result = searchMockListings(
    MOCK_SEARCH_LISTINGS,
    createFilters({ sortBy: 'price_asc', limit: 50 })
  );
  const prices = result.items.map((listing) => listing.price);

  assert.deepEqual(
    prices,
    [...prices].sort((first, second) => first - second)
  );
});

test('phân trang nối tiếp không trùng ID', () => {
  const firstPage = searchMockListings(MOCK_SEARCH_LISTINGS, createFilters({ page: 1, limit: 10 }));
  const secondPage = searchMockListings(
    MOCK_SEARCH_LISTINGS,
    createFilters({ page: 2, limit: 10 })
  );
  const ids = [...firstPage.items, ...secondPage.items].map((listing) => listing.id);

  assert.equal(firstPage.items.length, 10);
  assert.equal(secondPage.items.length, 6);
  assert.equal(new Set(ids).size, ids.length);
});

test('lọc bán kính sau khi có vị trí', () => {
  const result = searchMockListings(
    MOCK_SEARCH_LISTINGS,
    createFilters({ latitude: 16.073, longitude: 108.149, radius: 2, limit: 50 })
  );

  assert.ok(result.items.length > 0);
  assert.ok(result.items.every((listing) => (listing.distanceMeters ?? Infinity) <= 2000));
});

test('không lọc bán kính khi người dùng bỏ chọn', () => {
  const result = searchMockListings(
    MOCK_SEARCH_LISTINGS,
    createFilters({ latitude: 16.073, longitude: 108.149, radius: undefined, limit: 50 })
  );

  assert.equal(result.items.length, 16);
});
