import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import { CountdownTimer, formatRemaining } from '../src/features/booking/components/CountdownTimer';
import { SlotGrid } from '../src/features/booking/components/SlotGrid';
import { useBookingStore } from '../src/features/booking/store/bookingStore';

describe('Thành phần đặt lịch', () => {
  afterEach(async () => {
    await cleanup();
    jest.useRealTimers();
    useBookingStore.getState().reset();
  });

  it('đếm ngược và gọi làm mới khi hết hạn', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-10-02T08:00:00.000Z'));
    const onExpire = jest.fn();
    const screen = await render(
      <CountdownTimer expiresAt="2026-10-02T08:01:30.000Z" onExpire={onExpire} />
    );

    expect(screen.getByText('Còn 2 phút')).toBeTruthy();

    await act(() => jest.advanceTimersByTime(90_000));

    expect(screen.getByText('Còn 0 phút')).toBeTruthy();
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('định dạng thời gian còn lại theo ngày, giờ và phút', () => {
    expect(formatRemaining(3 * 24 * 3_600_000)).toBe('Còn 3 ngày');
    expect(formatRemaining(21 * 3_600_000)).toBe('Còn 21 giờ');
    expect(formatRemaining(10 * 60_000)).toBe('Còn 10 phút');
  });

  it('chỉ cho phép chọn khung giờ còn trống', async () => {
    const onSelect = jest.fn();
    const slots = [
      { time: '08:00', startTime: '2026-10-03T01:00:00.000Z', available: true },
      { time: '09:00', startTime: '2026-10-03T02:00:00.000Z', available: false },
    ];
    const screen = await render(<SlotGrid slots={slots} onSelect={onSelect} />);

    await fireEvent.press(screen.getByText('08:00'));
    await fireEvent.press(screen.getByText('09:00'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(slots[0]);
  });

  it('giữ trạng thái luồng đặt lịch khi chuyển màn hình', () => {
    const resource = { id: 'room-1', title: 'Phòng 101', price: 2500000, address: 'Đà Nẵng' };
    const slot = { time: '08:00', startTime: '2026-10-03T01:00:00.000Z', available: true };

    useBookingStore.getState().setResource(resource);
    useBookingStore.getState().selectDate('2026-10-03');
    useBookingStore.getState().selectSlot(slot);

    expect(useBookingStore.getState()).toMatchObject({
      resource,
      selectedDate: '2026-10-03',
      selectedSlot: slot,
    });
  });
});
