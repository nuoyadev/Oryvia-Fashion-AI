import { fail, getSessionUser, ok } from "@/lib/api";
import { findUserById, listOutfitFeedback } from "@/lib/repo";
import { effectiveStyleDna } from "@/lib/recommend";

// Returns the base DNA, the effective DNA (shaped by feedback) and
// the feedback history, so the UI can show how the user's taste is
// evolving Oryvia's understanding of them.
export async function GET() {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  const row = findUserById(session.id);
  if (!row) return fail("Non authentifié.", 401);

  const base = row.user.styleDna;
  const feedback = base ? listOutfitFeedback(session.id) : [];
  const effective = base ? effectiveStyleDna(base, feedback) : null;

  const stats = {
    likes: feedback.filter((f) => f.sentiment === "like").length,
    dislikes: feedback.filter((f) => f.sentiment === "dislike").length,
    total: feedback.length,
  };

  return ok({ base, effective, feedback, stats });
}
