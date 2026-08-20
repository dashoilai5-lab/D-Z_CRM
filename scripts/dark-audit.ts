
import { chromium } from "@playwright/test";

const BASE = "http://localhost:3002";

async function main() {
  const browser = await chromium.launch();
  // desktop dark
  const dctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await dctx.addCookies([
    { name: "dz_demo_persona", value: "OWNER", url: BASE },
    { name: "dz_lang", value: "en", url: BASE },
  ]);
  await dctx.addInitScript(() => {
    try { localStorage.setItem("theme", "dark"); } catch {}
    document.documentElement.classList.add("dark");
  });
  const page = await dctx.newPage();
  const pages = [
    ["dark-dashboard", "/workshop/dashboard"],
    ["dark-leads", "/workshop/leads"],
    ["dark-bookings", "/workshop/bookings"],
    ["dark-customers", "/workshop/customers"],
    ["dark-jobs", "/workshop/jobs"],
    ["dark-login", "/login"],
  ];
  for (const [name, path] of pages) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    const metrics = await page.evaluate(() => {
      // sample computed colors of common surfaces to detect light-on-dark issues
      const doc = document.documentElement;
      const bodyBg = getComputedStyle(document.body).backgroundColor;
      return { bodyBg, htmlDark: doc.classList.contains("dark") };
    });
    await page.screenshot({ path: "browser-screenshots/" + name + ".png" });
    console.log(name, "dark:", isDark, "| bodyBg:", metrics.bodyBg);
  }

  // rider dark (CUSTOMER)
  const rctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  await rctx.addCookies([
    { name: "dz_demo_persona", value: "CUSTOMER", url: BASE },
    { name: "dz_lang", value: "en", url: BASE },
  ]);
  await rctx.addInitScript(() => {
    try { localStorage.setItem("theme", "dark"); } catch {}
    document.documentElement.classList.add("dark");
  });
  const rpage = await rctx.newPage();
  for (const [name, path] of [["dark-rider-home", "/rider/home"], ["dark-rider-book", "/rider/book"], ["dark-rider-profile", "/rider/profile"]]) {
    await rpage.goto(BASE + path, { waitUntil: "networkidle" });
    await rpage.waitForTimeout(400);
    await rpage.screenshot({ path: "browser-screenshots/" + name + ".png" });
    const bg = await rpage.evaluate(() => getComputedStyle(document.body).backgroundColor);
    console.log(name, "| bodyBg:", bg);
  }
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
