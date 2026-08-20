import { db } from "@/lib/db";
import { ToggleIntegration } from "@/components/workshop/toggle-integration";

export const dynamic = "force-dynamic";

const PROVIDER_INFO: Record<string, { desc: string; impl: string }> = {
  WHATSAPP: { desc: "Customer messaging (business API)", impl: "MockMessagingProvider" },
  SMS: { desc: "SMS gateway", impl: "MessagingProvider (channel=SMS)" },
  EMAIL: { desc: "Email sending", impl: "MessagingProvider (channel=EMAIL)" },
  OPENAI: { desc: "AI generation", impl: "MockAIProvider" },
  PAYMENT: { desc: "Payment processing", impl: "MockPaymentProvider" },
  STORAGE: { desc: "File/attachment storage", impl: "LocalStorageProvider" },
};

export default async function IntegrationsPage() {
  const org = await db.organisation.findFirst();
  const configs = await db.integrationConfig.findMany({ where: { organisationId: org!.id }, orderBy: { provider: "asc" } });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-sm text-muted-foreground">Providers are abstracted (src/providers) — business code never depends on a vendor (INT-001..007). Production swaps in real credentials via IntegrationConfig.</p>
      </div>
      <div className="rounded-xl border bg-card divide-y">
        {configs.map((c) => (
          <div key={c.id} className="px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="min-w-[140px]">
              <div className="font-medium text-sm">{c.provider}</div>
              <div className="text-[11px] text-muted-foreground">{PROVIDER_INFO[c.provider]?.desc ?? ""}</div>
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">{PROVIDER_INFO[c.provider]?.impl ?? ""}</div>
            <div className="flex-1" />
            <ToggleIntegration id={c.id} enabled={c.enabled} provider={c.provider} />
          </div>
        ))}
        {configs.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No integration configs.</div>}
      </div>
      <p className="text-xs text-muted-foreground">Credentials are stored encrypted in IntegrationConfig.configEncrypted (SEC-002/013 — production wiring in the migration playbook, SETUP §5).</p>
    </div>
  );
}
