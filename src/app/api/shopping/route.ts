import { NextRequest } from "next/server";
import { fail, getSessionUser, ok } from "@/lib/api";
import { addShoppingList, listShoppingLists, listCloset, findUserById } from "@/lib/repo";
import { generateShopping } from "@/lib/recommend";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  return ok(listShoppingLists(session.id));
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  const body = (await req.json().catch(() => null)) as { goal?: string; budget?: number; style?: string } | null;
  if (!body) return fail("Requête invalide.");

  const row = findUserById(session.id)!;
  const budget = Math.max(20, Math.min(5000, Number(body.budget) || row.user.styleDna?.budget || 300));
  const goal = body.goal?.trim() || "Améliorer mon style";
  const style = body.style?.trim() || "";

  const { items, total } = generateShopping({
    dna: row.user.styleDna,
    body: row.user.bodyProfile,
    closet: listCloset(session.id),
    budget,
    goal,
    style,
  });

  const list = addShoppingList(session.id, { goal, budget, style, items, total });
  return ok(list, 201);
}
