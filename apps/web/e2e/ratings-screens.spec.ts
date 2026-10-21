import { expect, test } from "@playwright/test";

// Screenshots of /post/demo's rating UI at the design's widths, for comparing with design/Ratings.html by eye. They go to
// test-results/ratings-screens. Dark only switches the rating tokens (data-theme="dark"): the rest of Shoof has no dark
// styles yet. Every width must fit without horizontal scrolling.

const WIDTHS = [1440, 390, 360];

for (const theme of ["light", "dark"] as const) {
  for (const width of WIDTHS) {
    test(`ratings at ${width}px, ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/post/demo");
      if (theme === "dark") await page.evaluate(() => (document.documentElement.dataset.theme = "dark"));
      const card = page.locator("section.rt-card");
      await expect(card.getByRole("radio")).toHaveCount(5);

      const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
      expect(fits).toBe(true);

      const dir = "test-results/ratings-screens";
      await page.locator(".phead").screenshot({ path: `${dir}/${width}-${theme}-meta.png` });
      await card.screenshot({ path: `${dir}/${width}-${theme}-card.png` });

      // The prompt, after "visiting" the live site and coming back
      await page.evaluate(() => {
        const popup = window.open;
        window.open = () => null;
        document.querySelector<HTMLAnchorElement>("a.visit")?.click();
        window.open = popup;
      });
      await page.evaluate(() => {
        Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
      });
      await page.waitForTimeout(3200);
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
      await expect(page.getByRole("region", { name: "Rate this site" })).toBeVisible();
      await page.screenshot({ path: `${dir}/${width}-${theme}-prompt.png` });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  }
}
