# Data Model

Entities per §51. Full schema: `prisma/schema.prisma` (SQLite; migrations in `prisma/migrations`).
All money fields are integer sen. Key relations:

```
Organisation 1—* Branch 1—* User(Staff)
Organisation 1—* Customer 1—* Motorcycle
Customer 1—* Booking *—1 ServiceJob (1:1 optional)
Customer 1—* ServiceJob 1—* ServiceJobItem / ServiceJobPart
ServiceJob 1—1 ChecklistExecution 1—* ChecklistExecutionItem
ServiceJob 1—* InspectionFinding 1—1 CustomerApproval
ServiceJob 1—1 Invoice 1—* InvoiceItem / Payment
ServiceJob 1—1 ServiceReminder (next service)
ServiceJob 1—* Message / Review / Notification
Product 1—* Inventory (per branch) · Product 1—* StockMovement
Supplier 1—* Product · Supplier 1—* PurchaseOrder 1—* PurchaseOrderItem
Branch 1—* Campaign / MarketingAsset / ContentScript
Customer 1—1 CustomerAuthProfile (demo pin)
```

## Invariants

- **Every inventory change writes a StockMovement** (signed quantity + reason + reference) (§34).
- **Every completed job produces one invoice** (jobId unique) and **one open ServiceReminder**.
- **Motorcycle snapshot** (`lastServiceDate/Mileage, nextServiceMileage/EstDate`)
  is updated only inside the completion transaction.
- **Mileage regression is rejected** on completion (§103).
- **Job numbers** (`DZ#####`) and **invoice numbers** (`DZ-YYYY-#####`) are
  sequential via max+1 queries inside the same transaction (idempotency-safe).

## Statuses

- Booking: REQUESTED → CONFIRMED / RESCHEDULED → CHECKED_IN → COMPLETED / CANCELLED (§20)
- Job: WAITING → IN_PROGRESS ⇄ AWAITING_APPROVAL → READY → COMPLETED / CANCELLED (§21)
- Approval: PENDING → APPROVED / DECLINED (§26)
- Reminder: UPCOMING / DUE_SOON / DUE / OVERDUE / BOOKED (computed from km gap; 3,000 km interval) (§29)
- Stock: HEALTHY / LOW / CRITICAL / OUT_OF_STOCK (qty vs minStock) (§35)
- Dead stock: 60d slow-moving · 90d warning · 180d critical (§36)
- Invoice: DRAFT / ISSUED / PAID (§48 — demo auto-pays)
