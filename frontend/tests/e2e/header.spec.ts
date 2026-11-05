import { test, expect } from "@playwright/test";

test("header hides on downward scroll and returns on upward scroll or focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const header = page.locator(".site-header");
  await expect(header).toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect(header).not.toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 350));
  await expect(header).toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect(header).not.toBeInViewport();
  await header.locator(".brand").focus();
  await expect(header).toBeInViewport();
});

test("open mobile navigation stays on screen while scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.locator(".menu-toggle").click();
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 500);
  });
  await expect(page.locator(".site-header")).toBeInViewport();
  await expect(page.locator(".mobile-nav")).toBeInViewport();
});

test("hero fits the first screen with header and booking link", async ({
  page,
}) => {
  for (const [width, height] of [
    [1920, 1080],
    [1366, 768],
    [1280, 720],
    [1024, 768],
    [768, 1024],
    [390, 844],
    [375, 812],
    [320, 568],
  ]) {
    await page.setViewportSize({ width: width!, height: height! });
    await page.goto("/");
    const bottom = await page
      .locator(".hero")
      .evaluate((el) => el.getBoundingClientRect().bottom);
    expect(bottom, `Hero at ${width}x${height}`).toBeLessThanOrEqual(
      height! + 1,
    );
    await expect(page.locator(".hero-copy .button")).toBeInViewport();
  }
});
