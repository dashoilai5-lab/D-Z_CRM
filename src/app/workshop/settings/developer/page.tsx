import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session-user";
import { hasDeveloperAccess, getDeveloperMatrix, getDeveloperOverview } from "@/actions/developer";
import { DeveloperGate, DeveloperSettingsPanel } from "@/components/workshop/developer-settings";
import { getLang } from "@/lib/get-lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

/** Developer Settings：密码门禁 + 角色×模块访问矩阵 + 数据管理（仅 OWNER）。 */
export default async function DeveloperSettingsPage() {
  const lang = await getLang();
  const session = await getSessionUser();
  if (session.kind !== "staff" || (session.role !== "OWNER" && session.role !== "SUPER_ADMIN")) redirect("/workshop/settings");

  const [gated, matrix, overview] = await Promise.all([
    hasDeveloperAccess(),
    getDeveloperMatrix(),
    getDeveloperOverview(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("ws.dev.title", lang)}</h1>
        <p className="text-sm text-muted-foreground">{t("ws.dev.subtitle", lang)}</p>
      </div>
      {!gated ? (
        <DeveloperGate />
      ) : (
        <DeveloperSettingsPanel
          roles={matrix.ok ? matrix.roles : []}
          modules={matrix.ok ? matrix.modules : []}
          overview={overview.ok ? overview.data : undefined}
        />
      )}
    </div>
  );
}
