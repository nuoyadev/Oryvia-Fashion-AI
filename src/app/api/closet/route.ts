import { NextRequest } from "next/server";
import { fail, getSessionUser, LIMIT, ok, parseMultipart } from "@/lib/api";
import { addClosetItem, listCloset } from "@/lib/repo";
import { writeEncrypted } from "@/lib/store";
import { analyzeImage } from "@/lib/analyze";
import { nearestColor } from "@/lib/palette";
import type { ClosetCategory } from "@/lib/types";

const CATEGORIES = ["tops", "bottoms", "outerwear", "dresses", "shoes", "accessories"];

export async function GET() {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  return ok(listCloset(session.id));
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > LIMIT) return fail("Fichier trop volumineux (12 Mo max).", 413);

  const { fields, files } = await parseMultipart(req);
  const category = (fields.category ?? "tops") as ClosetCategory;
  if (!CATEGORIES.includes(category)) return fail("Catégorie invalide.");
  const name = (fields.name ?? "").trim();
  if (!name) return fail("Donne un nom à cette pièce.");

  let color = fields.color || "";
  let colorName = fields.colorName || "";
  let imageRel: string | null = null;
  const file = files.find((f) => f.field === "image") ?? files[0];

  if (file) {
    if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.contentType)) {
      return fail("Format d'image non supporté (JPG, PNG, WebP).");
    }
    try {
      const analysis = analyzeImage(file.data);
      if (!color) {
        color = analysis.dominant.hex;
        colorName = analysis.dominant.name;
      }
      if (!colorName) colorName = nearestColor(color).name;
      imageRel = writeEncrypted(session.wrappedDek, file.data, extFor(file.contentType));
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Impossible de lire cette image.");
    }
  } else {
    colorName = nearestColor(color || "#888888").name;
  }

  let tags: string[] = [];
  try {
    tags = JSON.parse(fields.tags ?? "[]");
    if (!Array.isArray(tags)) tags = [];
  } catch {
    tags = [];
  }

  const item = addClosetItem(session.id, {
    name,
    category,
    subcategory: fields.subcategory ?? "",
    color: color || nearestColor(color).hex,
    colorName,
    brand: fields.brand || null,
    tags,
    image: imageRel,
  });
  return ok(item, 201);
}

function extFor(ct: string): string {
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("heic") || ct.includes("heif")) return "heic";
  return "jpg";
}
