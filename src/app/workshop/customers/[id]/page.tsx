import Link from "next/link";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Money } from "@/components/shared/money";
import { CustomerActions } from "@/components/workshop/customer-actions";
import { customerService } from "@/modules/customers/service";
import { fmtDate, fmtKM, fmtDateTime } from "@/lib/format";
import { formatRM } from "@/lib/money";

export default async function CustomerPassportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const passport = await customerService.getPassport(id);
  if (!passport) notFound();
  const { customer, motorcycles, stats, jobs, oilHistory, tyres, messages, reminders } = passport;

  return (
    <div>
      <PageHeader title={customer.name} subtitle={(customer.phone ?? "") + (customer.email ? " · " + customer.email : "")} backHref="/workshop/customers" />

      {/* header card */}
      <div className="rounded-2xl border bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex-1 min-w-52">
            <h2 className="font-semibold">D&Z Rider Passport</h2>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Customer Since</div>
                <div className="font-semibold">{customer.joinedAt.getFullYear()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Visits</div>
                <div className="font-semibold tabular-nums">{stats.visits}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Lifetime Spend</div>
                <div className="font-semibold tabular-nums"><Money sen={stats.lifetimeSpend} /></div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Last Service</div>
                <div className="font-semibold">{stats.lastServiceLabel}</div>
              </div>
            </div>
          </div>
          <CustomerActions customerId={customer.id} motorcycleId={motorcycles[0]?.id ?? ""} nextServiceMileage={stats.nextServiceMileage} />
        </div>
      </div>

      {/* motorcycles */}
      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        {motorcycles.map((m) => (
          <div key={m.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{m.brand} {m.model}</div>
                <div className="text-sm text-muted-foreground">{m.year} · {m.plate}{m.color ? " · " + m.color : ""}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Mileage</div>
                <div className="font-bold tabular-nums">{fmtKM(m.currentMileage)}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-muted/50 p-2.5">
                <div className="text-muted-foreground">Last Service</div>
                <div className="font-semibold mt-0.5">{m.lastServiceDate ? fmtDate(m.lastServiceDate) : "—"} {m.lastServiceMileage != null ? "· " + fmtKM(m.lastServiceMileage) : ""}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5">
                <div className="text-muted-foreground">Next Service</div>
                <div className="font-semibold mt-0.5">{m.nextServiceMileage ? fmtKM(m.nextServiceMileage) : "—"} {m.nextServiceEstDate ? "· est " + fmtDate(m.nextServiceEstDate) : ""}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* tabs */}
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Service History</TabsTrigger>
          <TabsTrigger value="oil">Oil History</TabsTrigger>
          <TabsTrigger value="tyres">Tyres</TabsTrigger>
          <TabsTrigger value="spending">Spending</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold mb-3">Service Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><div className="text-xs text-muted-foreground">Last Service</div><div className="font-semibold mt-0.5">{stats.lastServiceLabel}</div></div>
              <div><div className="text-xs text-muted-foreground">Last Mileage</div><div className="font-semibold mt-0.5">{fmtKM(stats.lastServiceMileage)}</div></div>
              <div><div className="text-xs text-muted-foreground">Next Service</div><div className="font-semibold mt-0.5">{fmtKM(stats.nextServiceMileage)}</div></div>
              <div><div className="text-xs text-muted-foreground">Estimated</div><div className="font-semibold mt-0.5">{stats.nextServiceEstDate ? fmtDate(stats.nextServiceEstDate) : "—"}</div></div>
            </div>
            {reminders.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-semibold mb-2">Reminders</h4>
                <div className="space-y-2">
                  {reminders.filter((r) => !r.closedAt).map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-sm">
                      <span>{r.lastServiceMileage.toLocaleString()} km → <strong>{r.nextServiceMileage.toLocaleString()} km</strong></span>
                      <StatusBadge kind="reminder" value={r.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Job</th><th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Mileage</th><th className="px-4 py-2.5 font-medium">Service</th>
                  <th className="px-4 py-2.5 font-medium">Items</th><th className="px-4 py-2.5 font-medium">Total</th>
                </tr></thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id} className="border-b last:border-0">
                      <td className="px-4 py-2.5 font-mono text-xs font-semibold"><Link className="hover:text-primary" href={"/workshop/jobs/" + j.id}>{j.jobNumber}</Link></td>
                      <td className="px-4 py-2.5">{fmtDate(j.completedAt)}</td>
                      <td className="px-4 py-2.5 tabular-nums">{fmtKM(j.mileage)}</td>
                      <td className="px-4 py-2.5 font-medium">{j.packageName}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-52 truncate">{[...j.items, ...j.parts].join(", ")}</td>
                      <td className="px-4 py-2.5 font-semibold tabular-nums"><Money sen={j.totalSen} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="oil" className="mt-4">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold mb-3">Engine Oil History</h3>
            {oilHistory.length === 0 ? <p className="text-sm text-muted-foreground">No oil changes recorded.</p> : (
              <div className="space-y-2">
                {oilHistory.map((o, i) => (
                  <div key={i} className="flex justify-between text-sm border-b last:border-0 pb-2">
                    <span>{fmtDate(o.at)}</span><span className="tabular-nums">{fmtKM(o.mileage)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tyres" className="mt-4">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold mb-3">Tyre History</h3>
            {tyres.length === 0 ? <p className="text-sm text-muted-foreground">No tyre work recorded.</p> : (
              <div className="space-y-2">{tyres.map((t, i) => (
                <div key={i} className="flex justify-between text-sm border-b last:border-0 pb-2"><span>{fmtDate(t.at)}</span><span className="tabular-nums">{fmtKM(t.mileage)}</span></div>
              ))}</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="spending" className="mt-4">
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Spending</h3>
              <div className="text-sm text-muted-foreground">Lifetime <strong className="text-foreground tabular-nums">{formatRM(stats.lifetimeSpend)}</strong></div>
            </div>
            <div className="space-y-2">
              {jobs.map((j) => (
                <div key={j.id} className="flex justify-between text-sm border-b last:border-0 pb-2">
                  <span>{fmtDate(j.completedAt)} · {j.jobNumber}</span>
                  <span className="tabular-nums font-medium">{formatRM(j.totalSen)}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="mt-4">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold mb-3">Message History</h3>
            {messages.length === 0 ? <p className="text-sm text-muted-foreground">No messages.</p> : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className="text-sm">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold uppercase">{m.channel}</span>·{fmtDateTime(m.createdAt)} · {m.direction}
                    </div>
                    <p className="mt-0.5">{m.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold mb-3">Internal Notes</h3>
            <p className="text-sm whitespace-pre-wrap">{customer.internalNotes ?? customer.notes ?? "No notes."}</p>
            {customer.notes && <p className="mt-3 text-xs text-muted-foreground border-t pt-3">Customer note: {customer.notes}</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
