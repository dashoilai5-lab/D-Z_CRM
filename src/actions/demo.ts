"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { PERSONA_COOKIE, type DemoPersona } from "@/lib/demo";
import { resetDemoData } from "@/lib/reset";

export async function setPersona(persona: DemoPersona) {
  const store = await cookies();
  store.set(PERSONA_COOKIE, persona, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  revalidatePath("/", "layout");
}

export async function resetDemo() {
  const result = await resetDemoData();
  revalidatePath("/", "layout");
  return result;
}
