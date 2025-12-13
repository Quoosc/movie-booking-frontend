import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: "./e2e",
  globalSetup: path.join(__dirname, "e2e/global-setup.ts"),

  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
  fullyParallel: true,

  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    storageState: path.join(__dirname, "e2e/.auth/user.json"),
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
