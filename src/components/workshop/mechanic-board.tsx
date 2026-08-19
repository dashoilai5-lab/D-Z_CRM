"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { fmtKM } from "@/lib/format";

export interface BoardJob {
  id: string;
  jobNumber: string;
  status: string;
  mileage: number;
  packageName: string | null;
  pendingApprovals: number;
  motorcycle: { brand: string; model: string; plate: string };
  customer: { name: string };
  isToday: boolean;
}

export interface MechanicSummary {
  id: string;         // "unassigned" for no mechanic
  name: string;
  jobs: BoardJob[];   // active jobs
  todayCount: number;
  approvals: number;
  ready: number;
}

export function MechanicBoard({ mechanics, initialMechanicId, ownerView }: {
  mechanics: MechanicSummary[];
  initialMechanicId: string;
  ownerView: boolean;
}) {
  const [selected, setSelected] = useState(initialMechanicId || mechanics[0]?.id || "unassigned");
  const current = mechanics.find((m) => m.id === selected) ?? mechanics[0];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* mechanic switcher cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {mechanics.map((m) => {
          const active = m.id === current?.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m.id)}
              className={cn(
                "rounded-2xl border p-3.5 text-left transition-colors",
                active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "bg-card hover:border-primary/40"
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn("h-8 w-8 shrink-0 rounded-full flex items-center justify-center", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  <Users className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className={cn("text-sm font-semibold truncate", active ? "text-primary" : "")}>{m.name}</div>
                  <div className="text-[11px] text-muted-foreground">{m.todayCount} today · {m.jobs.length} active</div>
                </div>
              </div>
              {(m.approvals > 0 || m.ready > 0) && (
                <div className="mt-2 flex gap-2 text-[10px] font-medium">
                  {m.approvals > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">⏳ {m.approvals}</span>}
                  {m.ready > 0 && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">✓ {m.ready} ready</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* selected mechanic's summary + jobs */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary" />
          <span className="font-semibold">{current?.name}</span>
          <span className="text-xs text-muted-foreground">— {current?.jobs.length} active job{(current?.jobs.length ?? 0) !== 1 ? "s" : ""}</span>
          <div className="flex-1" />
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span><span className="font-semibold text-amber-600">{current?.approvals ?? 0}</span> approvals</span>
            <span><span className="font-semibold text-emerald-600">{current?.ready ?? 0}</span> ready</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {(current?.jobs ?? []).map((j) => (
          <Link key={j.id} href={"/workshop/mechanic/jobs/" + j.id} className="block rounded-2xl border bg-card p-4 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold">#{j.jobNumber}</span>
              <StatusBadge kind="job" value={j.status} />
            </div>
            <div className="mt-2 font-semibold">{j.motorcycle.brand} {j.motorcycle.model}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{j.motorcycle.plate} · {j.customer.name}</div>
            <div className="mt-1.5 text-xs font-medium">{fmtKM(j.mileage)}{j.packageName ? " · " + j.packageName : ""}</div>
            {j.pendingApprovals > 0 && <div className="mt-2 text-xs font-semibold text-amber-600">⏳ {j.pendingApprovals} customer approval pending</div>}
          </Link>
        ))}
        {(current?.jobs.length ?? 0) === 0 && <p className="text-sm text-muted-foreground text-center py-10">No active jobs for {current?.name}.</p>}
      </div>

      {ownerView && <p className="text-center text-[11px] text-muted-foreground">Owner view — switch mechanic to see their tasks.</p>}
    </div>
  );
}
