import { expect, type BrowserContext, type Page } from "@playwright/test";

export const BASE_URL = "http://localhost:3102";

export type DemoPersona = "OWNER" | "COUNTER_STAFF" | "MECHANIC" | "CUSTOMER";

/** §13 — persona → 真实 Supabase 账号（DEMO_ACCOUNTS.md，密码统一 Dashoil@!789）。 */
const ACCOUNT: Record<DemoPersona, { email: string; path: string }> = {
  OWNER: { email: "daniel.tan@dz.my", path: "/login" },
  COUNTER_STAFF: { email: "mei.ling.wong@dz.my", path: "/login" },
  MECHANIC: { email: "aizat.bin.ismail@dz.my", path: "/login" },
  CUSTOMER: { email: "ahmad.danial@dz.my", path: "/rider/login" },
};

/** 用真实 Supabase 账号登录（替代旧的 persona cookie）。 */
export async function setPersona(context: BrowserContext, persona: DemoPersona) {
  const account = ACCOUNT[persona];
  const page = await context.newPage();
  // 清掉可能的旧 session，再走登录表单
  await context.clearCookies();
  await page.goto(BASE_URL + account.path);
  await page.waitForTimeout(600);
  // 登录页：第一个非密码输入框（rider login 是手机/邮箱 type=text；workshop login 是 email）+ 密码 + Sign in
  await page.fill('form input:not([type="password"])', account.email);
  await page.fill('input[type="password"]', "Dashoil@!789");
  await page.getByRole("button", { name: /sign in/i }).click();
  // 等待 session cookie 写入（跳转或 header 更新）
  await page.waitForTimeout(1500);
  await page.close();
}

/** 让一个 action 触发的 router.push/refresh 稳定后再下一步（webkit 竞态）。 */
export async function settle(page: Page) {
  await page.waitForTimeout(600);
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
  // branch locator: pick the main branch first, then the booking form appears
  await page.locator('a[href*="branch="]').first().click();
  await settle(page);
  const date = isoInDays(days);
  await page.fill('input[type="date"]', date);
  await page.waitForTimeout(400);
  // 选第一个可用时段（真实 slots 或 estimated；book-submit 需 timeSlot）
  await page.locator('[data-testid^="slot-"]').first().click();
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
  await page.goto(BASE_URL + "/mechanic-app/jobs/" + jobId); // 隔离：mechanic 只能 mechanic app
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
