import { Page, expect } from "@playwright/test";

/**
 * Navigate to any movie detail page
 * Returns movieId if successful, null if no movies available
 */
export async function pickAnyMovieGoDetail(page: Page): Promise<string | null> {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // Find any movie card link
  const movieLink = page
    .locator('[data-testid="movie-card"]')
    .or(
      page.locator('a[href^="/movie/"]').filter({
        hasNot: page.locator(
          'a[href="/movie/movies"],a[href="/movie/moviesShowing"],a[href="/movie/moviesUpComming"]'
        ),
      })
    )
    .first();

  const count = await movieLink.count();
  if (count === 0) {
    return null;
  }

  // Extract movieId from href before clicking
  const href = await movieLink.getAttribute("href");
  const movieId = href?.match(/\/movie\/([^/?\#]+)/)?.[1] || null;

  await movieLink.click();
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1000);

  // Verify we're on movie detail page
  await expect(page).toHaveURL(/\/movie\/[^/]+$/);

  return movieId;
}

/**
 * Pick any available showtime on current movie detail page
 * Returns showtimeId if successful, null if no showtimes
 */
export async function pickAnyShowtime(page: Page): Promise<string | null> {
  const showtimeHeading = page.getByRole("heading", { name: /lịch chiếu theo rạp/i });
  const hasHeading = (await showtimeHeading.count()) > 0;

  if (!hasHeading) {
    return null;
  }

  const section = page.locator("section", { has: showtimeHeading }).first();

  // Try to find showtime button (giờ dạng HH:mm)
  let showtimeBtn = section.locator("button", { hasText: /\b\d{1,2}:\d{2}\b/ }).first();

  if ((await showtimeBtn.count()) > 0) {
    // Extract showtimeId from button (may have data-showtime-id or onclick)
    const showtimeId = await showtimeBtn.getAttribute("data-showtime-id");
    await showtimeBtn.click();
    await page.waitForTimeout(1000);
    return showtimeId || "unknown";
  }

  // Try clicking date buttons to find showtimes
  const dateButtons = section.locator("button").filter({
    hasText: /(hôm nay|\b\d{1,2}\/\d{1,2}\b|t[2-7]|cn)/i,
  });

  const n = await dateButtons.count();
  const tries = Math.min(n, 7);

  for (let i = 0; i < tries; i++) {
    await dateButtons.nth(i).click();
    await page.waitForTimeout(800);

    showtimeBtn = section.locator("button", { hasText: /\b\d{1,2}:\d{2}\b/ }).first();
    if ((await showtimeBtn.count()) > 0) {
      const showtimeId = await showtimeBtn.getAttribute("data-showtime-id");
      await showtimeBtn.click();
      await page.waitForTimeout(1000);
      return showtimeId || "unknown";
    }
  }

  return null;
}

/**
 * Pick ticket quantity (click + button)
 * @param qty Number of tickets to add (default 1)
 * @param ticketLabel Optional label to target specific ticket type (e.g., "NGƯỜI LỚN", "THÀNH VIÊN")
 */
export async function pickTicketQuantity(
  page: Page,
  qty: number = 1,
  ticketLabel?: string
): Promise<boolean> {
  const ticketHeading = page.getByRole("heading", { name: /chọn loại vé/i });
  const hasHeading = (await ticketHeading.count()) > 0;

  if (!hasHeading) {
    return false;
  }

  const ticketSection = page.locator("section", { has: ticketHeading }).first();

  let plusBtn;
  if (ticketLabel) {
    // Find specific ticket type by label
    const ticketCard = ticketSection
      .locator("div")
      .filter({ hasText: new RegExp(ticketLabel, "i") })
      .first();
    plusBtn = ticketCard.getByRole("button", { name: "+" }).first();
  } else {
    // Use first available + button
    plusBtn = ticketSection.getByRole("button", { name: "+" }).first();
  }

  const hasBtn = (await plusBtn.count()) > 0;
  if (!hasBtn) {
    return false;
  }

  // Click + button qty times
  for (let i = 0; i < qty; i++) {
    await plusBtn.click();
    await page.waitForTimeout(300);
  }

  return true;
}

/**
 * Pick any available seats
 * @param count Number of seats to select
 */
export async function pickAnyAvailableSeat(page: Page, count: number = 1): Promise<string[]> {
  // Wait for screen label
  const screenLabel = page.getByText(/^Màn hình$/i).first();
  const hasScreen = (await screenLabel.count()) > 0;

  if (!hasScreen) {
    return [];
  }

  // Find available seats (not disabled)
  const seatButtons = page
    .locator("button:not([disabled])")
    .filter({ hasText: /^(?:[A-J]\d{1,2}|\d{1,2})$/ });

  const availableCount = await seatButtons.count();
  if (availableCount === 0) {
    return [];
  }

  const toSelect = Math.min(count, availableCount);
  const selectedSeats: string[] = [];

  for (let i = 0; i < toSelect; i++) {
    const btn = seatButtons.nth(i);
    const seatLabel = await btn.textContent();
    await btn.click();
    await page.waitForTimeout(300);
    if (seatLabel) {
      selectedSeats.push(seatLabel);
    }
  }

  return selectedSeats;
}

/**
 * Click "ĐẶT VÉ NGAY" CTA button
 */
export async function clickBookNowCTA(page: Page): Promise<boolean> {
  const ctaBtn = page.getByRole("button", { name: /đặt vé ngay/i }).first();
  const hasBtn = (await ctaBtn.count()) > 0;

  if (!hasBtn) {
    return false;
  }

  const isEnabled = await ctaBtn.isEnabled();
  if (!isEnabled) {
    return false;
  }

  await ctaBtn.click();
  return true;
}

/**
 * Complete full booking flow: movie -> showtime -> tickets -> seats -> checkout
 * Returns null if any step fails (for graceful skip)
 */
export async function completeBookingFlow(
  page: Page,
  ticketQty: number = 1,
  seatCount?: number
): Promise<{ movieId: string; showtimeId: string; seats: string[] } | null> {
  // 1. Pick movie
  const movieId = await pickAnyMovieGoDetail(page);
  if (!movieId) return null;

  // 2. Pick showtime
  const showtimeId = await pickAnyShowtime(page);
  if (!showtimeId) return null;

  // 3. Pick tickets
  const hasTickets = await pickTicketQuantity(page, ticketQty);
  if (!hasTickets) return null;

  // 4. Pick seats
  const seats = await pickAnyAvailableSeat(page, seatCount || ticketQty);
  if (seats.length === 0) return null;

  // 5. Click CTA
  const clicked = await clickBookNowCTA(page);
  if (!clicked) return null;

  // 6. Wait for checkout
  await page.waitForURL(/\/checkout/i, { timeout: 20_000 });

  return { movieId, showtimeId, seats };
}
