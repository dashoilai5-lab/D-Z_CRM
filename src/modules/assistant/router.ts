// Deterministic intent detection for the Workshop AI assistant.
// Pure (no DB / no network) so it is unit-testable. Multilingual keywords.
// "how many / 多少 / berapa" count questions take precedence over "how-to (how)" guides.

export type IntentKind =
  | "booking_today" | "revenue_today" | "customers_count" | "jobs_overview" | "stock_alerts" | "reminders_due"
  | "check_ins" | "parts_count" | "month_earnings" | "dead_stock_value" | "overdue_customers" | "average_rating"
  | "analytics_service" | "analytics_revenue" | "analytics_customers" | "analytics_monthly_services" | "analytics_brand" | "analytics_inventory" | "analytics_sales" | "analytics_overview";

export type Intent =
  | { kind: IntentKind }
  | { kind: "guide"; guide: "invoice" | "create-job" | "checkin" }
  | { kind: "general" };

const has = (t: string, ...needles: string[]) => needles.some((n) => t.includes(n));

export function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  const count = /how many|how much|total|count|多少|几个|berapa|jumlah|总数/.test(t);
  const today = /今天|今日|today|hari ini/.test(t);
  const month = /this month|本月|这个月|month ini|bulan ini/.test(t);
  const booking = /booking|预约|预定|tempahan/.test(t);
  const checkin = /check ?-?in|check in|checkin|签到|进店|masuk/.test(t);
  const revenue = /revenue|income|earnings|收入|营收|赚|pendapatan|earning|profit|saldo/.test(t);
  const customer = /customer|客户|顾客|pelanggan/.test(t);
  const parts = /part|备件|零件|配件|sparepart|spare part|商品|product/.test(t);
  const dead = /dead ?stock|滞销|死库|stok mati|slow.?moving/.test(t);
  const reminders = /提醒|reminder|peringatan/.test(t);
  // "customers overdue for service" → overdue_customers；"提醒/reminder" → reminders_due
  const custOverdue = !reminders && /(customer|customers|客户|顾客|pelanggan|保养|servis)/.test(t) && /(overdue|逾期|过期|terlewat|due|到期|seterusnya)/.test(t);
  const rating = /rating|评分|评价|review|bintang|星/.test(t);
  const job = /job|工单|servis/.test(t);

  // ---- analytics / insight questions (trend/analysis/statistics/brand/monthly) ----
  const analytics = /analytic|analys|分析|统计|insight|趋势|trend|prestasi|laporan|report|compare|对比|占比|share|breakdown|排行|popular|most popular|最受欢迎|\btop\b|最|salesperson/.test(t);
  if (analytics) {
    if (/brand|品牌|jenama/.test(t)) return { kind: "analytics_brand" };
    if (/monthly|每月|月度|per month|by month|month trend/.test(t)) return { kind: "analytics_monthly_services" };
    if (/top service|popular service|热门|最常|top servis/.test(t)) return { kind: "analytics_service" };
    if (/salesperson|销售员|top sales|sales team|jualan/.test(t)) return { kind: "analytics_sales" };
    if (/repeat|retention|回头|会员|member|loyalty|referral|推荐|忠诚/.test(t)) return { kind: "analytics_customers" };
    if (/inventory|库存|inventori/.test(t)) return { kind: "analytics_inventory" };
    if (/revenue|sales|销售|pendapatan|profit|营收/.test(t)) return { kind: "analytics_revenue" };
    return { kind: "analytics_overview" };
  }

  // ---- count / quantity questions (take precedence over how-to "how") ----
  if (count) {
    if (checkin) return { kind: "check_ins" };
    if (dead) return { kind: "dead_stock_value" };
    if (parts) return { kind: "parts_count" };
    if (custOverdue) return { kind: "overdue_customers" };
    if (rating) return { kind: "average_rating" };
    if (customer) return { kind: "customers_count" };
    if (booking) return { kind: "booking_today" };
  }

  // ---- money / timeframe ----
  if (revenue && month) return { kind: "month_earnings" };
  if (today && revenue) return { kind: "revenue_today" };
  if (revenue) return { kind: "month_earnings" };
  if (booking && today) return { kind: "booking_today" };
  if (customer) return { kind: "customers_count" };
  if (job && today) return { kind: "jobs_overview" };
  if (dead) return { kind: "dead_stock_value" };
  if (custOverdue) return { kind: "overdue_customers" };
  if (rating) return { kind: "average_rating" };
  if (parts) return { kind: "parts_count" };
  if (has(t, "库存", "stock", "inventori", "缺货", "reorder", "low stock")) return { kind: "stock_alerts" };
  if (has(t, "提醒", "reminder", "peringatan", "due")) return { kind: "reminders_due" };

  // ---- how-to guides ----
  const invoice = has(t, "账单", "发票", "invoice", "invois", "billing", "收款", "payment");
  const create = has(t, "创建", "新增", "create", "new", "how do", "如何", "macam mana", "cara");
  if (create && invoice) return { kind: "guide", guide: "invoice" };
  if (create && checkin) return { kind: "guide", guide: "checkin" };
  if (create && (job || booking)) return { kind: "guide", guide: "create-job" };

  return { kind: "general" };
}
