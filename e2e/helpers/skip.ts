import { Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * Skip test with debug screenshot
 */
export async function skipWithDebug(page: Page, reason: string, filenamePrefix: string) {
  const debugDir = path.join(process.cwd(), "e2e/.debug");
  fs.mkdirSync(debugDir, { recursive: true });

  const timestamp = Date.now();
  const filename = `${filenamePrefix}-${timestamp}.png`;
  const filepath = path.join(debugDir, filename);

  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`[SKIP] ${reason}`);
  console.log(`[DEBUG] Screenshot saved: ${filepath}`);
  console.log(`[DEBUG] URL: ${page.url()}`);
}
