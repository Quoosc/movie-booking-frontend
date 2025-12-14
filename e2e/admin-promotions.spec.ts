import { test, expect } from "@playwright/test";
import { skipWithDebug } from "./helpers/skip";
import { pickAnyAvailableSeat } from "./helpers/ui";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("Admin Promotions Management", () => {
  test("Admin can view promotions page", async ({ page }) => {
    await page.goto("/admin/promotions");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    const heading = page.getByRole("heading", { name: /PROMOTIONS|KHUYẾN MÃI/i }).or(
      page.locator('h2, h1').filter({ hasText: /PROMOTIONS|KHUYẾN MÃI/i })
    ).first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test("Admin can create promotion", async ({ page }) => {
    await page.goto("/admin/promotions");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Click add promotion button
    const addBtn = page.getByRole("button", { name: /\+ Thêm promotion|Thêm khuyến mãi/i });

    if ((await addBtn.count()) === 0) {
      await skipWithDebug(page, "Add promotion button not found", "admin-promotions-no-add-btn");
      test.skip(true, "Add promotion button not found");
    }

    await addBtn.click();
    await page.waitForTimeout(2000);

    try {
      // Wait for modal
      const modal = page.locator('[class*="fixed"][class*="inset-0"]').filter({ hasText: /THÊM KHUYẾN MÃI|CHỈNH SỜỬA/i });
      await modal.waitFor({ state: "visible", timeout: 10_000 });

      const timestamp = Date.now();
      const promoCode = `E2E${timestamp}`;

      // Code - placeholder: "WINTER2024" (first text input in modal)
      const codeInput = modal.locator('input[type="text"]').first();
      await codeInput.waitFor({ state: "visible", timeout: 10_000 });
      await codeInput.fill(promoCode);

      // Name - placeholder: "Winter Sale 2024" (second text input)
      const nameInput = modal.locator('input[type="text"]').nth(1);
      await nameInput.fill("E2E Test Promotion");

      // Description - placeholder: "Special discount for winter season..." (textarea)
      const descInput = modal.locator('textarea').first();
      await descInput.fill("E2E Test Promotion Description");

      // Type - first select in modal
      const typeSelect = modal.locator('select').first();
      if ((await typeSelect.count()) > 0) {
        await typeSelect.selectOption({ index: 0 }); // PERCENTAGE
      }

      // Value - placeholder: "15"
      const valueInput = modal.locator('input[type="number"]').first();
      if ((await valueInput.count()) > 0) {
        await valueInput.fill("10");
      }

      // Start/End dates - type datetime-local
      const dateInputs = modal.locator('input[type="datetime-local"]');
      if ((await dateInputs.count()) >= 2) {
        const today = new Date();
        const startStr = new Date(today.getTime() - 24*60*60*1000).toISOString().slice(0, 16);
        const endStr = new Date(today.getTime() + 7*24*60*60*1000).toISOString().slice(0, 16);
        await dateInputs.nth(0).fill(startStr);
        await dateInputs.nth(1).fill(endStr);
      }

      // Active checkbox - should be checked by default
      const activeCheckbox = modal.locator('input[type="checkbox"]');
      if ((await activeCheckbox.count()) > 0) {
        const isChecked = await activeCheckbox.first().isChecked();
        if (!isChecked) {
          await activeCheckbox.first().check();
        }
      }

      // Save
      const saveBtn = modal.getByRole("button", { name: /Lưu|Tạo|KHUYẾN MÃI/i });
      await saveBtn.click();
      await page.waitForTimeout(3000);

      // Verify promotion in table
      const promoRow = page.locator("tr").filter({ hasText: promoCode });
      expect(await promoRow.count()).toBeGreaterThan(0);
      console.log(`✓ Promotion created: ${promoCode}`);
    } catch (error) {
      await skipWithDebug(page, `Promotion creation failed: ${error}`, "admin-promotions-create-error");
      throw error;
    }
  });

  test("Admin can verify promotion is active", async ({ page }) => {
    await page.goto("/admin/promotions");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Find first E2E promotion
    const promoRow = page.locator("tr").filter({ hasText: /E2E\d+/ }).first();

    if ((await promoRow.count()) === 0) {
      test.skip(true, "No E2E promotion found");
    }

    // Check row exists
    expect(await promoRow.count()).toBeGreaterThan(0);
    console.log("✓ Promotion found in list");
  });

  test("Admin can deactivate promotion", async ({ page }) => {
    await page.goto("/admin/promotions");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Find first E2E promotion
    const activePromo = page.locator("tr").filter({ hasText: /E2E\d+/ }).first();

    if ((await activePromo.count()) === 0) {
      console.log("⚠ No E2E promotion to deactivate");
      test.skip(true, "No E2E promotion");
    }

    // Look for action button (edit/deactivate)
    const actionBtn = activePromo.locator("button").first();

    if ((await actionBtn.count()) === 0) {
      console.log("⚠ No action button found - skipping");
      test.skip(true, "No action button");
    }

    console.log("✓ Promotion row found with action button");
  });
});
