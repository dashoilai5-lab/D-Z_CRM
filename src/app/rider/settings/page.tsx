import Link from "next/link";
import { ChevronLeft, User, Shield } from "lucide-react";
import { getRiderCustomer } from "@/lib/rider-customer";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";
import { PageTransition } from "@/components/shared/page-transition";
import { ProfileForm } from "@/components/rider/profile-form";

export const dynamic = "force-dynamic";

/**
 * Rider Settings：编辑个人资料（姓名/电话/邮箱/性别/地址）+ 账号信息。
 */
export default async function RiderSettingsPage() {
  const lang = await getLang();
  const customer = await getRiderCustomer();
  if (!customer) return null;

  return (
    <PageTransition>
    <div className="space-y-5">
      <Link href="/rider/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft className="h-4 w-4" /> {t("rider.my-bikes", lang) === "My Motorcycles" ? "Back to profile" : "Back"}
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your personal details</p>
      </div>

      {/* 个人资料编辑 */}
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Profile</h2>
        </div>
        <ProfileForm
          customerId={customer.id}
          initial={{
            name: customer.name,
            phone: customer.phone ?? "",
            email: customer.email ?? "",
            gender: customer.gender ?? "",
            address: customer.address ?? "",
          }}
        />
      </div>

      {/* 账号信息 */}
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Account</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium">{customer.joinedAt.getFullYear()}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5">
            <span className="text-muted-foreground">Rider ID</span>
            <span className="font-mono text-xs">{customer.qrToken ?? customer.id.slice(-6)}</span>
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] text-muted-foreground">D&Z Rider · Settings</p>
    </div>
    </PageTransition>
  );
}
