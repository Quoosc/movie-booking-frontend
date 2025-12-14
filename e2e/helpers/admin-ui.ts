import { Page, Locator } from "@playwright/test";

/**
 * Navigate to admin section and verify access
 */
export async function gotoAdmin(page: Page, path: string) {
  const fullPath = path.startsWith("/admin") ? path : `/admin${path}`;
  await page.goto(fullPath, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  // Check for 403/unauthorized
  const forbidden = page.locator("text=/403|forbidden|không có quyền/i");
  if ((await forbidden.count()) > 0) {
    await page.screenshot({
      path: "e2e/.debug/admin-403-forbidden.png",
      fullPage: true,
    });
    throw new Error(`Admin access denied: ${fullPath}`);
  }
}

/**
 * Login as admin and navigate to admin path
 */
export async function loginAdminUI(page: Page, email: string, password: string) {
  await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  const emailInput = page.locator('input[name="email"]');
  const passwordInput = page.locator('input[name="password"]');

  await emailInput.waitFor({ state: "visible", timeout: 10_000 });
  await emailInput.fill(email);
  await passwordInput.fill(password);

  const loginBtn = page.getByRole("button", { name: /đăng nhập|login/i });
  await loginBtn.click();
  await page.waitForLoadState("networkidle", { timeout: 20_000 });
  await page.waitForTimeout(2000);

  // Verify not on login page
  if (page.url().includes("/auth/login")) {
    await page.screenshot({
      path: "e2e/.debug/admin-login-failed.png",
      fullPage: true,
    });
    throw new Error(`Admin login failed for ${email}`);
  }
}

/**
 * Find table/list row containing specific text
 */
export async function findRowByText(
  container: Page | Locator,
  text: string | RegExp
): Promise<Locator | null> {
  const rows = container.locator("tr, li, [data-testid*='row'], [data-testid*='item']");
  const count = await rows.count();

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const textContent = await row.textContent();
    if (!textContent) continue;

    if (typeof text === "string" && textContent.includes(text)) {
      return row;
    } else if (text instanceof RegExp && text.test(textContent)) {
      return row;
    }
  }

  return null;
}

/**
 * Click button by text within container
 */
export async function clickButtonByText(
  container: Page | Locator,
  text: string | RegExp
): Promise<boolean> {
  const button = container.getByRole("button", { name: text }).or(
    container.locator("button").filter({ hasText: text })
  );

  if ((await button.count()) === 0) {
    return false;
  }

  await button.first().click();
  return true;
}

/**
 * Fill input by label or placeholder
 */
export async function fillByLabelOrPlaceholder(
  page: Page,
  labelRegex: string | RegExp,
  value: string
) {
  // Try by label
  const byLabel = page.getByLabel(labelRegex);
  if ((await byLabel.count()) > 0) {
    await byLabel.first().fill(value);
    return;
  }

  // Try by placeholder
  const byPlaceholder = page.getByPlaceholder(labelRegex);
  if ((await byPlaceholder.count()) > 0) {
    await byPlaceholder.first().fill(value);
    return;
  }

  // Try by nearby text + input
  const label = page.locator("label, span, div").filter({ hasText: labelRegex }).first();
  if ((await label.count()) > 0) {
    const input = label.locator("input").or(
      page.locator("input").locator(`xpath=ancestor::*[contains(., '${labelRegex}')]//input`)
    );
    if ((await input.count()) > 0) {
      await input.first().fill(value);
      return;
    }
  }

  throw new Error(`Cannot find input for label/placeholder: ${labelRegex}`);
}

/**
 * Select dropdown option by label
 */
export async function selectByLabel(
  page: Page,
  labelRegex: string | RegExp,
  optionText: string
) {
  const select = page.getByLabel(labelRegex).or(
    page.locator("select").filter({ has: page.locator(`text=${labelRegex}`) })
  );

  if ((await select.count()) === 0) {
    throw new Error(`Cannot find select for label: ${labelRegex}`);
  }

  await select.first().selectOption({ label: optionText });
}

/**
 * Wait for modal to open
 */
export async function waitForModal(page: Page, timeout = 5000): Promise<Locator | null> {
  const modal = page.locator('[role="dialog"]').or(
    page.locator('[data-testid*="modal"]').or(page.locator(".modal"))
  );

  try {
    await modal.first().waitFor({ state: "visible", timeout });
    return modal.first();
  } catch {
    return null;
  }
}

/**
 * Close modal if open
 */
export async function closeModal(page: Page) {
  const closeBtn = page
    .locator('[role="dialog"]')
    .getByRole("button", { name: /close|đóng|×/i })
    .or(page.locator('[data-testid*="modal"] button').filter({ hasText: /close|đóng|×/i }));

  if ((await closeBtn.count()) > 0) {
    await closeBtn.first().click();
    await page.waitForTimeout(500);
  }
}
