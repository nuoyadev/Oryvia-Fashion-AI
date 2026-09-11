import { fail, getSessionUser, ok } from "@/lib/api";
import { addStyleSnapshot, clearOutfitFeedback, findUserById } from "@/lib/repo";

// Wipe all like/dislike history, restoring the onboarding DNA.
export async function POST() {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  clearOutfitFeedback(session.id);
  const row = findUserById(session.id);
  if (row?.user.styleDna) {
    addStyleSnapshot(session.id, "reset", row.user.styleDna);
  }
  return ok(null);
}
