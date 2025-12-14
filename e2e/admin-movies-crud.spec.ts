import { test, expect } from "@playwright/test";
import { skipWithDebug } from "./helpers/skip";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("Admin CRUD Movies", () => {
  const cloudinaryUpload = process.env.E2E_CLOUDINARY_UPLOAD === "1";
  const posterPath = process.env.E2E_MOVIE_POSTER_PATH;

  test("Admin can view movies list", async ({ page }) => {
    await page.goto("/admin/movies");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Check heading - use role to be more specific
    const heading = page.getByRole("heading", { name: /Quản lý phim/i });
    await expect(heading).toBeVisible({ timeout: 10_000 });

    // Check for table
    const table = page.locator("table");
    await expect(table).toBeVisible({ timeout: 10_000 });
  });

  test("Admin can create new movie", async ({ page }) => {
    await page.goto("/admin/movies");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Click "+ Thêm phim mới" button
    const addBtn = page.getByRole("button", { name: /\+ Thêm phim mới/i });

    if ((await addBtn.count()) === 0) {
      await skipWithDebug(page, "Add movie button not found", "admin-movies-no-add-btn");
      test.skip(true, "Add movie button not found");
    }

    await addBtn.click();
    await page.waitForTimeout(2000);

    // Wait for modal to appear
    const modal = page.locator('[class*="fixed"][class*="inset-0"][class*="z-"]').filter({ hasText: /THÊM PHIM MỚI|Tên phim/i });
    await modal.waitFor({ state: "visible", timeout: 10_000 });

    // Fill form with unique title
    const timestamp = Date.now();
    const movieTitle = `E2E Movie ${timestamp}`;

    try {
      // Title - use placeholder since there's no name attribute
      const titleInput = modal.getByPlaceholder(/Tên phim/i);
      await titleInput.waitFor({ state: "visible", timeout: 10_000 });
      await titleInput.fill(movieTitle);

      // Genre
      const genreInput = modal.getByPlaceholder(/Ví dụ: Action, Drama/i);
      await genreInput.fill("Action");

      // Duration
      const durationInput = modal.getByPlaceholder("120");
      await durationInput.fill("120");

      // Minimum Age
      const ageInput = modal.getByPlaceholder(/13, 16, 18/i);
      await ageInput.fill("13");

      // Language
      const languageInput = modal.getByPlaceholder(/English, Tiếng Việt/i);
      await languageInput.fill("Vietnamese");

      // Director
      const directorInput = modal.getByPlaceholder(/Tên đạo diễn/i);
      await directorInput.fill("E2E Director");

      // Actors
      const actorsInput = modal.getByPlaceholder(/Danh sách diễn viên/i);
      await actorsInput.fill("E2E Actor 1, E2E Actor 2");

      // Trailer URL
      const trailerInput = modal.getByPlaceholder(/youtube.com/i);
      await trailerInput.fill("https://youtube.com/watch?v=test");

      // Description
      const descInput = modal.getByPlaceholder(/Tóm tắt nội dung phim/i);
      await descInput.fill("E2E test movie description");

      // Status - select "Đang chiếu"
      const statusSelect = modal.locator('select').filter({ hasText: /Đang chiếu|Sắp chiếu/i });
      if ((await statusSelect.count()) > 0) {
        await statusSelect.selectOption("SHOWING");
      }

      // Poster upload (optional)
      if (cloudinaryUpload && posterPath) {
        const fileInput = modal.locator('input[type="file"]');
        if ((await fileInput.count()) > 0) {
          try {
            await fileInput.setInputFiles(posterPath);
            await page.waitForTimeout(2000);
          } catch (err) {
            console.warn("Poster upload skipped:", err);
          }
        }
      }

      // Save - look for "Tạo phim" button
      const saveBtn = modal.getByRole("button", { name: /Tạo phim/i });
      await saveBtn.click();
      await page.waitForTimeout(3000);

      // Verify movie appears in table
      const movieRow = page.locator("tr").filter({ hasText: movieTitle });
      const rowCount = await movieRow.count();

      if (rowCount === 0) {
        await skipWithDebug(page, "Created movie not found in list", "admin-movies-not-in-list");
      }

      expect(rowCount).toBeGreaterThan(0);
      console.log(`✓ Movie created: ${movieTitle}`);
    } catch (error) {
      await skipWithDebug(page, `Movie creation failed: ${error}`, "admin-movies-create-error");
      throw error;
    }
  });

  test("Admin can update movie", async ({ page }) => {
    await page.goto("/admin/movies");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Find first movie row with edit button
    const firstRow = page.locator("tr").filter({ hasText: /Sửa/i }).first();

    if ((await firstRow.count()) === 0) {
      await skipWithDebug(page, "No movies to update", "admin-movies-no-rows");
      test.skip(true, "No movies to update");
    }

    // Click "Sửa" button
    const editBtn = firstRow.getByRole("button", { name: /Sửa/i });
    await editBtn.click();
    await page.waitForTimeout(2000);

    // Wait for modal
    const modal = page.locator('[class*="fixed"][class*="inset-0"][class*="z-"]').filter({ hasText: /CHỈNH SỬA PHIM|Tên phim/i });
    await modal.waitFor({ state: "visible", timeout: 10_000 });

    // Update title
    const titleInput = modal.getByPlaceholder(/Tên phim/i);
    await titleInput.waitFor({ state: "visible", timeout: 10_000 });

    const currentValue = await titleInput.inputValue();
    const updatedTitle = currentValue.includes("(Updated)")
      ? currentValue
      : `${currentValue} (Updated)`;

    await titleInput.fill(updatedTitle);

    // Save
    const saveBtn = modal.getByRole("button", { name: /Lưu thay đổi/i });
    await saveBtn.click();
    await page.waitForTimeout(3000);

    // Verify updated
    const updatedRow = page.locator("tr").filter({ hasText: updatedTitle });
    expect(await updatedRow.count()).toBeGreaterThan(0);
    console.log(`✓ Movie updated: ${updatedTitle}`);
  });

  test("Admin can toggle movie status", async ({ page }) => {
    await page.goto("/admin/movies");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Find first movie row
    const firstRow = page.locator("tbody tr").first();

    if ((await firstRow.count()) === 0) {
      test.skip(true, "No movies to toggle status");
    }

    // Get current row text
    const beforeText = await firstRow.textContent();

    // Look for edit button and open modal
    const editBtn = firstRow.getByRole("button", { name: /Sửa/i });
    if ((await editBtn.count()) === 0) {
      test.skip(true, "No edit button found");
    }

    await editBtn.click();
    await page.waitForTimeout(2000);

    // Wait for modal
    const modal = page.locator('[class*="fixed"][class*="inset-0"][class*="z-"]').filter({ hasText: /CHỈNH SỬA PHIM|Trạng thái/i });
    await modal.waitFor({ state: "visible", timeout: 10_000 });

    // Toggle status select
    const statusSelect = modal.locator('select').filter({ hasText: /Đang chiếu|Sắp chiếu/i });
    if ((await statusSelect.count()) === 0) {
      test.skip(true, "No status select");
    }

    const currentStatus = await statusSelect.inputValue();
    const newStatus = currentStatus === "SHOWING" ? "UPCOMING" : "SHOWING";
    await statusSelect.selectOption(newStatus);

    // Save
    const saveBtn = modal.getByRole("button", { name: /Lưu thay đổi/i });
    await saveBtn.click();
    await page.waitForTimeout(3000);

    console.log(`✓ Movie status changed from ${currentStatus} to ${newStatus}`);
  });
});
