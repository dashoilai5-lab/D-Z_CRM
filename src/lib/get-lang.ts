import "server-only";
import { cookies } from "next/headers";
import { parseLang, type Lang } from "@/lib/i18n";

/** Server-side: read the active language from the cookie. */
export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return parseLang(store.get("dz_lang")?.value);
}
