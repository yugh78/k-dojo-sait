import { test, expect } from "@playwright/test";
test("all main pages, real API content and no browser exceptions", async ({
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
test("schedule program and age filtering", async ({ page }) => {
  await page.goto("/schedule?program=bjj");
  await expect(page.getByLabel("Направление", { exact: true })).toHaveValue(
    "bjj",
  );
  await expect(page.locator(".schedule-entry")).toHaveCount(3);
  await page.getByLabel("Возраст", { exact: true }).fill("6");
  await expect(page.locator(".schedule-entry")).toHaveCount(0);
  await page.getByLabel("Возраст", { exact: true }).fill("7");
  await expect(page.locator(".schedule-entry")).toHaveCount(3);
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
test("application validates then saves through Django with CSRF", async ({
  page,
}) => {
  await page.goto("/contacts?program=mowgli#application");
  const form = page.locator("#application");
  await form.getByRole("button", { name: "Записаться бесплатно" }).click();
  await expect(form.locator("input[name=name]")).toBeFocused();
  await form.getByLabel("Ваше имя").fill("E2E demo application");
  await form.getByLabel("Телефон", { exact: true }).fill("invalid");
  await form.getByLabel("Возраст занимающегося").fill("8");
  await form.locator("input[name=consent]").check();
  await expect(form).toContainText("Мы всё равно поможем");
  await form.getByRole("button", { name: "Записаться бесплатно" }).click();
  await expect(form.getByRole("alert")).toContainText("Укажите телефон");
  await form.getByLabel("Телефон", { exact: true }).fill("+7 (999) 000-00-01");
  await form.getByRole("button", { name: "Записаться бесплатно" }).click();
  await expect(form.getByRole("status")).toContainText("Заявка сохранена");
});
test("prices are loaded from API and restrictions are visible", async ({
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
