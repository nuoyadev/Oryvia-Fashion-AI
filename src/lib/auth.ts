// ────────────────────────────────────────────────────────────────
// Oryvia — authentication & sessions
//
// Passwords are hashed with bcrypt (cost 12). Sessions are signed
// HS256 JWTs (jose) delivered in an httpOnly, SameSite=Lax cookie —
// never in localStorage, so they cannot be read by client scripts.
// ────────────────────────────────────────────────────────────────

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "oryvia_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

function secret(): Uint8Array {
  const raw = process.env.ORVYIA_JWT_SECRET || "oryvia-dev-secret-change-me";
  return new TextEncoder().encode(raw);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

/** Returns the user id when the token is valid, otherwise null. */
export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function isStrongPassword(pw: string): { ok: boolean; reason?: string } {
  if (pw.length < 10) return { ok: false, reason: "Minimum 10 caractères." };
  if (!/[a-z]/.test(pw)) return { ok: false, reason: "Ajoute une minuscule." };
  if (!/[A-Z]/.test(pw)) return { ok: false, reason: "Ajoute une majuscule." };
  if (!/[0-9]/.test(pw)) return { ok: false, reason: "Ajoute un chiffre." };
  return { ok: true };
}
