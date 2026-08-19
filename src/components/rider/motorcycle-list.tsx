"use client";

import { useState } from "react";
import Link from "next/link";
import { Bike, ChevronRight, Plus, X } from "lucide-react";
import { fmtKM } from "@/lib/format";
import { motorcycleTypeInfo } from "@/lib/motorcycle-types";
import { AddMotorcycle } from "@/components/rider/add-motorcycle";

export interface BikeRow {
  id: string; brand: string; model: string; year: number; plate: string; type: string; currentMileage: number;
}

export function MotorcycleList({ customerId, bikes }: { customerId: string; bikes: BikeRow[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Motorcycles</h1>
        {!adding && (
          <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> Add
          </button>
        )}
      </div>

      {adding && (
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold">Add a motorcycle</div>
              <div className="text-xs text-muted-foreground">Register your bike to get type-specific service recommendations</div>
            </div>
            <button onClick={() => setAdding(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground hover:bg-muted" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <AddMotorcycle customerId={customerId} onDone={() => setAdding(false)} />
        </div>
      )}

      <div className="space-y-3">
        {bikes.map((m) => (
          <Link key={m.id} href={"/rider/motorcycles/" + m.id} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Bike className="h-6 w-6" /></div>
            <div className="flex-1">
              <div className="font-semibold">{m.brand} {m.model}</div>
              <div className="text-xs text-muted-foreground">{m.plate} · {m.year} · {fmtKM(m.currentMileage)}</div>
              {(() => { const ti = motorcycleTypeInfo(m.type); return ti ? (
                <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{ti.label}</span>
              ) : null; })()}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
