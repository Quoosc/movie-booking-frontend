import { test, expect } from "@playwright/test";

test("Public: Home -> Movie Detail -> showtimes visible", async ({ page }) => {
  await page.goto("/");

  // vào movie detail
  const firstMovieCard = page.locator("[data-testid='movie-card']").first();
  if (await firstMovieCard.count()) {
    await firstMovieCard.click();
  } else {
    await page
      .getByRole("link", { name: /chi tiết|detail|mua vé|đặt vé/i })
      .first()
      .click();
  }

  await expect(page).toHaveURL(/\/movie/i);

  // ✅ showtime section visible (2 cách fallback)
  const showtimeSection = page
    .locator("[data-testid='showtime-section']")
    .or(page.getByText(/suất chiếu|showtime/i))
    .first();

  await expect(showtimeSection).toBeVisible();
});
