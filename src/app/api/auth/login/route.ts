import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE, verifyPassword } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { findUserByEmail } from "@/lib/repo";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { email?: string; password?: string } | null;
  if (!body) return fail("Requête invalide.");
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  const row = findUserByEmail(email);
  if (!row) return fail("Email ou mot de passe incorrect.", 401);
  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) return fail("Email ou mot de passe incorrect.", 401);

  const token = await createSessionToken(row.id);
  const res = NextResponse.json({ ok: true, data: { user: row.user } });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}
