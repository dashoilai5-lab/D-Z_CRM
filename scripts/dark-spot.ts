import { chromium } from "@playwright/test";
async function main() {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addCookies([{ name: "dz_demo_persona", value: "OWNER", url: "http://localhost:3002" }, { name: "dz_lang", value: "en", url: "http://localhost:3002" }]);
  await ctx.addInitScript(() => { try { localStorage.setItem("theme", "dark"); } catch {} document.documentElement.classList.add("dark"); });
  const p = await ctx.newPage();
  for (const [n, path] of [["dark2-staff", "/workshop/staff"], ["dark2-calendar", "/workshop/marketing/calendar"], ["dark2-packages", "/workshop/packages"]]) {
    await p.goto("http://localhost:3002" + path, { waitUntil: "networkidle" });
    await p.waitForTimeout(400);
    const badge = await p.evaluate(() => {
      const el = [...document.querySelectorAll("span")].find((s) => /bg-(amber|blue|emerald|red|slate|indigo|violet)-(50|100|950)/.test(s.className));
      if (!el) return null;
      return { cls: el.className.slice(0, 100), bg: getComputedStyle(el).backgroundColor };
    });
    await p.screenshot({ path: "browser-screenshots/" + n + ".png" });
    console.log(n, "badge:", badge ? badge.cls + " -> " + badge.bg : "none");
  }
  await b.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
