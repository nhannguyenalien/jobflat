import { neon } from "@neondatabase/serverless";

export interface AppEnv {
  DATABASE_URL: string;
  AUTH_SECRET?: string;
}

const encoder = new TextEncoder();

function base64url(bytes: Uint8Array) {
  let value = "";
  bytes.forEach((byte) => (value += String.fromCharCode(byte)));
  return btoa(value)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function fromBase64url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const raw = atob(
    normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="),
  );
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64url(
    new Uint8Array(
      await crypto.subtle.sign("HMAC", key, encoder.encode(value)),
    ),
  );
}

export async function hashPassword(
  password: string,
  salt = base64url(crypto.getRandomValues(new Uint8Array(16))),
) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: fromBase64url(salt),
      iterations: 100000,
    },
    key,
    256,
  );
  return { salt, hash: base64url(new Uint8Array(bits)) };
}

export async function createToken(
  user: { id: string; email: string; role: string },
  env: AppEnv,
) {
  const payload = base64url(
    encoder.encode(JSON.stringify({ ...user, exp: Date.now() + 7 * 86400000 })),
  );
  return `${payload}.${await hmac(payload, env.AUTH_SECRET || env.DATABASE_URL)}`;
}

export async function requireUser(request: Request, env: AppEnv) {
  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (
    !payload ||
    !signature ||
    (await hmac(payload, env.AUTH_SECRET || env.DATABASE_URL)) !== signature
  )
    return null;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64url(payload)));
    if (parsed.exp < Date.now()) return null;
    const sql = neon(env.DATABASE_URL);
    const rows =
      await sql`SELECT id, email, full_name, role, avatar_url FROM accounts WHERE id = ${parsed.id} LIMIT 1`;
    return rows[0] || null;
  } catch {
    return null;
  }
}
