// Brand → model mapping — derived from Malaysia_Motorcycle_Market_and_Service_Analysis_2026
// (Malaysia Model Catalogue sheet). Used by the add-motorcycle form: picking a
// brand filters its models; every list also offers "Others" for free input.

export interface BrandModels {
  brand: string;
  models: string[];
}

export const OTHERS = "Others";

/** Common Malaysia brands (order matters — most common first). */
export const BIKE_BRANDS = [
  "Yamaha", "Honda", "Modenas", "Kawasaki", "Suzuki", "KTM", "Benelli",
  "SYM", "CFMOTO", "Vespa", "Royal Enfield", "Harley-Davidson", "BMW",
  OTHERS,
] as const;

export const BRAND_MODEL_MAP: Record<string, string[]> = {
  Yamaha: ["135LC Fi", "EZ115", "Ego Avantiz", "Ego Gear", "MT-09", "MT-15", "MT-25", "NMAX", "NVX", "PG-1", "R15M", "TMAX", "Tenere 700", "Tracer 9 GT", "XMAX250", "Y15ZR", "Y16ZR", "YZF-R25", OTHERS],
  Honda: ["ADV160", "ADV350", "BeAT", "CB1000 SP", "CB250R", "CB350RS", "CB650R", "CB750 Hornet", "CBR150R", "CBR250RR", "CBR650R", "CRF250 Rally", "Dash125", "NSS250", "NX500", "RS-X Winner", "RS150R", "Rebel 500", "Vario125", "Vario160", "Wave Alpha", OTHERS],
  Modenas: ["Dominar D400", "ELIT 150S", "Elegan EX 250", "Karisma 125S", "Kriss 110", "MEV-1 Pro", "MEV-1 Pro SX", "MEV-2", "Z15GT", OTHERS],
  Kawasaki: ["Eliminator", "KLX", "KX", "Ninja ZX-10R", "Ninja ZX-4R SE", "Ninja ZX-6R", "Ninja 250", "Versys", "Vulcan", "Z900", "Z900 SE", "Z650 S", OTHERS],
  Suzuki: ["Avenis 125", "Burgman 125", "Burgman 400", "GSX-8R", "GSX-8S", "GSX-R150", "GSX-R1000", "GSX-S1000", "Gixxer 250", "Hayabusa", "Raider R150Fi", "V-Strom 800", "V-Strom 250SX", OTHERS],
  KTM: ["200 Duke", "250 Adventure", "250 Duke", "390 Adventure", "390 Duke", "690 Enduro R", "690 SMC R", "790 Adventure", "790 Duke", "1290 Super Adventure", "1290 Super Duke", OTHERS],
  Benelli: ["150S", "302R", "502C", "752S", "Imperiale 400", "Leoncino 250", "Leoncino 500", "Panarea 125", "TNT135i", "TNT25", "TRK251", "TRK502", "VZ125i", OTHERS],
  SYM: ["Cruisym 400i", "Husky 200", "Husky 300", "Jet X 150", "Maxsym TL508", "NAGA155", "Sport Rider 125i", "Tuscany 150", "VFE185i", OTHERS],
  CFMOTO: ["250NK", "250SR", "250CL-X", "450NK", "450SR", "450CL-C", "650MT", "650GT", "675NK", "675SR-R", "700CL-X", "700MT", "800MT", "1250TR-G", OTHERS],
  Vespa: ["Primavera 150", "Sprint 150", "GTS 300", "GTV 300", OTHERS],
  "Royal Enfield": ["Bear 650", "Bullet 350", "Classic 350", "Continental GT 650", "Guerrilla 450", "Himalayan 450", "Hunter 350", "Interceptor 650", "Meteor 350", "Shotgun 650", "Super Meteor 650", OTHERS],
  "Harley-Davidson": ["Fat Boy", "Heritage Classic", "Low Rider S", "Nightster", "Pan America 1250", "Road Glide", "Sportster S", "Street Bob", "Street Glide", OTHERS],
  BMW: ["C400GT", "F900R", "F900XR", "R1250RT", "R1300RT", "R12 nineT", "S1000RR", "K1600GT", OTHERS],
};

export function modelsForBrand(brand: string): string[] {
  return BRAND_MODEL_MAP[brand] ?? [OTHERS];
}

/* ---- catalogue product photos (example imagery uploaded to public/motorcycles) ----
   Each model resolves to a stable image via a small hash — the same model always
   shows the same photo, and neighbouring models spread across the 10 examples. */
export const MOTORCYCLE_IMAGES = [
  "01_red_sportbike.png", "02_classic_motorcycle.png", "03_blue_sportbike.png", "04_blue_sportbike_variant.png",
  "05_black_sportbike.png", "06_blue_sportbike_variant_2.png", "07_blue_sportbike_variant_3.png",
  "08_black_sport_touring.png", "09_naked_street_bike.png", "10_black_cruiser.png",
] as const;

export function bikeImageFor(model: string): string {
  let h = 0;
  for (let i = 0; i < model.length; i++) h = (h * 31 + model.charCodeAt(i)) >>> 0;
  return "/motorcycles/" + MOTORCYCLE_IMAGES[h % MOTORCYCLE_IMAGES.length];
}
