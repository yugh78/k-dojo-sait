import { test, expect } from "@playwright/test";
test("all main pages, local content and no browser exceptions", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of [
    "/",
    "/kyokushin",
    "/bjj",
    "/mowgli",
    "/coaches",
    "/coaches/ryazhsky",
    "/schedule",
    "/pricing",
    "/events",
    "/results",
    "/gallery",
    "/contacts",
    "/about",
    "/privacy",
    "/personal-data",
  ]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(
      "Не удалось загрузить данные",
    );
  }
  expect(errors).toEqual([]);
});
test("schedule age 3–7 shows only Mowgli", async ({ page }) => {
  await page.goto("/schedule");
  const age = page.getByLabel("Возраст", { exact: true });
  for (const value of [3, 4, 5, 6, 7]) {
    await age.fill(String(value));
    const entries = page.locator(".schedule-entry");
    await expect(entries).toHaveCount(3);
    for (const entry of await entries.all()) {
      await expect(entry.locator("h3")).toHaveText("Маугли");
    }
  }
  await age.fill("8");
  await expect(
    page.locator(".schedule-entry h3").filter({ hasText: "Каратэ" }).first(),
  ).toBeVisible();
  await expect(
    page.locator(".schedule-entry h3").filter({ hasText: "Маугли" }),
  ).toHaveCount(0);
});

test("schedule program and age filters remain compatible", async ({ page }) => {
  await page.goto("/schedule?program=bjj");
  await expect(page.getByLabel("Направление", { exact: true })).toHaveValue(
    "bjj",
  );
  await expect(page.locator(".schedule-entry")).toHaveCount(3);
  await page.getByLabel("Возраст", { exact: true }).fill("6");
  await expect(page.locator(".schedule-entry")).toHaveCount(0);
  await page.getByLabel("Возраст", { exact: true }).fill("7");
  await expect(page.locator(".schedule-entry")).toHaveCount(0);
  await page.getByLabel("Возраст", { exact: true }).fill("8");
  await expect(page.locator(".schedule-entry")).toHaveCount(3);
});
test("club pages show schedules and contacts without hall details", async ({
  page,
}) => {
  for (const path of [
    "/",
    "/schedule",
    "/kyokushin",
    "/bjj",
    "/mowgli",
    "/contacts",
  ]) {
    await page.goto(path);
    await expect(page.locator("body")).not.toContainText(
      /(?:Наши залы|Зал BJJ|Адрес уточняйте|Адрес зала уточняйте|проспект Королёва)/,
    );
  }
  await page.goto("/schedule");
  await expect(page.getByLabel("Зал", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Направление", { exact: true })).toBeVisible();
  await expect(page.locator(".schedule-entry").first()).toBeVisible();
  await page.goto("/contacts");
  await expect(
    page.getByRole("link", { name: "Смотреть расписание" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Позвонить в клуб" }),
  ).toBeVisible();
});
test("mobile menu is keyboard accessible", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Открыть меню" }).click();
  await expect(
    page.getByRole("navigation", { name: "Мобильная навигация" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Мобильная навигация" })
    .getByRole("link", { name: "Стоимость" })
    .click();
  await expect(page).toHaveURL(/pricing/);
  await expect(
    page.getByRole("navigation", { name: "Мобильная навигация" }),
  ).toHaveCount(0);
});
test("trial booking provides club contacts without collecting applications", async ({
  page,
}) => {
  await page.goto("/contacts#application");
  const section = page.locator("#application");
  await expect(
    section.getByRole("link", { name: "Позвонить в клуб" }),
  ).toHaveAttribute("href", "tel:+79250173216");
  await expect(section.locator("form")).toHaveCount(0);
});

test("prices are loaded from local content and restrictions are visible", async ({
  page,
}) => {
  await page.goto("/pricing");
  await expect(page.locator("body")).toContainText("4 500");
  await expect(page.locator("body")).toContainText(
    "действующего студенческого билета",
  );
  await expect(page.locator("body")).toContainText("минимум 3 соревнования");
  await expect(page.locator("body")).toContainText("Оплата только наличными");
});
test("404 returns a real 404 status", async ({ page }) => {
  const response = await page.goto("/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Страница не найдена" }),
  ).toBeVisible();
});
test("SSR metadata robots and sitemap", async ({ request }) => {
  const home = await request.get("/");
  expect(await home.text()).toContain("Спортивный клуб в Королёве");
  expect(await home.text()).toContain('rel="canonical"');
  expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap:");
  expect(await (await request.get("/sitemap.xml")).text()).toContain(
    "/coaches/ryazhsky",
  );
});
test("responsive pages have no horizontal overflow", async ({ page }) => {
  for (const width of [320, 360, 375, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/schedule", "/pricing", "/contacts"]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        path + " at " + width,
      ).toBe(true);
    }
  }
  await page.goto("/");
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
});
