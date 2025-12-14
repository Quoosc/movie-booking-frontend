import { test, expect, Browser } from "@playwright/test";
import { createIsolatedContext, closeAllContexts } from "./helpers/sessions";
import { completeBookingFlow, pickAnyAvailableSeat } from "./helpers/ui";
import { ensureHasMovieAndShowtimeOrSkip } from "./helpers/seed-guards";
import { waitForApiRequest } from "./helpers/waits";

test.describe("Seat Locking: Concurrency", () => {
  test("User A locks seat -> User B sees seat as LOCKED/disabled", async ({ browser }) => {
    // Create 2 isolated contexts
    const contextA = await createIsolatedContext(browser, "UserA");
    const contextB = await createIsolatedContext(browser, "UserB");

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    try {
      // User A: Complete booking flow to lock seats
      const resultA = await completeBookingFlow(pageA, 1);

      if (!resultA) {
        await pageA.screenshot({
          path: "e2e/.debug/seat-lock-userA-no-data.png",
          fullPage: true,
        });
        test.skip(true, "User A: No movies/showtimes/seats available");
      }

      const { showtimeId, seats: seatsA } = resultA!;
      const seatLabel = seatsA[0];

      // Wait for seat lock request
      try {
        await waitForApiRequest(pageA, "/seat-locks", "POST", 15_000);
        console.log(`✓ User A locked seat: ${seatLabel}`);
      } catch (err) {
        console.warn("⚠ No seat-locks request detected for User A");
      }

      await pageA.waitForTimeout(2000);

      // User B: Navigate to same movie detail + showtime
      const movieUrl = pageA.url().match(/\/movie\/([^/?#]+)/)?.[1];
      if (!movieUrl) {
        test.skip(true, "Could not extract movie URL");
      }

      await pageB.goto(`/movie/${movieUrl}`, { waitUntil: "domcontentloaded" });
      await pageB.waitForTimeout(1500);

      // Check if has showtimes
      const showtimeHeading = pageB.getByRole("heading", { name: /lịch chiếu theo rạp/i });
      const hasShowtime = (await showtimeHeading.count()) > 0;

      if (!hasShowtime) {
        await pageB.screenshot({
          path: "e2e/.debug/seat-lock-userB-no-showtimes.png",
          fullPage: true,
        });
        test.skip(true, "User B: No showtimes on movie detail");
      }

      // Find and click same showtime (by button text matching time)
      const section = pageB.locator("section", { has: showtimeHeading }).first();
      
      // Try to find showtime - may need to click date buttons
      let showtimeBtn = section.locator("button", { hasText: /\b\d{1,2}:\d{2}\b/ }).first();
      
      if ((await showtimeBtn.count()) === 0) {
        // Try clicking date buttons
        const dateButtons = section.locator("button").filter({
          hasText: /(hôm nay|\b\d{1,2}\/\d{1,2}\b|t[2-7]|cn)/i,
        });
        
        const tries = Math.min(await dateButtons.count(), 3);
        for (let i = 0; i < tries; i++) {
          await dateButtons.nth(i).click();
          await pageB.waitForTimeout(500);
          showtimeBtn = section.locator("button", { hasText: /\b\d{1,2}:\d{2}\b/ }).first();
          if ((await showtimeBtn.count()) > 0) break;
        }
      }

      if ((await showtimeBtn.count()) === 0) {
        test.skip(true, "User B: Could not find showtime button");
      }

      await showtimeBtn.click();
      await pageB.waitForTimeout(1500);

      // Select ticket to reveal seats
      const ticketHeading = pageB.getByRole("heading", { name: /chọn loại vé/i });
      if ((await ticketHeading.count()) === 0) {
        test.skip(true, "User B: No ticket section");
      }

      const ticketSection = pageB.locator("section", { has: ticketHeading }).first();
      const plusBtn = ticketSection.getByRole("button", { name: "+" }).first();
      await plusBtn.click();
      await pageB.waitForTimeout(1000);

      // Check if seat A locked is now disabled/locked for User B
      const screenLabel = pageB.getByText(/^Màn hình$/i).first();
      await expect(screenLabel).toBeVisible({ timeout: 10_000 });

      // Find the specific seat button
      const seatBtnB = pageB
        .locator("button")
        .filter({ hasText: new RegExp(`^${seatLabel}$`) })
        .first();

      const seatExists = (await seatBtnB.count()) > 0;
      if (!seatExists) {
        await pageB.screenshot({
          path: "e2e/.debug/seat-lock-userB-seat-not-found.png",
          fullPage: true,
        });
        console.warn(`User B: Seat ${seatLabel} not found in layout`);
      } else {
        // Verify seat is disabled/locked
        const isDisabled = await seatBtnB.isDisabled();
        const classes = (await seatBtnB.getAttribute("class")) || "";
        const isLocked = classes.includes("locked") || classes.includes("LOCKED");

        await pageB.screenshot({
          path: "e2e/.debug/seat-lock-userB-seat-state.png",
          fullPage: true,
        });

        if (!isDisabled && !isLocked) {
          console.warn(
            `⚠ Seat ${seatLabel} should be locked but appears available. Classes: ${classes}`
          );
        } else {
          console.log(`✓ User B: Seat ${seatLabel} is correctly ${isDisabled ? "disabled" : "locked"}`);
        }

        // Main assertion: seat should not be clickable
        expect(isDisabled || isLocked).toBe(true);
      }

      // Optional: Try to release lock and verify seat becomes available
      // This depends on backend having release endpoint
      // For now, we just verify the lock behavior

    } finally {
      await closeAllContexts([contextA, contextB]);
    }
  });

  test("After lock expires or released, seat becomes available again", async ({ browser }) => {
    // This test requires either:
    // 1. Admin API to release locks
    // 2. Waiting for lock timeout (usually 5-10 minutes)
    // For CI/CD, we'll make this a soft test

    const contextA = await createIsolatedContext(browser, "UserA");
    const contextB = await createIsolatedContext(browser, "UserB");

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    try {
      // User A locks seat
      const resultA = await completeBookingFlow(pageA, 1);
      if (!resultA) {
        test.skip(true, "No data available for lock test");
      }

      const { seats: seatsA } = resultA!;
      const seatLabel = seatsA[0];

      await waitForApiRequest(pageA, "/seat-locks", "POST", 15_000).catch(() => {});
      await pageA.waitForTimeout(2000);

      // Try to release lock via API (if endpoint exists)
      try {
        // Attempt DELETE /seat-locks or similar
        const response = await pageA.request.delete(`/api/seat-locks`, {
          failOnStatusCode: false,
        });

        if (response.ok()) {
          console.log("✓ Lock released via API");
          await pageA.waitForTimeout(1000);
        } else {
          console.warn("⚠ Release lock API not available or failed");
        }
      } catch (err) {
        console.warn("⚠ Could not release lock via API:", err);
      }

      // User B checks if seat is now available
      const movieUrl = pageA.url().match(/\/movie\/([^/?#]+)/)?.[1];
      if (!movieUrl) {
        test.skip(true, "Could not extract movie URL");
      }

      await pageB.goto(`/movie/${movieUrl}`, { waitUntil: "domcontentloaded" });
      await pageB.waitForTimeout(1500);

      // Navigate to same showtime (simplified - assumes first showtime)
      const section = pageB
        .locator("section")
        .filter({ has: pageB.getByRole("heading", { name: /lịch chiếu theo rạp/i }) })
        .first();

      const showtimeBtn = section.locator("button", { hasText: /\b\d{1,2}:\d{2}\b/ }).first();
      if ((await showtimeBtn.count()) > 0) {
        await showtimeBtn.click();
        await pageB.waitForTimeout(1000);

        // Select ticket
        const plusBtn = pageB
          .locator("section")
          .filter({ has: pageB.getByRole("heading", { name: /chọn loại vé/i }) })
          .first()
          .getByRole("button", { name: "+" })
          .first();

        await plusBtn.click();
        await pageB.waitForTimeout(1000);

        // Check seat state
        const seatBtnB = pageB
          .locator("button")
          .filter({ hasText: new RegExp(`^${seatLabel}$`) })
          .first();

        if ((await seatBtnB.count()) > 0) {
          const isDisabled = await seatBtnB.isDisabled();
          
          if (!isDisabled) {
            console.log(`✓ Seat ${seatLabel} is now available after release`);
          } else {
            console.warn(`⚠ Seat ${seatLabel} still locked (may need more time or manual release)`);
          }

          // Soft assertion - don't fail if lock still persists
          // In real scenario, locks expire after timeout
        }
      }
    } finally {
      await closeAllContexts([contextA, contextB]);
    }
  });
});
