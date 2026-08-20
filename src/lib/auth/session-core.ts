// Pure session token logic — WebCrypto HMAC so it runs in both Edge (middleware)
// and Node (server actions / components). No next/headers imports here.
export const SESSION_COOKIE = "dz_session";
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export interface SessionPayload {
  uid: string;      // user id
  exp: number;      // expiry epoch ms
}

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not configured");
  return s;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signToken(payload: SessionPayload): Promise<string> {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const key = await hmacKey();
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)));
  return body + "." + Buffer.from(sig).toString("base64url");
}

export async function verifyToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const key = await hmacKey();
    const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)));
    const provided = Buffer.from(sig, "base64url");
    if (provided.length !== expected.length) return null;
    let diff = 0;
    for (let i = 0; i < provided.length; i++) diff |= provided[i] ^ expected[i];
    if (diff !== 0) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (typeof payload.uid !== "string" || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSessionPayload(userId: string): SessionPayload {
  return { uid: userId, exp: Date.now() + SESSION_TTL_MS };
}
