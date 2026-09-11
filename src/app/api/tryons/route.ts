import { NextRequest } from "next/server";
import { fail, getSessionUser, LIMIT, ok, parseMultipart } from "@/lib/api";
import { addTryOn, listTryOns } from "@/lib/repo";
import { writeEncrypted } from "@/lib/store";
import type { TryOn } from "@/lib/types";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  return ok(listTryOns(session.id));
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > LIMIT) return fail("Fichier trop volumineux (12 Mo max).", 413);

  const { fields, files } = await parseMultipart(req);
  const file = files.find((f) => f.field === "image") ?? files[0];
  if (!file) return fail("Ajoute une photo de ton essai.");
  if (!/^image\/(jpeg|png|webp)$/i.test(file.contentType)) {
    return fail("Format d'image non supporté (JPG, PNG, WebP).");
  }

  let verdict: TryOn["verdict"];
  try {
    verdict = JSON.parse(fields.verdict ?? "{}");
    if (typeof verdict.score !== "number") verdict.score = 0;
    if (typeof verdict.verdict !== "string") verdict.verdict = "";
    if (!Array.isArray(verdict.palette)) verdict.palette = [];
  } catch {
    verdict = { score: 0, verdict: "", palette: [] };
  }

  const imageRel = writeEncrypted(
    session.wrappedDek,
    file.data,
    file.contentType.includes("png") ? "png" : "jpg"
  );
  const item = addTryOn(session.id, {
    outfitId: fields.outfitId || null,
    lookName: fields.lookName?.trim() || "Essai",
    image: imageRel,
    verdict,
  });
  return ok(item, 201);
}
