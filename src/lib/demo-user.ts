import "server-only";
import { db } from "@/lib/db";
import { PERSONA_LABEL, type DemoPersona } from "@/lib/persona";

export interface DemoUserInfo {
  name: string;
  roleLabel: string;
  initials: string;
}

const ROLE_BY_PERSONA: Record<Exclude<DemoPersona, "CUSTOMER">, string> = {
  OWNER: "OWNER",
  COUNTER_STAFF: "COUNTER_STAFF",
  MECHANIC: "MECHANIC",
};

/** The demo workshop user for the current persona (staff table lookup). */
export async function getDemoUser(persona: DemoPersona): Promise<DemoUserInfo | null> {
  if (persona === "CUSTOMER") return null;
  const role = ROLE_BY_PERSONA[persona];
  const user = await db.user.findFirst({ where: { role: role as never }, orderBy: { name: "asc" } });
  if (!user) return null;
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return { name: user.name, roleLabel: PERSONA_LABEL[persona], initials };
}
