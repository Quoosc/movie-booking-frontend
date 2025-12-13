import { Page } from "@playwright/test";

export async function waitForApiRequest(
  page: Page,
  urlPart: string,
  method: string = "GET",
  timeout: number = 20_000
) {
  return await page.waitForRequest(
    (request) =>
      request.url().includes(urlPart) &&
      request.method().toUpperCase() === method.toUpperCase(),
    { timeout }
  );
}

export async function waitForApiResponse(
  page: Page,
  urlPart: string,
  timeout: number = 20_000
) {
  return await page.waitForResponse(
    (response) => response.url().includes(urlPart) && response.ok(),
    { timeout }
  );
}

export async function waitForAnyRequest(
  page: Page,
  urlParts: string[],
  method: string = "GET",
  timeout: number = 20_000
) {
  return await page.waitForRequest(
    (request) =>
      urlParts.some((part) => request.url().includes(part)) &&
      request.method().toUpperCase() === method.toUpperCase(),
    { timeout }
  );
}
