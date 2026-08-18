# Product Decisions & Assumptions (§17, §113)

Decisions made during Phase 0–1+3 that need dealer/customer confirmation:

1. **Standard Service RM120 excludes the oil filter** — the filter is a counter
   recommendation (matches the §48 invoice: Standard RM120 + Oil Filter RM25 +
   Chain Adjustment RM20 = RM165). Basic RM60 / Standard RM120 / Premium RM180
   (Best value). Confirm pricing with the real workshop.
2. **Service interval = 3,000 km / ~1,000 km per month** (≈3 months). Deterministic
   (§29/§71). Confirm actual interval policy.
3. **"Jobs Today 28" vs board totals**: board status pills show all open jobs +
   all-time completed; "Jobs Today" counts jobs created today. The spec's numbers
   (6/8/3/4/10 = 31 vs 28) are internally inconsistent — we chose consistency.
4. **Dashboard financials are computed live** from seed data: Today's Sales
   RM4,850 ✓, Avg Ticket RM173 ✓, Customers Due 18 ✓, Critical Stock 4 ✓, Dead
   Stock RM2,305 (spec: RM2,115 — close; exact figure depends on cost data),
   Gross Profit RM3,203 (spec: RM1,420 — ours is honest COGS from parts; confirm
   labour-cost modelling).
5. **Demo completion auto-pays invoices (PAID)** — no payment gateway in the
   prototype (§48). PaymentProvider interface ready for the production gateway.
6. **Completion is manual ("Complete Service")** rather than automatic on all
   checklist PASS — the workshop controls the money event. Confirmed by spec §27.
7. **Rider app renders as Ahmad Danial** in demo mode (the demo customer §49).
   Real authentication (Supabase Auth + roles §87) is a production concern.
8. **One persona per browser (cookie)** — a single-tab demo. Multi-window persona
   comparison is possible by using two browsers.
9. **Mechanic board shows all active jobs** (team view); "MY JOBS TODAY" counts
   today's jobs. A per-mechanic login would scope it (production RBAC).
10. **Zero-price "verified" lines** (Engine Oil ✓, Brake Check ✓ …) record what was
    done for the rider history without double-billing (§45).
11. **Aizat's KPI ≈ 95 (spec: 92)** — KPI is deterministic and computed from real
    seeded data; exact numbers depend on the seed sample, not on a hard-coded 92.
12. **Mileage regression is rejected** at completion (§103); a privileged,
    audited correction flow is a later phase.

Assumptions: Malaysian market (RM, Bahasa Malaysia sales scripts), single-workshop
demo tenant, SQLite local-first, WhatsApp as the primary channel.
