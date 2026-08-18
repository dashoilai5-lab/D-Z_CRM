# Testing Architecture (§66-78)

Phase 1 ships a manual E2E-verified prototype. The automated suite is next:

## Unit (Vitest) — business logic only

- Profit: revenue 16500 − COGS 7200 = 9300 sen (§69)
- Stock: 20 − 1 = 19 units + StockMovement −1 reference DZ#### (§70)
- Next service: 31,800 + 3,000 = 34,800 km (§71)
- Approval: PENDING → APPROVED adds the item and updates the invoice (§72)
- Booking state machine, job transitions, reorder formula, KPI formula

## E2E (Playwright) — mandatory first test (§74)

`ahmad-complete-service-journey.spec.ts`: book → workshop receives → confirm →
check-in → job → mechanic inspection → chain warning → approval requested →
customer approves → complete → stock deducted → invoice RM165 → profit updated →
history updated → reminder created → rider app updated. **If it fails: DO NOT DEPLOY.**

More tests (§75): booking cancel/reschedule, package selection, repair decline,
low stock, dead stock, purchase order, KPI, return campaign, reminder, rider
invoice, multi-motorcycle. Browser matrix: desktop Chromium/Firefox/WebKit +
mobile Chromium/WebKit (heavy on mechanic & rider).

## Environments (§66)

LOCAL (SQLite) → PREVIEW (Vercel + Supabase preview branch per PR) → STAGING
(persistent, full QA/UAT) → PRODUCTION. Never test against production (§76).

## Performance (§77-78)

Grafana k6 on staging: 10/100/500/1,000 concurrent users. Targets: page load
< 2 s, customer search < 500 ms, passport < 1 s, API < 500 ms. Avoid N+1 and
unpaginated tables (repositories already include relations to prevent N+1).
