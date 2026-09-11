import { NextRequest } from "next/server";
import { fail, getSessionUser, ok } from "@/lib/api";
import { deleteOutfit } from "@/lib/repo";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  deleteOutfit(session.id, params.id);
  return ok(null);
}
