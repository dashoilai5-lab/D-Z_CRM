import { test, expect } from "@playwright/test";
import { BASE_URL, setPersona, settle } from "./helpers";

test.describe("§34-37 inventory intelligence", () => {
  test("stock alerts show CRITICAL products and reorder creates a PO draft", async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await setPersona(ctx, "OWNER");

    // alerts page lists the 4 seeded critical items
    await page.goto(BASE_URL + "/workshop/inventory/alerts");
    await expect(page.getByText("CRITICAL", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("BRK-FLUID", { exact: false }).first()).toBeVisible();

    // dead stock page shows the seeded slow movers
    await page.goto(BASE_URL + "/workshop/inventory/dead-stock");
    await expect(page.getByText("DEAD STOCK WARNING", { exact: false }).first()).toBeVisible();

    // reorder recommendation → accept → PO draft appears
    await page.goto(BASE_URL + "/workshop/inventory/reorder");
    const reorderBtn = page.getByRole("button", { name: /Reorder/ }).first();
    await expect(reorderBtn).toBeVisible();
    await reorderBtn.click();
    // wait until the server action has committed (toast confirms), then check the PO
    await expect(page.getByText(/Reorder draft created/).first()).toBeVisible({ timeout: 15_000 });
    await settle(page); // let the action's router.refresh settle before navigating (webkit race)
    await page.goto(BASE_URL + "/workshop/inventory/purchase-orders");
    await expect(page.getByText("DRAFT", { exact: true }).first()).toBeVisible();
    await ctx.close();
  });
});
