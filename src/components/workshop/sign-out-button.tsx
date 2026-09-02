"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useLang } from "@/components/shared/language-context";
import { t } from "@/lib/i18n";

export function SignOutButton({ expanded }: { expanded: boolean }) {
  const lang = useLang();
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        const { signOutSupabase } = await import("@/actions/auth-supabase");
        await signOutSupabase();
        router.push("/login");
        router.refresh();
      }}
      title={t("common.sign_out", lang)}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {expanded && <span className="truncate">{t("common.sign_out", lang)}</span>}
    </button>
  );
}
