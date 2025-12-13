import { expect, Page } from "@playwright/test";

export async function loginUI(page: Page, email: string, password: string) {
  await page.goto("/login");

  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);

  await Promise.all([
    page.waitForLoadState("networkidle"),
    page.getByRole("button", { name: /đăng nhập|login/i }).click(),
  ]);
  await expect(page).not.toHaveURL(/\/login/i);
}
