import React from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  waitFor,
} from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ComparisonTable } from '../src/features/comparison/components/ComparisonTable';
import {
  COMPARISON_QUERY_KEY,
  useAddComparison,
  useClearComparison,
  useComparison,
  useComparisonSync,
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
let mockAuth = { isAuthenticated: true, role: 'student' };

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
  };
});
jest.mock('../src/features/search', () => ({
  formatFullPrice: (value) => `${value}đ`,
  formatListingDistance: (value) => `${value} m`,
  formatTravelEstimate: () => '5 phút',
  getPlaceholderGradient: () => ['#ccc', '#eee'],
}));
jest.mock('../src/hooks', () => ({ useToast: () => mockToast }));
jest.mock('../src/features/auth', () => ({ useAuth: () => mockAuth }));
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

const serverList = (items) => ({
  status: true,
  data: { items, count: items.length, maxItems: 4 },
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, Wrapper };
};

const conflictError = (message) => {
  const { AppError } = require('../src/core');

  return new AppError(message, 409);
};

describe('So sánh phòng', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth = { isAuthenticated: true, role: 'student' };
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

describe('Danh sách so sánh đồng bộ với máy chủ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth = { isAuthenticated: true, role: 'student' };
    useComparisonStore.setState({ items: [] });
  });

  afterEach(async () => {
    await cleanup();
  });

  it('đọc danh sách từ máy chủ và giữ phòng không còn trống', async () => {
    mockApiClient.get.mockResolvedValue({
      data: serverList([buildItem('a'), buildItem('b', { isAvailable: false })]),
    });
    const { Wrapper } = createWrapper();
    const { result } = await renderHook(() => useComparison(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.count).toBe(2));

    expect(mockApiClient.get).toHaveBeenCalledWith('/comparison');
    expect(result.current.contains('b')).toBe(true);
    expect(result.current.isFull).toBe(false);
  });

  it('thêm phòng: cập nhật lạc quan và trả về kết quả từ máy chủ', async () => {
    mockApiClient.get.mockResolvedValue({ data: serverList([]) });
    mockApiClient.post.mockResolvedValue({
      data: { status: true, data: { listingId: 'a', added: true, count: 1, maxItems: 4 } },
    });
    const { Wrapper } = createWrapper();
    const { result } = await renderHook(
      () => ({ list: useComparison(), add: useAddComparison() }),
      {
        wrapper: Wrapper,
      }
    );

    await waitFor(() => expect(mockApiClient.get).toHaveBeenCalled());

    let outcome;

    await act(async () => {
      outcome = await result.current.add.add(buildItem('a'));
    });

    expect(outcome).toBe('added');
    expect(mockApiClient.post).toHaveBeenCalledWith('/comparison', { listingId: 'a' });
  });

  it('thêm phòng thứ 5 bị máy chủ từ chối thì hoàn tác và báo đã đủ giới hạn', async () => {
    const current = ['a', 'b', 'c'].map((id) => buildItem(id));
    mockApiClient.get.mockResolvedValue({ data: serverList(current) });
    mockApiClient.post.mockRejectedValue(conflictError('Chỉ so sánh được tối đa 4 phòng'));
    const { Wrapper, queryClient } = createWrapper();
    const { result } = await renderHook(
      () => ({ list: useComparison(), add: useAddComparison() }),
      {
        wrapper: Wrapper,
      }
    );

    await waitFor(() => expect(result.current.list.count).toBe(3));

    let outcome;

    await act(async () => {
      outcome = await result.current.add.add(buildItem('d'));
    });

    expect(outcome).toBe('limit-reached');
    expect(queryClient.getQueryData(COMPARISON_QUERY_KEY).items.map((item) => item.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('không gọi máy chủ khi phòng đã có hoặc danh sách đã đủ 4 phòng', async () => {
    const current = ['a', 'b', 'c', 'd'].map((id) => buildItem(id));
    mockApiClient.get.mockResolvedValue({ data: serverList(current) });
    const { Wrapper } = createWrapper();
    const { result } = await renderHook(
      () => ({ list: useComparison(), add: useAddComparison() }),
      {
        wrapper: Wrapper,
      }
    );

    await waitFor(() => expect(result.current.list.isFull).toBe(true));

    let duplicate;
    let overflow;

    await act(async () => {
      duplicate = await result.current.add.add(buildItem('a'));
      overflow = await result.current.add.add(buildItem('e'));
    });

    expect(duplicate).toBe('duplicate');
    expect(overflow).toBe('limit-reached');
    expect(mockApiClient.post).not.toHaveBeenCalled();
  });

  it('phòng không còn hiển thị bị máy chủ từ chối với kết quả unavailable', async () => {
    mockApiClient.get.mockResolvedValue({ data: serverList([]) });
    mockApiClient.post.mockRejectedValue(
      conflictError('Tin đăng không còn hiển thị nên không thể so sánh')
    );
    const { Wrapper } = createWrapper();
    const { result } = await renderHook(() => useAddComparison(), { wrapper: Wrapper });
    let outcome;

    await act(async () => {
      outcome = await result.current.add(buildItem('a'));
    });

    expect(outcome).toBe('unavailable');
  });

  it('lỗi mạng khi bỏ phòng thì hoàn tác và hiện thông báo lỗi', async () => {
    mockApiClient.get.mockResolvedValue({ data: serverList([buildItem('a'), buildItem('b')]) });
    mockApiClient.delete.mockRejectedValue(new Error('Mất kết nối'));
    const { Wrapper, queryClient } = createWrapper();
    const { result } = await renderHook(
      () => ({ list: useComparison(), remove: useRemoveComparison() }),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.list.count).toBe(2));

    await act(async () => {
      result.current.remove('a');
    });

    await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith('Mất kết nối'));
    expect(mockApiClient.delete).toHaveBeenCalledWith('/comparison/a');
    expect(queryClient.getQueryData(COMPARISON_QUERY_KEY).items).toHaveLength(2);
  });

  it('xoá hết gọi DELETE /comparison', async () => {
    mockApiClient.get.mockResolvedValue({ data: serverList([buildItem('a')]) });
    mockApiClient.delete.mockResolvedValue({});
    const { Wrapper } = createWrapper();
    const { result } = await renderHook(
      () => ({ list: useComparison(), clear: useClearComparison() }),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.list.count).toBe(1));

    await act(async () => {
      result.current.clear();
    });

    await waitFor(() => expect(mockApiClient.delete).toHaveBeenCalledWith('/comparison'));
  });

  it('người dùng chưa đăng nhập dùng danh sách cục bộ và không gọi máy chủ', async () => {
    mockAuth = { isAuthenticated: false, role: null };
    const { Wrapper } = createWrapper();
    const { result } = await renderHook(
      () => ({
        list: useComparison(),
        add: useAddComparison(),
        remove: useRemoveComparison(),
      }),
      { wrapper: Wrapper }
    );

    await act(async () => {
      await result.current.add.add(buildItem('a'));
      await result.current.add.add(buildItem('b'));
    });

    expect(result.current.list.count).toBe(2);

    await act(async () => {
      result.current.remove('a');
    });

    expect(result.current.list.items.map((item) => item.id)).toEqual(['b']);
    expect(mockApiClient.get).not.toHaveBeenCalled();
    expect(mockApiClient.post).not.toHaveBeenCalled();
  });

  it('gộp danh sách cục bộ lên máy chủ khi đăng nhập, bỏ qua lỗi và xoá bản cục bộ', async () => {
    useComparisonStore.setState({ items: [buildItem('a'), buildItem('b'), buildItem('c')] });
    mockApiClient.get.mockResolvedValue({ data: serverList([]) });
    mockApiClient.post
      .mockResolvedValueOnce({ data: { data: { added: true } } })
      .mockRejectedValueOnce(conflictError('Tin đăng không còn hiển thị nên không thể so sánh'))
      .mockResolvedValueOnce({ data: { data: { added: true } } });
    const { Wrapper } = createWrapper();

    await renderHook(() => useComparisonSync(), { wrapper: Wrapper });

    await waitFor(() => expect(useComparisonStore.getState().items).toHaveLength(0));

    expect(mockApiClient.post.mock.calls.map(([, body]) => body.listingId)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('không gộp danh sách cục bộ khi chưa đăng nhập', async () => {
    mockAuth = { isAuthenticated: false, role: null };
    useComparisonStore.setState({ items: [buildItem('a')] });
    const { Wrapper } = createWrapper();

    await renderHook(() => useComparisonSync(), { wrapper: Wrapper });

    expect(mockApiClient.post).not.toHaveBeenCalled();
    expect(useComparisonStore.getState().items).toHaveLength(1);
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
