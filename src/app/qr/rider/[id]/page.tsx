import Link from "next/link";
import { notFound } from "next/navigation";
import { User as UserIcon, Phone, Mail, Bike } from "lucide-react";
import { db } from "@/lib/db";
import { fmtKM, fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * QR 落地页 B（QR-002 车主码）：Workshop 员工扫码 → Rider 个人全套资料。
 * Deep link：/qr/rider/<Customer.id>
 */
export default async function QrRiderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await db.customer.findUnique({
    where: { id },
    include: { motorcycles: true },
  });
  if (!customer) notFound();

  const serviceCount = await db.serviceJob.count({ where: { customerId: customer.id, status: "COMPLETED" } });
  const lastJob = await db.serviceJob.findFirst({ where: { customerId: customer.id, status: "COMPLETED" }, orderBy: { completedAt: "desc" } });

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <div className="rounded-3xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><UserIcon className="h-6 w-6" /></div>
          <div>
            <h1 className="text-lg font-bold">{customer.name}</h1>
            <p className="text-sm text-muted-foreground">D&Z Rider · customer since {fmtDate(customer.joinedAt)}</p>
          </div>
        </div>

        <div className="mt-4 space-y-1.5 text-sm">
          {customer.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> <span className="font-medium text-foreground">{customer.phone}</span></div>}
          {customer.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> <span className="font-medium text-foreground">{customer.email}</span></div>}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <div className="text-lg font-bold tabular-nums">{customer.motorcycles.length}</div>
            <div className="text-[10px] text-muted-foreground">Bikes</div>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <div className="text-lg font-bold tabular-nums">{serviceCount}</div>
            <div className="text-[10px] text-muted-foreground">Services</div>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <div className="text-lg font-bold tabular-nums">{lastJob ? fmtDate(lastJob.completedAt) : "—"}</div>
            <div className="text-[10px] text-muted-foreground">Last service</div>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Motorcycles on record</div>
          <div className="space-y-2">
            {customer.motorcycles.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl border p-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Bike className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{m.brand} {m.model}</div>
                  <div className="text-[11px] text-muted-foreground">{m.plate} · {m.year} · {fmtKM(m.currentMileage)}</div>
                </div>
                <Link href={"/qr/motorcycle/" + m.id} className="text-xs font-medium text-primary hover:underline">View</Link>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-5 text-center text-[10px] text-muted-foreground">Scanned via D&Z rider QR · {fmtDate(new Date())}</p>
      </div>
    </main>
  );
}
