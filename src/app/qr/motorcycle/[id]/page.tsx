import Link from "next/link";
import { notFound } from "next/navigation";
import { Bike, Phone, MapPin, Wrench, User as UserIcon } from "lucide-react";
import { db } from "@/lib/db";
import { fmtKM, fmtDate } from "@/lib/format";
import { getLang } from "@/lib/get-lang";
import { t, tpl } from "@/lib/i18n";
import { motorcycleTypeInfo } from "@/lib/motorcycle-types";
import { formatRM } from "@/lib/money";

export const dynamic = "force-dynamic";

/**
 * QR 落地页 A（QR-001 车辆码）：Workshop 员工扫码 → 车辆 + 车主全套资料。
 * Deep link：/qr/motorcycle/<Motorcycle.id>
 */
export default async function QrMotorcyclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await getLang();
  // QR 编码 qrToken（不可枚举）；兼容旧 id 直查
  const bike = await db.motorcycle.findFirst({
    where: { OR: [{ qrToken: id }, { id }] },
    include: {
      customer: {
        include: {
          motorcycles: { include: { customer: true } },
        },
      },
    },
  });
  if (!bike) notFound();

  const owner = bike.customer;
  const ti = motorcycleTypeInfo(bike.type);
  const lifetimeAgg = await db.invoice.aggregate({ where: { job: { motorcycleId: bike.id, status: "COMPLETED" } }, _sum: { totalSen: true } });
  const lifetime = lifetimeAgg._sum?.totalSen ?? 0;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-8">
      <div className="w-full rounded-3xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Bike className="h-6 w-6" /></div>
          <div>
            <h1 className="text-lg font-bold uppercase">{bike.brand} {bike.model}</h1>
            <p className="text-sm text-muted-foreground">{bike.plate} · {bike.year}{ti ? " · " + ti.label : ""}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <div className="text-lg font-bold tabular-nums">{fmtKM(bike.currentMileage)}</div>
            <div className="text-[10px] text-muted-foreground">{t("bike.col-mileage", lang)}</div>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <div className="text-lg font-bold tabular-nums">{bike.lastServiceMileage ? fmtKM(bike.lastServiceMileage) : "—"}</div>
            <div className="text-[10px] text-muted-foreground">{t("svc.last-service", lang)}</div>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <div className="text-lg font-bold tabular-nums">{bike.nextServiceMileage ? fmtKM(bike.nextServiceMileage) : "—"}</div>
            <div className="text-[10px] text-muted-foreground">{t("qr.next-service", lang)}</div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <UserIcon className="h-4 w-4 text-primary" /> {owner.name}
          </div>
          <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            {owner.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {owner.phone}</div>}
            {owner.email && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {owner.email}</div>}
            <div className="flex items-center gap-1.5"><Wrench className="h-3 w-3" /> {tpl("qr.records-line", lang, { n: owner.motorcycles.length, km: owner.motorcycles.reduce((a, m) => a + m.currentMileage, 0).toLocaleString() })}</div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border bg-muted/30 p-4">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{t("qr.lifetime", lang)}</div>
          <div className="mt-1 text-xl font-bold tabular-nums">{formatRM(lifetime)}</div>
          <div className="text-[10px] text-muted-foreground">{t("rider.lifetime-maintenance", lang)}</div>
        </div>

        <div className="mt-6 flex gap-2">
          <Link href={"/workshop/jobs/new?motorcycle=" + bike.id} className="flex-1 rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground">
            {t("qr.new-job", lang)}
          </Link>
          <Link href={"/workshop/customers/" + owner.id} className="flex-1 rounded-xl border py-3 text-center text-sm font-semibold">
            {t("qr.open-customer", lang)}
          </Link>
        </div>
        <p className="mt-4 text-center text-[10px] text-muted-foreground">{tpl("qr.scan-motorcycle", lang, { date: fmtDate(new Date()) })}</p>
      </div>
    </main>
  );
}
