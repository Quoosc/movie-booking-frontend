import { Page } from "@playwright/test";

/**
 * Kiểm tra xem trang có movie cards không
 * Return true nếu có ít nhất 1 movie card clickable
 */
export async function ensureHasMovies(page: Page): Promise<boolean> {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // Tìm movie cards theo nhiều cách
  const movieCard = page
    .locator('[data-testid="movie-card"]')
    .or(page.locator('a[href^="/movie/"]').filter({
      hasNot: page.locator(
        'a[href="/movie/movies"],a[href="/movie/moviesShowing"],a[href="/movie/moviesUpComming"]'
      ),
    }))
    .first();

  return (await movieCard.count()) > 0;
}

/**
 * Kiểm tra xem movie detail page có showtime không
 * Cần đảm bảo đã ở trên /movie/:id trước khi gọi
 */
export async function ensureHasShowtimes(page: Page): Promise<boolean> {
  // Tìm section lịch chiếu
  const showtimeHeading = page.getByRole("heading", { name: /lịch chiếu theo rạp/i });
  const hasHeading = (await showtimeHeading.count()) > 0;
  
  if (!hasHeading) {
    return false;
  }

  const section = page.locator("section", { has: showtimeHeading }).first();

  // Kiểm tra có showtime button không (giờ dạng HH:mm)
  const showtimeBtn = section.locator("button", { hasText: /\b\d{1,2}:\d{2}\b/ }).first();
  if ((await showtimeBtn.count()) > 0) {
    return true;
  }

  // Thử click các nút ngày để tìm showtime
  const dateButtons = section.locator("button").filter({
    hasText: /(hôm nay|\b\d{1,2}\/\d{1,2}\b|t[2-7]|cn)/i,
  });

  const n = await dateButtons.count();
  const tries = Math.min(n, 7);

  for (let i = 0; i < tries; i++) {
    await dateButtons.nth(i).click();
    await page.waitForTimeout(500);

    const btn = section.locator("button", { hasText: /\b\d{1,2}:\d{2}\b/ }).first();
    if ((await btn.count()) > 0) {
      return true;
    }
  }

  return false;
}

/**
 * Kiểm tra xem booking page có ghế clickable không
 */
export async function ensureCanSelectSeat(page: Page): Promise<boolean> {
  // Chờ screen label xuất hiện
  const screenLabel = page.getByText(/^Màn hình$/i).first();
  const hasScreen = (await screenLabel.count()) > 0;

  if (!hasScreen) {
    return false;
  }

  // Tìm ghế không disabled
  const seatBtn = page
    .locator("button:not([disabled])")
    .filter({ hasText: /^(?:[A-J]\d{1,2}|\d{1,2})$/ })
    .first();

  return (await seatBtn.count()) > 0;
}

/**
 * Kiểm tra xem có ticket types để chọn không
 */
export async function ensureHasTicketTypes(page: Page): Promise<boolean> {
  const ticketHeading = page.getByRole("heading", { name: /chọn loại vé/i });
  const hasHeading = (await ticketHeading.count()) > 0;

  if (!hasHeading) {
    return false;
  }

  const ticketSection = page.locator("section", { has: ticketHeading }).first();
  const plusBtn = ticketSection.getByRole("button", { name: "+" }).first();

  return (await plusBtn.count()) > 0;
}
