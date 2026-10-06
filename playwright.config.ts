import { defineConfig } from '@playwright/test';

const WEB_SERVER_ENV = { ...process.env };

delete WEB_SERVER_ENV.NO_COLOR;
delete WEB_SERVER_ENV.FORCE_COLOR;

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:8081',
    viewport: { width: 390, height: 844 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm.cmd run start',
      cwd: '../uninest-be',
      url: 'http://127.0.0.1:3000/api/v1/health',
      reuseExistingServer: true,
      timeout: 120_000,
      env: WEB_SERVER_ENV,
    },
    {
      command: 'npm.cmd run web -- --port 8081',
      cwd: '.',
      url: 'http://127.0.0.1:8081',
      reuseExistingServer: true,
      timeout: 120_000,
      env: {
        ...WEB_SERVER_ENV,
        EXPO_PUBLIC_API_URL: 'http://127.0.0.1:3000/api/v1',
      },
    },
  ],
});
