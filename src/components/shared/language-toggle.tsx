"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANGS, LANG_LABEL, type Lang } from "@/lib/i18n";
import { setLanguage } from "@/actions/language";

export function LanguageToggle({ lang, compact = false }: { lang: Lang; compact?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className={cn("flex items-center gap-0.5 rounded-lg border bg-background p-0.5", compact ? "h-7" : "h-8")}>
      <Globe className={cn("text-muted-foreground", compact ? "h-3 w-3 ml-1" : "h-3.5 w-3.5 ml-1.5")} />
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => { if (l !== lang) start(async () => { await setLanguage(l); router.refresh(); }); }}
          disabled={pending}
          className={cn(
            "rounded-md text-[10px] font-semibold transition-colors",
            compact ? "px-1.5 py-0.5" : "px-2 py-1",
            l === lang ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {LANG_LABEL[l]}
        </button>
      ))}
    </div>
  );
}
