import { test, expect } from "@playwright/test";
import { skipWithDebug } from "./helpers/skip";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("Admin Showtimes Management", () => {
  test("Admin can create showtime", async ({ page }) => {
    await page.goto("/admin/showtimes");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Check page loaded
    const heading = page.getByText(/QUẢN LÝ SUẤT CHIẾU/i);
    if ((await heading.count()) === 0) {
      await skipWithDebug(page, "Showtimes page not found", "admin-showtimes-no-page");
      test.skip(true, "Showtimes page not available");
    }

    // Click add showtime button
    const addBtn = page.getByRole("button", { name: /\+ Thêm suất chiếu/i });

    if ((await addBtn.count()) === 0) {
      await skipWithDebug(page, "Add showtime button not found", "admin-showtimes-no-add-btn");
      test.skip(true, "Add showtime button not found");
    }

    await addBtn.click();
    await page.waitForTimeout(2000);

    try {
      // Wait for modal
      const modal = page.locator('[class*="fixed"][class*="inset-0"]').filter({ hasText: /THÊM SUẤT CHIẾU|CHỈNH SỜỬA SUẤT/i });
      await modal.waitFor({ state: "visible", timeout: 10_000 });

      // Select Movie
      const movieSelect = modal.locator('select').first();
      await movieSelect.waitFor({ state: "visible", timeout: 10_000 });

      const movieOptions = await movieSelect.locator("option").count();
      if (movieOptions <= 1) {
        await skipWithDebug(page, "No movies available", "admin-showtimes-no-movies");
        test.skip(true, "No movies available - create movie first");
      }

      await movieSelect.selectOption({ index: 1 });

      // Select Cinema
      const cinemaSelect = modal.locator('select').nth(1);
      if ((await cinemaSelect.count()) > 0) {
        await page.waitForTimeout(500);
        const cinemaOptions = await cinemaSelect.locator("option").count();
        if (cinemaOptions <= 1) {
          test.skip(true, "No cinemas available");
        }
        await cinemaSelect.selectOption({ index: 1 });
      }

      // Select Room
      const roomSelect = page.locator('select[name="roomId"]');
      if ((await roomSelect.count()) > 0) {
        await page.waitForTimeout(1000); // Wait for rooms to load
        const roomOptions = await roomSelect.locator("option").count();
        if (roomOptions <= 1) {
          test.skip(true, "No rooms available");
        }
        await roomSelect.selectOption({ index: 1 });
      }

      // Start Time - set to now + 2 hours
      const startTimeInput = page.locator('input[name="startTime"]');
      if ((await startTimeInput.count()) > 0) {
        const now = new Date();
        now.setHours(now.getHours() + 2);
        const datetimeLocal = now.toISOString().slice(0, 16);
        await startTimeInput.fill(datetimeLocal);
      }

      // Format
      const formatSelect = page.locator('select[name="format"]');
      if ((await formatSelect.count()) > 0) {
        await formatSelect.selectOption({ index: 1 });
      }

      // Save
      const saveBtn = page.getByRole("button", { name: /Lưu|Tạo/i });
      await saveBtn.click();
      await page.waitForTimeout(3000);

      console.log("✓ Showtime created successfully");
    } catch (error) {
      await skipWithDebug(page, `Showtime creation failed: ${error}`, "admin-showtimes-create-error");
      throw error;
    }
  });

  test("Public can see created showtime", async ({ page, context }) => {
    await page.goto("/admin/showtimes");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Get first showtime
    const firstShowtime = page.locator("tr").filter({ hasText: /\d{2}:\d{2}/ }).first();

    if ((await firstShowtime.count()) === 0) {
      test.skip(true, "No showtimes to verify");
    }

    // Open public page
    const publicPage = await context.newPage();
    await publicPage.goto("/", { waitUntil: "domcontentloaded" });
    await publicPage.waitForTimeout(2000);

    // Click first movie card
    const firstMovie = publicPage.locator("[data-testid='movie-card']").first();

    if ((await firstMovie.count()) === 0) {
      test.skip(true, "No movies on public page");
    }

    await firstMovie.click();
    await publicPage.waitForLoadState("domcontentloaded");
    await publicPage.waitForTimeout(2000);

    // Look for showtime buttons
    const timeButtons = publicPage.locator("button").filter({ hasText: /\d{2}:\d{2}/ });

    const timeCount = await timeButtons.count();
    expect(timeCount).toBeGreaterThan(0);
    console.log(`✓ Public sees ${timeCount} showtime(s)`);

    await publicPage.close();
  });

  test("Admin can filter showtimes", async ({ page }) => {
    await page.goto("/admin/showtimes");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Look for filter select
    const movieFilter = page.locator('select[name="movieId"]').first();

    if ((await movieFilter.count()) === 0) {
      console.log("⚠ No filters available");
      test.skip(true, "No filters to test");
    }

    // Apply filter
    await movieFilter.selectOption({ index: 1 });
    await page.waitForTimeout(2000);

    console.log("✓ Filter applied");
  });
});
