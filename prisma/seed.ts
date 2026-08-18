import { runSeed } from "../src/lib/seed-core";
runSeed()
  .then((c) => { console.log("Seed complete:", JSON.stringify(c)); })
  .catch((e) => { console.error(e); process.exit(1); });
