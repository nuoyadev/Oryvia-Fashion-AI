import { NextRequest } from "next/server";
import { fail, getSessionUser, ok } from "@/lib/api";
import { findUserById, updateUserProfile, updateUserName } from "@/lib/repo";
import { buildStyleDna, type StyleDnaInput } from "@/lib/recommend";
import type { BodyProfile } from "@/lib/types";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  return ok(findUserById(session.id)?.user ?? null);
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  const body = (await req.json().catch(() => null)) as {
    name?: string;
    bodyProfile?: BodyProfile;
    styleInput?: StyleDnaInput;
  } | null;
  if (!body) return fail("Requête invalide.");

  if (typeof body.name === "string" && body.name.trim()) {
    updateUserName(session.id, body.name.trim());
  }
  if (body.bodyProfile && body.styleInput) {
    const styleDna = buildStyleDna(body.bodyProfile, body.styleInput);
    const user = updateUserProfile(session.id, { bodyProfile: body.bodyProfile, styleDna });
    return ok(user);
  }
  return ok(findUserById(session.id)?.user ?? null);
}
