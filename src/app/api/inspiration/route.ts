import { NextRequest } from "next/server";
import { fail, getSessionUser, LIMIT, ok, parseMultipart } from "@/lib/api";
import { addInspiration, listInspiration } from "@/lib/repo";
import { writeEncrypted } from "@/lib/store";
import { analyzeImage } from "@/lib/analyze";
import { nearestColor } from "@/lib/palette";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  return ok(listInspiration(session.id));
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > LIMIT) return fail("Fichier trop volumineux (12 Mo max).", 413);

  const { fields, files } = await parseMultipart(req);
  const file = files.find((f) => f.field === "image") ?? files[0];
  if (!file) return fail("Ajoute une photo d'inspiration.");
  if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.contentType)) {
    return fail("Format d'image non supporté (JPG, PNG, WebP).");
  }

  let palette: string[] = [];
  try {
    const analysis = analyzeImage(file.data);
    palette = analysis.palette.map((c) => c.hex).filter((c) => c !== nearestColor("#ffffff").hex);
    if (palette.length === 0) palette = [analysis.dominant.hex];
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Impossible de lire cette image.");
  }

  let tags: string[] = [];
  try {
    tags = JSON.parse(fields.tags ?? "[]");
    if (!Array.isArray(tags)) tags = [];
  } catch {
    tags = [];
  }

  const imageRel = writeEncrypted(session.wrappedDek, file.data, file.contentType.includes("png") ? "png" : file.contentType.includes("webp") ? "webp" : "jpg");
  const item = addInspiration(session.id, {
    source: fields.source?.trim() || "Inspiration",
    note: fields.note?.trim() || null,
    palette,
    tags,
    image: imageRel,
  });
  return ok(item, 201);
}
