// Motorcycle type catalogue — derived from Malaysia_Motorcycle_Market_and_Service_Analysis_2026
// (Motorcycle Taxonomy sheet). Single source of truth for the type dimension:
// used by the seed, the rider app, and future type-aware service recommendations.
// Only mainstream Malaysia types (Relevance >= 3) are included.

export type MotorcycleType =
  | "UNDERBONE"
  | "LIFESTYLE_CUB"
  | "SCOOTER"
  | "PREMIUM_SCOOTER"
  | "NAKED"
  | "SPORT"
  | "ADV"
  | "CRUISER"
  | "MODERN_CLASSIC"
  | "MINI_FUN"
  | "ELECTRIC_SCOOTER"
  | "ELECTRIC_FLEET";

export interface MotorcycleTypeInfo {
  key: MotorcycleType;
  label: string;          // user-facing English
  labelBM: string;        // Bahasa Malaysia
  malaysiaTerm: string;   // kapcai / skuter / etc
  relevance: number;      // 1-5 from taxonomy
  typical: string[];      // representative Malaysia models
  serviceFocus: string[]; // high-frequency services per Bike-Service Matrix
}

export const MOTORCYCLE_TYPES: readonly MotorcycleTypeInfo[] = [
  {
    key: "UNDERBONE", label: "Underbone", labelBM: "Kapcai", malaysiaTerm: "kapcai / cub",
    relevance: 5, typical: ["Honda Wave", "Yamaha 135LC", "Honda Dash125"],
    serviceFocus: ["Engine Oil", "Chain & Sprocket", "Tyres", "Brake Pads"],
  },
  {
    key: "LIFESTYLE_CUB", label: "Lifestyle Cub", labelBM: "Cub Retro", malaysiaTerm: "cub / retro kapcai",
    relevance: 4, typical: ["Yamaha PG-1", "CFMOTO Papio", "WMOTO Cub Classic"],
    serviceFocus: ["Engine Oil", "Chain & Sprocket", "Tyres"],
  },
  {
    key: "SCOOTER", label: "Scooter", labelBM: "Skuter", malaysiaTerm: "skuter",
    relevance: 5, typical: ["Honda BeAT", "Honda Vario", "Yamaha Ego", "Yamaha NMAX"],
    serviceFocus: ["CVT Service", "Engine Oil", "Tyres", "Brake Pads"],
  },
  {
    key: "PREMIUM_SCOOTER", label: "Premium Scooter", labelBM: "Skuter Premium", malaysiaTerm: "premium scooter",
    relevance: 4, typical: ["Yamaha XMAX", "Honda ADV160", "Modenas Elegan EX"],
    serviceFocus: ["CVT Service", "Coolant", "Brake Pads", "Diagnostics"],
  },
  {
    key: "NAKED", label: "Naked / Roadster", labelBM: "Naked", malaysiaTerm: "naked bike",
    relevance: 4, typical: ["Honda CB250R", "Yamaha MT series", "CFMOTO NK"],
    serviceFocus: ["Engine Oil", "Chain & Sprocket", "Tyres", "Brake Pads", "Valve Service"],
  },
  {
    key: "SPORT", label: "Sport / Supersport", labelBM: "Sport", malaysiaTerm: "sportbike",
    relevance: 4, typical: ["Honda CBR", "Yamaha R series", "Kawasaki Ninja"],
    serviceFocus: ["Tyres", "Brake Pads", "Brake Fluid", "Chain & Sprocket", "Coolant"],
  },
  {
    key: "ADV", label: "Adventure Touring", labelBM: "ADV", malaysiaTerm: "ADV / adventure",
    relevance: 4, typical: ["Honda Africa Twin", "Suzuki V-Strom", "CFMOTO MT"],
    serviceFocus: ["Tyres", "Chain & Sprocket", "Suspension", "Diagnostics"],
  },
  {
    key: "CRUISER", label: "Cruiser", labelBM: "Cruiser", malaysiaTerm: "cruiser",
    relevance: 3, typical: ["Honda Rebel", "Harley-Davidson", "WMOTO Bobbie"],
    serviceFocus: ["Engine Oil", "Tyres", "Brake Pads", "Battery", "Wash & Detail"],
  },
  {
    key: "MODERN_CLASSIC", label: "Modern Classic", labelBM: "Retro", malaysiaTerm: "retro / classic",
    relevance: 3, typical: ["Royal Enfield Classic", "Honda CB350RS", "BMW R12"],
    serviceFocus: ["Engine Oil", "Chain & Sprocket", "Tyres", "Detailing"],
  },
  {
    key: "MINI_FUN", label: "Mini / Fun Bike", labelBM: "Mini", malaysiaTerm: "mini bike",
    relevance: 3, typical: ["CFMOTO Papio", "CFMOTO Papio Racer"],
    serviceFocus: ["Engine Oil", "Chain & Sprocket", "Tyres"],
  },
  {
    key: "ELECTRIC_SCOOTER", label: "Electric Scooter", labelBM: "E-Skuter", malaysiaTerm: "E-scooter",
    relevance: 3, typical: ["Blueshark R1", "MForce EZI", "YADEA"],
    serviceFocus: ["Battery Health", "Tyres", "Brake Pads", "Electrical Diagnostics"],
  },
  {
    key: "ELECTRIC_FLEET", label: "Electric Fleet", labelBM: "Fleet EV", malaysiaTerm: "EV fleet",
    relevance: 3, typical: ["MODENAS MEV-1", "MForce delivery"],
    serviceFocus: ["Battery Health", "Tyres", "Brake Pads", "Uptime Support"],
  },
];

export function motorcycleTypeInfo(key: string): MotorcycleTypeInfo | undefined {
  return MOTORCYCLE_TYPES.find((t) => t.key === key);
}

export const MOTORCYCLE_TYPE_KEYS = MOTORCYCLE_TYPES.map((t) => t.key);
export const MOTORCYCLE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  MOTORCYCLE_TYPES.map((t) => [t.key, t.label])
);
