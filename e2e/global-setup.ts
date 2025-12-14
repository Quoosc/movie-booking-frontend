import { chromium, FullConfig } from "@playwright/test";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

export default async function globalSetup(config: FullConfig) {
  dotenv.config({ path: ".env.e2e" });

  const baseURL = process.env.E2E_BASE_URL || "http://localhost:5173";

  const userEmail = process.env.E2E_USER_EMAIL;
  const userPassword = process.env.E2E_USER_PASSWORD;

  const adminEmail = process.env.E2E_ADMIN_EMAIL;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD;

  const authDir = path.join(process.cwd(), "e2e/.auth");
  const debugDir = path.join(process.cwd(), "e2e/.debug");
  fs.mkdirSync(authDir, { recursive: true });
  fs.mkdirSync(debugDir, { recursive: true });

  const browser = await chromium.launch();

  async function dump(page: any, tag: string) {
    console.log(`\n[DEBUG:${tag}] URL = ${page.url()}`);
    const inputs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("input")).map((i) => ({
        type: (i as HTMLInputElement).type,
        name: (i as HTMLInputElement).name,
        id: (i as HTMLInputElement).id,
        placeholder: (i as HTMLInputElement).placeholder,
      }))
    );
    console.log(`[DEBUG:${tag}] inputs =`, inputs);

    const shot = path.join(debugDir, `${tag}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    console.log(`[DEBUG:${tag}] screenshot saved: ${shot}\n`);
  }

  async function openLoginUI(page: any) {
    // 1) vào Home trước (đảm bảo navbar render)
    await page.goto(baseURL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    // 2) thử click "Đăng nhập/Login" (link hoặc button)
    const loginTrigger = page
      .getByRole("link", { name: /đăng nhập|login/i })
      .or(page.getByRole("button", { name: /đăng nhập|login/i }))
      .first();

    if ((await loginTrigger.count()) === 0) {
      await dump(page, "no-login-trigger");
      throw new Error('Cannot find "Đăng nhập/Login" trigger on Home.');
    }

    await loginTrigger.click();

    // 3) Chờ UI login xuất hiện:
    // - Nếu route điều hướng: URL sẽ đổi
    // - Nếu modal: password input sẽ xuất hiện
    const pass = page.locator('input[type="password"]').first();
    await pass.waitFor({ state: "visible", timeout: 30_000 });
  }

  async function fillLoginForm(page: any, email: string, password: string) {
    // Email: ưu tiên input[type=email], fallback placeholder VN
    const emailInput = page
      .locator('input[type="email"]')
      .or(page.locator('input[placeholder*="email" i]'))
      .or(page.locator('input[placeholder*="Địa chỉ" i]'))
      .first();

    if ((await emailInput.count()) === 0) {
      await dump(page, "no-email-input");
      throw new Error("Cannot find email input on login UI.");
    }
    await emailInput.fill(email);

    // Password: type=password (đã wait ở openLoginUI)
    const passInput = page.locator('input[type="password"]').first();
    await passInput.fill(password);

    // Submit
    const submitBtn = page
      .getByRole("button", { name: /đăng nhập|login/i })
      .or(page.locator('button[type="submit"]'))
      .first();

    if ((await submitBtn.count()) === 0) {
      await dump(page, "no-submit-btn");
      throw new Error("Cannot find submit button on login UI.");
    }

    await Promise.all([
      page.waitForLoadState("networkidle"),
      submitBtn.click(),
    ]);
  }

 async function loginAndSave(fileName: string, email?: string, password?: string) {
  if (!email || !password) return;

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${baseURL}/auth/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // Use name attribute selectors (matches TextInput component)
  const emailInput = page.locator('input[name="email"]');
  await emailInput.waitFor({ state: "visible", timeout: 30_000 });
  await emailInput.fill(email);

  const passInput = page.locator('input[name="password"]');
  await passInput.waitFor({ state: "visible", timeout: 30_000 });
  await passInput.fill(password);

  const submitBtn = page
    .getByRole("button", { name: /đăng nhập|login/i })
    .or(page.locator('button[type="submit"]'))
    .first();

  await submitBtn.click();
  await page.waitForLoadState("networkidle", { timeout: 30_000 });

  // Wait a bit more for redirect
  await page.waitForTimeout(2000);

  // Check if login succeeded
  if (page.url().includes("/auth/login")) {
    await page.screenshot({
      path: path.join(debugDir, `login-failed-${fileName.replace(".json", "")}.png`),
      fullPage: true,
    });
    throw new Error(`Login failed for ${email}. Still on /auth/login`);
  }

  await context.storageState({ path: path.join(authDir, fileName) });
  await context.close();
}

  await loginAndSave("user.json", userEmail, userPassword);
  await loginAndSave("admin.json", adminEmail, adminPassword);

  await browser.close();
}
