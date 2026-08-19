// Service catalogue — derived from Malaysia_Motorcycle_Market_and_Service_Analysis_2026
// (Service Taxonomy + Bike-Service Matrix sheets). Replaces the hardcoded string
// list in the rider booking form and the seed. Only mainstream, high-frequency
// Malaysia services are included (Tier 1-2 quick/general work).

export type ServiceKey =
  | "ENGINE_OIL"
  | "OIL_FILTER"
  | "CVT_SERVICE"
  | "CHAIN_SPROCKET"
  | "TYRE_CHANGE"
  | "BRAKE_PADS"
  | "BRAKE_FLUID"
  | "BATTERY"
  | "AIR_FILTER"
  | "SPARK_PLUG"
  | "COOLANT"
  | "GENERAL_CHECKUP";

export interface ServiceInfo {
  key: ServiceKey;
  label: string;           // user-facing
  family: string;          // taxonomy family (Routine / CVT / Chain / Tyres / Brakes / Electrical / Cooling / Inspection)
  tier: number;            // capability tier 1-2 for routine work
  typicalInterval: string; // generalized interval
  appliesTo: string[];     // motorcycle type keys this applies most to
}

export const SERVICE_CATALOG: readonly ServiceInfo[] = [
  { key: "ENGINE_OIL", label: "Engine Oil Change", family: "Routine Maintenance", tier: 1, typicalInterval: "Every 3,000 km", appliesTo: ["UNDERBONE", "LIFESTYLE_CUB", "SCOOTER", "PREMIUM_SCOOTER", "NAKED", "SPORT", "ADV", "CRUISER", "MODERN_CLASSIC", "MINI_FUN"] },
  { key: "OIL_FILTER", label: "Oil Filter Replacement", family: "Routine Maintenance", tier: 1, typicalInterval: "Usually with oil change", appliesTo: ["UNDERBONE", "SCOOTER", "NAKED", "SPORT", "ADV", "CRUISER"] },
  { key: "CVT_SERVICE", label: "CVT Service (Belt & Rollers)", family: "CVT Scooter", tier: 2, typicalInterval: "Every 8,000-12,000 km", appliesTo: ["SCOOTER", "PREMIUM_SCOOTER"] },
  { key: "CHAIN_SPROCKET", label: "Chain & Sprocket Service", family: "Chain / Final Drive", tier: 1, typicalInterval: "Clean/lube often; set every 15,000-20,000 km", appliesTo: ["UNDERBONE", "LIFESTYLE_CUB", "NAKED", "SPORT", "ADV", "CRUISER", "MODERN_CLASSIC", "MINI_FUN"] },
  { key: "TYRE_CHANGE", label: "Tyre Replacement", family: "Tyres", tier: 1, typicalInterval: "Tread / age / damage", appliesTo: ["UNDERBONE", "SCOOTER", "NAKED", "SPORT", "ADV", "CRUISER"] },
  { key: "BRAKE_PADS", label: "Brake Pad Replacement", family: "Brakes", tier: 1, typicalInterval: "Wear inspection", appliesTo: ["UNDERBONE", "SCOOTER", "PREMIUM_SCOOTER", "NAKED", "SPORT", "ADV", "CRUISER"] },
  { key: "BRAKE_FLUID", label: "Brake Fluid Flush", family: "Brakes", tier: 2, typicalInterval: "Every 2 years / condition", appliesTo: ["SPORT", "ADV", "PREMIUM_SCOOTER", "NAKED"] },
  { key: "BATTERY", label: "Battery Test / Replacement", family: "Electrical", tier: 1, typicalInterval: "No-start / age", appliesTo: ["UNDERBONE", "SCOOTER", "NAKED", "SPORT", "CRUISER", "ELECTRIC_SCOOTER"] },
  { key: "AIR_FILTER", label: "Air Filter Service", family: "Routine Maintenance", tier: 1, typicalInterval: "Time / mileage; earlier in dust", appliesTo: ["UNDERBONE", "SCOOTER", "NAKED", "ADV", "CRUISER"] },
  { key: "SPARK_PLUG", label: "Spark Plug Replacement", family: "Routine Maintenance", tier: 1, typicalInterval: "Every 10,000-15,000 km", appliesTo: ["UNDERBONE", "SCOOTER", "NAKED", "SPORT", "CRUISER"] },
  { key: "COOLANT", label: "Coolant Replacement", family: "Cooling", tier: 2, typicalInterval: "Time / mileage per manual", appliesTo: ["PREMIUM_SCOOTER", "SPORT", "ADV"] },
  { key: "GENERAL_CHECKUP", label: "General Checkup", family: "Inspection", tier: 1, typicalInterval: "Recommended each visit", appliesTo: ["UNDERBONE", "LIFESTYLE_CUB", "SCOOTER", "PREMIUM_SCOOTER", "NAKED", "SPORT", "ADV", "CRUISER", "MODERN_CLASSIC", "MINI_FUN", "ELECTRIC_SCOOTER", "ELECTRIC_FLEET"] },
];

/** Services that apply to a motorcycle type (matrix-driven), grouped by family. */
export function servicesForType(typeKey: string): { family: string; items: ServiceInfo[] }[] {
  const rows = SERVICE_CATALOG.filter((s) => s.appliesTo.includes(typeKey));
  const groups = new Map<string, ServiceInfo[]>();
  for (const s of rows) {
    const arr = groups.get(s.family) ?? [];
    arr.push(s);
    groups.set(s.family, arr);
  }
  return [...groups.entries()].map(([family, items]) => ({ family, items }));
}

export const SERVICE_LABELS: Record<string, string> = Object.fromEntries(SERVICE_CATALOG.map((s) => [s.key, s.label]));
export const SERVICE_KEYS = SERVICE_CATALOG.map((s) => s.key);
