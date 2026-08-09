import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e', timeout: 30000, retries: 0,
  use: { baseURL: 'http://127.0.0.1:4174', trace: 'retain-on-failure' },
  globalSetup: './tests/e2e/setup.js',
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }]
});
