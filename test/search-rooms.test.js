import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react-native';
import { SearchScreen } from '../src/features/search/screens/SearchScreen';

const mockNavigation = { navigate: jest.fn() };
const mockRefetch = jest.fn();
let mockRoomsQuery;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('../src/features/search/hooks', () => ({
  useRooms: () => mockRoomsQuery,
}));

const room = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  title: 'Phòng thật từ cơ sở dữ liệu',
  description: 'Phòng dành cho sinh viên',
  address: 'Số 12, đường số 8, thành phố Thủ Đức',
  streetAddress: 'Số 12, đường số 8',
  provinceCode: '79',
  wardCode: '26800',
  latitude: 10.86,
  longitude: 106.8,
  price: 2500000,
  area: 20,
  roomType: 'phong_don',
  maxOccupants: 2,
  electricPrice: 3500,
  waterPrice: 80000,
  deposit: 2500000,
  imageUrl: 'https://example.com/room.jpg',
  imageUrls: ['https://example.com/room.jpg'],
  amenityIds: [1, 6],
  status: 'active',
  isActive: true,
  createdAt: '2026-10-03T00:00:00.000Z',
  updatedAt: '2026-10-03T00:00:00.000Z',
};

describe('Màn Tìm trọ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRoomsQuery = {
      data: [room],
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetch: mockRefetch,
    };
  });

  afterEach(async () => {
    await cleanup();
  });

  it('hiển thị phòng từ API và chuyển đúng resourceId sang màn Booking', async () => {
    const screen = await render(<SearchScreen />);

    expect(screen.getByText(room.title)).toBeTruthy();
    expect(screen.getByText('2.500.000đ/tháng')).toBeTruthy();

    await fireEvent.press(screen.getByText('Đặt lịch xem phòng'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('BookingNew', {
      resourceId: room.id,
    });
  });

  it('hiển thị trạng thái rỗng', async () => {
    mockRoomsQuery = { ...mockRoomsQuery, data: [] };
    const screen = await render(<SearchScreen />);

    expect(screen.getByText('Chưa có phòng nào')).toBeTruthy();
  });

  it('hiển thị lỗi và cho phép thử lại', async () => {
    mockRoomsQuery = { ...mockRoomsQuery, data: undefined, isError: true };
    const screen = await render(<SearchScreen />);

    await fireEvent.press(screen.getByText('Thử lại'));

    expect(screen.getByText('Không tải được danh sách')).toBeTruthy();
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
