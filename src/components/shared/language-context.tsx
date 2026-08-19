"use client";

import { createContext, useContext } from "react";
import { type Lang } from "@/lib/i18n";

const LanguageContext = createContext<Lang>("en");

export function LanguageProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LanguageContext.Provider value={lang}>{children}</LanguageContext.Provider>;
}

/** Client-side hook: the active language. Server components should use getLang() instead. */
export function useLang(): Lang {
  return useContext(LanguageContext);
}
