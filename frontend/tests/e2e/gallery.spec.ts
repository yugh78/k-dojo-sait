import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { GalleryImage } from "../../app/types/api";
import type { GalleryCatalog } from "../../shared/gallery";

const albumPath = "/gallery/kyokushin/technique-2026-10-02";

test("gallery opens real photos, cycles with keyboard and restores focus", async ({
  page,
  request,
}) => {
  const featured: GalleryImage[] = await (
    await request.get("/api/gallery/featured")
  ).json();
  await page.goto("/");
  const gallery = page.locator("#gallery");
  const tiles = gallery.locator(".gallery-tile");
  await expect(tiles).toHaveCount(4);
  await tiles.first().click();
  const viewer = page.getByRole("dialog", { name: "Галерея клуба" });
  await expect(viewer).toBeVisible();
  await expect(
    viewer.getByRole("button", { name: "Закрыть просмотр" }),
  ).toBeFocused();
  await expect(viewer.locator(".gallery-lightbox-photo")).toHaveAttribute(
    "src",
    featured[0]!.image,
  );
  await expect
    .poll(() =>
      viewer
        .locator(".gallery-lightbox-photo")
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("ArrowLeft");
  await expect(viewer.locator(".gallery-lightbox-photo")).toHaveAttribute(
    "src",
    featured[2]!.image,
  );
  await expect(viewer).toContainText("2 / 2");
  await page.keyboard.press("ArrowRight");
  await expect(viewer).toContainText("1 / 2");
  await viewer.getByRole("button", { name: "Следующий кадр" }).click();
  await expect(viewer.locator(".gallery-lightbox-photo")).toHaveAttribute(
    "src",
    featured[2]!.image,
  );
  await expect(
    viewer.locator('.gallery-thumbnails [aria-current="true"]'),
  ).toHaveAttribute("aria-label", /Кадр 2/);
  await viewer.getByRole("button", { name: /^Кадр 1:/ }).click();
  await expect(viewer.locator(".gallery-lightbox-photo")).toHaveAttribute(
    "src",
    featured[0]!.image,
  );
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(scan.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(viewer).not.toBeVisible();
  await expect(tiles.first()).toBeFocused();
  await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
  await expect(viewer.locator("img")).toHaveCount(0);
});

test("lightbox retries a failed full-size photograph", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(albumPath);
  const tile = page.locator(".gallery-tile").first();
  await tile.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      tile
        .locator("img")
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  let fail = true;
  await page.route("**/gallery-images/*-1600.webp", (route) =>
    fail ? route.abort() : route.continue(),
  );
  await tile.click();
  const viewer = page.getByRole("dialog");
  await expect(viewer.getByRole("alert")).toBeVisible();
  fail = false;
  await viewer.getByRole("button", { name: "Повторить", exact: true }).click();
  await expect
    .poll(() =>
      viewer
        .locator(".gallery-lightbox-photo")
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  await expect(viewer.getByRole("alert")).not.toBeVisible();
});

test("gallery works on mobile with swipes, thumbnails, button and backdrop", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const data = await (
    await request.get("/api/gallery/albums/technique-2026-10-02")
  ).json();
  await page.goto(albumPath);
  const tiles = page.locator(".gallery-tile");
  await expect(tiles).toHaveCount(2);
  await expect(tiles.first()).toHaveCSS("animation-name", "none");
  await tiles.nth(1).click();
  const viewer = page.getByRole("dialog", { name: "Галерея клуба" });
  await expect(viewer.locator(".gallery-lightbox-photo")).toHaveAttribute(
    "src",
    data.photos.items[1].image,
  );
  await viewer.getByRole("button", { name: "Предыдущий кадр" }).click();
  await expect(viewer).toContainText("1 / 2");
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setTouchEmulationEnabled", { enabled: true });
  const media = (await viewer
    .locator(".gallery-lightbox-media")
    .boundingBox())!;
  const x = media.x + media.width * 0.8;
  const y = media.y + media.height * 0.5;
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (const distance of [30, 60, 90, 120])
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x - distance, y }],
    });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(viewer).toContainText("2 / 2");
  await expect(
    viewer.locator('.gallery-thumbnails [aria-current="true"]'),
  ).toHaveAttribute("aria-label", /Кадр 2/);
  await viewer.getByRole("button", { name: "Закрыть просмотр" }).click();
  await expect(viewer).not.toBeVisible();
  await expect(tiles.nth(1)).toBeFocused();
  await tiles.first().click();
  await page.mouse.click(2, 2);
  await expect(viewer).not.toBeVisible();
});

test("gallery images load and layout fits desktop, tablet and phone", async ({
  page,
}) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const gallery = page.locator("#gallery");
    for (const tile of await gallery.locator(".gallery-tile").all()) {
      await tile.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          tile
            .locator("img")
            .evaluate((image: HTMLImageElement) => image.naturalWidth),
        )
        .toBeGreaterThan(0);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await gallery.screenshot({
      path: `test-results/gallery-${width}.png`,
      animations: "disabled",
    });
    await gallery.locator(".gallery-tile").first().click();
    const viewer = page.getByRole("dialog", { name: "Галерея клуба" });
    const box = await viewer.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    await viewer.screenshot({
      path: `test-results/gallery-viewer-${width}.png`,
      animations: "disabled",
    });
    await page.keyboard.press("Escape");
    await page.goto("/gallery");
    await expect(page.locator(".gallery-category-card")).toHaveCount(6);
    await page.screenshot({
      path: `test-results/gallery-catalog-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await page.goto(albumPath);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/gallery-album-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
});

test("categories, album breadcrumbs, dates, empty sections and 404s", async ({
  page,
  request,
}) => {
  await page.goto("/gallery");
  await page
    .locator(".gallery-category-card")
    .filter({ hasText: "Киокушинкай карате" })
    .click();
  await expect(page).toHaveURL(/\/gallery\/kyokushin$/);
  await page
    .getByRole("link", { name: "Открыть альбом: Работа над техникой" })
    .click();
  await expect(page).toHaveURL(new RegExp(`${albumPath}$`));
  await expect(page.locator("h1")).toHaveText("Работа над техникой");
  await expect(page.locator("time")).toContainText("2 октября 2026");
  await expect(page.locator(".gallery-tile")).toHaveCount(2);
  await page
    .getByRole("navigation", { name: "Хлебные крошки" })
    .getByRole("link", { name: "Киокушинкай карате" })
    .click();
  await page
    .getByRole("navigation", { name: "Категории галереи" })
    .getByRole("link", { name: "BJJ", exact: true })
    .click();
  await expect(page.locator(".gallery-empty")).toContainText(
    "пока нет альбомов",
  );
  for (const path of [
    "/gallery/unknown",
    "/gallery/club/technique-2026-10-02",
    "/gallery/club/missing",
  ])
    expect((await request.get(path)).status()).toBe(404);
  expect(
    (
      await request.get(
        "/api/gallery/albums/technique-2026-10-02/photos?page=999999",
      )
    ).status(),
  ).toBe(400);
  expect(
    (await request.get("/api/gallery/albums/unknown/photos")).status(),
  ).toBe(404);
  expect(await (await request.get("/sitemap.xml")).text()).toContain(albumPath);
});

test("large albums load in pages, retry failures and keep thumbnail DOM bounded", async ({
  page,
  request,
}) => {
  const catalog: GalleryCatalog = await (
    await request.get("/api/gallery")
  ).json();
  const album = { ...catalog.albums[0]!, photoCount: 5000 };
  const prototype = album.cover!;
  const requested: number[] = [];
  let failNextPage = true;
  const makePage = (number: number) => ({
    total: 5000,
    page: number,
    pageSize: 24,
    items: Array.from(
      { length: Math.min(24, 5000 - number * 24) },
      (_, offset) => ({
        ...prototype,
        id: number * 24 + offset + 1,
        index: number * 24 + offset,
        caption: `Кадр ${number * 24 + offset + 1}`,
        albumTotal: 5000,
      }),
    ),
  });
  await page.goto("/gallery");
  await page.route(`**/api/gallery/albums/${album.slug}**`, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/photos")) {
      const number = Number(url.searchParams.get("page") || 0);
      requested.push(number);
      if (number === 1 && failNextPage) {
        return route.fulfill({
          status: 503,
          json: { message: "Temporary error" },
        });
      }
      return route.fulfill({ json: makePage(number) });
    }
    return route.fulfill({ json: { album, photos: makePage(0) } });
  });
  await page
    .getByRole("link", { name: "Открыть альбом: Работа над техникой" })
    .click();
  const tiles = page.locator(".gallery-tile");
  await expect(tiles).toHaveCount(24);
  await page.getByRole("button", { name: /Ещё фотографии/ }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(tiles).toHaveCount(24);
  failNextPage = false;
  await page.getByRole("button", { name: /Повторить загрузку/ }).click();
  await expect(tiles).toHaveCount(48);
  await tiles.nth(47).click();
  const viewer = page.getByRole("dialog");
  await expect(viewer).toContainText("48 / 5000");
  await page.keyboard.press("ArrowRight");
  await expect(viewer).toContainText("49 / 5000");
  await expect(viewer.locator(".gallery-thumbnails button")).toHaveCount(9);
  await page.keyboard.press("Escape");
  await tiles.first().click();
  await page.keyboard.press("ArrowLeft");
  await expect(viewer).toContainText("5000 / 5000");
  await expect(viewer.locator(".gallery-thumbnails button")).toHaveCount(9);
  await expect(tiles).toHaveCount(48);
  expect(new Set(requested).size).toBeLessThanOrEqual(6);
  await page.keyboard.press("Escape");
  await expect(viewer).not.toBeVisible();
});
