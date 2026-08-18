// Pure persona constants — safe for client components (no next/headers here).
export const DEMO_PERSONAS = ["OWNER", "COUNTER_STAFF", "MECHANIC", "CUSTOMER"] as const;
export type DemoPersona = (typeof DEMO_PERSONAS)[number];

export const PERSONA_LABEL: Record<DemoPersona, string> = {
  OWNER: "Workshop Owner",
  COUNTER_STAFF: "Counter Staff",
  MECHANIC: "Mechanic",
  CUSTOMER: "Customer",
};

export const PERSONA_COOKIE = "dz_demo_persona";
