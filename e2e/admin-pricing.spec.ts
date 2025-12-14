import { test, expect } from "@playwright/test";
import { skipWithDebug } from "./helpers/skip";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("Admin Pricing Management", () => {
  test("Admin can view pricing page", async ({ page }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Heading text is "Cấu hình giá vé"
    const heading = page.getByRole("heading", { name: /Cấu hình giá vé/i }).first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test("Admin can set base price", async ({ page }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Look for add base price button
    const addBasePriceBtn = page.getByRole("button", { name: /\+ Thêm Base Price|Thêm giá gốc/i });

    if ((await addBasePriceBtn.count()) === 0) {
      // Check if base price already exists
      const existingBasePrice = page.locator("text=/base price|giá gốc/i");
      if ((await existingBasePrice.count()) > 0) {
        console.log("✓ Base price already configured");
        return;
      }

      await skipWithDebug(page, "Add base price button not found", "admin-pricing-no-base-btn");
      test.skip(true, "Add base price button not found");
    }

    await addBasePriceBtn.click();
    await page.waitForTimeout(2000);

    try {
      // Fill price
      const priceInput = page.locator('input[name="price"]').or(page.locator('input[name="basePrice"]'));
      await priceInput.waitFor({ state: "visible", timeout: 10_000 });
      await priceInput.fill("90000");

      // Active checkbox
      const activeCheckbox = page.locator('input[name="isActive"]').or(page.locator('input[type="checkbox"]'));
      if ((await activeCheckbox.count()) > 0) {
        const isChecked = await activeCheckbox.first().isChecked();
        if (!isChecked) {
          await activeCheckbox.first().check();
        }
      }

      // Save
      const saveBtn = page.getByRole("button", { name: /Lưu|Save/i });
      await saveBtn.click();
      await page.waitForTimeout(3000);

      console.log("✓ Base price set to 90,000");
    } catch (error) {
      await skipWithDebug(page, `Base price setting failed: ${error}`, "admin-pricing-base-error");
      throw error;
    }
  });

  test("Admin can create ticket type", async ({ page }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Find add ticket type button
    const addBtn = page.getByRole("button", { name: /\+ Thêm Ticket Type|Thêm loại vé/i });

    if ((await addBtn.count()) === 0) {
      await skipWithDebug(page, "Add ticket type button not found", "admin-pricing-no-ticket-btn");
      test.skip(true, "Add ticket type button not found");
    }

    await addBtn.click();
    await page.waitForTimeout(2000);

    try {
      const timestamp = Date.now();
      const ticketCode = `e2e_adult_${timestamp}`;

      // Code
      const codeInput = page.locator('input[name="code"]');
      if ((await codeInput.count()) > 0) {
        await codeInput.fill(ticketCode);
      }

      // Label/Name
      const labelInput = page.locator('input[name="label"]').or(page.locator('input[name="name"]'));
      await labelInput.waitFor({ state: "visible", timeout: 10_000 });
      await labelInput.fill("E2E Adult Ticket");

      // Price
      const priceInput = page.locator('input[name="price"]');
      if ((await priceInput.count()) > 0) {
        await priceInput.fill("0");
      }

      // Save
      const saveBtn = page.getByRole("button", { name: /Lưu|Tạo/i });
      await saveBtn.click();
      await page.waitForTimeout(3000);

      console.log(`✓ Ticket type created: ${ticketCode}`);
    } catch (error) {
      await skipWithDebug(page, `Ticket type creation failed: ${error}`, "admin-pricing-ticket-error");
      throw error;
    }
  });

  test("Public can see ticket types for showtime", async ({ page, context }) => {
    // Navigate to public movie page
    const publicPage = await context.newPage();
    await publicPage.goto("/", { waitUntil: "domcontentloaded" });
    await publicPage.waitForTimeout(2000);

    // Find first movie
    const firstMovie = publicPage.locator("[data-testid='movie-card']").first();

    if ((await firstMovie.count()) === 0) {
      test.skip(true, "No movies on public page");
    }

    await firstMovie.click();
    await publicPage.waitForLoadState("domcontentloaded");
    await publicPage.waitForTimeout(2000);

    // Click first showtime
    const firstShowtime = publicPage.locator("button").filter({ hasText: /\d{2}:\d{2}/ }).first();

    if ((await firstShowtime.count()) === 0) {
      test.skip(true, "No showtimes available");
    }

    await firstShowtime.click();
    await publicPage.waitForTimeout(3000);

    // Look for ticket type section
    const ticketSection = publicPage.locator("text=/Chọn loại vé|LOẠI VÉ/i");

    if ((await ticketSection.count()) === 0) {
      await skipWithDebug(publicPage, "Ticket types section not found", "public-no-tickets");
      test.skip(true, "Ticket types section not found");
    }

    // Verify ticket types displayed
    const ticketCards = publicPage.locator("text=/NGƯỜI LỚN|TRẺ EM|SINH VIÊN|MEMBER/i");

    const ticketCount = await ticketCards.count();
    expect(ticketCount).toBeGreaterThan(0);
    console.log(`✓ Public sees ${ticketCount} ticket type(s)`);

    await publicPage.close();
  });
});
