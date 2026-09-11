import { NextRequest } from "next/server";
import { fail, getSessionUser, ok } from "@/lib/api";
import { addChatMessage, listChatMessages } from "@/lib/repo";
import { answerChat } from "@/lib/ai";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  return ok(listChatMessages(session.id, 60));
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  const body = (await req.json().catch(() => null)) as { text?: string } | null;
  const text = (body?.text ?? "").trim();
  if (!text) return fail("Message vide.");
  if (text.length > 2000) return fail("Message trop long.");

  addChatMessage(session.id, "user", text);
  const reply = await answerChat(session.id, text);
  addChatMessage(session.id, "assistant", reply);
  return ok(reply);
}
