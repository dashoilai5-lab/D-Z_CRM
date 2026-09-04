// Deterministic intent detection for the Workshop AI assistant.
// Pure (no DB / no network) so it is unit-testable. Multilingual keywords.

export type Intent =
  | { kind: "booking_today" | "revenue_today" | "customers_count" | "jobs_overview" | "stock_alerts" | "reminders_due" }
  | { kind: "guide"; guide: "invoice" | "create-job" | "checkin" }
  | { kind: "general" };

const has = (t: string, ...needles: string[]) => needles.some((n) => t.includes(n));

export function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  const today = has(t, "今天", "今日", "today", "hari ini");
  const booking = has(t, "预约", "预定", "booking", "tempahan");
  const revenue = has(t, "收入", "营收", "赚", "revenue", "income", "pendapatan", "earning");
  const customer = has(t, "客户", "顾客", "customer", "pelanggan");
  const job = has(t, "工单", "job", "servis");
  const stock = has(t, "库存", "stock", "inventori", "缺货", "reorder");
  const reminder = has(t, "提醒", "reminder", "peringatan", "due");
  const invoice = has(t, "账单", "发票", "invoice", "invois", "billing", "收款");
  const checkin = has(t, "签到", "check in", "checkin", "check-in");
  const create = has(t, "创建", "新增", "create", "new", "how", "如何", "macam mana", "cara");

  // data reads (prefer the most specific signal first)
  if (today && revenue) return { kind: "revenue_today" };
  if (today && booking) return { kind: "booking_today" };
  if (customer && !today) return { kind: "customers_count" };
  if (job && today) return { kind: "jobs_overview" };
  if (stock) return { kind: "stock_alerts" };
  if (reminder) return { kind: "reminders_due" };

  // how-to guides
  if (create && invoice) return { kind: "guide", guide: "invoice" };
  if (create && checkin) return { kind: "guide", guide: "checkin" };
  if (create && (job || booking)) return { kind: "guide", guide: "create-job" };

  return { kind: "general" };
}
