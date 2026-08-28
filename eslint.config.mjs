import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Dev helper scripts (CJS) — not product code.
    "scripts/**",
    "e2e/**",
    // D&Z teaching-PPT build artifacts — not product code.
    ".ppt-build/**",
    "docs/ppt-assets/**",
  ]),
]);

export default eslintConfig;
