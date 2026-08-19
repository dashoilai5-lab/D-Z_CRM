import { test, expect } from "@playwright/test";
import { BASE_URL, setPersona } from "./helpers";

// The sidebar rail is desktop-only (hidden below lg) and hover needs a mouse —
// skip on mobile projects where it is hidden and contexts are touch-based.
test.describe("sidebar hover flyout", () => {
  test.skip(({ isMobile }) => isMobile, "sidebar is hidden on mobile");

  test("collapsed by default, expands on hover, collapses on leave", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await setPersona(ctx, "OWNER");
    await page.goto(BASE_URL + "/workshop/dashboard");
    await page.waitForTimeout(300);

    const aside = page.locator("aside");
    await expect(aside).toHaveClass(/w-16/);

    // flyout hidden initially
    const flyout = aside.locator(".absolute.left-full");
    await expect(flyout).toHaveCSS("opacity", "0");

    // hover the rail → flyout appears
    await aside.hover();
    await expect(flyout).toHaveCSS("opacity", "1", { timeout: 5000 });

    // no visual gap: flyout's left edge hugs the rail's right edge
    const railBox = await aside.locator(".flex.h-full.w-16").boundingBox();
    const flyoutBox = await flyout.boundingBox();
    expect(Math.abs(railBox!.x + railBox!.width - flyoutBox!.x)).toBeLessThan(1);

    // labels are visible in flyout
    await expect(flyout.getByText("Inventory", { exact: false }).first()).toBeVisible();
    await expect(flyout.getByText("Purchase Orders").first()).toBeVisible();

    // mouse moves onto the flyout itself → still open
    await flyout.getByText("Purchase Orders").first().hover();
    await expect(flyout).toHaveCSS("opacity", "1");

    // move away → collapses
    await page.mouse.move(1400, 450);
    await expect(flyout).toHaveCSS("opacity", "0", { timeout: 5000 });

    // click via flyout works: open a page, rail still shows active icon
    await aside.hover();
    await flyout.getByText("Stock").first().click();
    await page.waitForURL("**/workshop/inventory/stock");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await ctx.close();
  });
});
