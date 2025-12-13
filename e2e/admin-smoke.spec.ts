import { test, expect } from "@playwright/test";

test.use({ storageState: "e2e/.auth/admin.json" });



test("Admin: /admin accessible", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin/i);
});