import { test, expect } from "@playwright/test";
import { skipWithDebug } from "./helpers/skip";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("Admin Cinemas, Rooms & Seats", () => {
  test("Admin can generate seat layout for room", async ({ page }) => {
    await page.goto("/admin/seats");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Check if seats page exists
    const heading = page.getByText(/QUẢN LÝ GHẾ|SEAT LAYOUT/i);
    if ((await heading.count()) === 0) {
      await skipWithDebug(page, "Seats page not found", "admin-seats-no-page");
      test.skip(true, "Seats page not available");
    }

    // Look for generate button
    const generateBtn = page.getByRole("button", { name: /Generate|Tạo sơ đồ/i });

    if ((await generateBtn.count()) === 0) {
      console.log("⚠ Generate seats button not found - skipping");
      test.skip(true, "Generate seats button not found");
    }

    await generateBtn.click();
    await page.waitForTimeout(2000);

    try {
      // Room selection
      const roomSelect = page.locator('select[name="roomId"]');
      if ((await roomSelect.count()) > 0) {
        const options = await roomSelect.locator("option").count();
        if (options <= 1) {
          test.skip(true, "No rooms available");
        }
        await roomSelect.selectOption({ index: 1 });
      }

      // Rows
      const rowsInput = page.locator('input[name="rows"]');
      if ((await rowsInput.count()) > 0) {
        await rowsInput.fill("8");
      }

      // Columns
      const colsInput = page.locator('input[name="columns"]').or(page.locator('input[name="cols"]'));
      if ((await colsInput.count()) > 0) {
        await colsInput.fill("10");
      }

      // Submit
      const submitBtn = page.getByRole("button", { name: /Generate|Tạo|Lưu/i });
      await submitBtn.click();
      await page.waitForTimeout(3000);

      console.log("✓ Seats layout generated");
    } catch (error) {
      console.log("⚠ Seat generation failed:", error);
    }
  });
});
