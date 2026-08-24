import http from "k6/http";
import { check, sleep } from "k6";
const BASE = __ENV.URL || "https://d-z-crm.vercel.app";
const PAGES = ["/", "/login", "/catalogue", "/rider/home", "/workshop/dashboard"];
export const options = { vus: 3, duration: "30s" };
export default function () {
  const i = __ITER % PAGES.length;
  const p = PAGES[i];
  const res = http.get(BASE + p, { tags: { page: p } });
  check(res, { "ok": (r) => r.status < 500 });
  sleep(0.5);
}
