import { test, expect } from "@playwright/test";
import { loginUI } from "./helpers/auth";

test.describe("Route Guards & Role-based Access", () => {
  const userEmail = process.env.E2E_USER_EMAIL;
  const userPassword = process.env.E2E_USER_PASSWORD;
  const adminEmail = process.env.E2E_ADMIN_EMAIL;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD;

  test("Guest accessing /account/account-history redirects to login", async ({ page }) => {
    await page.goto("/account/account-history", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Should be redirected to /auth/login
    const url = page.url();
    const isRedirected = url.includes("/auth/login");
    
    if (!isRedirected) {
      await page.screenshot({ path: "e2e/.debug/route-guard-account-no-redirect.png" });
      console.log(`Expected redirect to /auth/login, got: ${url}`);
    }
    
    expect(isRedirected).toBe(true);
  });

  test("Guest accessing /admin redirects to login or home", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Should NOT stay on /admin
    const url = page.url();
    const isBlocked = url.includes("/auth/login") || !url.includes("/admin");
    expect(isBlocked).toBe(true);
  });

  test("Regular USER accessing /admin is blocked", async ({ page }) => {
    test.skip(!userEmail || !userPassword, "E2E_USER_EMAIL/PASSWORD not configured");

    // Login as regular user
    await loginUI(page, userEmail!, userPassword!);
    await page.waitForTimeout(1000);

    // Try to access admin
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Should be redirected away from /admin
    const url = page.url();
    const isBlocked = !url.includes("/admin") || url.includes("/auth/login");
    
    if (!isBlocked) {
      await page.screenshot({ path: "e2e/.debug/user-admin-not-blocked.png" });
      console.log(`Regular user should be blocked from /admin, got: ${url}`);
    }
    
    expect(isBlocked).toBe(true);

    // Optional: Check for "forbidden" or "unauthorized" message
    const forbiddenMsg = page.locator('text=/không có quyền|forbidden|unauthorized|access denied/i').first();
    if ((await forbiddenMsg.count()) > 0) {
      console.log("Found forbidden message");
    }
  });

  test("ADMIN can access /admin dashboard", async ({ page }) => {
    test.skip(!adminEmail || !adminPassword, "E2E_ADMIN_EMAIL/PASSWORD not configured");

    // Login as admin
    await loginUI(page, adminEmail!, adminPassword!);
    await page.waitForTimeout(1000);

    // Navigate to admin
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    // Should stay on /admin
    expect(page.url()).toMatch(/\/admin/i);

    // Verify admin UI elements exist
    const adminIndicators = [
      page.locator('[data-testid="admin-sidebar"]'),
      page.locator('[data-testid="admin-layout"]'),
      page.getByRole('heading', { name: /dashboard|admin|quản lý/i }),
      page.locator('nav').filter({ hasText: /phim|rạp|đơn hàng|movies|cinemas|orders/i }),
    ];

    let foundIndicator = false;
    for (const indicator of adminIndicators) {
      if ((await indicator.count()) > 0) {
        foundIndicator = true;
        break;
      }
    }

    expect(foundIndicator).toBe(true);
  });

  test("Regular USER can access /account/account-profile", async ({ page }) => {
    test.skip(!userEmail || !userPassword, "E2E_USER_EMAIL/PASSWORD not configured");

    // Login as user
    await loginUI(page, userEmail!, userPassword!);
    await page.waitForTimeout(1000);

    // Navigate to account profile
    await page.goto("/account/account-profile", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    // Should stay on /account (not redirected to /auth/login)
    const url = page.url();
    expect(url).toMatch(/\/account/i);
    expect(url).not.toMatch(/\/auth\/login/i);

    // Should see profile-related UI
    const profileIndicators = [
      page.getByRole('heading', { name: /hồ sơ|profile|thông tin|tài khoản/i }),
      page.locator('text=/email|họ tên|full name/i'),
    ];

    let foundIndicator = false;
    for (const indicator of profileIndicators) {
      if ((await indicator.count()) > 0) {
        foundIndicator = true;
        break;
      }
    }

    if (!foundIndicator) {
      // Fallback: just verify we're on the right route
      expect(page.url()).toContain("/account");
    }
  });
});
