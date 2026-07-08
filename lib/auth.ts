/*
  Auth: a single admin password (ADMIN_PASSWORD env var) → a signed JWT stored
  in an httpOnly cookie. verifyToken() is Edge-safe (used by middleware).
*/
import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "dk_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecretKey(): Uint8Array {
  const raw =
    process.env.SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "insecure-dev-secret-change-me";
  // HS256 wants a reasonably long key; pad short secrets.
  return new TextEncoder().encode(raw.padEnd(32, "!"));
}

export async function signToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecretKey());
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};

/* ---- password check (Node runtime only; used in the login route) ---- */
export function adminConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

export function checkPassword(input: unknown): boolean {
  const pw = process.env.ADMIN_PASSWORD || "";
  if (!pw || typeof input !== "string") return false;
  // constant-time-ish comparison
  if (input.length !== pw.length) return false;
  let diff = 0;
  for (let i = 0; i < pw.length; i += 1) diff |= input.charCodeAt(i) ^ pw.charCodeAt(i);
  return diff === 0;
}

/* ---- best-effort in-memory login rate limiting (per warm instance) ---- */
const attempts = new Map<string, { count: number; ts: number }>();
export function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const max = 8;
  const e = attempts.get(ip) ?? { count: 0, ts: now };
  if (now - e.ts > windowMs) {
    e.count = 0;
    e.ts = now;
  }
  e.count += 1;
  attempts.set(ip, e);
  return e.count <= max;
}
