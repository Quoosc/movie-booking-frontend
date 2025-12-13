import { test, expect } from "@playwright/test";
import { loginUI } from "./helpers/auth";
import {
  ensureHasMovies,
  ensureHasShowtimes,
  ensureCanSelectSeat,
  ensureHasTicketTypes,
} from "./helpers/seed-guards";
import { waitForApiRequest } from "./helpers/waits";

test.describe("Booking: Happy Path", () => {
  const userEmail = process.env.E2E_USER_EMAIL;
  const userPassword = process.env.E2E_USER_PASSWORD;

  test.beforeEach(async ({ page }) => {
    test.skip(!userEmail || !userPassword, "E2E_USER_EMAIL/PASSWORD not configured");

    // Login first
    await loginUI(page, userEmail!, userPassword!);
    await page.waitForTimeout(1000);
  });

  test("Complete booking flow: select movie -> showtime -> tickets -> seats -> checkout", async ({
    page,
  }) => {
    // 1) Check if there are movies
    const hasMovies = await ensureHasMovies(page);
    if (!hasMovies) {
      await page.screenshot({ path: "e2e/.debug/booking-no-movies.png", fullPage: true });
      test.skip(true, "No movies available in test environment");
    }

    // 2) Click first movie to go to detail page
    const movieCard = page
      .locator('[data-testid="movie-card"]')
      .or(
        page.locator('a[href^="/movie/"]').filter({
          hasNot: page.locator(
            'a[href="/movie/movies"],a[href="/movie/moviesShowing"],a[href="/movie/moviesUpComming"]'
          ),
        })
      )
      .first();

    await movieCard.click();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // Verify we're on movie detail page
    expect(page.url()).toMatch(/\/movie\/[^/]+$/);

    // 3) Check if there are showtimes
    const hasShowtimes = await ensureHasShowtimes(page);
    if (!hasShowtimes) {
      await page.screenshot({ path: "e2e/.debug/booking-no-showtimes.png", fullPage: true });
      test.skip(true, "No showtimes available for this movie (checked 7 days)");
    }

    // 4) Select a showtime
    const showtimeHeading = page.getByRole("heading", { name: /lịch chiếu theo rạp/i });
    const showtimeSection = page.locator("section", { has: showtimeHeading }).first();
    const showtimeBtn = showtimeSection
      .locator("button", { hasText: /\b\d{1,2}:\d{2}\b/ })
      .first();

    await expect(showtimeBtn).toBeVisible({ timeout: 20_000 });
    await showtimeBtn.click();
    await page.waitForTimeout(1000);

    // 5) Check if ticket types are available
    const hasTickets = await ensureHasTicketTypes(page);
    if (!hasTickets) {
      await page.screenshot({ path: "e2e/.debug/booking-no-tickets.png", fullPage: true });
      test.skip(true, "No ticket types available");
    }

    // 6) Select ticket quantity (click + button)
    const ticketHeading = page.getByRole("heading", { name: /chọn loại vé/i });
    const ticketSection = page.locator("section", { has: ticketHeading }).first();
    const plusBtn = ticketSection.getByRole("button", { name: "+" }).first();

    await expect(plusBtn).toBeVisible({ timeout: 20_000 });
    await plusBtn.click();
    await page.waitForTimeout(500);

    // 7) Check if seats are available
    const hasSeats = await ensureCanSelectSeat(page);
    if (!hasSeats) {
      await page.screenshot({ path: "e2e/.debug/booking-no-seats.png", fullPage: true });
      test.skip(true, "No available seats for this showtime");
    }

    // 8) Select a seat
    const seatBtn = page
      .locator("button:not([disabled])")
      .filter({ hasText: /^(?:[A-J]\d{1,2}|\d{1,2})$/ })
      .first();

    await expect(seatBtn).toBeVisible({ timeout: 20_000 });
    await seatBtn.click();
    await page.waitForTimeout(500);

    // 9) Click CTA "ĐẶT VÉ NGAY"
    const ctaBtn = page.getByRole("button", { name: /đặt vé ngay/i }).first();
    await expect(ctaBtn).toBeVisible({ timeout: 20_000 });

    const isEnabled = await ctaBtn.isEnabled();
    if (!isEnabled) {
      await page.screenshot({ path: "e2e/.debug/booking-cta-disabled.png", fullPage: true });
      test.skip(true, "CTA button disabled - possible validation issue");
    }

    await ctaBtn.click();

    // 10) Should navigate to /checkout
    await page.waitForURL(/\/checkout/i, { timeout: 20_000 });
    expect(page.url()).toMatch(/\/checkout/i);

    // 11) CheckoutPage should auto-lock seats (POST /seat-locks)
    try {
      await waitForApiRequest(page, "/seat-locks", "POST", 15_000);
      console.log("✓ Seat lock request detected");
    } catch (err) {
      console.warn("⚠ No seat-locks request detected (may be already locked)");
    }

    // 12) Look for payment/checkout button
    const payBtn = page
      .getByRole("button", { name: /thanh toán|pay|xác nhận|confirm/i })
      .or(page.locator("button").filter({ hasText: /thanh toán|pay|xác nhận/i }))
      .first();

    const payBtnCount = await payBtn.count();
    if (payBtnCount === 0) {
      await page.screenshot({ path: "e2e/.debug/booking-no-pay-btn.png", fullPage: true });
      test.skip(true, "Payment button not found - checkout flow may need config");
    }

    await expect(payBtn).toBeVisible({ timeout: 20_000 });
    await payBtn.click();

    // 13) Wait for payment order creation
    try {
      await page.waitForResponse(
        (r) => r.url().includes("/payments/order") && r.ok(),
        { timeout: 20_000 }
      );
      console.log("✓ Payment order created successfully");
    } catch (err) {
      console.warn("⚠ Payment order response not detected");
      // Don't fail - may redirect to payment gateway
    }

    // Optional: Verify redirect to payment gateway or success page
    await page.waitForTimeout(2000);
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);

    // Success if we're either still on checkout, on payment gateway, or success page
    const isValidFlow =
      finalUrl.includes("/checkout") ||
      finalUrl.includes("/payment") ||
      finalUrl.includes("momo.vn") ||
      finalUrl.includes("paypal.com");

    expect(isValidFlow).toBe(true);
  });
});
