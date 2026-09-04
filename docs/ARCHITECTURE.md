# Architecture

## Layers (§9)

```
UI (Server/Client Components)
   ↓
Application Service   src/modules/<domain>/service.ts   (business logic, no JSX)
   ↓
Repository interface  src/modules/<domain>/repository.ts
   ↓
Adapter               src/repositories/prisma/*.repository.ts
   ↓
Database              SQLite (Prisma) → PostgreSQL (Supabase) later
```

Example: `RiderPassportPage → CustomerService → ICustomerRepository → PrismaCustomerRepository → SQLite`

## Cross-domain orchestration

- `src/services/completion.ts` — the §27 transactional completion workflow
  (one Prisma interactive transaction: inventory deduction + movements, invoice,
  payment, motorcycle snapshot, reminder, thank-you message, review request,
  booking completion). Idempotent on repeat. 60 s transaction timeout.
- `src/services/dashboard.ts` — workshop dashboard aggregates.

## Server actions (mutations)

All mutations are Next.js Server Actions in `src/actions/*`; every action calls
a service then `revalidatePath("/", "layout")` so both apps refresh immediately.

## Provider abstraction (§11)

`AiProvider` now also exposes `chat(messages, opts)` (system + multi-turn) in addition to `generate(prompt)`.
The Workshop AI assistant (`src/modules/assistant/`) routes intents → `tools.ts` (org/branch-scoped real data) → `AiProvider.chat` with a lang-aware system prompt, so replies are localized and grounded on live numbers. See SETUP §9 (2026-09-03).

`src/providers/types.ts` defines `MessagingProvider / AiProvider / StorageProvider /
PaymentProvider / NotificationProvider`. The prototype ships mock implementations
(MockMessagingProvider = WhatsApp stand-in, etc.). Business modules only depend on
the interfaces — swapping in OpenAI / Meta WhatsApp / Supabase Storage later is a
registry change in `src/providers/index.ts`.

## Demo persona (§13)

Persona is a cookie (`dz_demo_persona`, values OWNER / COUNTER_STAFF / MECHANIC /
CUSTOMER). `getPersona()` is async (Next 16). Personas share one database —
switching is purely a presentation/view change. "RESET DEMO DATA" wipes and
reseeds via `src/lib/reset.ts → runSeed()`.

## Route map (§15)

`/workshop/{dashboard,customers,customers/[id],bookings,jobs,jobs/new,jobs/[id],
mechanic,mechanic/jobs/[id],packages,checklists,crm/{reminders,return-list},
marketing/{calendar,posters,scripts,reviews},staff/kpi,inventory/{products,stock,
alerts,dead-stock,reorder,purchase-orders,suppliers},finance/profit,ai,settings}`
and `/rider/{home,motorcycles,motorcycles/[id],book,bookings,service-status,
approvals,service-history,invoices,profile}`. Marketing calendar/posters/scripts
and settings are "coming soon" placeholders pending review.

## Money & precision (§102)

All money is integer sen. `src/lib/money.ts` has `toSen/formatRM`. Unit tests
cover the profit and next-service formulas (see TESTING.md).

## Production notes

- Every business record carries `organisationId` (+ `branchId` where relevant) —
  multi-tenant ready (§86). RLS policies to be added at the Supabase stage.
- `Booking→ServiceJob`, `ServiceJob→ChecklistExecution/Invoice/Reminder`,
  `InspectionFinding→CustomerApproval` are 1:1 relations with the FK on one side.
