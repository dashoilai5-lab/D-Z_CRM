import Link from "next/link";
import { Users, CalendarClock, Bot, Star, Plug, ShieldCheck, FileUp, MessageSquare } from "lucide-react";
import { db } from "@/lib/db";
import { OrgProfileForm, BranchManager, ServiceTypeManager, LostReasonsEditor } from "@/components/workshop/settings-forms";
import { QrSettings } from "@/components/workshop/qr-settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const org = await db.organisation.findFirst();
  const [branches, serviceTypes, users] = await Promise.all([
    db.branch.findMany({ where: { organisationId: org!.id }, orderBy: { isMain: "desc" } }),
    db.serviceType.findMany({ where: { organisationId: org!.id }, orderBy: { name: "asc" } }),
    db.user.findMany({ where: { organisationId: org!.id, active: true }, orderBy: { name: "asc" } }),
  ]);
  const links = [
    { href: "/workshop/staff", label: "Users & Staff", desc: users.length + " active users", icon: Users },
    { href: "/workshop/bookings/slots", label: "Appointment Slots", desc: "Slots, capacity, holidays", icon: CalendarClock },
    { href: "/workshop/automations", label: "Automations", desc: "Event rules", icon: Bot },
    { href: "/workshop/messaging/templates", label: "Message Templates", desc: "WhatsApp/SMS/email", icon: MessageSquare },
    { href: "/workshop/loyalty", label: "Loyalty & Rewards", desc: "Tiers, points, referrals", icon: Star },
    { href: "/workshop/integrations", label: "Integrations", desc: "Provider configs", icon: Plug },
    { href: "/workshop/settings/audit-logs", label: "Audit Logs", desc: "Sensitive operations", icon: ShieldCheck },
    { href: "/workshop/import", label: "CSV Import / Export", desc: "Data migration", icon: FileUp },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Organisation profile, branches, service catalogue and configuration hubs</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <OrgProfileForm org={{ name: org!.name, contactPhone: org!.contactPhone, contactEmail: org!.contactEmail, address: org!.address, taxId: org!.taxId, timezone: org!.timezone, currency: org!.currency }} />
        <LostReasonsEditor current={org!.lostReasons ?? "[]"} />
      </div>

      <QrSettings orgId={org!.id} flags={{ enableMotorcycleQr: org!.enableMotorcycleQr, enableRiderProfileQr: org!.enableRiderProfileQr, enableWorkshopQr: org!.enableWorkshopQr }} />

      <BranchManager branches={branches.map((b) => ({ id: b.id, name: b.name, city: b.city, phone: b.phone, address: b.address, isMain: b.isMain, operatingHours: b.operatingHours }))} />

      <ServiceTypeManager serviceTypes={serviceTypes.map((s) => ({ id: s.id, name: s.name, category: s.category, durationMin: s.durationMin, priceSen: s.priceSen, active: s.active }))} />

      <div>
        <h2 className="font-semibold mb-3">Configuration hubs</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-xl border bg-card p-4 hover:border-primary/40 transition-colors">
              <l.icon className="h-5 w-5 text-primary" />
              <div className="font-medium text-sm mt-2">{l.label}</div>
              <div className="text-[11px] text-muted-foreground">{l.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
