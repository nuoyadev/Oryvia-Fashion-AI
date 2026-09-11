import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api";
import { readEncrypted } from "@/lib/store";
import { db } from "@/lib/db";

// Serve a decrypted image only to its owner. Images are stored
// encrypted at rest and are never exposed on a public path.
export async function GET(_req: NextRequest, { params }: { params: { file: string } }) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });

  const rel = params.file;
  if (!/^[0-9a-f-]+\.(jpg|jpeg|png|webp|heic|heif)$/i.test(rel)) {
    return NextResponse.json({ ok: false, error: "Fichier invalide." }, { status: 400 });
  }

  const owned = db()
    .prepare(
      `SELECT 1 AS x FROM closet_items WHERE image = ? AND user_id = ?
       UNION SELECT 1 FROM inspiration_items WHERE image = ? AND user_id = ?
       UNION SELECT 1 FROM tryons WHERE image = ? AND user_id = ?
       UNION SELECT 1 FROM users WHERE avatar = ? AND id = ? LIMIT 1`
    )
    .get(rel, session.id, rel, session.id, rel, session.id, rel, session.id);
  if (!owned) return NextResponse.json({ ok: false, error: "Non autorisé." }, { status: 403 });

  try {
    const data = readEncrypted(session.wrappedDek, rel);
    const type = rel.toLowerCase().endsWith(".png") ? "image/png" : rel.toLowerCase().endsWith(".webp") ? "image/webp" : "image/jpeg";
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Fichier illisible." }, { status: 500 });
  }
}
