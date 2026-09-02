import { db } from "@/lib/db";
import { ToggleIntegration } from "@/components/workshop/toggle-integration";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const PROVIDER_INFO: Record<string, { descKey: string; impl: string }> = {
  WHATSAPP: { descKey: "int.provider.WHATSAPP.desc", impl: "MockMessagingProvider" },
  SMS: { descKey: "int.provider.SMS.desc", impl: "MessagingProvider (channel=SMS)" },
  EMAIL: { descKey: "int.provider.EMAIL.desc", impl: "MessagingProvider (channel=EMAIL)" },
  OPENAI: { descKey: "int.provider.OPENAI.desc", impl: "MockAIProvider" },
  PAYMENT: { descKey: "int.provider.PAYMENT.desc", impl: "MockPaymentProvider" },
  STORAGE: { descKey: "int.provider.STORAGE.desc", impl: "LocalStorageProvider" },
};

export default async function IntegrationsPage() {
  const lang = await getLang();
  const org = await db.organisation.findFirst();
  const configs = await db.integrationConfig.findMany({ where: { organisationId: org!.id }, orderBy: { provider: "asc" } });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t("int.title", lang)}</h1>
        <p className="text-sm text-muted-foreground">{t("int.subtitle", lang)}</p>
      </div>
      <div className="rounded-xl border bg-card divide-y">
        {configs.map((c) => (
          <div key={c.id} className="px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="min-w-[140px]">
              <div className="font-medium text-sm">{c.provider}</div>
              <div className="text-[11px] text-muted-foreground">{PROVIDER_INFO[c.provider] ? t(PROVIDER_INFO[c.provider].descKey, lang) : ""}</div>
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">{PROVIDER_INFO[c.provider]?.impl ?? ""}</div>
            <div className="flex-1" />
            <ToggleIntegration id={c.id} enabled={c.enabled} provider={c.provider} />
          </div>
        ))}
        {configs.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">{t("int.empty", lang)}</div>}
      </div>
      <p className="text-xs text-muted-foreground">{t("int.cred-hint", lang)}</p>
    </div>
  );
}
