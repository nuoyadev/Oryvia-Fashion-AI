import { NextRequest } from "next/server";
import { fail, getSessionUser, ok } from "@/lib/api";
import { deleteOutfit, setOutfitFeedback } from "@/lib/repo";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  const body = (await req.json().catch(() => null)) as { feedback?: string } | null;
  const feedback = body?.feedback;
  if (feedback !== "like" && feedback !== "dislike" && feedback !== null && feedback !== undefined) {
    return fail("Feedback invalide (like | dislike | null).");
  }
  const outfit = setOutfitFeedback(session.id, params.id, (feedback as "like" | "dislike" | null) ?? null);
  if (!outfit) return fail("Tenue introuvable.", 404);
  return ok(outfit);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  deleteOutfit(session.id, params.id);
  return ok(null);
}
