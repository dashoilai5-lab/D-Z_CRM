
import { chromium } from "@playwright/test";
import * as fs from "node:fs";

const BASE = "http://localhost:3002";
const MOBILE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...MOBILE, locale: "en-MY" });
  await ctx.addCookies([
    { name: "dz_demo_persona", value: "CUSTOMER", url: BASE },
    { name: "dz_lang", value: "en", url: BASE },
  ]);
  const page = await ctx.newPage();

  const riderPages = [
    ["rider-home", "/rider/home"],
    ["rider-book", "/rider/book"],
    ["rider-bookings", "/rider/bookings"],
    ["rider-profile", "/rider/profile"],
    ["rider-service-status", "/rider/service-status"],
    ["rider-motorcycles", "/rider/motorcycles"],
  ];

  const issues = [];
  for (const [name, path] of riderPages) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const main = document.querySelector("main");
      const nav = document.querySelector("nav");
      const bottomNav = [...document.querySelectorAll("div,nav")].find((el) => el.getBoundingClientRect().top < 9999 && el.getBoundingClientRect().bottom >= window.innerHeight - 40);
      return {
        scrollW: doc.scrollWidth, innerW: window.innerWidth,
        mainBottomPad: main ? getComputedStyle(main).paddingBottom : null,
        mainRectBottom: main ? main.getBoundingClientRect().bottom : null,
        vh: window.innerHeight,
      };
    });
    const hScroll = metrics.scrollW > metrics.innerW + 1;
    const padOk = metrics.mainBottomPad && parseFloat(metrics.mainBottomPad) >= 96;
    if (hScroll) issues.push(name + " HORIZONTAL SCROLL " + metrics.scrollW + ">" + metrics.innerW);
    if (!padOk) issues.push(name + " main pb=" + metrics.mainBottomPad);
    await page.screenshot({ path: "browser-screenshots/mobile-" + name + ".png", fullPage: false });
    console.log(name, "h-scroll:", hScroll, "| pb:", metrics.mainBottomPad, "| rect-bottom:", metrics.mainRectBottom?.toFixed(0), "/ vh", metrics.vh);
  }

  // workshop mobile (OWNER)
  await ctx.addCookies([{ name: "dz_demo_persona", value: "OWNER", url: BASE }]);
  const wsPages = [
    ["workshop-dashboard", "/workshop/dashboard"],
    ["workshop-leads", "/workshop/leads"],
    ["workshop-bookings", "/workshop/bookings"],
    ["workshop-jobs", "/workshop/jobs"],
    ["workshop-customers", "/workshop/customers"],
  ];
  for (const [name, path] of wsPages) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      return { scrollW: doc.scrollWidth, innerW: window.innerWidth };
    });
    const hScroll = metrics.scrollW > metrics.innerW + 1;
    if (hScroll) issues.push(name + " HORIZONTAL SCROLL " + metrics.scrollW + ">" + metrics.innerW);
    await page.screenshot({ path: "browser-screenshots/mobile-" + name + ".png" });
    console.log(name, "h-scroll:", hScroll);
  }

  console.log("--- ISSUES ---");
  console.log(issues.length ? issues.join("\n") : "none");
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
