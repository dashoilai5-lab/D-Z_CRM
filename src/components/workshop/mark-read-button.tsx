"use client";
import { useRouter } from "next/navigation";
import { markNotificationRead } from "@/actions/notifications";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();
  const lang = useLang();
  return (
    <button className="text-[11px] text-muted-foreground hover:text-foreground" onClick={async () => { await markNotificationRead(id); router.refresh(); }}>
      {t("ws.ctrl.mark-read", lang)}
    </button>
  );
}
