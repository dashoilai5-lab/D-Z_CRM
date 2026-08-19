# D&Z Platform — Handoff

> End of Day 1 — **18 Aug 2026**. Everything below is committed to git (3 commits on main).

## 1 · What exists today (all verified)

| Layer | Status | Proof |
| --- | --- | --- |
| Next.js 16 + React 19 + TS + Tailwind 4 + shadcn/ui (Base UI) | ✅ | pnpm build green · tsc --noEmit clean |
| Prisma 6 + SQLite schema (full §51 entity model) | ✅ | prisma/migrations/ (init + review_job) |
| Demo seed (103 customers · 136 bikes · 164 jobs · 82 products · 3 branches · 8 staff) | ✅ | deterministic RNG, anchored to today |
| Workshop OS (dashboard, customers, passport, bookings, jobs, mechanic, CRM, KPI, inventory, finance, AI) | ✅ | ~40 routes |
| Rider app (home, bikes, passport, book, bookings, status, approvals, history, invoices, profile) | ✅ | mobile-first, bottom nav |
| Master journey (§50/§74) — Ahmad books → check-in → chain approval RM20 → complete → invoice RM165 · next service 34,800 km (Nov 2026) · passport 12 visits / RM2,450 | ✅ | manual E2E + Playwright green |
| Unit tests (Vitest) | ✅ 15/15 | money, profit, prediction, reorder, state machines, KPI |
| E2E (Playwright) | ✅ 72/72 | 24 tests × Desktop Chromium + Mobile Chromium + Mobile WebKit |
| CI | ✅ | .github/workflows/ci.yml (lint → typecheck → vitest → playwright → build) |

## 2 · How to run tomorrow

    cd "/Users/Jun/Documents/CRM-D&Z"
    pnpm install                 # deps (node_modules persisted)
    pnpm db:reset                # wipe → migrate → seed (fresh demo state)
    pnpm dev                     # dev server (picks a free port; 3000 is taken by another app)
    pnpm start --port 3002       # production build + live demo on :3002
    pnpm test                    # Vitest (15)
    pnpm exec playwright test    # E2E matrix (72) — uses launchd e2e server on :3102 + its own DB
    pnpm build                   # production build

**LaunchAgents (keep servers alive — the sandbox kills plain background processes):**

    launchctl list | grep dz-platform                                   # status
    launchctl kickstart -k gui/$(id -u)/com.dz-platform.server          # demo server (:3002, dev.db)
    launchctl kickstart -k gui/$(id -u)/com.dz-platform.e2e             # e2e server (:3102, e2e.db)

> ⚠️ Ports: 3000 is owned by another AI session's app ("DashOil" — it force-kills whoever holds :3000). Keep D&Z on 3002 (demo) and 3102 (e2e). If a server dies, launchctl kickstart -k brings it back in seconds.

## 3 · Live URLs

- Demo: http://localhost:3002 (Workshop OS → /workshop/dashboard · Rider → /rider/home · persona switcher + RESET DEMO DATA in the amber bar)
- E2E: http://localhost:3102 (same app, e2e.db — tests reset it every run)
- Screenshots: screenshots/*.png

## 4 · Known traps (already fixed — don't rediscover)

1. Job numbers: compute max(jobNumber)+1, never count+offset (createdAt order ≠ number order).
2. SQLite nested interactive transactions deadlock — stock deduction must reuse the outer tx.
3. Package attach = one priced line ("Standard Service RM120") + zero-price verified lines + parts for COGS; never a merged price map.
4. Price inputs in RM — multiply ×100 to sen before persisting.
5. AI recs use lowercase part/item kinds — normalize with toUpperCase() in addRecommendation.
6. E2E server must be rebuilt (pnpm build) + kickstarted after ANY src change (testids live in the build).
7. e2e/global-setup wipes prisma/e2e.db then migrates + seeds; the e2e server must be restarted after seeding (stale SQLite handle).

## 5 · Open product decisions (need dealer/customer input)

1. Standard RM120 excludes the oil filter (it's the counter add-on — matches §48 invoice 120+25+20=165). Confirm.
2. Interval = 3,000 km / ~1,000 km per month (§29). Confirm.
3. Gross Profit RM3,203 vs spec RM1,420 — ours is honest COGS from parts; confirm labour-cost model.
4. Aizat KPI ≈ 95 vs spec 92 — deterministic formula on seed data.
5. Demo auto-pays invoices (PAID) — OK for prototype.
6. "Jobs Today 28" vs board totals — spec numbers inconsistent; we chose consistency.
   → Details in docs/PRODUCT_DECISIONS.md.

## 6 · Next steps (recommended order)

- [x] A · Remaining modules DONE (19 Aug): marketing calendar/posters/scripts UIs (CRUD + promo engine with discountPercent), purchase-order receiving (receive button → stock in + movements), promotions engine (pure functions + 5 unit tests), payment simulation (already had MockPaymentProvider).
- [ ] B · Dealer validation: fill docs/DEALER_FEEDBACK.md, run the DEMO_SCRIPT session, answer the decisions above.
- [ ] C · Production transition (§65): Supabase PostgreSQL + Auth + RLS, provider swap (WhatsApp/OpenAI/storage), Vercel deploy, Sentry, k6.
- [ ] D · Hardening: pagination on big tables, mileage-correction audit flow, i18n (BM/EN), dark mode for rider.

## 7 · Tomorrow's first 10 minutes

1. curl localhost:3002 → if down: launchctl kickstart -k gui/$(id -u)/com.dz-platform.server
2. git status → clean; read docs/HANDOFF.md + docs/PRODUCT_DECISIONS.md
3. pnpm test && pnpm exec playwright test → expect 15 + 72 green (baseline before new work)
4. Pick the next step from §6.
