import React from 'react';
import { act, cleanup, fireEvent, render, renderHook } from '@testing-library/react-native';
import { ComparisonTable } from '../src/features/comparison/components/ComparisonTable';
import {
  useAddComparison,
  useClearComparison,
  useComparison,
  useRemoveComparison,
} from '../src/features/comparison/hooks';
import { useComparisonStore } from '../src/features/comparison/store';
import { ComparisonEmptyState } from '../src/features/comparison/components/ComparisonEmptyState';
import {
  getAmenityRows,
  getBestIndexes,
  getDepositMonths,
  getInitials,
} from '../src/features/comparison/utils/comparisonMetrics';
import { AvailabilityBadge } from '../src/features/listings/components/AvailabilityBadge';

const mockApiClient = { get: jest.fn(), post: jest.fn(), delete: jest.fn() };
const mockToast = { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() };

jest.mock('../src/core', () => {
  class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }

  return {
    apiClient: {
      get: (...args) => mockApiClient.get(...args),
      post: (...args) => mockApiClient.post(...args),
      delete: (...args) => mockApiClient.delete(...args),
    },
    AppError,
    HTTP_STATUS_CODES: { CONFLICT: 409 },
    registerStoreResetter: () => () => undefined,
  };
});
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));
jest.mock('../src/features/search', () => ({
  formatFullPrice: (value) => `${value}đ`,
  formatListingDistance: (value) => `${value} m`,
  formatTravelEstimate: () => '5 phút',
  getPlaceholderGradient: () => ['#ccc', '#eee'],
}));
jest.mock('../src/hooks', () => ({ useToast: () => mockToast }));
jest.mock('../src/features/chat/hooks/useOpenListingChat', () => ({
  useOpenListingChat: () => ({ openChat: jest.fn(), isOpening: false }),
}));

const buildItem = (id, overrides = {}) => ({
  id,
  title: `Phòng ${id}`,
  price: 2_500_000,
  area: 20,
  maxOccupants: 2,
  deposit: null,
  amenities: [],
  images: [],
  landlord: { id: 'landlord-1', fullName: 'Chủ trọ', isVerified: true },
  availability: 'available',
  averageRating: null,
  ...overrides,
});

describe('So sánh phòng', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useComparisonStore.setState({ items: [] });
  });

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

describe('Danh sách so sánh lưu trên máy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useComparisonStore.setState({ items: [] });
  });

  afterEach(async () => {
    await cleanup();
  });

  it('thêm, bỏ và xoá hết phòng khỏi danh sách', async () => {
    const { result } = await renderHook(() => ({
      list: useComparison(),
      add: useAddComparison(),
      remove: useRemoveComparison(),
      clear: useClearComparison(),
    }));

    await act(async () => {
      await result.current.add.add(buildItem('a'));
      await result.current.add.add(buildItem('b'));
    });

    expect(result.current.list.count).toBe(2);

    await act(async () => {
      result.current.remove('a');
    });

    expect(result.current.list.items.map((item) => item.id)).toEqual(['b']);

    await act(async () => {
      result.current.clear();
    });

    expect(result.current.list.count).toBe(0);
  });

  it('không thêm trùng và giới hạn tối đa 4 phòng', async () => {
    const { result } = await renderHook(() => useAddComparison());
    const results = [];

    await act(async () => {
      for (const id of ['a', 'a', 'b', 'c', 'd', 'e']) {
        results.push(await result.current.add(buildItem(id)));
      }
    });

    expect(results).toEqual(['added', 'duplicate', 'added', 'added', 'added', 'limit-reached']);
    expect(useComparisonStore.getState().items).toHaveLength(4);
  });

  it('không gọi máy chủ khi thao tác với danh sách', async () => {
    const { result } = await renderHook(() => useAddComparison());

    await act(async () => {
      await result.current.add(buildItem('a'));
    });

    expect(mockApiClient.get).not.toHaveBeenCalled();
    expect(mockApiClient.post).not.toHaveBeenCalled();
    expect(mockApiClient.delete).not.toHaveBeenCalled();
  });

  it('bảng so sánh làm mờ phòng không còn trống, hiện thông báo và cho phép bỏ phòng', async () => {
    const onRemove = jest.fn();
    const screen = await render(
      <ComparisonTable
        items={[
          buildItem('a'),
          buildItem('b', {
            isAvailable: false,
            unavailableReason: 'Phòng đã được cho thuê',
            price: 1_000_000,
          }),
        ]}
        reference={{}}
        referenceLabel={null}
        onRemove={onRemove}
        onOpenDetail={jest.fn()}
      />
    );

    expect(screen.getAllByText('Phòng không còn trống')).toHaveLength(1);
    expect(screen.getByText('Phòng đã được cho thuê')).toBeTruthy();
    expect(screen.queryByText('RẺ HƠN')).toBeNull();

    await fireEvent.press(screen.getByLabelText('Bỏ Phòng b khỏi so sánh'));

    expect(onRemove).toHaveBeenCalledWith('b');
  });
});
