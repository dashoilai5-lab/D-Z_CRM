// Segment-2 auth library smoke test (pure functions, no server deps).
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { signToken, verifyToken, createSessionPayload } from "../src/lib/auth/session-core";
import { generateTotpSecret, totp, verifyTotp } from "../src/lib/auth/totp";

process.env.AUTH_SECRET = "test-secret-0123456789abcdef";

async function main() {
  const results: string[] = [];
  const t = (name: string, cond: boolean, extra = "") => results.push((cond ? "OK   " : "FAIL ") + name + (extra ? " :: " + extra : ""));

  const h = hashPassword("demo1234");
  t("hash format", h.includes(":"));
  t("verify correct", verifyPassword("demo1234", h));
  t("verify wrong", !verifyPassword("wrong", h));

  const p = createSessionPayload("user-1");
  const tok = await signToken(p);
  t("sign/verify roundtrip", (await verifyToken(tok))?.uid === "user-1");
  const expired = await signToken({ uid: "user-1", exp: Date.now() - 1000 });
  t("expired rejected", (await verifyToken(expired)) === null);
  const tampered = tok.slice(0, -2) + (tok.endsWith("AA") ? "BB" : "AA");
  t("tampered rejected", (await verifyToken(tampered)) === null);
  t("empty rejected", (await verifyToken(null)) === null);

  const sec = generateTotpSecret();
  t("totp secret base32", /^[A-Z2-7]{32}$/.test(sec));
  const code = totp(sec);
  t("totp verify ok", verifyTotp(sec, code));
  t("totp verify wrong", !verifyTotp(sec, "000000"));

  const pass = results.filter((r) => r.startsWith("OK")).length;
  const fail = results.filter((r) => r.startsWith("FAIL")).length;
  console.log(results.join("\n"));
  console.log("---\nAUTH SMOKE: " + pass + " passed, " + fail + " failed / " + results.length);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
