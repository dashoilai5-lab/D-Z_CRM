import { chromium } from "@playwright/test";
async function main() {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addCookies([{ name: "dz_demo_persona", value: "OWNER", url: "http://localhost:3002" }, { name: "dz_lang", value: "en", url: "http://localhost:3002" }]);
  await ctx.addInitScript(() => { try { localStorage.setItem("theme", "dark"); } catch {} document.documentElement.classList.add("dark"); });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3002/workshop/dashboard", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const m = await p.evaluate(() => {
    const css = getComputedStyle(document.documentElement);
    const btn = document.querySelector("a.bg-primary, button.bg-primary");
    return {
      bg: css.getPropertyValue("--background").trim(),
      card: css.getPropertyValue("--card").trim(),
      primary: css.getPropertyValue("--primary").trim(),
      btnBg: btn ? getComputedStyle(btn).backgroundColor : null,
    };
  });
  console.log("tokens:", JSON.stringify(m));
  await p.screenshot({ path: "browser-screenshots/dark-redesign-dashboard.png" });
  await b.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
