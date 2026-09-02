"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar as RBar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ExportCsvButton } from "@/components/shared/search-form";
import { useLang } from "@/components/shared/language-context";
import { t, tpl } from "@/lib/i18n";

type KV = { label: string; value: number };
function ChartBar({ data, color = "var(--primary)" }: { data: KV[]; color?: string }) {
  const lang = useLang();
  if (data.length === 0) return <p className="text-xs text-muted-foreground py-6 text-center">{t("analytics.no-data", lang)}</p>;
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={data.length > 6 ? -30 : 0} textAnchor={data.length > 6 ? "end" : "middle"} height={44} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", fontSize: 12 }} />
          <RBar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Section({ title, data, csv }: { title: string; data: KV[]; csv: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        <ExportCsvButton name={csv} data={data} className="text-[11px] text-primary hover:underline" />
      </div>
      <ChartBar data={data} />
    </div>
  );
}

export function AnalyticsTabs(props: {
  sales: { total: number; won: number; lost: number; conversionRate: number; bySource: KV[]; byStage: KV[]; bySalesperson: KV[]; byModel: KV[]; lostReasons: KV[]; stale: number };
  service: { total: number; completed: number; cancelled: number; noShow: number; throughput: number; avgCompletionDays: number; waitingParts: number; technicianWorkload: KV[]; topServices: KV[] };
  customers: { total: number; new: number; repeat: number; retentionRate: number; avgServiceFrequency: number; inactive: number; members: number; referrals: number };
  revenue: { total: number; totalLabel: string; prevTotal: number; prevLabel?: string; pctChange: number; repeatLabel: string; avgLabel: string; trend: KV[]; byBranch: KV[]; bySource: KV[]; byServiceType: KV[]; perCustomer: KV[] };
  inventory: { totalItems: number; lowStock: number; outOfStock: number; totalQty: number; byBranch: KV[]; movements: number; lowStockList: KV[] };
  branches: { id: string; city: string; leads: number; bookings: number; revenue: number; revenueLabel: string; customers: number }[];
}) {
  const s = props.sales, sv = props.service, c = props.customers, r = props.revenue, inv = props.inventory;
  const lang = useLang();
  return (
    <Tabs defaultValue="sales">
      <TabsList className="flex-wrap h-auto">
        <TabsTrigger value="sales">{t("analytics.tab-sales", lang)}</TabsTrigger><TabsTrigger value="service">{t("analytics.tab-service", lang)}</TabsTrigger>
        <TabsTrigger value="customer">{t("analytics.tab-customers", lang)}</TabsTrigger><TabsTrigger value="revenue">{t("analytics.tab-revenue", lang)}</TabsTrigger>
        <TabsTrigger value="inventory">{t("analytics.tab-inventory", lang)}</TabsTrigger><TabsTrigger value="branches">{t("analytics.tab-branches", lang)}</TabsTrigger>
      </TabsList>

      <TabsContent value="sales" className="mt-4 space-y-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <K label={t("analytics.leads", lang)} v={String(s.total)} /><K label={t("lead.status.WON", lang)} v={String(s.won)} /><K label={t("lead.status.LOST", lang)} v={String(s.lost)} />
          <K label={t("analytics.conversion", lang)} v={s.conversionRate + "%"} /><K label={t("analytics.stale", lang)} v={String(s.stale)} /><K label={t("analytics.by-person", lang)} v={String(s.bySalesperson.length)} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Section title={t("analytics.section-leads-source", lang)} data={s.bySource} csv="leads-by-source" />
          <Section title={t("analytics.section-pipeline-stage", lang)} data={s.byStage} csv="leads-by-stage" />
          <Section title={t("analytics.section-leads-salesperson", lang)} data={s.bySalesperson} csv="leads-by-salesperson" />
          <Section title={t("analytics.section-leads-model", lang)} data={s.byModel} csv="leads-by-model" />
          <Section title={t("analytics.section-lost-reasons", lang)} data={s.lostReasons} csv="lost-reasons" />
        </div>
      </TabsContent>

      <TabsContent value="service" className="mt-4 space-y-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <K label={t("analytics.bookings", lang)} v={String(sv.total)} /><K label={t("common.completed", lang)} v={String(sv.completed)} /><K label={t("common.cancelled", lang)} v={String(sv.cancelled)} />
          <K label={t("analytics.no-shows", lang)} v={String(sv.noShow)} /><K label={t("analytics.throughput", lang)} v={String(sv.throughput)} /><K label={t("analytics.avg-days", lang)} v={String(sv.avgCompletionDays)} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Section title={t("analytics.section-technician-workload", lang)} data={sv.technicianWorkload} csv="technician-workload" />
          <Section title={t("analytics.section-top-services", lang)} data={sv.topServices} csv="top-services" />
        </div>
        <p className="text-xs text-muted-foreground">{t("svc.waiting_parts", lang)}: {sv.waitingParts}</p>
      </TabsContent>

      <TabsContent value="customer" className="mt-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <K label={t("analytics.customers", lang)} v={String(c.total)} /><K label={t("analytics.new-30d", lang)} v={String(c.new)} /><K label={t("analytics.repeat", lang)} v={String(c.repeat)} />
          <K label={t("analytics.retention", lang)} v={c.retentionRate + "%"} /><K label={t("analytics.inactive", lang)} v={String(c.inactive)} /><K label={t("analytics.members", lang)} v={String(c.members)} />
        </div>
        <div className="mt-4 rounded-xl border bg-card p-4 text-sm">
          {t("analytics.avg-frequency", lang)}: <strong>{c.avgServiceFrequency}</strong> {t("analytics.per-customer", lang)} · {t("analytics.referrals-made", lang)}: <strong>{c.referrals}</strong>
        </div>
      </TabsContent>

      <TabsContent value="revenue" className="mt-4 space-y-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <K label={t("analytics.total-30d", lang)} v={r.totalLabel} /><K label={t("analytics.prev-30d", lang)} v={r.prevLabel ?? "—"} /><K label={t("analytics.change", lang)} v={(r.pctChange >= 0 ? "+" : "") + r.pctChange + "%"} />
          <K label={t("analytics.repeat", lang)} v={r.repeatLabel} /><K label={t("analytics.avg-customer", lang)} v={r.avgLabel} />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold text-sm mb-2">{t("analytics.revenue-trend", lang)}</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={r.trend} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={3} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Section title={t("analytics.section-revenue-branch", lang)} data={r.byBranch} csv="revenue-by-branch" />
          <Section title={t("analytics.section-revenue-source", lang)} data={r.bySource} csv="revenue-by-source" />
          <Section title={t("analytics.section-revenue-service", lang)} data={r.byServiceType} csv="revenue-by-service" />
          <Section title={t("analytics.section-revenue-customer", lang)} data={r.perCustomer} csv="revenue-per-customer" />
        </div>
      </TabsContent>

      <TabsContent value="inventory" className="mt-4 space-y-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <K label={t("analytics.items", lang)} v={String(inv.totalItems)} /><K label={t("analytics.low-stock", lang)} v={String(inv.lowStock)} /><K label={t("analytics.out-of-stock", lang)} v={String(inv.outOfStock)} />
          <K label={t("analytics.total-qty", lang)} v={String(inv.totalQty)} /><K label={t("analytics.movements", lang)} v={String(inv.movements)} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Section title={t("analytics.section-stock-branch", lang)} data={inv.byBranch} csv="stock-by-branch" />
          <Section title={t("analytics.section-low-stock", lang)} data={inv.lowStockList} csv="low-stock" />
        </div>
      </TabsContent>

      <TabsContent value="branches" className="mt-4">
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr><th className="px-4 py-2.5 font-medium">{t("analytics.th-branch", lang)}</th><th className="px-4 py-2.5 font-medium">{t("analytics.leads", lang)}</th><th className="px-4 py-2.5 font-medium">{t("analytics.bookings", lang)}</th><th className="px-4 py-2.5 font-medium">{t("analytics.customers", lang)}</th><th className="px-4 py-2.5 font-medium">{t("analytics.th-revenue", lang)}</th><th className="px-4 py-2.5 font-medium">{t("analytics.th-rank", lang)}</th></tr>
            </thead>
            <tbody>
              {props.branches.map((b, i) => (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-2.5 font-medium">{b.city}</td>
                  <td className="px-4 py-2.5 tabular-nums">{b.leads}</td>
                  <td className="px-4 py-2.5 tabular-nums">{b.bookings}</td>
                  <td className="px-4 py-2.5 tabular-nums">{b.customers}</td>
                  <td className="px-4 py-2.5 tabular-nums font-semibold">{b.revenueLabel}</td>
                  <td className="px-4 py-2.5">
                    <span className={"inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold " + (i === 0 ? "bg-amber-500/15 text-amber-600 dark:text-amber-300" : i === 1 ? "bg-slate-500/15 text-slate-500 dark:text-slate-300" : i === 2 ? "bg-orange-500/15 text-orange-600 dark:text-orange-300" : "bg-muted text-muted-foreground")}>
                      {i + 1}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function K({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-bold tabular-nums mt-0.5 truncate">{v}</div>
    </div>
  );
}
