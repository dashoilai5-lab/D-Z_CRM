# D&Z Platform — Workshop OS + Rider

**D&Z CONNECTS THE WORKSHOP AND THE RIDER.** One shared business system, two experiences:
D&Z Workshop OS for the team, D&Z Rider for motorcycle owners.

## Demo (Phase 1 prototype)

```bash
pnpm install
pnpm db:reset        # delete DB → migrations → seed demo data (§14)
pnpm dev             # http://localhost:3000 (or the printed port)
```

The app boots in **DEMO MODE**. Use the top bar to switch persona
(Workshop Owner / Counter Staff / Mechanic / Customer) and **RESET DEMO DATA**
any time. Personas share one SQLite database — switch persona and the other
side's screen updates instantly.

### The master demo journey (§50)

Ahmad Danial books a service → workshop confirms & checks in (31,800 km) →
Standard Service + Oil Filter recommended → mechanic inspects → **Chain WARNING →
approval requested (RM20)** → switch to Customer → approve → switch back →
complete → invoice **RM165**, stock deducted, next service **34,800 km (Nov 2026)**,
rider passport updates to **12 visits / RM2,450**. Full walkthrough in
[docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).

## Stack

| Layer | Prototype (this repo) | Production target (§65) |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript | same |
| UI | Tailwind CSS 4 + shadcn/ui (Base UI) + Lucide | same |
| Forms / tables / charts | React Hook Form + Zod · TanStack-ready · Recharts | same |
| Database | **SQLite + Prisma** (temporary) | Supabase PostgreSQL |
| Auth / storage / realtime | demo persona cookie / local | Supabase Auth / Storage / Realtime |
| AI / messaging | MockAIProvider / MockMessagingProvider (§11) | OpenAI / Meta WhatsApp Business API |

The application architecture (UI → Service → Repository → Adapter → DB) is
provider-agnostic so the frontend does **not** need to be rewritten when moving
to PostgreSQL/Supabase (§10).

## Scripts

```bash
pnpm dev            # dev server
pnpm build          # production build
pnpm start          # production server
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm db:reset       # wipe + migrate + seed (§14)
pnpm db:seed        # reseed only
pnpm db:migrate     # prisma migrate dev
pnpm test           # vitest (business logic)
```

## Layout

- `/workshop/**` — D&Z Workshop OS (dashboard, customers, passport, bookings, jobs, mechanic, CRM, KPI, inventory, finance, AI)
- `/rider/**` — D&Z Rider mobile app (home, my bike, book, approvals, live status, history, invoices, profile)
- `src/modules/<domain>` — business logic (service + repository interface)
- `src/repositories/prisma` — Prisma adapters
- `src/services` — cross-domain orchestration (CompletionService, DashboardService)
- `src/providers` — external integration abstractions + mocks (§11)
- `src/actions` — server actions (all mutations)
- `prisma/seed.ts` — deterministic demo data (§52)

## Docs

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) · [DATA_MODEL.md](docs/DATA_MODEL.md) · [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)
- [FUNCTIONALITY_MATRIX.md](docs/FUNCTIONALITY_MATRIX.md) · [PRODUCT_DECISIONS.md](docs/PRODUCT_DECISIONS.md)
- [PRODUCT_REQUIREMENTS.md](docs/PRODUCT_REQUIREMENTS.md) · [TESTING.md](docs/TESTING.md) · [API.md](docs/API.md)

Screenshots of the prototype: `screenshots/*.png`.

## Financial precision

All money is stored as **integer sen** (RM1.00 = 100 sen) — no floating-point
arithmetic (§102). Next-service prediction is deterministic
(last service + 3,000 km interval; date = interval ÷ 1,000 km/month) (§29, §71).
Staff KPI is computed from stored job data with explainable formulas (§33) —
never AI-invented.
