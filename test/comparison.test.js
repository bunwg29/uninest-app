import React from 'react';
import { cleanup, render } from '@testing-library/react-native';
import { ComparisonEmptyState } from '../src/features/comparison/components/ComparisonEmptyState';
import {
  getAmenityRows,
  getBestIndexes,
  getDepositMonths,
  getInitials,
} from '../src/features/comparison/utils/comparisonMetrics';
import { AvailabilityBadge } from '../src/features/listings/components/AvailabilityBadge';

describe('So sánh phòng', () => {
  afterEach(async () => {
    await cleanup();
  });

  it('đánh dấu giá trị tốt nhất và bỏ qua khi các giá trị bằng nhau', () => {
    expect([...getBestIndexes([2_500_000, 3_800_000], 'min')]).toEqual([0]);
    expect([...getBestIndexes([22, 30, undefined], 'max')]).toEqual([1]);
    expect(getBestIndexes([20, 20], 'max').size).toBe(0);
    expect(getBestIndexes([20], 'max').size).toBe(0);
  });

  it('gộp tiện ích theo mức phổ biến rồi theo mã', () => {
    const items = [
      {
        amenities: [
          { id: 6, name: 'Wifi' },
          { id: 1, name: 'Máy lạnh' },
        ],
      },
      {
        amenities: [
          { id: 6, name: 'Wifi' },
          { id: 7, name: 'Chỗ để xe' },
        ],
      },
    ];

    expect(getAmenityRows(items).map((row) => row.name)).toEqual(['Wifi', 'Máy lạnh', 'Chỗ để xe']);
  });

  it('tính số tháng cọc và chữ cái đầu của tên', () => {
    expect(getDepositMonths(5_000_000, 2_500_000)).toBe(2);
    expect(getDepositMonths(3_000_000, 2_500_000)).toBeNull();
    expect(getInitials('Cô Lệ Hà')).toBe('LH');
  });

  it('hiển thị trạng thái rỗng với tiêu chí đối chiếu', async () => {
    const screen = await render(<ComparisonEmptyState />);

    expect(screen.getByText('Chưa có phòng nào để so sánh')).toBeTruthy();
    expect(screen.getByText('Đánh giá và chủ trọ')).toBeTruthy();
  });

  it('hiển thị nhãn trạng thái phòng', async () => {
    const screen = await render(<AvailabilityBadge availability="holding" />);

    expect(screen.getByText('ĐANG GIỮ CHỖ')).toBeTruthy();
  });
});
