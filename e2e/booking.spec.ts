import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const LOGIN_PHONE = process.env.E2E_LOGIN_PHONE ?? '0900000001';
const LOGIN_PASSWORD = process.env.E2E_LOGIN_PASSWORD ?? '';
const API_URL = process.env.E2E_API_URL ?? 'http://127.0.0.1:3000/api/v1';

if (!LOGIN_PASSWORD) {
  throw new Error('Thiếu biến môi trường E2E_LOGIN_PASSWORD để chạy kiểm thử e2e');
}

const cleanActiveBookings = async (request: APIRequestContext) => {
  const loginResponse = await request.post(`${API_URL}/auth/login`, {
    data: { identifier: LOGIN_PHONE, password: LOGIN_PASSWORD, deviceName: 'Playwright' },
  });
  const loginBody = await loginResponse.json();
  const accessToken = loginBody.data.accessToken as string;
  const headers = { Authorization: `Bearer ${accessToken}` };
  const bookingsResponse = await request.get(`${API_URL}/bookings?page=1&limit=50`, { headers });
  const bookingsBody = await bookingsResponse.json();

  for (const booking of bookingsBody.data.items as Array<{ id: string; status: string }>) {
    if (['pending', 'confirmed', 'holding'].includes(booking.status)) {
      await request.delete(`${API_URL}/bookings/${booking.id}`, {
        headers,
        data: { reason: 'Dọn dữ liệu trước khi chạy Playwright' },
      });
    }
  }
};

const login = async (page: Page) => {
  await page.goto('/');
  await page.getByText('Bỏ qua', { exact: true }).click();
  await page.getByPlaceholder('0905 123 456').fill(LOGIN_PHONE);
  await page.getByPlaceholder('••••••••').fill(LOGIN_PASSWORD);
  await page.getByText('Đăng nhập', { exact: true }).last().click();
  await expect(page.getByText('Tìm trọ', { exact: true })).toBeVisible();
};

test('tìm phòng, đặt lịch xem và theo dõi lịch hẹn qua API thật', async ({ page, request }) => {
  const consoleErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
      consoleErrors.push(message.text());
    }
  });

  await cleanActiveBookings(request);
  await login(page);
  await page.getByText('Tìm trọ', { exact: true }).click();

  const firstPrice = page.getByText(/\d\.\d{3}\.\d{3}đ/).first();

  await expect(firstPrice).toBeVisible();
  await firstPrice.click();
  await expect(page.getByText('Tiện ích', { exact: true })).toBeVisible();
  await page.getByText('Đặt lịch xem', { exact: true }).click();

  await expect(
    page.getByText('Chọn ngày bạn muốn xem', { exact: true }).filter({ visible: true })
  ).toBeVisible();
  const availableSlot = page.getByText('20:00', { exact: true });

  await expect(availableSlot).toBeVisible();
  await availableSlot.click();
  await page.getByText('Tiếp tục', { exact: true }).click();

  await expect(page.getByText('Xác nhận yêu cầu', { exact: true })).toBeVisible();
  await page.getByPlaceholder('0905 123 456').fill(LOGIN_PHONE);
  await page
    .getByPlaceholder('Ví dụ: Mình muốn xem phòng vào đúng giờ đã chọn...')
    .fill('Mình sẽ đến đúng giờ đã chọn');
  await page.getByText('Gửi yêu cầu xem phòng', { exact: true }).click();
  await expect(page.getByText('Đã gửi yêu cầu xem phòng', { exact: true })).toBeVisible();

  await page.getByText('Xem lịch hẹn của tôi', { exact: true }).click();
  await expect(page.getByText('Lịch hẹn của tôi', { exact: true })).toBeVisible();

  for (const tab of ['Chờ', 'Đã xác nhận', 'Hết hạn', 'Đã hủy']) {
    await expect(page.getByText(new RegExp(`^${tab} \\(\\d+\\)$`))).toBeVisible();
  }

  await expect(page.getByText(/Còn \d+ giờ/)).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
