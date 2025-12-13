import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test("auth: login and save storage state", async ({ page }) => {
  const baseURL = process.env.E2E_BASE_URL || "http://localhost:5173";
  const email = process.env.E2E_USER_EMAIL!;
  const password = process.env.E2E_USER_PASSWORD!;

  await page.goto(`${baseURL}/login`);

  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);

  await Promise.all([
    page.waitForLoadState("networkidle"),
    page.getByRole("button", { name: /đăng nhập|login/i }).click(),
  ]);

  await expect(page).not.toHaveURL(/\/login/i);

  const authDir = path.join(process.cwd(), "e2e/.auth");
  fs.mkdirSync(authDir, { recursive: true });

  await page.context().storageState({ path: path.join(authDir, "user.json") });
});
