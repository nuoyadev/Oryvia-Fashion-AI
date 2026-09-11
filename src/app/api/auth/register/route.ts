import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, hashPassword, isStrongPassword, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { createUser, findUserByEmail } from "@/lib/repo";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { email?: string; password?: string; name?: string } | null;
  if (!body) return fail("Requête invalide.");
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const name = (body.name ?? "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Adresse email invalide.");
  const pw = isStrongPassword(password);
  if (!pw.ok) return fail(pw.reason ?? "Mot de passe trop faible.");

  if (findUserByEmail(email)) return fail("Un compte existe déjà avec cet email.", 409);

  const hash = await hashPassword(password);
  const { user } = createUser({ email, passwordHash: hash, name: name || null });

  const token = await createSessionToken(user.id);
  const res = NextResponse.json({ ok: true, data: { user } });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}
