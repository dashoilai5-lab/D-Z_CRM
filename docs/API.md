# API Surface (Phase 1)

The prototype is Server-Action-driven; the production API follows the same
service/repository layer.

## Server actions

| Action | Purpose |
| --- | --- |
| `demo.setPersona / resetDemo` | persona cookie · wipe+reseed (§13-14) |
| `workshop.createJob` | counter create job (§22) |
| `workshop.transitionJob` | WAITING→IN_PROGRESS→READY→COMPLETED/CANCELLED (§21) |
| `workshop.bookingAction` | confirm / reschedule / cancel / check-in (§20) |
| `workshop.acceptRecommendation / declineRecommendation` | §23 |
| `workshop.addAiRecommendation` | ADD an AI recommendation to a job |
| `workshop.sendReminder` | mock WhatsApp reminder (§31) |
| `workshop.createPurchaseOrder` | reorder → PO draft (§37) |
| `mechanic.startChecklist / setChecklistResult` | §25 |
| `mechanic.requestApproval` | finding → approval request (§26) |
| `rider.bookService` | rider booking (§46) |
| `rider.respondApproval` | approve/decline RM20 (§47) |
| `rider.updateProfile` | profile |

## HTTP endpoints

- `GET /api/search?q=` — global search (§18)
- `GET /api/recommendations?motorcycleId=&mileage=` — sales recommendations (§23)
- `GET /api/supplier-for-product?productId=` — reorder supplier lookup

## Query entry points

Reads are Server Components calling domain services directly (no REST layer in
the prototype): `customerService.getPassport(id)`, `jobService.listBoard()`,
`dashboardService.get()`, `financeService.profitDashboard(90)`,
`inventoryService.stockStatus(branchId)`, `crmService.reminders()`, etc.
