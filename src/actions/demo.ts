"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { PERSONA_COOKIE, type DemoPersona } from "@/lib/demo";
import { resetDemoData } from "@/lib/reset";

// Demo-only actions (§A4): production never accepts the demo persona or the
// reset-demo-data wipe. The middleware already ignores the persona cookie in
// production; this guard closes the server-action path (deep defense).
const demoEnabled = () => process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.NODE_ENV !== "production";

export async function setPersona(persona: DemoPersona) {
  if (!demoEnabled()) return;
  const store = await cookies();
  store.set(PERSONA_COOKIE, persona, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  revalidatePath("/", "layout");
}

export async function resetDemo() {
  if (!demoEnabled()) return { ok: false, counts: {} };
  const result = await resetDemoData();
  revalidatePath("/", "layout");
  return result;
}
