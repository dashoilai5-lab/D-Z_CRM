import { PageHeader } from "@/components/shared/page-header";
import { CreateJobForm } from "@/components/workshop/create-job-form";
import { RepairJobForm } from "@/components/workshop/repair-job-form";
import { db } from "@/lib/db";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function NewJobPage({ searchParams }: { searchParams: Promise<{ customer?: string; motorcycle?: string; type?: string }> }) {
  const { customer, motorcycle, type } = await searchParams;
  const lang = await getLang();
  const isRepair = type === "repair";
  const [customers, motorcycles, packages, mechanics] = await Promise.all([
    db.customer.findMany({ select: { id: true, name: true, phone: true }, orderBy: { name: "asc" } }),
    db.motorcycle.findMany({ select: { id: true, customerId: true, brand: true, model: true, plate: true, year: true, type: true, currentMileage: true } }),
    db.servicePackage.findMany({ where: { active: true }, select: { id: true, name: true, tier: true, priceSen: true, isBestValue: true, description: true }, orderBy: { priceSen: "asc" } }),
    db.user.findMany({ where: { role: { in: ["MECHANIC", "MANAGER"] }, active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const motorcyclesByCustomer = motorcycles.reduce<Record<string, typeof motorcycles>>((acc, m) => {
    (acc[m.customerId] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title={isRepair ? t("ws.job.repair", lang) : t("ws.job.service", lang)}
        subtitle={isRepair ? "Customer → motorcycle → parts → labour → mechanic" : "Customer → motorcycle → package → recommendations → mechanic"}
        backHref="/workshop/jobs"
      />
      {isRepair ? (
        <RepairJobForm customers={customers} motorcyclesByCustomer={motorcyclesByCustomer} mechanics={mechanics} preselectCustomer={customer ?? null} preselectMotorcycle={motorcycle ?? null} />
      ) : (
        <CreateJobForm customers={customers} motorcyclesByCustomer={motorcyclesByCustomer} packages={packages} mechanics={mechanics} preselectCustomer={customer ?? null} preselectMotorcycle={motorcycle ?? null} />
      )}
    </div>
  );
}
