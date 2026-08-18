import { test, expect } from "@playwright/test";
import { BASE_URL, setPersona } from "./helpers";

test.describe("route smoke tests", () => {
  const workshopRoutes = [
    "/workshop/dashboard",
    "/workshop/customers",
    "/workshop/bookings",
    "/workshop/jobs",
    "/workshop/mechanic",
    "/workshop/crm/reminders",
    "/workshop/crm/return-list",
    "/workshop/staff/kpi",
    "/workshop/inventory/stock",
    "/workshop/inventory/dead-stock",
    "/workshop/finance/profit",
    "/workshop/ai",
  ];
  for (const route of workshopRoutes) {
    test("renders " + route, async ({ browser }) => {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await setPersona(ctx, "OWNER");
      const res = await page.goto(BASE_URL + route);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      await ctx.close();
    });
  }

  const riderRoutes = ["/rider/home", "/rider/book", "/rider/bookings", "/rider/approvals", "/rider/service-history", "/rider/invoices", "/rider/profile"];
  for (const route of riderRoutes) {
    test("renders " + route, async ({ browser }) => {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await setPersona(ctx, "CUSTOMER");
      const res = await page.goto(BASE_URL + route);
      expect(res?.status()).toBe(200);
      await ctx.close();
    });
  }
});
