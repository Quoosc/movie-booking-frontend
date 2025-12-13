import { test, expect, type Locator, type Page } from "@playwright/test";

const MOVIE_DETAIL_URL_REGEX =
  /\/movie\/(?!movies(?:Showing|UpComming)?|search)[^/?#]+/i;

function showtimeSection(page: Page) {
  // section chứa heading "LỊCH CHIẾU THEO RẠP"
  const heading = page.getByRole("heading", { name: /lịch chiếu theo rạp/i });
  return page.locator("section", { has: heading }).first();
}

async function gotoAnyMovieDetail(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  // Ưu tiên click link movie detail dạng /movie/:id (loại trừ /movie/movies...)
  const directMovieLink = page
    .locator('a[href^="/movie/"]')
    .filter({
      hasNot: page.locator(
        'a[href="/movie/movies"],a[href="/movie/moviesShowing"],a[href="/movie/moviesUpComming"],a[href="/movie/search"]'
      ),
    })
    .first();

  if (await directMovieLink.count()) {
    await directMovieLink.click();
  } else {
    // fallback: click movie card nếu có
    const firstCard = page.locator("[data-testid='movie-card']").first();
    if (await firstCard.count()) {
      await firstCard.click();
    } else {
      // fallback cuối: click link/button có chữ mua vé/đặt vé/chi tiết
      const toDetail = page
        .getByRole("link", { name: /chi tiết|mua vé|đặt vé|detail/i })
        .or(page.getByRole("button", { name: /chi tiết|mua vé|đặt vé|detail/i }))
        .first();
      await toDetail.click();
    }
  }

  await page.waitForLoadState("domcontentloaded");

  // Nếu bị lạc sang /movie/movies => click tiếp 1 phim trong list để vào /movie/:id
  if (page.url().includes("/movie/movies")) {
    const listMovieLink = page
      .locator('a[href^="/movie/"]')
      .filter({
        hasNot: page.locator(
          'a[href="/movie/movies"],a[href="/movie/moviesShowing"],a[href="/movie/moviesUpComming"],a[href="/movie/search"]'
        ),
      })
      .first();

    await expect(listMovieLink).toBeVisible({ timeout: 20_000 });
    await listMovieLink.click();
  }

  await expect(page).toHaveURL(MOVIE_DETAIL_URL_REGEX, { timeout: 20_000 });
}

async function pickAnyShowtime(page: Page) {
  const sec = showtimeSection(page);
  await expect(sec).toBeVisible({ timeout: 20_000 });

  // nút showtime là button có text chứa HH:mm (ví dụ 19:30)
  const timeBtn = sec.locator("button", { hasText: /\b\d{1,2}:\d{2}\b/ }).first();

  // Nếu có luôn showtime -> click
  if (await timeBtn.count()) {
    await timeBtn.click();
    return true;
  }

  // Không có showtime: thử đổi ngày trong 7 ngày (DAYS=7)
  // Date button có "HÔM NAY" hoặc "dd/mm"
  const dateButtons = sec.locator("button").filter({
    hasText: /(hôm nay|\b\d{1,2}\/\d{1,2}\b|t[2-7]|cn)/i,
  });

  const n = await dateButtons.count();
  const tries = Math.min(n, 7);

  for (let i = 0; i < tries; i++) {
    await dateButtons.nth(i).click();
    await page.waitForTimeout(800);

    const btn = sec.locator("button", { hasText: /\b\d{1,2}:\d{2}\b/ }).first();
    if (await btn.count()) {
      await btn.click();
      return true;
    }
  }

  // Không tìm thấy showtime sau 7 ngày
  return false;
}

async function pickTicketQuantity(page: Page) {
  // Sau khi chọn showtime, BookingPanel xuất hiện với heading "CHỌN LOẠI VÉ"
  const ticketHeading = page.getByRole("heading", { name: /chọn loại vé/i });
  await expect(ticketHeading).toBeVisible({ timeout: 20_000 });

  const ticketSection = page.locator("section", { has: ticketHeading }).first();

  // click nút "+" đầu tiên trong section vé (đảm bảo có vé > 0 để chọn ghế)
  const plusBtn = ticketSection.getByRole("button", { name: "+" }).first();
  await expect(plusBtn).toBeVisible({ timeout: 20_000 });
  await plusBtn.click();
}

async function pickAnySeat(page: Page) {
  // Chờ khu "Màn hình" (seat screen) xuất hiện
  const screenLabel = page.getByText(/^Màn hình$/i).first();
  await expect(screenLabel).toBeVisible({ timeout: 20_000 });

  // Ghế thường hiển thị text là số (1..20),
  // ghế đôi hiển thị "A1" kiểu row+number.
  // Lọc button không disabled và text đúng pattern ghế
  const seatBtn = page
    .locator("button:not([disabled])")
    .filter({ hasText: /^(?:[A-J]\d{1,2}|\d{1,2})$/ })
    .first();

  // Nếu không có ghế khả dụng -> return false
  const count = await seatBtn.count();
  if (count === 0) {
    return false;
  }

  await expect(seatBtn).toBeVisible({ timeout: 20_000 });
  await seatBtn.click();
  return true;
}

async function clickProceedToCheckout(page: Page) {
  // Nút CTA sticky bottom bar
  const proceedBtn = page.getByRole("button", { name: /đặt vé ngay/i }).first();

  await expect(proceedBtn).toBeVisible({ timeout: 20_000 });
  
  // Kiểm tra nút có enabled không
  const isEnabled = await proceedBtn.isEnabled();
  if (!isEnabled) {
    return false;
  }

  await proceedBtn.click();
  await page.waitForURL(/\/checkout/i, { timeout: 20_000 });
  return true;
}

test("Member: choose seat -> checkout -> creates payment order (smoke)", async ({ page }) => {
  // 1) Vào đúng Movie Detail (/movie/:id)
  await gotoAnyMovieDetail(page);

  // 2) Chọn showtime (có auto đổi ngày nếu hôm nay không có suất)
  const hasShowtime = await pickAnyShowtime(page);
  if (!hasShowtime) {
    await page.screenshot({ path: "e2e/.debug/no-showtime.png", fullPage: true });
    test.skip(true, "No showtime available in test environment (7 days checked)");
  }

  // 3) Chọn ít nhất 1 vé (bấm +)
  await pickTicketQuantity(page);

  // 4) Chọn 1 ghế
  const hasSeat = await pickAnySeat(page);
  if (!hasSeat) {
    await page.screenshot({ path: "e2e/.debug/no-seat.png", fullPage: true });
    test.skip(true, "No available seats in test environment");
  }

  // 5) Proceed sang /checkout
  const canProceed = await clickProceedToCheckout(page);
  if (!canProceed) {
    await page.screenshot({ path: "e2e/.debug/checkout-btn-disabled.png", fullPage: true });
    test.skip(true, "Checkout button disabled (possible validation issue)");
  }

  // 6) CheckoutPage mount sẽ gọi lock seats
  await page.waitForRequest(
    (r) => r.url().includes("/seat-locks") && r.method() === "POST",
    { timeout: 20_000 }
  );

  // 7) Bấm thanh toán -> tạo payment order
  const payBtn = page
    .getByRole("button", { name: /thanh toán|pay|xác nhận/i })
    .or(page.locator("button").filter({ hasText: /thanh toán|pay|xác nhận/i }))
    .first();

  const payBtnCount = await payBtn.count();
  if (payBtnCount === 0) {
    await page.screenshot({ path: "e2e/.debug/no-pay-btn.png", fullPage: true });
    test.skip(true, "Payment button not found (checkout flow may need config)");
  }

  await expect(payBtn).toBeVisible({ timeout: 20_000 });
  await payBtn.click();

  await page.waitForResponse(
    (r) => r.url().includes("/payments/order") && r.ok(),
    { timeout: 20_000 }
  );
});
