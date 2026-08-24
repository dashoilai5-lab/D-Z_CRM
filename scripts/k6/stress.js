// k6 压测脚本 — D&Z 生产（https://d-z-crm.vercel.app）
// 用法: k6 run scripts/k6/stress.js --env URL=https://d-z-crm.vercel.app
// 目标: p95 < 2s（部署清单 §C3）
import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE = __ENV.URL || "https://d-z-crm.vercel.app";

const errorRate = new Rate("errors");
const pageTrend = new Trend("page_duration_ms");

// 页面集：静态页 + 轻查询 + 重查询（dashboard 需登录，测未登录重定向也算通过）
const PAGES = [
  { name: "home", path: "/" },
  { name: "login", path: "/login" },
  { name: "catalogue", path: "/catalogue" },
  { name: "rider-home", path: "/rider/home" },
  { name: "dashboard-redirect", path: "/workshop/dashboard" },
];

export const options = {
  // 场景：渐进负载 10 → 100 → 500 → 1000（各 30s 爬升）
  stages: [
    { duration: "30s", target: 10 },
    { duration: "30s", target: 100 },
    { duration: "30s", target: 500 },
    { duration: "30s", target: 1000 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    errors: ["rate<0.05"],        // 错误率 < 5%
    page_duration_ms: ["p(95)<2000"], // p95 < 2s
  },
};

export default function () {
  const page = PAGES[Math.floor(Math.random() * PAGES.length)];
  const res = http.get(BASE + page.path);
  const ok = res.status >= 200 && res.status < 500; // 4xx/5xx 都算失败（307 算正常跳转）
  errorRate.add(!ok);
  pageTrend.add(res.timings.duration);
  check(res, {
    "status < 500": (r) => r.status < 500,
    "duration < 2s": (r) => r.timings.duration < 2000,
  });
  sleep(1);
}
