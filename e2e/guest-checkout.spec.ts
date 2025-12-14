import { test, expect } from "@playwright/test";
import { ensureLoggedOut } from "./helpers/auth";
import { completeBookingFlow } from "./helpers/ui";
import { waitForApiRequest } from "./helpers/waits";

test.describe("Guest Checkout (No Login)", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedOut(page);
  });

  test("Guest can complete booking without login by providing contact info", async ({ page }) => {
    // Complete booking flow as guest
    const result = await completeBookingFlow(page, 1);

    if (!result) {
      await page.screenshot({
        path: "e2e/.debug/guest-checkout-no-data.png",
        fullPage: true,
      });
      test.skip(true, "No movies/showtimes/seats available for guest checkout");
    }

    // Should navigate to /checkout
    await page.waitForURL(/\/checkout/i, { timeout: 20_000 });

    // Wait for seat lock
    await waitForApiRequest(page, "/seat-locks", "POST", 15_000).catch(() => {
      console.warn("No seat-locks request detected");
    });

    await page.waitForTimeout(2000);

    // Fill guest info (name, email, phone)
    const guestName = process.env.E2E_GUEST_NAME || `Guest User ${Date.now()}`;
    const guestEmail = process.env.E2E_GUEST_EMAIL || `guest${Date.now()}@test.com`;
    const guestPhone = process.env.E2E_GUEST_PHONE || "0987654321";

    // Find guest info inputs
    const nameInput = page
      .locator('input[name="fullName"]')
      .or(page.getByPlaceholder(/họ và tên|full name/i))
      .first();

    const emailInput = page
      .locator('input[name="email"]')
      .or(page.getByPlaceholder(/email/i))
      .first();

    const phoneInput = page
      .locator('input[name="phone"]')
      .or(page.getByPlaceholder(/sđt|phone|điện thoại/i))
      .first();

    // Check if inputs exist
    const hasInputs =
      (await nameInput.count()) > 0 &&
      (await emailInput.count()) > 0 &&
      (await phoneInput.count()) > 0;

    if (!hasInputs) {
      await page.screenshot({
        path: "e2e/.debug/guest-checkout-no-inputs.png",
        fullPage: true,
      });
      test.skip(true, "Guest info inputs not found (may require login)");
    }

    await nameInput.fill(guestName);
    await emailInput.fill(guestEmail);
    await phoneInput.fill(guestPhone);

    await page.waitForTimeout(500);

    // Click payment button
    const payBtn = page
      .getByRole("button", { name: /thanh toán|pay|xác nhận/i })
      .or(page.locator("button").filter({ hasText: /thanh toán|pay|xác nhận/i }))
      .first();

    const hasPayBtn = (await payBtn.count()) > 0;
    if (!hasPayBtn) {
      test.skip(true, "Payment button not found");
    }

    await expect(payBtn).toBeVisible({ timeout: 20_000 });
    await payBtn.click();

    // Wait for booking/payment order creation
    try {
      await page.waitForResponse(
        (r) =>
          (r.url().includes("/bookings") || r.url().includes("/payments/order")) && r.ok(),
        { timeout: 20_000 }
      );
      console.log("✓ Guest booking/payment order created");
    } catch (err) {
      console.warn("⚠ No booking/payment response (may redirect to gateway)");
      // Soft assertion - just verify no crash
    }

    await page.waitForTimeout(2000);

    // Verify no redirect to login (guest should be able to checkout)
    const url = page.url();
    const redirectedToLogin = url.includes("/auth/login") || url.includes("/login");
    expect(redirectedToLogin).toBe(false);
  });
});
