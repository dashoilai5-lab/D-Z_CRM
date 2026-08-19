import { test, expect } from "@playwright/test";
import { BASE_URL, setPersona } from "./helpers";

test.describe("sidebar uniform top spacing", () => {
  test.skip(({ isMobile }) => isMobile, "desktop only");

  test("gaps between logo/user/nav are uniform in both states", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await setPersona(ctx, "OWNER");
    await page.goto(BASE_URL + "/workshop/dashboard");
    await page.waitForTimeout(300);

    const aside = page.locator("aside");

    const measure = () => aside.evaluate(() => {
      const link = document.querySelector("aside a[href='/workshop/dashboard']")!.getBoundingClientRect();
      const user = document.querySelector("aside > a[href='/workshop/dashboard'] + div")!.getBoundingClientRect();
      const firstNav = document.querySelector("aside nav a")!.getBoundingClientRect();
      return { g1: Math.round(user.top - link.bottom), g2: Math.round(firstNav.top - user.bottom) };
    });

    // collapsed: gaps should be equal
    const c = await measure();
    expect(Math.abs(c.g1 - c.g2)).toBeLessThanOrEqual(1);

    // expanded: gaps should be equal (and larger)
    await aside.hover();
    await expect(aside).toHaveCSS("width", "208px", { timeout: 5000 });
    const x = await measure();
    expect(Math.abs(x.g1 - x.g2)).toBeLessThanOrEqual(1);
    expect(x.g1).toBeGreaterThanOrEqual(8);
    await ctx.close();
  });
});
