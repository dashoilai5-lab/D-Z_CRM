import { expect, type BrowserContext, type Page } from "@playwright/test";

export const BASE_URL = "http://localhost:3102";

export type DemoPersona = "OWNER" | "COUNTER_STAFF" | "MECHANIC" | "CUSTOMER";

/** Let an action-triggered router.push/refresh settle before the next navigation (webkit races). */
export async function settle(page: Page) {
  await page.waitForTimeout(600);
}

/** §13 — set the demo persona via its cookie (equivalent to the DEMO bar select). */
export async function setPersona(context: BrowserContext, persona: DemoPersona) {
  await context.addCookies([{ name: "dz_demo_persona", value: persona, url: BASE_URL }]);
}

/** Booking dates must be unique per test — pass a distinct days offset. */
export function isoInDays(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

/**
 * The precise row for Ahmad's newest actionable booking. Located by the action
 * button (REQUESTED/CONFIRMED rows) rather than the date, so it stays unique
 * across worker/project boundaries where booking dates may repeat.
 */
export function ahmadBookingRow(page: Page, action: "Check In" | "Confirm" | "Cancel" | "Reschedule") {
  return page
    .getByTestId("booking-row")
    .filter({ hasText: "Ahmad Danial" })
    .filter({ has: page.getByRole("button", { name: action, exact: true }) })
    .last();
}

/** Rider books a Standard Service a few days out. Returns the display date. */
export async function bookViaRider(page: Page, ctx: BrowserContext, days = 2) {
  await setPersona(ctx, "CUSTOMER");
  await page.goto(BASE_URL + "/rider/book");
  await settle(page);
  const date = isoInDays(days);
  await page.fill('input[type="date"]', date);
  await page.getByTestId("book-submit").click();
  await page.waitForURL("**/rider/bookings");
  await expect(page.getByText("Waiting for confirmation").first()).toBeVisible();
  return { date, fmt: fmtDateISO(date) };
}

export function fmtDateISO(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" });
}

/** Workshop confirms the booking and checks in with a given mileage. Returns jobId. */
export async function confirmAndCheckIn(page: Page, ctx: BrowserContext, mileage = "31800") {
  await setPersona(ctx, "OWNER");
  await page.goto(BASE_URL + "/workshop/bookings");
  const row = ahmadBookingRow(page, "Check In");
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Confirm", exact: true }).click();
  await row.getByRole("button", { name: "Check In", exact: true }).click();
  await page.getByTestId("checkin-mileage").fill(mileage);
  await page.getByTestId("checkin-package").click();
  await page.getByText("Standard Service RM120", { exact: true }).click();
  await page.getByTestId("checkin-submit").click();
  await page.waitForURL("**/workshop/jobs/**");
  await settle(page);
  return page.url().split("/").pop() as string;
}

/** Mechanic runs the checklist: PASS×3, Chain WARNING, requests RM20 approval. */
export async function runMechanicInspection(page: Page, jobId: string) {
  await setPersona(page.context() as unknown as BrowserContext, "MECHANIC");
  await settle(page);
  await page.goto(BASE_URL + "/workshop/mechanic/jobs/" + jobId);
  await page.getByTestId("start-checklist").click();
  for (const item of ["Engine-Oil", "Oil-Filter", "Brake"]) {
    await page.getByTestId("result-" + item + "-PASS").click();
  }
  await page.getByTestId("result-Chain-WARNING").click();
  await page.getByPlaceholder(/Mechanic note/).fill("Chain is too loose.");
  await page.getByTestId("approval-request-Chain").click();
  await page.getByPlaceholder("Chain Adjustment").fill("Chain Adjustment");
  await page.getByPlaceholder("20").fill("20");
  await page.getByTestId("approval-send").click();
  await expect(page.getByText("WAITING CUSTOMER").first()).toBeVisible();
}
