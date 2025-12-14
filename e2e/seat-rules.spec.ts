import { test, expect } from "@playwright/test";
import { ensureLoggedOut } from "./helpers/auth";
import { pickAnyMovieGoDetail, pickAnyShowtime, pickTicketQuantity } from "./helpers/ui";

test.describe("Seat Selection Rules", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedOut(page);
  });

  test("Couple seats must be selected together (pair constraint)", async ({ page }) => {
    const movieId = await pickAnyMovieGoDetail(page);
    if (!movieId) {
      test.skip(true, "No movies available");
    }

    const showtimeId = await pickAnyShowtime(page);
    if (!showtimeId) {
      test.skip(true, "No showtimes available");
    }

    await pickTicketQuantity(page, 1);
    await page.waitForTimeout(1500);

    // Check for seat map
    const seatHeading = page.getByRole("heading", { name: /chọn ghế|select seat/i });
    if ((await seatHeading.count()) === 0) {
      await page.screenshot({ path: "e2e/.debug/seat-rules-no-section.png", fullPage: true });
      test.skip(true, "No seat selection section");
    }

    const seatSection = page.locator("section", { has: seatHeading }).first();

    // Look for couple seat (usually marked with special color or icon)
    const coupleSeat = seatSection
      .locator("button")
      .filter({ hasText: /couple|đôi/i })
      .or(
        seatSection
          .locator("button")
          .filter({ has: page.locator('[data-couple="true"]') })
      )
      .first();

    if ((await coupleSeat.count()) === 0) {
      await page.screenshot({ path: "e2e/.debug/seat-rules-no-couple-seat.png", fullPage: true });
      test.skip(true, "No couple seat found");
    }

    // Click couple seat
    await coupleSeat.click();
    await page.waitForTimeout(1000);

    // Should trigger warning/error about needing to select both seats
    const warningText = page
      .locator("text=/ghế đôi phải chọn cùng lúc|couple seats must be selected together/i")
      .or(page.locator('[role="alert"]'))
      .or(page.locator("div").filter({ hasText: /phải chọn 2 ghế/i }));

    const hasWarning = (await warningText.count()) > 0;
    if (!hasWarning) {
      await page.screenshot({
        path: "e2e/.debug/seat-rules-couple-no-warning.png",
        fullPage: true,
      });
      console.warn("⚠ No warning shown when selecting single couple seat");
    }

    expect(hasWarning).toBe(true);
  });

  test("Cannot select more seats than ticket quantity", async ({ page }) => {
    const movieId = await pickAnyMovieGoDetail(page);
    if (!movieId) {
      test.skip(true, "No movies available");
    }

    const showtimeId = await pickAnyShowtime(page);
    if (!showtimeId) {
      test.skip(true, "No showtimes available");
    }

    // Select 2 tickets
    await pickTicketQuantity(page, 2);
    await page.waitForTimeout(1500);

    const seatHeading = page.getByRole("heading", { name: /chọn ghế|select seat/i });
    if ((await seatHeading.count()) === 0) {
      test.skip(true, "No seat selection section");
    }

    const seatSection = page.locator("section", { has: seatHeading }).first();

    // Find available seats
    const availableSeats = seatSection
      .locator("button")
      .filter({ hasNot: page.locator('[disabled]') })
      .filter({ hasNot: page.locator('.selected') });

    const seatCount = await availableSeats.count();
    if (seatCount < 3) {
      test.skip(true, "Not enough seats to test constraint");
    }

    // Select 2 seats (should be OK)
    await availableSeats.nth(0).click();
    await page.waitForTimeout(500);
    await availableSeats.nth(1).click();
    await page.waitForTimeout(500);

    // Try to select 3rd seat (should be blocked or show warning)
    await availableSeats.nth(2).click();
    await page.waitForTimeout(1000);

    const warningText = page
      .locator("text=/đã đủ số lượng|maximum seats|cannot select more/i")
      .or(page.locator('[role="alert"]'));

    const hasWarning = (await warningText.count()) > 0;

    // OR check if 3rd seat is not actually selected
    const selectedSeats = seatSection.locator("button.selected, button[data-selected='true']");
    const selectedCount = await selectedSeats.count();

    expect(selectedCount).toBeLessThanOrEqual(2);
    console.log(`✓ Seat selection constraint enforced: ${selectedCount}/2 seats selected`);
  });

  test("Can deselect and reselect different seats", async ({ page }) => {
    const movieId = await pickAnyMovieGoDetail(page);
    if (!movieId) {
      test.skip(true, "No movies available");
    }

    const showtimeId = await pickAnyShowtime(page);
    if (!showtimeId) {
      test.skip(true, "No showtimes available");
    }

    await pickTicketQuantity(page, 1);
    await page.waitForTimeout(1500);

    const seatHeading = page.getByRole("heading", { name: /chọn ghế|select seat/i });
    if ((await seatHeading.count()) === 0) {
      test.skip(true, "No seat selection section");
    }

    const seatSection = page.locator("section", { has: seatHeading }).first();

    const availableSeats = seatSection
      .locator("button")
      .filter({ hasNot: page.locator('[disabled]') });

    if ((await availableSeats.count()) < 2) {
      test.skip(true, "Not enough seats to test");
    }

    // Select seat 1
    await availableSeats.nth(0).click();
    await page.waitForTimeout(500);

    let selectedSeats = seatSection.locator("button.selected, button[data-selected='true']");
    expect(await selectedSeats.count()).toBe(1);

    // Deselect seat 1
    await availableSeats.nth(0).click();
    await page.waitForTimeout(500);

    selectedSeats = seatSection.locator("button.selected, button[data-selected='true']");
    expect(await selectedSeats.count()).toBe(0);

    // Select seat 2
    await availableSeats.nth(1).click();
    await page.waitForTimeout(500);

    selectedSeats = seatSection.locator("button.selected, button[data-selected='true']");
    expect(await selectedSeats.count()).toBe(1);

    console.log("✓ Seat deselect/reselect works correctly");
  });
});
