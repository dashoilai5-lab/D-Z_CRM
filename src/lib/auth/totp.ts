// RFC 6238 TOTP (HMAC-SHA1, 6 digits, 30s step) — admin MFA, zero deps.
import { createHmac, randomBytes } from "node:crypto";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateTotpSecret(): string {
  const bytes = randomBytes(20);
  let out = "";
  for (let i = 0; i < bytes.length; i += 5) {
    const chunk = bytes.slice(i, i + 5);
    let buffer = 0;
    let bits = 0;
    for (const b of chunk) {
      buffer = (buffer << 8) | b;
      bits += 8;
      while (bits >= 5) {
        out += BASE32[(buffer >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    if (bits > 0) out += BASE32[(buffer << (5 - bits)) & 31];
  }
  return out.slice(0, 32);
}

function base32Decode(secret: string): Buffer {
  const clean = secret.toUpperCase().replace(/=+$/, "");
  const bits: number[] = [];
  for (const c of clean) {
    const v = BASE32.indexOf(c);
    if (v < 0) throw new Error("invalid base32");
    bits.push(v);
  }
  const bytes: number[] = [];
  let buffer = 0;
  let bitCount = 0;
  for (const v of bits) {
    buffer = (buffer << 5) | v;
    bitCount += 5;
    if (bitCount >= 8) {
      bytes.push((buffer >>> (bitCount - 8)) & 0xff);
      bitCount -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function totp(secret: string, timeStepSec = 30, digits = 6): string {
  const counter = Math.floor(Date.now() / 1000 / timeStepSec);
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const key = base32Decode(secret);
  const hash = createHmac("sha1", key).update(msg).digest();
  const offset = hash[hash.length - 1] & 0x0f;
  const bin = ((hash[offset] & 0x7f) << 24) | ((hash[offset + 1] & 0xff) << 16) | ((hash[offset + 2] & 0xff) << 8) | (hash[offset + 3] & 0xff);
  return String(bin % 10 ** digits).padStart(digits, "0");
}

export function verifyTotp(secret: string, code: string, window = 1): boolean {
  const clean = code.trim();
  for (let w = -window; w <= window; w++) {
    const counter = Math.floor(Date.now() / 1000 / 30) + w;
    const msg = Buffer.alloc(8);
    msg.writeBigUInt64BE(BigInt(counter));
    const key = base32Decode(secret);
    const hash = createHmac("sha1", key).update(msg).digest();
    const offset = hash[hash.length - 1] & 0x0f;
    const bin = ((hash[offset] & 0x7f) << 24) | ((hash[offset + 1] & 0xff) << 16) | ((hash[offset + 2] & 0xff) << 8) | (hash[offset + 3] & 0xff);
    const expected = String(bin % 10 ** 6).padStart(6, "0");
    if (expected === clean) return true;
  }
  return false;
}
