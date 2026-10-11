import { defineConfig } from "@playwright/test";

// Isolated local fixture: never runs against the marketplace or its APIs.
export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  outputDir: "../../test-results/toast",
  timeout: 30_000,
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3217", headless: true },
  webServer: {
    command: "node tests/toast/serve.cjs",
    cwd: "../..",
    url: "http://127.0.0.1:3217",
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
