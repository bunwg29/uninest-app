import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSearchParams } from '../src/features/search/services/searchParams.ts';
import { DEFAULT_SEARCH_FILTERS } from '../src/features/search/types/index.ts';

const createFilters = (overrides = {}) => ({
  ...DEFAULT_SEARCH_FILTERS,
  roomTypes: [],
  amenities: [],
  ...overrides,
});

test('mặc định sắp xếp theo mức độ liên quan và không gửi bộ lọc rỗng', () => {
  assert.deepEqual(buildSearchParams(createFilters()), {
    sortBy: 'relevance',
    page: 1,
    limit: 10,
  });
});

test('gộp nhiều bộ lọc thành tham số truy vấn của API', () => {
  const params = buildSearchParams(
    createFilters({
      keyword: '  Hòa Khánh ',
      minPrice: 1500000,
      maxPrice: 3000000,
      roomTypes: ['phong_tro', 'studio'],
      amenities: [1, 6],
    })
  );

  assert.equal(params.keyword, 'Hòa Khánh');
  assert.equal(params.minPrice, 1500000);
  assert.equal(params.maxPrice, 3000000);
  assert.equal(params.roomTypes, 'phong_tro,studio');
  assert.equal(params.amenities, '1,6');
});

test('chỉ gửi bán kính khi có toạ độ tham chiếu', () => {
  assert.equal(buildSearchParams(createFilters({ radius: 3 })).radius, undefined);

  const params = buildSearchParams(
    createFilters({ latitude: 16.07, longitude: 108.15, radius: 3, sortBy: 'nearest' })
  );

  assert.equal(params.latitude, 16.07);
  assert.equal(params.longitude, 108.15);
  assert.equal(params.radius, 3);
  assert.equal(params.sortBy, 'nearest');
});

test('không giới hạn bán kính thì dùng bán kính tối đa của API', () => {
  const params = buildSearchParams(
    createFilters({ latitude: 16.07, longitude: 108.15, radius: undefined })
  );

  assert.equal(params.radius, 50);
});
