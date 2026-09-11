import { NextRequest } from "next/server";
import { fail, getSessionUser, ok } from "@/lib/api";
import { deleteClosetItem, getClosetItem, updateClosetItem } from "@/lib/repo";
import { deleteEncrypted } from "@/lib/store";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  const existing = getClosetItem(session.id, params.id);
  if (!existing) return fail("Pièce introuvable.", 404);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail("Requête invalide.");
  updateClosetItem(session.id, params.id, {
    name: typeof body.name === "string" ? body.name : undefined,
    category: typeof body.category === "string" ? body.category : undefined,
    subcategory: typeof body.subcategory === "string" ? body.subcategory : undefined,
    color: typeof body.color === "string" ? body.color : undefined,
    colorName: typeof body.colorName === "string" ? body.colorName : undefined,
    brand: typeof body.brand === "string" ? body.brand : null,
    tags: Array.isArray(body.tags) ? (body.tags as string[]) : undefined,
  });
  return ok(getClosetItem(session.id, params.id));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  const removed = deleteClosetItem(session.id, params.id);
  if (!removed) return fail("Pièce introuvable.", 404);
  deleteEncrypted(removed.image);
  return ok(null);
}
