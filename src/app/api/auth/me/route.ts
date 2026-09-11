import { fail, getSessionUser, ok } from "@/lib/api";
import { findUserById } from "@/lib/repo";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  const row = findUserById(session.id);
  if (!row) return fail("Non authentifié.", 401);
  return ok(row.user);
}
