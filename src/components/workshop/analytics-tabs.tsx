"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar as RBar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type KV = { label: string; value: number };
function ChartBar({ data, color = "var(--primary)" }: { data: KV[]; color?: string }) {
  if (data.length === 0) return <p className="text-xs text-muted-foreground py-6 text-center">No data.</p>;
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

function toCSV(rows: { label: string; value: number }[]): string {
  return "label,value\n" + rows.map((r) => r.label + "," + r.value).join("\n");
}
function download(name: string, rows: { label: string; value: number }[]) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name + ".csv";
  a.click();
}

function Section({ title, data, csv }: { title: string; data: KV[]; csv: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        <button className="text-[11px] text-primary hover:underline" onClick={() => download(csv, data)}>Export CSV</button>
      </div>
      <ChartBar data={data} />
    </div>
  );
}

export function AnalyticsTabs(props: {
  sales: { total: number; won: number; lost: number; conversionRate: number; bySource: KV[]; byStage: KV[]; bySalesperson: KV[]; byModel: KV[]; lostReasons: KV[]; stale: number };
  service: { total: number; completed: number; cancelled: number; noShow: number; throughput: number; avgCompletionDays: number; waitingParts: number; technicianWorkload: KV[]; topServices: KV[] };
  customers: { total: number; new: number; repeat: number; retentionRate: number; avgServiceFrequency: number; inactive: number; members: number; referrals: number };
  revenue: { total: number; totalLabel: string; repeatLabel: string; avgLabel: string; trend: KV[]; byBranch: KV[]; bySource: KV[]; byServiceType: KV[]; perCustomer: KV[] };
  inventory: { totalItems: number; lowStock: number; outOfStock: number; totalQty: number; byBranch: KV[]; movements: number; lowStockList: KV[] };
  branches: { id: string; city: string; leads: number; bookings: number; revenue: number; revenueLabel: string; customers: number }[];
}) {
  const s = props.sales, sv = props.service, c = props.customers, r = props.revenue, inv = props.inventory;
  return (
    <Tabs defaultValue="sales">
      <TabsList className="flex-wrap h-auto">
        <TabsTrigger value="sales">Sales</TabsTrigger><TabsTrigger value="service">Service</TabsTrigger>
        <TabsTrigger value="customer">Customers</TabsTrigger><TabsTrigger value="revenue">Revenue</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger><TabsTrigger value="branches">Branches</TabsTrigger>
      </TabsList>

      <TabsContent value="sales" className="mt-4 space-y-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <K label="Leads" v={String(s.total)} /><K label="Won" v={String(s.won)} /><K label="Lost" v={String(s.lost)} />
          <K label="Conversion" v={s.conversionRate + "%"} /><K label="Stale" v={String(s.stale)} /><K label="By person" v={String(s.bySalesperson.length)} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Section title="Leads by source" data={s.bySource} csv="leads-by-source" />
          <Section title="Pipeline by stage" data={s.byStage} csv="leads-by-stage" />
          <Section title="Leads by salesperson" data={s.bySalesperson} csv="leads-by-salesperson" />
          <Section title="Leads by motorcycle model" data={s.byModel} csv="leads-by-model" />
          <Section title="Closed-lost reasons" data={s.lostReasons} csv="lost-reasons" />
        </div>
      </TabsContent>

      <TabsContent value="service" className="mt-4 space-y-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <K label="Bookings" v={String(sv.total)} /><K label="Completed" v={String(sv.completed)} /><K label="Cancelled" v={String(sv.cancelled)} />
          <K label="No-shows" v={String(sv.noShow)} /><K label="Throughput" v={String(sv.throughput)} /><K label="Avg days" v={String(sv.avgCompletionDays)} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Section title="Technician workload" data={sv.technicianWorkload} csv="technician-workload" />
          <Section title="Most performed services" data={sv.topServices} csv="top-services" />
        </div>
        <p className="text-xs text-muted-foreground">Waiting for parts: {sv.waitingParts}</p>
      </TabsContent>

      <TabsContent value="customer" className="mt-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <K label="Customers" v={String(c.total)} /><K label="New (30d)" v={String(c.new)} /><K label="Repeat" v={String(c.repeat)} />
          <K label="Retention" v={c.retentionRate + "%"} /><K label="Inactive" v={String(c.inactive)} /><K label="Members" v={String(c.members)} />
        </div>
        <div className="mt-4 rounded-xl border bg-card p-4 text-sm">
          Avg service frequency: <strong>{c.avgServiceFrequency}</strong> per customer · Referrals made: <strong>{c.referrals}</strong>
        </div>
      </TabsContent>

      <TabsContent value="revenue" className="mt-4 space-y-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <K label="Total (30d)" v={r.totalLabel} /><K label="Repeat" v={r.repeatLabel} /><K label="Avg/customer" v={r.avgLabel} />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold text-sm mb-2">Revenue trend</h3>
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
          <Section title="Revenue by branch" data={r.byBranch} csv="revenue-by-branch" />
          <Section title="Revenue by source" data={r.bySource} csv="revenue-by-source" />
          <Section title="Revenue by service type" data={r.byServiceType} csv="revenue-by-service" />
          <Section title="Revenue per customer" data={r.perCustomer} csv="revenue-per-customer" />
        </div>
      </TabsContent>

      <TabsContent value="inventory" className="mt-4 space-y-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <K label="Items" v={String(inv.totalItems)} /><K label="Low stock" v={String(inv.lowStock)} /><K label="Out of stock" v={String(inv.outOfStock)} />
          <K label="Total qty" v={String(inv.totalQty)} /><K label="Movements" v={String(inv.movements)} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Section title="Stock by branch" data={inv.byBranch} csv="stock-by-branch" />
          <Section title="Low/out of stock items" data={inv.lowStockList} csv="low-stock" />
        </div>
      </TabsContent>

      <TabsContent value="branches" className="mt-4">
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr><th className="px-4 py-2.5 font-medium">Branch</th><th className="px-4 py-2.5 font-medium">Leads</th><th className="px-4 py-2.5 font-medium">Bookings</th><th className="px-4 py-2.5 font-medium">Customers</th><th className="px-4 py-2.5 font-medium">Revenue</th><th className="px-4 py-2.5 font-medium">Rank</th></tr>
            </thead>
            <tbody>
              {props.branches.map((b, i) => (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-2.5 font-medium">{b.city}</td>
                  <td className="px-4 py-2.5 tabular-nums">{b.leads}</td>
                  <td className="px-4 py-2.5 tabular-nums">{b.bookings}</td>
                  <td className="px-4 py-2.5 tabular-nums">{b.customers}</td>
                  <td className="px-4 py-2.5 tabular-nums font-semibold">{b.revenueLabel}</td>
                  <td className="px-4 py-2.5">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1)}</td>
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
