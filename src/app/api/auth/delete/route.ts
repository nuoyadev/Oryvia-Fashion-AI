import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteUser } from "@/lib/repo";
import { deleteEncrypted } from "@/lib/store";

// Full account deletion: remove every row and every encrypted photo.
export async function POST() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });

  const rels = db()
    .prepare(
      `SELECT image AS rel FROM closet_items WHERE user_id = ? AND image IS NOT NULL
       UNION SELECT image FROM inspiration_items WHERE user_id = ? AND image IS NOT NULL
       UNION SELECT image FROM tryons WHERE user_id = ? AND image IS NOT NULL
       UNION SELECT avatar FROM users WHERE id = ? AND avatar IS NOT NULL`
    )
    .all(session.id, session.id, session.id, session.id) as { rel: string }[];

  for (const { rel } of rels) {
    try {
      deleteEncrypted(rel);
    } catch {
      /* already gone */
    }
  }

  deleteUser(session.id);
  const res = NextResponse.json({ ok: true, data: null });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" });
  return res;
}
