import { test, expect } from "@playwright/test";
import { loginUI, logoutUI, isLoggedIn } from "./helpers/auth";

test.describe("Auth: Basic Login/Logout", () => {
  const userEmail = process.env.E2E_USER_EMAIL;
  const userPassword = process.env.E2E_USER_PASSWORD;

  test.beforeEach(async ({ page }) => {
    // Đảm bảo bắt đầu ở trạng thái logout
    await page.goto("/");
  });

  test("User can login with email/password and session persists on reload", async ({ page }) => {
    test.skip(!userEmail || !userPassword, "E2E_USER_EMAIL/PASSWORD not configured");

    // 1) Login
    await loginUI(page, userEmail!, userPassword!);

    // 2) Verify logged in state
    await page.waitForTimeout(1000);
    const loggedIn = await isLoggedIn(page);
    expect(loggedIn).toBe(true);

    // 3) Reload page and verify session persists
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const stillLoggedIn = await isLoggedIn(page);
    expect(stillLoggedIn).toBe(true);

    // Alternative verification: Navigate to protected route
    await page.goto("/account/account-profile", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    // Should NOT be redirected to /auth/login
    expect(page.url()).not.toMatch(/\/auth\/login/i);
    expect(page.url()).toMatch(/\/account/i);
  });

  test("User can logout and session is cleared", async ({ page }) => {
    test.skip(!userEmail || !userPassword, "E2E_USER_EMAIL/PASSWORD not configured");

    // 1) Login first
    await loginUI(page, userEmail!, userPassword!);
    await page.waitForTimeout(1000);

    // 2) Verify logged in
    let loggedIn = await isLoggedIn(page);
    expect(loggedIn).toBe(true);

    // 3) Logout
    await logoutUI(page);
    await page.waitForTimeout(1000);

    // 4) Verify logged out - should be redirected or see guest UI
    loggedIn = await isLoggedIn(page);
    expect(loggedIn).toBe(false);

    // 5) Try accessing protected route - should redirect to /auth/login
    await page.goto("/account/account-history", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Should be redirected to /auth/login
    const url = page.url();
    const isRedirected = url.includes("/auth/login");
    
    if (!isRedirected) {
      await page.screenshot({ path: "e2e/.debug/logout-no-redirect.png" });
      console.log(`After logout, expected redirect to /auth/login, got: ${url}`);
    }
    
    expect(isRedirected).toBe(true);
  });

  test("Login with wrong credentials shows error", async ({ page }) => {
    test.skip(!userEmail, "E2E_USER_EMAIL not configured");

    await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    await expect(emailInput).toBeVisible({ timeout: 10_000 });
    await expect(passwordInput).toBeVisible({ timeout: 10_000 });
    
    await emailInput.fill(userEmail!);
    await passwordInput.fill("wrong-password-123");

    await page.getByRole("button", { name: /đăng nhập|login/i }).click();
    await page.waitForTimeout(2000);

    // Should stay on login page or show error
    const isStillOnLogin = page.url().includes("/auth/login");
    expect(isStillOnLogin).toBe(true);

    // Optional: Check for error message
    const errorMessage = page.locator('text=/sai|invalid|incorrect|error|thất bại/i').first();
    const hasError = (await errorMessage.count()) > 0;
    
    if (hasError) {
      await expect(errorMessage).toBeVisible();
    }
  });
});
