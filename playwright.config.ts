import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the GOQii Assessment - Task 3 (Automation Challenge)
 *
 * Reporting: HTML report (auto-opens locally, kept on CI) + list reporter for console output.
 * Resilience: screenshots and traces are captured only on failure to keep artifacts lean,
 * video is retained on first retry to help debug flaky failures.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { open: process.env.CI ? 'never' : 'on-failure', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
