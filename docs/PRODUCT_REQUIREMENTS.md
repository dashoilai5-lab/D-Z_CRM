# Product Requirements

Source: the D&Z PLATFORM master prompt (this workspace). Phase 1 scope = PHASE 0
foundation + PHASE 1 core workshop UI + PHASE 3 core rider UI + the first
workshop ↔ rider shared workflow, then stop for product review (§113).

## Products

- **D&Z Workshop OS** — operate, manage and grow the workshop (§5).
- **D&Z Rider** — one digital home for the motorcycle; mobile-first (§40-48).

## Core principle (§4, §112)

One transaction lifecycle: Customer → Motorcycle → Booking → Service Job →
Inspection → Customer Approval → Service → Parts → Invoice → Inventory → Profit →
Staff KPI → Service History → Reminder → CRM → Customer Returns. Two interfaces,
one shared database (§6), with data-access boundaries (§7).

## Phase 1 acceptance

1. Master demo journey works after RESET DEMO DATA (§50) — **verified**.
2. Persona switching preserves shared state (§13) — **verified**.
3. Booking flows rider → workshop and job status flows workshop → rider — **verified**.
4. Mechanic finding → rider approval → workshop job — **verified**.
5. Completion updates history, stock, invoice, reminder, passport — **verified**.
6. `pnpm db:reset` fully rebuilds demo data (§14) — **verified**.

## Not in Phase 1

Production auth, payments, real WhatsApp, OpenAI, marketing generator, purchase
receiving, promotions engine, k6 load tests, Sentry, CI/CD — designed in the
master prompt (§65-98) and documented; implementation follows product review.
