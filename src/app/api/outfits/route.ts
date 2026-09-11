import { NextRequest } from "next/server";
import { fail, getSessionUser, ok } from "@/lib/api";
import { addOutfit, listOutfits, listCloset, listOutfitFeedback, findUserById } from "@/lib/repo";
import { effectiveStyleDna, generateOutfit } from "@/lib/recommend";
import { getWeather, geocodeCity } from "@/lib/weather";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  return ok(listOutfits(session.id));
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("Non authentifié.", 401);
  const body = (await req.json().catch(() => null)) as { occasion?: string; city?: string } | null;
  if (!body) return fail("Requête invalide.");

  const row = findUserById(session.id)!;
  const occasion = body.occasion ?? "everyday";
  const city = body.city?.trim() || null;

  let weather = null;
  if (city) {
    const geo = await geocodeCity(city);
    if (geo) {
      weather = await getWeather(geo.latitude, geo.longitude);
      if (weather) weather.city = geo.name;
    }
  }

  // The effective DNA blends the onboarding base with the user's
  // like/dislike history — feedback shapes every new outfit.
  const baseDna = row.user.styleDna;
  const dna = baseDna ? effectiveStyleDna(baseDna, listOutfitFeedback(session.id)) : null;

  const { look, alternatives } = generateOutfit({
    body: row.user.bodyProfile,
    dna,
    closet: listCloset(session.id),
    occasion,
    weather,
    city,
  });

  const outfit = addOutfit(session.id, { occasion, city, look, alternatives });
  return ok({ ...outfit, weather }, 201);
}
