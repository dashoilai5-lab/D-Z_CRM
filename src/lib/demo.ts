import { cookies } from "next/headers";
import { PERSONA_COOKIE, DEMO_PERSONAS, type DemoPersona } from "@/lib/persona";
export { PERSONA_COOKIE, DEMO_PERSONAS, PERSONA_LABEL, type DemoPersona } from "@/lib/persona";

// Demo persona switcher (§13). Persona is stored in a cookie so that Server
// Components can react to it. Switching persona preserves the same shared DB.

export async function getPersona(): Promise<DemoPersona> {
  const store = await cookies();
  const v = store.get(PERSONA_COOKIE)?.value as DemoPersona | undefined;
  return v && (DEMO_PERSONAS as readonly string[]).includes(v) ? v : "OWNER";
}

export function isWorkshopPersona(p: DemoPersona): boolean {
  return p !== "CUSTOMER";
}
