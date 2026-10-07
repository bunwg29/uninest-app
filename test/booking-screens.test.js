import React from 'react';
import { Linking } from 'react-native';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { BookingNewScreen } from '../src/features/booking/screens/BookingNewScreen';
import { BookingConfirmScreen } from '../src/features/booking/screens/BookingConfirmScreen';
import { BookingSuccessScreen } from '../src/features/booking/screens/BookingSuccessScreen';
import { MyBookingsScreen, isInTab } from '../src/features/booking/screens/MyBookingsScreen';
import { BookingDetailScreen } from '../src/features/booking/screens/BookingDetailScreen';
import { CancelBookingScreen } from '../src/features/booking/screens/CancelBookingScreen';
import { BookingHoldScreen } from '../src/features/booking/screens/BookingHoldScreen';
import { ResourceCard } from '../src/features/booking/components/ResourceCard';
import { StatusBadge } from '../src/features/booking/components/StatusBadge';
import { formatBookingDateTime, formatDateKey, getHoursUntil } from '../src/features/booking/utils';

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
  replace: jest.fn(),
};
let mockRouteParams = {};
let mockFlowState;
let mockBooking;
let mockSlotsQuery;
let mockDetailQuery;
let mockBookingsQuery;
let mockRoomQuery;
let mockRole = 'student';
const mockOpenChat = jest.fn();
const mockOpenListing = jest.fn();
const mockLandlordAction = { mutateAsync: jest.fn(), isPending: false };
const mockToast = { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() };
const mockCreate = { mutateAsync: jest.fn(), isPending: false };
const mockCancel = { mutateAsync: jest.fn(), isPending: false };
const mockHold = { mutateAsync: jest.fn(), isPending: false };
const mockRefetch = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: mockRouteParams }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('../src/features/auth', () => ({
  useAuthStore: (selector) => selector({ user: { phoneNumber: '0905123456' } }),
}));
jest.mock('../src/hooks', () => ({ useToast: () => mockToast }));
jest.mock('../src/features/booking/store', () => ({ useBookingStore: () => mockFlowState }));
jest.mock('../src/features/booking/hooks', () => ({
  useBookingSlots: () => mockSlotsQuery,
  useCreateBooking: () => mockCreate,
  useBookingDetail: () => mockDetailQuery,
  useBookings: () => mockBookingsQuery,
  useCancelBooking: () => mockCancel,
  useHoldBooking: () => mockHold,
  useConfirmBooking: () => mockLandlordAction,
  useRejectBooking: () => mockLandlordAction,
  useReleaseBooking: () => mockLandlordAction,
}));
jest.mock('../src/features/auth/hooks', () => ({
  useAuth: () => ({ role: mockRole }),
}));
jest.mock('../src/features/listings/hooks/useOpenListing', () => ({
  useOpenListing: () => ({ openListing: mockOpenListing, isOpening: false }),
}));
jest.mock('@features/listings/hooks/useListingDetail', () => ({
  useListingDetail: () => mockRoomQuery,
}));
jest.mock('@features/listings/hooks/useLandlordListings', () => ({
  useLandlordListingMutation: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));
jest.mock('@features/chat', () => ({
  useOpenListingChat: () => ({ openChat: mockOpenChat, isOpening: false }),
}));

const toListingDetail = (room) => ({
  id: room.id,
  title: room.title,
  price: room.price,
  deposit: room.deposit,
  address: { fullAddress: room.address },
  images: room.imageUrl ? [{ id: 'img', url: room.imageUrl, isCover: true, sortOrder: 0 }] : [],
  availability: 'available',
});

const resource = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  title: 'Phòng 101 gần trường',
  price: 2500000,
  address: 'Liên Chiểu, Đà Nẵng',
  imageUrl: null,
  deposit: 2500000,
};

const createBooking = (overrides = {}) => ({
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  code: 'BK-20301002-123456',
  phone: '0905123456',
  note: null,
  startTime: '2030-10-03T01:00:00.000Z',
  endTime: '2030-10-03T02:00:00.000Z',
  status: 'pending',
  expiresAt: '2030-10-02T01:15:00.000Z',
  cancelReason: null,
  depositAmount: null,
  confirmedAt: null,
  expiredAt: null,
  cancelledAt: null,
  createdAt: '2030-10-02T01:00:00.000Z',
  listing: resource,
  events: [
    {
      id: 'event-1',
      eventType: 'created',
      actor: 'student',
      metadata: null,
      createdAt: '2030-10-02T01:00:00.000Z',
    },
  ],
  ...overrides,
});

describe('Các màn hình Booking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRole = 'student';
    mockBooking = createBooking();
    mockRouteParams = { id: mockBooking.id, resourceId: resource.id, resource };
    mockFlowState = {
      resource,
      selectedDate: '2030-10-03',
      selectedSlot: { time: '08:00', startTime: '2030-10-03T01:00:00.000Z', available: true },
      startBooking: jest.fn(),
      setResource: jest.fn(),
      selectDate: jest.fn(),
      selectSlot: jest.fn(),
    };
    mockSlotsQuery = {
      data: [{ time: '08:00', startTime: '2030-10-03T01:00:00.000Z', available: true }],
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    };
    mockRoomQuery = {
      data: toListingDetail(resource),
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    };
    mockDetailQuery = { data: mockBooking, isLoading: false, isError: false, refetch: mockRefetch };
    mockBookingsQuery = {
      data: { items: [mockBooking] },
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetch: mockRefetch,
    };
    mockCreate.mutateAsync.mockResolvedValue(mockBooking);
    mockCancel.mutateAsync.mockResolvedValue({ ...mockBooking, status: 'cancelled' });
    mockHold.mutateAsync.mockResolvedValue({ ...mockBooking, status: 'holding' });
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
  });

  it('hiển thị lịch, chọn slot và chuyển sang xác nhận', async () => {
    const screen = await render(<BookingNewScreen />);

    expect(screen.getByText('Chọn một ngày để tiếp tục')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Ngày 03/10/2030'));
    expect(mockFlowState.selectDate).toHaveBeenCalledWith('2030-10-03');
    await fireEvent.press(screen.getByText('Tiếp tục'));
    await fireEvent.press(screen.getByText('08:00'));
    await fireEvent.press(screen.getByText('Tiếp tục'));

    expect(mockFlowState.selectSlot).toHaveBeenCalled();
    expect(mockNavigation.navigate).toHaveBeenCalledWith('BookingConfirm');
  });

  it('chỉ khởi tạo store một lần khi chuyển sang đặt một phòng khác', async () => {
    const nextRoom = { ...resource, id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc' };

    mockRouteParams = { resourceId: nextRoom.id };
    mockRoomQuery = { ...mockRoomQuery, data: toListingDetail(nextRoom) };
    const screen = await render(<BookingNewScreen />);

    await waitFor(() => expect(mockFlowState.startBooking).toHaveBeenCalledTimes(1));
    screen.rerender(<BookingNewScreen />);

    expect(mockFlowState.startBooking).toHaveBeenCalledTimes(1);
    expect(mockFlowState.startBooking).toHaveBeenCalledWith(
      expect.objectContaining({ id: nextRoom.id, title: nextRoom.title }),
      expect.any(String)
    );
  });

  it('gửi yêu cầu hợp lệ và điều hướng sang thành công', async () => {
    const screen = await render(<BookingConfirmScreen />);

    await fireEvent.press(screen.getByText('Gửi yêu cầu xem phòng'));

    await screen.findByText('Gửi yêu cầu xem phòng');
    expect(mockCreate.mutateAsync).toHaveBeenCalled();
  });

  it('chặn số điện thoại sai ở màn xác nhận', async () => {
    const screen = await render(<BookingConfirmScreen />);
    const input = screen.getByPlaceholderText('0905 123 456');

    await fireEvent.changeText(input, '123');
    await fireEvent.press(screen.getByText('Gửi yêu cầu xem phòng'));

    expect(screen.getByText('Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số')).toBeTruthy();
  });

  it('hiển thị trạng thái thiếu slot và xử lý lỗi gửi yêu cầu', async () => {
    mockFlowState = { ...mockFlowState, resource: null, selectedSlot: null };
    const missingScreen = await render(<BookingConfirmScreen />);

    expect(missingScreen.getByText('Bạn chưa chọn thời gian xem phòng.')).toBeTruthy();
    await cleanup();

    mockFlowState = {
      ...mockFlowState,
      resource,
      selectedSlot: { time: '08:00', startTime: '2030-10-03T01:00:00.000Z', available: true },
    };
    mockCreate.mutateAsync.mockRejectedValueOnce(new Error('Máy chủ bận'));
    const errorScreen = await render(<BookingConfirmScreen />);

    await fireEvent.press(errorScreen.getByText('Gửi yêu cầu xem phòng'));
    expect(mockToast.error).toHaveBeenCalledWith('Máy chủ bận');
  });

  it('hiển thị lỗi tải slot và cho phép thử lại', async () => {
    mockSlotsQuery = { ...mockSlotsQuery, data: undefined, isError: true };
    const screen = await render(<BookingNewScreen />);

    await fireEvent.press(screen.getByLabelText('Ngày 03/10/2030'));
    await fireEvent.press(screen.getByText('Tiếp tục'));
    await fireEvent.press(screen.getByText('Thử lại'));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('hiển thị trạng thái tải thông tin phòng', async () => {
    mockRoomQuery = { ...mockRoomQuery, data: undefined, isLoading: true };
    const screen = await render(<BookingNewScreen />);

    expect(screen.getByText('Đang tải thông tin phòng...')).toBeTruthy();
  });

  it('hiển thị lỗi tải phòng và cho phép thử lại hoặc quay về tìm trọ', async () => {
    mockRoomQuery = { ...mockRoomQuery, data: undefined, isError: true };
    mockFlowState = { ...mockFlowState, resource: null };
    const screen = await render(<BookingNewScreen />);

    await fireEvent.press(screen.getByText('Thử lại'));
    await fireEvent.press(screen.getByText('Quay lại Tìm trọ'));

    expect(mockRefetch).toHaveBeenCalled();
    expect(mockNavigation.replace).toHaveBeenCalledWith('Main', { screen: 'Search' });
  });

  it('hiển thị màn thành công và mở danh sách lịch hẹn', async () => {
    const screen = await render(<BookingSuccessScreen />);

    await fireEvent.press(screen.getByText('Xem lịch hẹn của tôi'));

    expect(screen.getByText('Đã gửi yêu cầu xem phòng')).toBeTruthy();
    expect(mockNavigation.replace).toHaveBeenCalledWith('MyBookings');
  });

  it('lọc tab và mở chi tiết lịch hẹn', async () => {
    const screen = await render(<MyBookingsScreen />);

    await fireEvent.press(screen.getByText('Phòng 101 gần trường'));
    await fireEvent.press(screen.getByText('Đã xác nhận'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('BookingDetail', { id: mockBooking.id });
    expect(isInTab('pending', 'pending')).toBe(true);
    expect(isInTab('holding', 'confirmed')).toBe(true);
    expect(isInTab('confirmed', 'confirmed')).toBe(true);
    expect(isInTab('expired', 'expired')).toBe(true);
    expect(isInTab('cancelled', 'cancelled')).toBe(true);
    expect(isInTab('rejected', 'cancelled')).toBe(true);
  });

  it('hiển thị chi tiết xác nhận và mở Google Calendar', async () => {
    mockBooking = createBooking({
      status: 'confirmed',
      confirmedAt: '2030-10-02T02:00:00.000Z',
      expiresAt: null,
    });
    mockDetailQuery = { ...mockDetailQuery, data: mockBooking };
    const screen = await render(<BookingDetailScreen />);

    await fireEvent.press(screen.getByText('Thêm vào lịch'));

    expect(screen.getByText('Chủ trọ đã xác nhận.')).toBeTruthy();
    expect(Linking.openURL).toHaveBeenCalled();
    await fireEvent.press(screen.getByText('Huỷ lịch hẹn'));
    expect(screen.getByText('Huỷ lịch hẹn?')).toBeTruthy();
    await fireEvent.press(screen.getByText('Không'));
    expect(mockCancel.mutateAsync).not.toHaveBeenCalled();
  });

  it('sinh viên bấm vào phòng để mở chi tiết phòng', async () => {
    const screen = await render(<BookingDetailScreen />);

    await fireEvent.press(screen.getByLabelText(`Xem chi tiết phòng ${resource.title}`));

    expect(mockOpenListing).toHaveBeenCalledWith(resource.id);
  });

  it('chủ trọ nhắn tin cho sinh viên đã đặt lịch thay vì nhắn cho chính mình', async () => {
    mockRole = 'landlord';
    mockBooking = createBooking({
      student: { id: 'student-1', fullName: 'Nguyễn Văn A', phone: '0905123456', avatarUrl: null },
    });
    mockDetailQuery = { ...mockDetailQuery, data: mockBooking };
    const screen = await render(<BookingDetailScreen />);

    expect(screen.queryByText('Nhắn tin với Chủ trọ')).toBeNull();
    expect(screen.queryByText('Huỷ lịch hẹn')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Nhắn tin với sinh viên'));

    expect(mockOpenChat).toHaveBeenCalledWith(resource.id, 'student-1');
  });

  it('xác nhận hủy lịch bằng hộp thoại khi còn trên 24 giờ', async () => {
    const screen = await render(<BookingDetailScreen />);

    await fireEvent.press(screen.getByText('Huỷ lịch hẹn'));
    await fireEvent.press(screen.getByText('Huỷ lịch'));

    await waitFor(() =>
      expect(mockCancel.mutateAsync).toHaveBeenCalledWith({ id: mockBooking.id })
    );
    expect(mockToast.success).toHaveBeenCalledWith('Đã hủy lịch hẹn');
  });

  it('hiển thị biến thể đã hủy và phòng tương tự', async () => {
    mockBooking = createBooking({
      status: 'cancelled',
      cancelReason: 'Có lịch học',
      expiresAt: null,
    });
    mockDetailQuery = { ...mockDetailQuery, data: mockBooking };
    const screen = await render(<BookingDetailScreen />);

    expect(screen.getAllByText('Đã hủy')).toHaveLength(1);
    expect(screen.getByText('Lý do: Có lịch học')).toBeTruthy();
    expect(screen.getByText('Phòng tương tự đang còn trống')).toBeTruthy();
  });

  it('hiển thị biến thể hết hạn và cho gửi lại yêu cầu', async () => {
    mockBooking = createBooking({
      status: 'expired',
      expiredAt: '2030-10-03T01:00:00.000Z',
      expiresAt: null,
    });
    mockDetailQuery = { ...mockDetailQuery, data: mockBooking };
    const screen = await render(<BookingDetailScreen />);

    expect(screen.getByText('Hết hạn — không có phản hồi')).toBeTruthy();
    await fireEvent.press(screen.getByText('Gửi lại yêu cầu'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('BookingNew', {
      resourceId: resource.id,
    });
  });

  it('bắt buộc và gửi lý do hủy', async () => {
    const screen = await render(<CancelBookingScreen />);

    await fireEvent.press(screen.getByText('Gửi lý do'));
    expect(screen.getByText('Vui lòng cho chủ trọ biết lý do bạn không thể đến')).toBeTruthy();

    await fireEvent.changeText(
      screen.getByPlaceholderText('Nhập lý do bạn không thể đến...'),
      'Có lịch học'
    );
    await fireEvent.press(screen.getByText('Gửi lý do'));

    expect(mockCancel.mutateAsync).toHaveBeenCalledWith({
      id: mockBooking.id,
      reason: 'Có lịch học',
    });
  });

  it('xác nhận hủy lịch từ danh sách khi còn trên 24 giờ', async () => {
    const screen = await render(<MyBookingsScreen />);

    await fireEvent.press(screen.getByText('Huỷ yêu cầu'));
    expect(screen.getByText('Huỷ yêu cầu xem phòng?')).toBeTruthy();
    const confirmButtons = screen.getAllByText('Huỷ yêu cầu');

    await fireEvent.press(confirmButtons[confirmButtons.length - 1]);

    expect(mockCancel.mutateAsync).toHaveBeenCalledWith({ id: mockBooking.id });
    expect(mockToast.success).toHaveBeenCalledWith('Đã hủy yêu cầu xem phòng');
  });

  it('hiển thị lỗi danh sách và lỗi chi tiết', async () => {
    mockBookingsQuery = { ...mockBookingsQuery, data: undefined, isError: true };
    const listScreen = await render(<MyBookingsScreen />);

    expect(listScreen.getByText('Không thể tải lịch hẹn.')).toBeTruthy();
    await cleanup();

    mockDetailQuery = { ...mockDetailQuery, data: undefined, isError: true };
    const detailScreen = await render(<BookingDetailScreen />);

    expect(detailScreen.getByText('Không thể tải chi tiết lịch hẹn.')).toBeTruthy();
  });

  it('hiển thị bốn quy tắc và tạo yêu cầu giữ chỗ', async () => {
    mockDetailQuery = { ...mockDetailQuery, data: { ...mockBooking, status: 'confirmed' } };
    const screen = await render(<BookingHoldScreen />);

    await fireEvent.press(screen.getByText('Tiếp tục đặt cọc'));

    expect(screen.getByText('Trước khi giữ chỗ, đọc kỹ 4 điều này')).toBeTruthy();
    expect(mockHold.mutateAsync).toHaveBeenCalledWith(mockBooking.id);
  });

  it('không cho giữ chỗ khi lịch hẹn chưa được Chủ trọ xác nhận', async () => {
    const screen = await render(<BookingHoldScreen />);

    await fireEvent.press(screen.getByText('Tiếp tục đặt cọc'));

    expect(mockHold.mutateAsync).not.toHaveBeenCalled();
  });

  it('bao phủ card, badge và tiện ích định dạng', async () => {
    const screen = await render(
      <>
        <ResourceCard resource={{ ...resource, imageUrl: 'https://example.com/room.jpg' }} />
        <StatusBadge status="holding" />
      </>
    );

    expect(screen.getByText('Đang giữ chỗ')).toBeTruthy();
    expect(formatDateKey(new Date(2030, 9, 3))).toBe('2030-10-03');
    expect(formatBookingDateTime(mockBooking.startTime)).toContain('2030');
    expect(getHoursUntil(mockBooking.startTime)).toBeGreaterThan(0);
  });
});
