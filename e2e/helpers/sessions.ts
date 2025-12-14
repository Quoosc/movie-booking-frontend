import { BrowserContext, Browser } from "@playwright/test";

/**
 * Create isolated browser context for multi-user scenarios
 * Each context has separate cookies/session
 */
export async function createIsolatedContext(
  browser: Browser,
  name: string = "User"
): Promise<BrowserContext> {
  const context = await browser.newContext({
    storageState: undefined, // No shared storage
  });

  // Add helpful metadata
  (context as any)._testName = name;

  return context;
}

/**
 * Create multiple isolated contexts for concurrent testing
 */
export async function createMultipleContexts(
  browser: Browser,
  count: number = 2
): Promise<BrowserContext[]> {
  const contexts: BrowserContext[] = [];
  
  for (let i = 0; i < count; i++) {
    const context = await createIsolatedContext(browser, `User${i + 1}`);
    contexts.push(context);
  }

  return contexts;
}

/**
 * Cleanup all contexts
 */
export async function closeAllContexts(contexts: BrowserContext[]) {
  for (const context of contexts) {
    await context.close();
  }
}
