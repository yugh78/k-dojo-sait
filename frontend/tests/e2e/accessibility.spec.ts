import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("key pages pass automated WCAG AA checks", async ({ page }) => {
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/schedule", "/pricing", "/contacts"]) {
      await page.goto(path);
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(scan.violations, path + " at " + width).toEqual([]);
    }
  }
});
