import { fail, getSessionUser, ok } from "@/lib/api";
import {
  ensureBaseSnapshot,
  findUserById,
  listLikedOutfits,
  listStyleSnapshots,
} from "@/lib/repo";

// Style evolution timeline: dated DNA snapshots + liked looks + stats.
export async function GET() {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  const row = findUserById(session.id);
  if (!row) return fail("Non authentifié.", 401);

  const dna = row.user.styleDna;
  if (dna) ensureBaseSnapshot(session.id, dna);

  const snapshots = listStyleSnapshots(session.id);
  const likedOutfits = listLikedOutfits(session.id);

  const stats = {
    snapshots: snapshots.length,
    likes: likedOutfits.length,
    firstAt: snapshots[0]?.createdAt ?? null,
    lastAt: snapshots[snapshots.length - 1]?.createdAt ?? null,
  };

  return ok({ snapshots, likedOutfits, stats });
}
