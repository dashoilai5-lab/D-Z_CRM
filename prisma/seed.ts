import { runSeed } from "../src/lib/seed-core";

// Seed is staging/dev/e2e-only (§A4): deterministic demo data must never
// touch production. Guard here so a stray `pnpm db:seed` in production fails
// loudly instead of polluting the real database. Override with SEED_ALLOWED=1
// (never set it in the production environment).
if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOWED !== "1") {
  console.error("Refusing to seed in production (NODE_ENV=production). Set SEED_ALLOWED=1 to override.");
  process.exit(1);
}

runSeed()
  .then((c) => { console.log("Seed complete:", JSON.stringify(c)); })
  .catch((e) => { console.error(e); process.exit(1); });
