import { NextRequest } from "next/server";
import { fail, getSessionUser, ok } from "@/lib/api";
import { deleteInspiration } from "@/lib/repo";
import { deleteEncrypted } from "@/lib/store";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  const removed = deleteInspiration(session.id, params.id);
  if (!removed) return fail("Introuvable.", 404);
  deleteEncrypted(removed.image);
  return ok(null);
}
