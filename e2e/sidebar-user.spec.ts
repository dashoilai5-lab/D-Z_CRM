import { test, expect } from "@playwright/test";
import { BASE_URL, setPersona } from "./helpers";

test.describe("sidebar user block + centering", () => {
  test.skip(({ isMobile }) => isMobile, "sidebar is desktop-only");

  test("icons centered, user info hidden collapsed, revealed on hover", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await setPersona(ctx, "OWNER");
    await page.goto(BASE_URL + "/workshop/dashboard");
    await page.waitForTimeout(300);

    const aside = page.locator("aside");

    // icons centered in the 56px rail
    const iconCenters = await aside.evaluate(() => {
      const w = document.querySelector("aside")!.getBoundingClientRect().width;
      const c = w / 2;
      const logo = document.querySelector("aside a[href='/workshop/dashboard'] div[class*='rounded-xl']")!.getBoundingClientRect();
      const nav = document.querySelector("aside nav a svg")!.getBoundingClientRect();
      return { logoOff: Math.abs(logo.x + logo.width / 2 - c), navOff: Math.abs(nav.x + nav.width / 2 - c) };
    });
    expect(iconCenters.logoOff).toBeLessThan(2);
    expect(iconCenters.navOff).toBeLessThan(2);

    // user block visible (initials), name hidden while collapsed (opacity on the text wrapper)
    const nameWrap = aside.getByText("Daniel Tan").locator("..");
    await expect(nameWrap).toHaveCSS("opacity", "0");

    // hover reveals name + role
    await aside.hover();
    await expect(aside).toHaveCSS("width", "208px", { timeout: 5000 });
    await expect(nameWrap).toHaveCSS("opacity", "1", { timeout: 5000 });

    // role-aware: MECHANIC 被隔离到 mechanic app（访问 workshop OS 重定向）
    await setPersona(ctx, "MECHANIC");
    await page.goto(BASE_URL + "/workshop/dashboard");
    await page.waitForTimeout(600);
    // 隔离：mechanic 访问 workshop OS 被重定向到 mechanic app
    await expect(page).toHaveURL(/\/mechanic-app/);

    await ctx.close();
  });
});
