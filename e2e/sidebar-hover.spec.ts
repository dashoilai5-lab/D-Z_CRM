import { test, expect } from "@playwright/test";
import { BASE_URL, setPersona } from "./helpers";

// The rail is desktop-only (hidden below lg) and hover needs a mouse —
// skip on mobile projects.
test.describe("sidebar hover-expand rail", () => {
  test.skip(({ isMobile }) => isMobile, "sidebar is hidden on mobile");

  test("collapsed by default, width-expands on hover, collapses on leave", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await setPersona(ctx, "OWNER");
    await page.goto(BASE_URL + "/workshop/dashboard");
    await page.waitForTimeout(300);

    const aside = page.locator("aside");
    // 1. collapsed by default (w-14 = 56px)
    await expect(aside).toHaveClass(/w-14/);
    await expect(aside).toHaveCSS("width", "56px");

    // labels are hidden while collapsed (opacity 0)
    const label = aside.getByText("Purchase Orders").first();
    await expect(label).toHaveCSS("opacity", "0");

    // 2. hover → expands (w-52 = 208px), labels fade in
    await aside.hover();
    await expect(aside).toHaveCSS("width", "208px", { timeout: 5000 });
    await expect(label).toHaveCSS("opacity", "1", { timeout: 5000 });

    // 3. cursor leaves → collapses back (reversible, zero persistence)
    await page.mouse.move(1400, 450);
    await expect(aside).toHaveCSS("width", "56px", { timeout: 5000 });
    await expect(label).toHaveCSS("opacity", "0");

    // 4. click via expanded rail navigates
    await aside.hover();
    await aside.getByText("Stock").first().click();
    await page.waitForURL("**/workshop/inventory/stock");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await ctx.close();
  });
});
