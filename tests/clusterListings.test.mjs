import assert from 'node:assert/strict';
import test from 'node:test';
import { clusterListings } from '../src/features/search/utils/clusterListings.ts';

const createListing = (id, latitude, longitude) => ({
  id,
  title: id,
  price: 2_000_000,
  location: { latitude, longitude },
});

const wideRegion = {
  latitude: 16.07,
  longitude: 108.15,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

test('gộp các phòng nằm cùng một ô lưới thành cụm', () => {
  const items = clusterListings(
    [createListing('a', 16.0701, 108.1501), createListing('b', 16.0702, 108.1502)],
    wideRegion,
    null
  );

  assert.equal(items.length, 1);
  assert.equal(items[0].type, 'cluster');
  assert.equal(items[0].count, 2);
});

test('giữ phòng đang chọn tách khỏi cụm', () => {
  const items = clusterListings(
    [createListing('a', 16.0701, 108.1501), createListing('b', 16.0702, 108.1502)],
    wideRegion,
    'a'
  );

  assert.equal(items.length, 2);
  assert.ok(items.every((item) => item.type === 'listing'));
});

test('không gộp khi đã phóng to và bỏ qua phòng thiếu toạ độ', () => {
  const items = clusterListings(
    [createListing('a', 16.0701, 108.1501), { id: 'b', title: 'b', price: 1 }],
    { ...wideRegion, latitudeDelta: 0.005, longitudeDelta: 0.005 },
    null
  );

  assert.equal(items.length, 1);
  assert.equal(items[0].type, 'listing');
});
