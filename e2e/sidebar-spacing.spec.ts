import { test, expect } from "@playwright/test";
import { BASE_URL, setPersona } from "./helpers";

test.describe("sidebar top spacing", () => {
  test.skip(({ isMobile }) => isMobile, "desktop only");

  test("logo card and user card are separated when expanded", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await setPersona(ctx, "OWNER");
    await page.goto(BASE_URL + "/workshop/dashboard");
    await page.waitForTimeout(300);

    const aside = page.locator("aside");
    await aside.hover();
    await expect(aside).toHaveCSS("width", "208px", { timeout: 5000 });

    const gap = await aside.evaluate(() => {
      const link = document.querySelector("aside a[href='/workshop/dashboard']")!.getBoundingClientRect();
      // user card = the div immediately after the logo link (contains initials circle)
      const userDiv = document.querySelector("aside > a[href='/workshop/dashboard'] + div")!;
      const user = userDiv.getBoundingClientRect();
      const nav = document.querySelector("aside nav")!.getBoundingClientRect();
      return { logoToUser: Math.round(user.top - link.bottom), userToNav: Math.round(nav.top - user.bottom) };
    });
    expect(gap.logoToUser).toBeGreaterThanOrEqual(8);
    expect(gap.userToNav).toBeGreaterThanOrEqual(8);
    await ctx.close();
  });
});
