import { NextRequest } from "next/server";
import { fail, getSessionUser, ok } from "@/lib/api";
import {
  addStyleSnapshot,
  deleteOutfit,
  findUserById,
  listOutfitFeedback,
  setOutfitFeedback,
} from "@/lib/repo";
import { effectiveStyleDna } from "@/lib/recommend";

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

  // Record how the Style DNA just evolved.
  const row = findUserById(session.id);
  if (row?.user.styleDna) {
    const effective = effectiveStyleDna(row.user.styleDna, listOutfitFeedback(session.id));
    const trigger: "like" | "dislike" | "reset" =
      feedback === "like" ? "like" : feedback === "dislike" ? "dislike" : "reset";
    addStyleSnapshot(session.id, trigger, effective);
  }

  return ok(outfit);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  deleteOutfit(session.id, params.id);
  return ok(null);
}
