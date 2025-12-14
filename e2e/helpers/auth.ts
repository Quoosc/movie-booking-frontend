import { expect, Page } from "@playwright/test";

export async function loginUI(page: Page, email: string, password: string) {
  await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // Login form uses custom TextInput with name="email" and name="password"
  const emailInput = page.locator('input[name="email"]').or(page.getByPlaceholder(/email/i));
  const passwordInput = page.locator('input[name="password"]').or(page.getByPlaceholder(/password|mật khẩu/i));

  await expect(emailInput).toBeVisible({ timeout: 10_000 });
  await expect(passwordInput).toBeVisible({ timeout: 10_000 });

  await emailInput.fill(email);
  await passwordInput.fill(password);

  // Use exact match or type=submit to avoid matching "Đăng nhập với Google/Facebook/Instagram"
  const loginBtn = page.locator('button[type="submit"]').first().or(
    page.getByRole("button", { name: "Đăng nhập", exact: true })
  );
  await expect(loginBtn).toBeVisible({ timeout: 10_000 });
  
  await loginBtn.click();
  await page.waitForLoadState("networkidle", { timeout: 20_000 });
  
  // Allow time for redirect
  await page.waitForTimeout(1500);
  
  // Should NOT be on login page anymore (either /, /admin, or protected route)
  const currentUrl = page.url();
  const stillOnLogin = currentUrl.includes("/auth/login") || currentUrl.includes("/login");
  
  if (stillOnLogin) {
    // May have error - take screenshot for debugging
    await page.screenshot({ path: "e2e/.debug/login-failed.png" });
  }
  
  await expect(page).not.toHaveURL(/\/auth\/login|\/login/i);
}

export async function logoutUI(page: Page) {
  // Tìm user menu/avatar để mở dropdown
  const userMenu = page.locator('[data-testid="user-menu"]').or(
    page.getByRole('button').filter({ hasText: /tài khoản|account|profile/i })
  ).first();

  if (await userMenu.count() > 0) {
    await userMenu.click();
    await page.waitForTimeout(500);
  }

  // Click nút logout - check if exists first
  const logoutBtn = page.getByRole('button', { name: /đăng xuất|logout/i }).or(
    page.locator('button').filter({ hasText: /đăng xuất|logout/i })
  ).first();

  // If logout button doesn't exist, user might not be logged in
  if (await logoutBtn.count() === 0) {
    return; // Already logged out
  }

  // Scroll into view first
  await logoutBtn.scrollIntoViewIfNeeded({ timeout: 10_000 });
  await expect(logoutBtn).toBeVisible({ timeout: 10_000 });
  // Force click to bypass viewport/overlay issues
  await logoutBtn.click({ force: true, timeout: 10_000 });
  await page.waitForLoadState('networkidle');
}

export async function isLoggedIn(page: Page): Promise<boolean> {
  // Kiểm tra xem user có đang login không
  // Cách 1: Kiểm tra UI có user menu/avatar
  const userMenu = page.locator('[data-testid="user-menu"]').or(
    page.getByRole('button').filter({ hasText: /tài khoản|account/i })
  ).first();

  if (await userMenu.count() > 0) {
    return true;
  }

  // Cách 2: Thử navigate đến protected route
  const currentUrl = page.url();
  await page.goto('/account/account-profile', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  
  const isProtectedPage = !page.url().includes('/login') && page.url().includes('/account');
  
  // Restore original URL
  if (currentUrl !== page.url()) {
    await page.goto(currentUrl, { waitUntil: 'domcontentloaded' });
  }

  return isProtectedPage;
}

export async function ensureLoggedOut(page: Page) {
  // Check if there's a logout button visible
  const logoutExists = await page.getByRole('button', { name: /đăng xuất|logout/i }).or(
    page.locator('button').filter({ hasText: /đăng xuất|logout/i })
  ).count() > 0;
  
  if (logoutExists) {
    await logoutUI(page);
  }
  // If no logout button, assume already logged out
  
  // Verify logged out
  await page.waitForTimeout(500);
  const stillLoggedIn = await isLoggedIn(page);
  if (stillLoggedIn) {
    // Clear cookies as fallback
    await page.context().clearCookies();
    await page.goto("/", { waitUntil: "domcontentloaded" });
  }
}
