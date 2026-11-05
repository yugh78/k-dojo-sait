import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import content from "../../app/data/club.json" with { type: "json" };
import { scheduleDays, scheduleBookingMessage } from "../../app/utils/schedule";

async function openSchedule(page: Page) {
  await page.getByRole("button", { name: "Все дни и группы" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Расписание тренировок K-Dojo",
  });
  await expect(dialog).toBeVisible();
  return dialog;
}

test("home preview stays brief; modal keeps every session and selects today on each opening", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-11-02T10:00:00Z"));
  await page.goto("/");
  const days = page.locator(".schedule-day");
  await expect(days).toHaveCount(3);
  for (let day = 0; day < 3; day++) {
    await expect(days.nth(day).locator(".schedule-entry")).toHaveCount(2);
    expect(
      await days
        .nth(day)
        .locator(".schedule-entry")
        .evaluateAll((entries) =>
          entries.map((entry) => Number(entry.getAttribute("data-entry-id"))),
        ),
    ).toEqual(
      content.schedule
        .filter((entry) => entry.weekday === day)
        .slice(0, 2)
        .map((entry) => entry.id),
    );
  }
  const dialog = await openSchedule(page);
  await expect(page).toHaveURL(/\/$/);
  await expect(
    dialog.getByRole("tab", { name: "Понедельник" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    dialog.getByRole("button", { name: "Закрыть расписание" }),
  ).toBeFocused();
  await expect(
    dialog.locator(".schedule-entry time").filter({ hasText: /^18:45/ }),
  ).toHaveCount(2);
  for (let day = 0; day < 7; day++) {
    await dialog.getByRole("tab", { name: scheduleDays[day]!.name }).click();
    const rows = content.schedule.filter((entry) => entry.weekday === day);
    await expect(dialog.locator(".schedule-entry")).toHaveCount(rows.length);
    expect(
      await dialog
        .locator(".schedule-entry")
        .evaluateAll((entries) =>
          entries.map((entry) => Number(entry.getAttribute("data-entry-id"))),
        ),
    ).toEqual(rows.map((entry) => entry.id));
    await expect(dialog.locator(".schedule-modal-summary")).toContainText(
      String(rows.length),
    );
  }
  await expect(dialog).toContainText("В этот день занятий нет");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Все дни и группы" }),
  ).toBeFocused();
  await page.clock.setFixedTime(new Date("2026-11-03T10:00:00Z"));
  await openSchedule(page);
  await expect(dialog.getByRole("tab", { name: "Вторник" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("modal filters intersect and booking reuses ApplicationForm with the exact session", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  const dialog = await openSchedule(page);
  await dialog.getByRole("tab", { name: "Вторник" }).click();
  await dialog.getByLabel("Возраст", { exact: true }).fill("7");
  await expect(dialog.locator(".schedule-entry")).toHaveCount(1);
  await expect(dialog.locator(".schedule-entry h3")).toHaveText("Маугли");
  await dialog.getByLabel("Направление", { exact: true }).selectOption("bjj");
  await expect(dialog.locator(".schedule-entry")).toHaveCount(0);
  await dialog.getByLabel("Возраст", { exact: true }).fill("8");
  await expect(dialog.locator(".schedule-entry")).toHaveCount(1);
  const entry = content.schedule.find(
    (entry) => entry.weekday === 1 && entry.program.slug === "bjj",
  )!;
  const otherCoach = content.coaches.find(
    (coach) => !entry.coaches.some((item) => item.id === coach.id),
  )!;
  await dialog
    .getByLabel("Тренер", { exact: true })
    .selectOption(String(otherCoach.id));
  await expect(dialog.locator(".schedule-entry")).toHaveCount(0);
  await dialog
    .getByLabel("Тренер", { exact: true })
    .selectOption(String(entry.coaches[0]!.id));
  const book = dialog.getByRole("button", { name: "Записаться", exact: false });
  await book.click();
  const application = dialog.locator("#schedule-application");
  await expect(application).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expect(application.getByLabel("Сообщение для клуба")).toHaveValue(
    scheduleBookingMessage(entry),
  );
  for (const value of [
    entry.program.name,
    "Вторник",
    "18:00–19:30",
    entry.audience,
    entry.coaches[0]!.full_name,
  ])
    await expect(application.locator(".application-selection")).toContainText(
      value,
    );
  const href = await application
    .getByRole("link", { name: "Написать в Telegram" })
    .getAttribute("href");
  expect(new URL(href!).searchParams.get("text")).toBe(
    scheduleBookingMessage(entry),
  );
  await expect(
    application.getByRole("link", { name: "Позвонить в клуб" }),
  ).toHaveAttribute("href", "tel:+79250173216");
  await application
    .getByRole("button", { name: "Скопировать сообщение" })
    .click();
  expect(
    (await page.evaluate(() => navigator.clipboard.readText())).replace(
      /\r\n/g,
      "\n",
    ),
  ).toBe(scheduleBookingMessage(entry));
  await dialog.getByRole("button", { name: "К расписанию" }).click();
  await expect(book).toBeFocused();
  await expect(dialog.getByLabel("Возраст", { exact: true })).toHaveValue("8");
  await expect(dialog.getByLabel("Направление", { exact: true })).toHaveValue(
    "bjj",
  );
  await dialog.getByRole("button", { name: "Сбросить фильтры" }).click();
  await expect(dialog.locator(".schedule-entry")).toHaveCount(3);
});

test("full page retains all groups and booking context survives a reload", async ({
  page,
}) => {
  await page.goto("/schedule");
  await expect(page.locator(".schedule-day")).toHaveCount(7);
  await expect(page.locator(".schedule-entry")).toHaveCount(
    content.schedule.length,
  );
  expect(
    await page
      .locator(".schedule-entry")
      .evaluateAll((entries) =>
        entries.map((entry) => Number(entry.getAttribute("data-entry-id"))),
      ),
  ).toEqual(content.schedule.map((entry) => entry.id));
  const entry = content.schedule.find(
    (entry) => entry.weekday === 0 && entry.start_time === "18:45:00",
  )!;
  await page
    .locator(`[data-entry-id="${entry.id}"]`)
    .getByRole("link", { name: "Записаться в группу" })
    .click();
  await expect(page).toHaveURL(new RegExp(`session=${entry.id}`));
  await expect(
    page.locator("#application").getByLabel("Сообщение для клуба"),
  ).toHaveValue(scheduleBookingMessage(entry));
  await page.reload();
  await expect(
    page.locator("#application").getByLabel("Сообщение для клуба"),
  ).toHaveValue(scheduleBookingMessage(entry));
});

test("modal keyboard navigation, focus trap, dismissal and scroll restoration", async ({
  page,
}) => {
  await page.goto("/");
  const dialog = await openSchedule(page);
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  await dialog.getByRole("tab", { name: "Понедельник" }).click();
  await page.keyboard.press("ArrowLeft");
  await expect(dialog.getByRole("tab", { name: "Воскресенье" })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(dialog.getByRole("tab", { name: "Понедельник" })).toBeFocused();
  await page.keyboard.press("End");
  await expect(dialog.getByRole("tab", { name: "Воскресенье" })).toBeFocused();
  for (let step = 0; step < 12; step++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);
  }
  const scroll = await page.evaluate(() => window.scrollY);
  await page.mouse.move(2, 2);
  await page.mouse.wheel(0, 600);
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await page.mouse.click(2, 2);
  await expect(dialog).not.toBeVisible();
  await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
  await expect(
    page.getByRole("button", { name: "Все дни и группы" }),
  ).toBeFocused();
  await openSchedule(page);
  await dialog.getByRole("button", { name: "Закрыть расписание" }).click();
  await expect(dialog).not.toBeVisible();
});

test("schedule and booking fit phones, tablets and desktops and pass accessibility checks", async ({
  page,
}) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const dialog = await openSchedule(page);
    await dialog.getByRole("tab", { name: "Понедельник" }).click();
    await expect(dialog).toHaveCSS("animation-name", "none");
    const box = (await dialog.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(
      await dialog.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    await dialog.screenshot({
      path: `test-results/schedule-modal-${width}.png`,
    });
    expect(
      await dialog
        .locator(".schedule-modal-body")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    const closeBox = (await dialog
      .getByRole("button", { name: "Закрыть расписание" })
      .boundingBox())!;
    expect(closeBox.width).toBeGreaterThanOrEqual(44);
    expect(closeBox.height).toBeGreaterThanOrEqual(44);
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
    await dialog
      .getByRole("button", { name: "Записаться", exact: false })
      .first()
      .click();
    await expect(dialog.locator("#schedule-application")).toBeVisible();
    expect(
      await dialog.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    const bookingScan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(bookingScan.violations).toEqual([]);
    await dialog.screenshot({
      path: `test-results/schedule-booking-${width}.png`,
    });
    expect(
      await dialog
        .locator(".schedule-modal-body")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  }
});
