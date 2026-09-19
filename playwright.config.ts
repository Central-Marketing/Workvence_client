import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://dev.workvence.com';
const isHeadless = process.env.HEADLESS !== 'false';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results/artifacts',
  timeout: 300000, // 5 minutes for comprehensive dual-user journey
  expect: {
    timeout: 15000,
  },
  fullyParallel: false,
  workers: 1, // Sequential execution for coordinated Buyer/Seller state machine
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/html-report', open: 'never' }],
    ['./tests/helpers/reporter/markdown-reporter.ts'],
  ],
  use: {
    baseURL: BASE_URL,
    headless: isHeadless,
    launchOptions: {
      slowMo: isHeadless ? 0 : 100,
      args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox'],
    },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
