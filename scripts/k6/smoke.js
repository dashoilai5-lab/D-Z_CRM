// k6 冒烟测试：10 VU × 60s，验证生产可用性
import http from "k6/http";
import { check, sleep } from "k6";
const BASE = __ENV.URL || "https://d-z-crm.vercel.app";
const PAGES = ["/", "/login", "/catalogue", "/rider/home", "/workshop/dashboard"];
export const options = { vus: 10, duration: "60s" };
export default function () {
  const p = PAGES[Math.floor(Math.random() * PAGES.length)];
  const res = http.get(BASE + p);
  check(res, { "status<500": (r) => r.status < 500 });
  sleep(1);
}
