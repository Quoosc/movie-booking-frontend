import { test, expect } from "@playwright/test";
import { loginUI, ensureLoggedOut } from "./helpers/auth";
import { pickAnyMovieGoDetail, pickAnyShowtime } from "./helpers/ui";

test.describe("Member Benefits & Restrictions", () => {
  const userEmail = process.env.E2E_USER_EMAIL;
  const userPassword = process.env.E2E_USER_PASSWORD;

  test("Guest blocked from selecting MEMBER ticket type", async ({ page }) => {
    await ensureLoggedOut(page);

    const movieId = await pickAnyMovieGoDetail(page);
    if (!movieId) {
      test.skip(true, "No movies available");
    }

    const showtimeId = await pickAnyShowtime(page);
    if (!showtimeId) {
      test.skip(true, "No showtimes available");
    }

    await page.waitForTimeout(1500);

    // Find member ticket card
    const ticketHeading = page.getByRole("heading", { name: /chọn loại vé/i });
    if ((await ticketHeading.count()) === 0) {
      test.skip(true, "No ticket section");
    }

    const ticketSection = page.locator("section", { has: ticketHeading }).first();
    const memberCard = ticketSection
      .locator("div")
      .filter({ hasText: /giá vé thành viên|thành viên|member/i })
      .first();

    const hasMemberTicket = (await memberCard.count()) > 0;
    if (!hasMemberTicket) {
      await page.screenshot({ path: "e2e/.debug/member-no-ticket-type.png", fullPage: true });
      test.skip(true, "No MEMBER ticket type found");
    }

    // Try to click + button on member ticket
    const plusBtn = memberCard.getByRole("button", { name: "+" }).first();
    await plusBtn.click();
    await page.waitForTimeout(1000);

    // Should show warning popup/modal
    const warningModal = page.locator('[role="dialog"]').or(
      page.locator("div").filter({ hasText: /chỉ dành cho|vui lòng đăng nhập|member only/i })
    );

    const hasWarning = (await warningModal.count()) > 0;
    if (!hasWarning) {
      await page.screenshot({
        path: "e2e/.debug/member-guest-no-warning.png",
        fullPage: true,
      });
      console.warn("⚠ No warning shown when guest clicks member ticket +");
    }

    expect(hasWarning).toBe(true);
  });

  test("Logged-in USER can select MEMBER ticket type", async ({ page }) => {
    test.skip(!userEmail || !userPassword, "E2E_USER_EMAIL/PASSWORD not configured");

    await loginUI(page, userEmail!, userPassword!);

    const movieId = await pickAnyMovieGoDetail(page);
    if (!movieId) {
      test.skip(true, "No movies available");
    }

    const showtimeId = await pickAnyShowtime(page);
    if (!showtimeId) {
      test.skip(true, "No showtimes available");
    }

    await page.waitForTimeout(1500);

    const ticketHeading = page.getByRole("heading", { name: /chọn loại vé/i });
    if ((await ticketHeading.count()) === 0) {
      test.skip(true, "No ticket section");
    }

    const ticketSection = page.locator("section", { has: ticketHeading }).first();
    const memberCard = ticketSection
      .locator("div")
      .filter({ hasText: /giá vé thành viên|thành viên|member/i })
      .first();

    if ((await memberCard.count()) === 0) {
      test.skip(true, "No MEMBER ticket type found");
    }

    // Click + button
    const plusBtn = memberCard.getByRole("button", { name: "+" }).first();
    await plusBtn.click();
    await page.waitForTimeout(1000);

    // Should NOT show warning
    const warningModal = page.locator('[role="dialog"]').or(
      page.locator("div").filter({ hasText: /chỉ dành cho|vui lòng đăng nhập/i })
    );

    const hasWarning = (await warningModal.count()) > 0;
    expect(hasWarning).toBe(false);

    // Quantity should increase (or at least no error)
    console.log("✓ User successfully selected member ticket");
  });

  test("User can view booking history after purchase", async ({ page }) => {
    test.skip(!userEmail || !userPassword, "E2E_USER_EMAIL/PASSWORD not configured");

    await loginUI(page, userEmail!, userPassword!);

    // Navigate to booking history
    await page.goto("/account/account-history", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Should NOT redirect to login
    expect(page.url()).not.toMatch(/\/auth\/login/i);
    expect(page.url()).toMatch(/\/account\/account-history/i);

    // Check for bookings list or empty state
    const bookingList = page.locator('[data-testid="booking-list"]').or(
      page.locator("table").or(page.locator("ul").filter({ hasText: /booking|đơn hàng/i }))
    );

    const emptyState = page.locator("text=/chưa có|no bookings|empty/i");

    const hasContent = (await bookingList.count()) > 0 || (await emptyState.count()) > 0;
    expect(hasContent).toBe(true);
  });
});
