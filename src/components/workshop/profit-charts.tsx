"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend, Cell } from "recharts";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export function RevenueTrendChart({ data }: { data: { day: string; revenue: number; grossProfit: number }[] }) {
  const lang = useLang();
  const rows = data.map((d) => ({ day: d.day.slice(5), revenue: Math.round(d.revenue / 100), grossProfit: Math.round(d.grossProfit / 100) }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.19 45)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="oklch(0.62 0.19 45)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => "RM" + v} />
        <Tooltip formatter={(v) => "RM" + Number(v).toLocaleString()} labelStyle={{ fontSize: 12 }} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
        <Area type="monotone" dataKey="revenue" name={t("profit.revenue", lang)} stroke="oklch(0.62 0.19 45)" strokeWidth={2} fill="url(#rev)" />
        <Area type="monotone" dataKey="grossProfit" name={t("profit.gross-profit", lang)} stroke="#10b981" strokeWidth={2} fill="transparent" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueSplitChart({ service, parts }: { service: number; parts: number }) {
  const lang = useLang();
  const data = [
    { name: t("profit.service-revenue", lang), value: Math.round(service / 100) },
    { name: t("profit.parts-revenue", lang), value: Math.round(parts / 100) },
  ];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => "RM" + v} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={110} />
        <Tooltip formatter={(v) => "RM" + Number(v).toLocaleString()} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
        <Bar dataKey="value" name={t("profit.revenue", lang)} radius={[0, 8, 8, 0]}>
          {data.map((d, i) => <Cell key={i} fill={i === 0 ? "oklch(0.62 0.19 45)" : "#0ea5e9"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

