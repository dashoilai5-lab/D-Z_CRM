// 真实负载：50 并发（CRM 内部工具场景），阈值 p95<2s
import http from "k6/http";
import { check, sleep } from "k6";
const BASE = __ENV.URL || "https://d-z-crm.vercel.app";
const PAGES = ["/", "/login", "/catalogue", "/rider/home", "/workshop/dashboard"];
export const options = {
  vus: 50, duration: "90s",
  thresholds: { http_req_duration: ["p(95)<2000"], http_req_failed: ["rate<0.05"] },
};
export default function () {
  const p = PAGES[Math.floor(Math.random() * PAGES.length)];
  const res = http.get(BASE + p);
  check(res, { "status<500": (r) => r.status < 500 });
  sleep(0.5);
}
