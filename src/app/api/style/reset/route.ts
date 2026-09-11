import { fail, getSessionUser, ok } from "@/lib/api";
import { clearOutfitFeedback } from "@/lib/repo";

// Wipe all like/dislike history, restoring the onboarding DNA.
export async function POST() {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  clearOutfitFeedback(session.id);
  return ok(null);
}
