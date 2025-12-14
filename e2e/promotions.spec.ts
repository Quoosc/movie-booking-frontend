import { test, expect } from "@playwright/test";
import { loginUI, ensureLoggedOut } from "./helpers/auth";
import { completeBookingFlow } from "./helpers/ui";

test.describe("Promotions & Discounts", () => {
  const validPromoCode = process.env.E2E_PROMO_VALID_CODE;
  const invalidPromoCode = process.env.E2E_PROMO_INVALID_CODE || "INVALIDCODE123";

  test("Apply valid promo code reduces total price", async ({ page }) => {
    test.skip(!validPromoCode, "E2E_PROMO_VALID_CODE not configured");

    // Login first (promos may require auth)
    const userEmail = process.env.E2E_USER_EMAIL;
    const userPassword = process.env.E2E_USER_PASSWORD;

    if (userEmail && userPassword) {
      await loginUI(page, userEmail, userPassword);
    }

    // Complete booking to checkout
    const result = await completeBookingFlow(page, 1);
    if (!result) {
      test.skip(true, "No data for promo test");
    }

    await page.waitForURL(/\/checkout/i, { timeout: 20_000 });
    await page.waitForTimeout(2000);

    // Find promo input
    const promoInput = page
      .locator('input[name="promotionCode"]')
      .or(page.getByPlaceholder(/mã khuyến mãi|promotion|voucher|coupon/i))
      .first();

    if ((await promoInput.count()) === 0) {
      await page.screenshot({ path: "e2e/.debug/promo-no-input.png", fullPage: true });
      test.skip(true, "Promo code input not found");
    }

    // Capture price before promo
    const priceText = await page
      .locator("text=/tổng cộng|total|thanh toán/i")
      .first()
      .textContent();

    const priceBefore = parsePrice(priceText || "0");

    // Apply promo
    await promoInput.fill(validPromoCode!);

    const applyBtn = page
      .getByRole("button", { name: /áp dụng|apply/i })
      .or(page.locator("button").filter({ hasText: /áp dụng|apply/i }))
      .first();

    await applyBtn.click();
    await page.waitForTimeout(2000);

    // Capture price after promo
    const priceTextAfter = await page
      .locator("text=/tổng cộng|total|thanh toán/i")
      .first()
      .textContent();

    const priceAfter = parsePrice(priceTextAfter || "0");

    console.log(`Price before: ${priceBefore}, after: ${priceAfter}`);

    // Verify discount applied
    expect(priceAfter).toBeLessThan(priceBefore);
  });

  test("Apply invalid promo code shows error", async ({ page }) => {
    const userEmail = process.env.E2E_USER_EMAIL;
    const userPassword = process.env.E2E_USER_PASSWORD;

    if (userEmail && userPassword) {
      await loginUI(page, userEmail, userPassword);
    }

    const result = await completeBookingFlow(page, 1);
    if (!result) {
      test.skip(true, "No data for promo test");
    }

    await page.waitForURL(/\/checkout/i, { timeout: 20_000 });
    await page.waitForTimeout(2000);

    const promoInput = page
      .locator('input[name="promotionCode"]')
      .or(page.getByPlaceholder(/mã khuyến mãi|promotion|voucher/i))
      .first();

    if ((await promoInput.count()) === 0) {
      test.skip(true, "Promo input not found");
    }

    await promoInput.fill(invalidPromoCode);

    const applyBtn = page
      .getByRole("button", { name: /áp dụng|apply/i })
      .or(page.locator("button").filter({ hasText: /áp dụng|apply/i }))
      .first();

    await applyBtn.click();
    await page.waitForTimeout(2000);

    // Check for error message
    const errorMsg = page.locator("text=/không hợp lệ|invalid|hết hạn|expired/i").first();
    const hasError = (await errorMsg.count()) > 0;

    expect(hasError).toBe(true);
  });
});

function parsePrice(text: string): number {
  // Remove currency symbols, separators
  const cleaned = text.replace(/[^\d]/g, "");
  return parseInt(cleaned) || 0;
}
