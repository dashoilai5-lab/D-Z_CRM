"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLanguage } from "@/actions/language";
import { LANGS, LANG_LABEL, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Rider 语言切换（Settings → Language）：EN / 中文 / BM，写入 dz_lang cookie。 */
export function LanguageSwitcher({ current }: { current: Lang }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const pick = (lang: Lang) =>
    start(async () => {
      await setLanguage(lang);
      router.refresh();
    });

  return (
    <div className="grid grid-cols-3 gap-2">
      {LANGS.map((lang) => (
        <button
          key={lang}
          type="button"
          disabled={pending}
          onClick={() => pick(lang)}
          className={cn(
            "h-10 rounded-xl border text-sm font-medium transition-colors",
            lang === current
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-muted/50 text-foreground hover:bg-muted"
          )}
        >
          {LANG_LABEL[lang]}
        </button>
      ))}
    </div>
  );
}
