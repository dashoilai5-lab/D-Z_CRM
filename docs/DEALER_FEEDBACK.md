# Dealer / Customer Feedback

To be completed after the first dealer validation session (§54 Phase 1 stop).

## Rehearsal status (19 Aug 2026)

Full DEMO_SCRIPT (20 steps) rehearsed end-to-end — **all PASS**. Journey numbers
verified: booking → check-in DZ1189 → oil filter RM25 → chain WARNING → approval
RM20 → complete → invoice **RM165** → next service **34,800 km / Nov 2026**.

Known data drift (seed is date-anchored — see DEMO_SCRIPT note):
- Jobs Today / Critical Stock / Customers Due vary by run date (expected).

## Open product decisions (awaiting dealer sign-off)

| # | Decision | Our current choice | Evidence |
| --- | --- | --- | --- |
| 1 | Standard RM120 excludes oil filter (counter add-on) | ✅ as-is | §48 invoice 120+25+20=165 |
| 2 | Service interval 3,000 km / ~1,000 km per month | ✅ as-is | §29 deterministic |
| 3 | Gross Profit RM3,203 vs spec RM1,420 | ours = honest COGS; confirm labour model | parts + labour split |
| 4 | Aizat KPI ≈95 vs spec 92 | deterministic formula | seeded data |
| 5 | Demo auto-pays invoices (PAID) | OK for prototype | no gateway in §48 |
| 6 | "Jobs Today 28" vs board totals | consistent counting (24 today) | spec internally inconsistent |

## Feedback log

| Date | Source | Feedback | Decision |
| --- | --- | --- | --- |
| 2026-08-19 | Internal rehearsal | All 20 demo steps pass; date-anchored counts drift (expected) | Documented in DEMO_SCRIPT |
| — | Dealer (pending) | (pending) | — |
