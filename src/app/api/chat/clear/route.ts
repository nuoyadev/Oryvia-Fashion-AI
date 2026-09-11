import { fail, getSessionUser, ok } from "@/lib/api";
import { clearChat } from "@/lib/repo";

export async function POST() {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  clearChat(session.id);
  return ok(null);
}
