// ────────────────────────────────────────────────────────────────
// Oryvia — Style Recommendation Engine
//
// Pure functions that turn a body profile + wardrobe + inspirations
// into a Style DNA, outfits, shopping lists and insight. Everything
// here is deterministic and runs with zero API keys.
// ────────────────────────────────────────────────────────────────

import {
  archetypeMap,
  archetypes,
  bodyShapes,
  catalog,
  colorSeasons,
  occasions,
  seasonMap,
  type Archetype,
  type PieceDef,
  type SeasonPalette,
  type ShapeGuidance,
} from "./fashion";
import { hexToRgb, nearestColor, isDark } from "./palette";
import type {
  BodyProfile,
  ClosetItem,
  FeedbackEntry,
  InspirationItem,
  OutfitLook,
  OutfitPiece,
  ShoppingItem,
  StyleDna,
  WeatherInfo,
} from "./types";

// ── colour season detection ─────────────────────────────────────

export function detectSeason(body: BodyProfile): SeasonPalette {
  const skin = (body.skinTone ?? "").toLowerCase();
  const hair = (body.hairColor ?? "").toLowerCase();
  const eyes = (body.eyeColor ?? "").toLowerCase();
  const scores: Record<string, number> = { winter: 0, summer: 0, autumn: 0, spring: 0 };

  const warm = skin.includes("chaud") || hair.includes("roux") || hair.includes("blond doré");
  const cool = skin.includes("froid") || hair.includes("noir") || hair.includes("blond cendré") || hair.includes("gris");

  if (warm) { scores.autumn += 2; scores.spring += 2; }
  if (cool) { scores.winter += 2; scores.summer += 2; }

  if (hair.includes("noir") || hair.includes("brun")) { scores.winter += 2; scores.autumn += 1; }
  if (hair.includes("blond") || hair.includes("châtain clair")) { scores.spring += 2; scores.summer += 1; }
  if (hair.includes("roux")) { scores.autumn += 2; scores.spring += 1; }
  if (hair.includes("gris") || hair.includes("blanc")) { scores.winter += 1; scores.summer += 1; }

  if (eyes.includes("noir") || eyes.includes("marron")) { scores.winter += 1; scores.autumn += 1; }
  if (eyes.includes("bleu") || eyes.includes("vert")) { scores.summer += 1; scores.spring += 1; }

  const skinLight = /clair|porcelaine|ivoire/.test(skin);
  const skinDark = /foncé|mat|olive/.test(skin);
  const darkHair = /noir|brun/.test(hair);
  if (skinLight && darkHair) scores.winter += 2; // high contrast
  if (skinLight && !darkHair) { scores.summer += 1; scores.spring += 1; }
  if (skinDark && darkHair) scores.autumn += 1;

  let best = "winter";
  for (const s of ["summer", "autumn", "spring", "winter"]) {
    if (scores[s] > scores[best]) best = s;
  }
  return colorSeasons.find((s) => s.id === best) ?? colorSeasons[0];
}

// ── Style DNA (archetype mix) ───────────────────────────────────

function norm(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchArchetype(a: Archetype, tokens: string[], brands: string[]): number {
  let score = 0;
  const kw = a.keywords.map(norm);
  for (const t of tokens) {
    if (!t || t.length < 3) continue;
    for (const k of kw) {
      if (k.includes(t) || t.includes(k)) score += 2;
    }
  }
  for (const b of brands) {
    const bn = norm(b);
    if (!bn) continue;
    for (const ab of a.brands) {
      if (norm(ab).includes(bn) || bn.includes(norm(ab))) score += 3;
    }
  }
  return score;
}

export interface StyleDnaInput {
  lifestyle: string[];
  goals: string[];
  brands: string[];
  favoriteColors: string[];
  styleWords: string;
  inspirationTags: string[];
  budget: number;
  budgetTier: StyleDna["budgetTier"];
}

export function computeArchetypes(input: StyleDnaInput): Record<string, number> {
  const tokens = [
    ...input.lifestyle,
    ...input.goals,
    ...input.styleWords.split(/[\s,;]+/),
  ].map(norm);
  const brands = input.brands;
  const inspoTokens = input.inspirationTags.map(norm);
  const scores = archetypes.map((a) => ({
    id: a.id,
    score: matchArchetype(a, [...tokens, ...inspoTokens], brands),
  }));
  const total = scores.reduce((s, x) => s + x.score, 0);

  if (total === 0) {
    // Sensible default identity when the user gave no strong signal.
    return { minimal_luxury: 45, classic: 30, parisian: 25 };
  }
  const out: Record<string, number> = {};
  let acc = 0;
  const sorted = scores.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
  const topTotal = sorted.reduce((s, x) => s + x.score, 0);
  sorted.forEach((s, i) => {
    if (i === sorted.length - 1) {
      out[s.id] = 100 - acc;
    } else {
      out[s.id] = Math.round((s.score / topTotal) * 100);
      acc += out[s.id];
    }
  });
  // Clamp & renormalize
  const keys = Object.keys(out);
  const sum = keys.reduce((s, k) => s + out[k], 0);
  if (sum !== 100) out[keys[keys.length - 1]] += 100 - sum;
  return out;
}

export function buildStyleDna(body: BodyProfile, input: StyleDnaInput): StyleDna {
  const season = detectSeason(body);
  const archetypes = computeArchetypes(input);
  const topId = Object.entries(archetypes).sort((a, b) => b[1] - a[1])[0][0];
  const top = archetypeMap.get(topId)!;

  const paletteSet: string[] = [];
  const push = (hex: string) => {
    if (paletteSet.length >= 9) return;
    const c = nearestColor(hex);
    if (!paletteSet.includes(c.hex)) paletteSet.push(c.hex);
  };
  // Season colors first (harmonious with the skin), then archetype,
  // then the user's explicit favourites — colour is alive in Oryvia.
  for (const c of season.colors) push(c);
  for (const c of top.colors) push(c);
  for (const c of input.favoriteColors) push(c);
  if (paletteSet.length < 4) {
    for (const c of ["#111111", "#f5f5f0", "#1f2a44", "#d9c6a5"]) push(c);
  }

  return {
    archetypes,
    palette: paletteSet,
    brands: input.brands,
    budget: input.budget,
    budgetTier: input.budgetTier,
    vibe: `${top.label} teinté ${season.label.toLowerCase()} — une signature ${top.description.toLowerCase()}.`,
    colorSeason: season.id,
  };
}

// ── scoring helpers ─────────────────────────────────────────────

const SEASON_BY_TEMP = (t: number): string =>
  t <= 8 ? "winter" : t <= 16 ? "autumn" : t <= 22 ? "spring" : "summer";

function archetypeOfPiece(subcategory: string, tags: string[], brand: string | null): string[] {
  const tokens = [...tags.map(norm), norm(subcategory), brand ? norm(brand) : ""];
  const scored = archetypes.map((a) => ({ id: a.id, s: matchArchetype(a, tokens, brand ? [brand] : []) }));
  const max = Math.max(...scored.map((x) => x.s), 0);
  return scored.filter((x) => x.s >= Math.max(1, max - 1)).map((x) => x.id);
}

function scorePiece(
  p: { archetypes: string[]; color: string; seasons?: string[]; luxe?: number; subcategory?: string },
  ctx: { archetypes: string[]; palette: string[]; season: string; luxe: number }
): number {
  let s = 0;
  if (p.archetypes.some((a) => ctx.archetypes.includes(a))) s += 3;
  const named = nearestColor(p.color);
  if (ctx.palette.includes(named.hex)) s += 3;
  else if (ctx.palette.some((c) => nearestColor(c).family === named.family)) s += 1;
  if (p.seasons && p.seasons.includes(ctx.season)) s += 1;
  if (p.luxe !== undefined && Math.abs(p.luxe - ctx.luxe) <= 1) s += 1;
  return s;
}

function colorDistance(a: string, b: string): number {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return Math.sqrt((ca.r - cb.r) ** 2 + (ca.g - cb.g) ** 2 + (ca.b - cb.b) ** 2);
}

function shapeNote(shape: ShapeGuidance | null, category: string): string | null {
  if (!shape) return null;
  return shape.do[Math.abs(category.length + shape.label.length) % shape.do.length] ?? null;
}

// ── outfit generation ───────────────────────────────────────────

export interface OutfitInput {
  body: BodyProfile | null;
  dna: StyleDna | null;
  closet: (ClosetItem & { image?: string | null })[];
  occasion: string;
  weather: WeatherInfo | null;
  city: string | null;
  /** Free-text style request (e.g. "streetwear oversize") that biases archetypes. */
  styleHint?: string;
}

export function generateOutfit(input: OutfitInput): { look: OutfitLook; alternatives: OutfitLook[] } {
  const occKey = Object.keys(occasions).includes(input.occasion) ? input.occasion : "everyday";
  const occ = occasions[occKey];
  const gender = input.body?.gender ?? null;
  // Gender-aware needs: no dresses for men — swap in tailored separates.
  let needs = [...occ.needs];
  if (gender === "man") {
    needs = needs.filter((c) => c !== "dresses");
    if (!needs.includes("tops")) needs.unshift("tops");
    if (!needs.includes("bottoms")) needs.splice(1, 0, "bottoms");
    if (!needs.includes("outerwear") && (occKey === "wedding" || occKey === "business" || occKey === "interview")) {
      needs.splice(2, 0, "outerwear");
    }
  }
  const shape = input.body?.bodyShape
    ? bodyShapes.find((b) => b.id === input.body!.bodyShape) ?? null
    : null;
  const season = input.weather ? SEASON_BY_TEMP(input.weather.tempC) : "all";
  const archetypeIds = input.styleHint
    ? archetypesFromText(
        input.styleHint,
        input.dna
          ? Object.entries(input.dna.archetypes)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([id]) => id)
          : ["minimal_luxury", "classic", "parisian"]
      )
    : input.dna
    ? Object.entries(input.dna.archetypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id]) => id)
    : ["minimal_luxury", "classic", "parisian"];
  const palette = input.dna?.palette ?? ["#111111", "#f5f5f0", "#1f2a44", "#d9c6a5"];
  const luxe = input.dna ? (["essential", "contemporary", "premium", "luxury"].indexOf(input.dna.budgetTier)) : 1;

  const ctx = { archetypes: archetypeIds, palette, season, luxe };
  const usedCloset = new Set<string>();

  const pick = (category: string): OutfitPiece => {
    // Prefer the user's own wardrobe.
    const candidates = input.closet.filter((c) => c.category === category && !usedCloset.has(c.id));
    let bestCloset: (typeof candidates)[number] | null = null;
    let bestScore = -Infinity;
    for (const c of candidates) {
      const archs = archetypeOfPiece(c.subcategory, c.tags, c.brand);
      const s = scorePiece(
        { archetypes: archs, color: c.color },
        ctx
      );
      if (s > bestScore) { bestScore = s; bestCloset = c; }
    }
    if (bestCloset) {
      usedCloset.add(bestCloset.id);
      return {
        kind: "closet",
        closetId: bestCloset.id,
        category: bestCloset.category,
        subcategory: bestCloset.subcategory,
        name: bestCloset.name,
        brand: bestCloset.brand,
        color: bestCloset.color,
        reason: shapeNote(shape, category),
        archetypes: archetypeOfPiece(bestCloset.subcategory, bestCloset.tags, bestCloset.brand),
      };
    }
    // Fall back to the fashion catalog (future: real retail search).
    const catalogCandidates = catalog.filter((p) => p.category === category);
    let bestCat: PieceDef | null = null;
    bestScore = -Infinity;
    for (const p of catalogCandidates) {
      const s = scorePiece(
        { archetypes: p.archetype, color: p.color, seasons: p.seasons, luxe: p.luxe },
        ctx
      );
      if (s > bestScore) { bestScore = s; bestCat = p; }
    }
    const p = bestCat ?? catalogCandidates[0];
    return {
      kind: "shop",
      category: p.category,
      subcategory: p.subcategory,
      name: p.label,
      brand: p.archetype[0] ? archetypeMap.get(p.archetype[0])?.brands[0] ?? null : null,
      color: p.color,
      price: p.price,
      reason: shapeNote(shape, category),
      archetypes: p.archetype,
    };
  };

  const items = needs.map(pick);
  const usedPalette = items
    .filter((i) => i.color)
    .map((i) => nearestColor(i.color!).hex)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 5);

  const weatherLine = input.weather
    ? `${input.weather.description.toLowerCase()} et ${input.weather.tempC}°C${input.city ? ` à ${input.city}` : ""} — `
    : "";

  const explanation = buildExplanation(items, shape, weatherLine, occKey, input.dna);

  const look: OutfitLook = {
    name: `${occ.emoji} ${occ.label}${input.city ? ` · ${input.city}` : ""}`,
    description: items.map((i) => i.name).join(" + "),
    explanation,
    items,
    tips: buildTips(shape, items, weatherLine, input.dna),
    palette: usedPalette,
  };

  // Alternatives: swap the accent colour and re-prioritise archetype.
  const alternatives: OutfitLook[] = [1, 2].map((n) => {
    const shifted = [...archetypeIds];
    shifted.push(shifted.shift()!);
    const altPalette = [...palette];
    altPalette.push(altPalette.shift()!);
    const altItems = items.map((it) => {
      if (it.kind !== "shop") return it;
      const nearest = catalog
        .filter((p) => p.category === it.category && p.label !== it.name)
        .sort((a, b) => scorePiece({ archetypes: a.archetype, color: a.color, seasons: a.seasons, luxe: a.luxe }, { ...ctx, archetypes: shifted, palette: altPalette }) - scorePiece({ archetypes: b.archetype, color: b.color, seasons: b.seasons, luxe: b.luxe }, { ...ctx, archetypes: shifted, palette: altPalette }))
        .at(-1);
      if (!nearest) return it;
      return {
        ...it,
        name: nearest.label,
        color: nearest.color,
        price: nearest.price,
        brand: archetypeMap.get(nearest.archetype[0])?.brands[0] ?? null,
      };
    });
    return {
      name: `Variante ${n} — ${archetypeMap.get(shifted[0])?.label ?? "Autre registre"}`,
      description: altItems.map((i) => i.name).join(" + "),
      explanation: `Une variante qui met l'accent sur ${archetypeMap.get(shifted[0])?.label.toLowerCase() ?? "une autre facette"} de ton style.`,
      items: altItems,
      tips: [],
      palette: altItems.filter((i) => i.color).map((i) => nearestColor(i.color!).hex).slice(0, 5),
    };
  });

  return { look, alternatives };
}

function buildExplanation(
  items: OutfitPiece[],
  shape: ShapeGuidance | null,
  weatherLine: string,
  occKey: string,
  dna: StyleDna | null
): string {
  const closetCount = items.filter((i) => i.kind === "closet").length;
  const shopCount = items.filter((i) => i.kind === "shop").length;
  const shapeLine = shape
    ? `Ta morphologie ${shape.label.toLowerCase()} guide les coupes : ${shape.do[0]?.toLowerCase() ?? "des coupes structurées"}. `
    : "";
  const occLine = occasions[occKey]?.label ?? "cette occasion";
  const dnaLine = dna ? `Je pars de ta signature « ${dna.vibe.split("—")[0].trim()} ». ` : "";
  return (
    `${dnaLine}${shapeLine}${weatherLine}Pour ${occLine.toLowerCase()}, j'ai composé cette tenue autour de ${items.length} pièces : ` +
    `${closetCount} viennent de ton dressing et ${shopCount === 0 ? "aucune n'est à acheter" : `${shopCount} à envisager`}. ` +
    `Les couleurs sont accordées entre elles et à ta palette pour rester dans ton identité.`
  );
}

function buildTips(
  shape: ShapeGuidance | null,
  items: OutfitPiece[],
  weatherLine: string,
  dna: StyleDna | null
): string[] {
  const tips: string[] = [];
  if (shape) tips.push(...shape.do.slice(0, 2).map((d) => `Coupe : ${d.toLowerCase()}.`));
  if (dna) {
    const top = Object.entries(dna.archetypes).sort((a, b) => b[1] - a[1])[0];
    const arch = archetypeMap.get(top[0]);
    if (arch) tips.push(`Cohérence : ${arch.label.toLowerCase()} à ${top[1]}% — reste fidèle à cette ligne.`);
  }
  if (weatherLine) tips.push(`Météo : ${weatherLine.trim()} ajoute ou retire une couche selon l'évolution.`);
  if (items.length >= 3) tips.push("Équilibre : garde un seul point fort (couleur vive, coupe ample ou accessoire) pour rester élégant.");
  return tips.slice(0, 5);
}

/** Derive target archetypes from free text (goal/style), else fallback. */
export function archetypesFromText(text: string, fallback: string[]): string[] {
  const tokens = text.split(/[\s,;.]+/).map(norm);
  const full = norm(text);
  const scores = archetypes.map((a) => {
    let s = matchArchetype(a, tokens, []);
    const label = norm(a.label);
    const idNorm = norm(a.id.replace(/_/g, " "));
    if (label && full.includes(label)) s += 8;
    if (idNorm && full.includes(idNorm)) s += 8;
    return { id: a.id, s };
  });
  const matched = scores.filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 3).map((x) => x.id);
  return matched.length ? matched : fallback;
}

// ── shopping list generation ────────────────────────────────────

export interface ShoppingInput {
  dna: StyleDna | null;
  body: BodyProfile | null;
  closet: (ClosetItem & { image?: string | null })[];
  budget: number;
  goal: string;
  style: string;
}

export function generateShopping(input: ShoppingInput): { items: ShoppingItem[]; total: number } {
  const dnaArchetypes = input.dna
    ? Object.entries(input.dna.archetypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([id]) => id)
    : ["minimal_luxury", "classic"];
  const archetypeIds = archetypesFromText(`${input.goal} ${input.style}`, dnaArchetypes);
  const palette = input.dna?.palette ?? ["#111111", "#f5f5f0", "#1f2a44"];
  const luxe = input.dna ? ["essential", "contemporary", "premium", "luxury"].indexOf(input.dna.budgetTier) : 1;
  const ctx = { archetypes: archetypeIds, palette, season: "all", luxe };

  // Gap analysis: categories under-represented in the closet.
  const allCats = ["outerwear", "tops", "bottoms", "dresses", "shoes", "accessories"] as const;
  const gaps = allCats.filter((c) => {
    const count = input.closet.filter((i) => i.category === c).length;
    return count === 0;
  });
  // Also detect colour gaps between style palette and closet.
  const closetColors = new Set(input.closet.map((i) => nearestColor(i.color).hex));
  const missingColors = palette.filter((c) => !closetColors.has(nearestColor(c).hex)).slice(0, 2);

  const pool = catalog
    .filter((p) => gaps.includes(p.category as never) || missingColors.some((mc) => colorDistance(mc, p.color) < 140))
    .sort((a, b) => scorePiece({ archetypes: b.archetype, color: b.color, seasons: b.seasons, luxe: b.luxe }, ctx) - scorePiece({ archetypes: a.archetype, color: a.color, seasons: a.seasons, luxe: a.luxe }, ctx));

  const items: ShoppingItem[] = [];
  let total = 0;
  const seen = new Set<string>();
  for (const p of pool) {
    if (seen.has(p.label)) continue;
    if (total + p.price > input.budget * 1.02) continue;
    if (items.length >= 6) break;
    seen.add(p.label);
    total += p.price;
    const gapReason = gaps.includes(p.category as never)
      ? `Comble un manque dans ta garde-robe (catégorie ${categoryLabel(p.category)}).`
      : `Ajoute la couleur ${nearestColor(p.color).name.toLowerCase()} qui manque à ta palette.`;
    items.push({
      name: p.label,
      brand: archetypeMap.get(p.archetype[0])?.brands[0] ?? "Marque à découvrir",
      price: p.price,
      category: p.category,
      color: p.color,
      reason: gapReason,
      url: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(`${p.label} ${archetypeMap.get(p.archetype[0])?.brands[0] ?? ""}`)}`,
    });
  }

  // If the budget is not used enough, add a signature piece.
  if (items.length < 3) {
    for (const p of catalog.filter((c) => c.category === "outerwear" || c.category === "shoes")) {
      if (total + p.price > input.budget * 1.02 || items.length >= 5) continue;
      total += p.price;
      items.push({
        name: p.label,
        brand: archetypeMap.get(p.archetype[0])?.brands[0] ?? "Marque à découvrir",
        price: p.price,
        category: p.category,
        color: p.color,
        reason: `Pièce signature qui ancre ton style ${archetypeMap.get(archetypeIds[0])?.label.toLowerCase() ?? ""}.`,
        url: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(p.label)}`,
      });
    }
  }

  return { items, total: Math.round(total) };
}

function categoryLabel(cat: string): string {
  return (
    { outerwear: "vestes & manteaux", tops: "hauts", bottoms: "bas", dresses: "robes", shoes: "chaussures", accessories: "accessoires" } as Record<string, string>
  )[cat] ?? cat;
}

// ── inspiration insights ────────────────────────────────────────

export interface InspirationInsight {
  palette: string[];
  tags: string[];
  archetypes: string[];
  colorGaps: string[];
  summary: string;
}

export function analyzeInspirations(
  inspirations: (InspirationItem & { image?: string | null })[],
  closet: (ClosetItem & { image?: string | null })[]
): InspirationInsight {
  const paletteCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();
  const archetypeScores: Record<string, number> = {};
  for (const insp of inspirations) {
    for (const c of insp.palette) {
      const hex = nearestColor(c).hex;
      paletteCounts.set(hex, (paletteCounts.get(hex) ?? 0) + 1);
    }
    for (const t of insp.tags) {
      const n = norm(t);
      if (n) tagCounts.set(n, (tagCounts.get(n) ?? 0) + 1);
      const sc = matchArchetype(archetypeMap.get("minimal_luxury")!, [n], []);
      for (const a of archetypes) {
        const s = matchArchetype(a, [n], []);
        if (s > 0) archetypeScores[a.id] = (archetypeScores[a.id] ?? 0) + s;
      }
      void sc;
    }
  }
  const palette = [...paletteCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c]) => c);
  const tags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => t);
  const archetypeIds = Object.entries(archetypeScores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id);

  const closetColors = new Set(closet.map((i) => nearestColor(i.color).hex));
  const colorGaps = palette.filter((c) => !closetColors.has(c)).slice(0, 3);

  const summary = `Tes inspirations révèlent ${archetypeIds.length ? archetypeIds.map((id) => archetypeMap.get(id)?.label.toLowerCase()).join(", ") : "un goût éclectique"} avec une dominante ${palette[0] ? nearestColor(palette[0]).name.toLowerCase() : "neutre"}.`;

  return { palette, tags, archetypes: archetypeIds, colorGaps, summary };
}

// ── feedback learning (the "moat") ───────────────────────────────
//
// Every like/dislike on a generated look re-weights the Style DNA:
// archetypes and colours present in liked outfits are boosted, those
// in disliked outfits are faded. The base DNA (from onboarding) is
// preserved; the effective DNA is computed deterministically from it
// plus the user's feedback history.

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

function lookSignals(look: OutfitLook): { archetypes: string[]; colors: string[] } {
  const archetypes: string[] = [];
  const colors: string[] = [];
  for (const item of look.items ?? []) {
    if (item.archetypes) archetypes.push(...item.archetypes);
    if (item.color) colors.push(nearestColor(item.color).hex);
  }
  return { archetypes: unique(archetypes), colors: unique(colors) };
}

export function effectiveStyleDna(base: StyleDna, feedback: FeedbackEntry[]): StyleDna {
  if (!feedback.length) return base;

  const LIKE_W = 6; // archetype points per like
  const DISLIKE_W = 3; // archetype points per dislike

  // 1. Archetype weights.
  const weights = new Map<string, number>(Object.entries(base.archetypes));
  for (const f of feedback) {
    const { archetypes } = lookSignals(f.look);
    const mult = f.sentiment === "like" ? LIKE_W : -DISLIKE_W;
    for (const a of archetypes) {
      weights.set(a, Math.max(0, (weights.get(a) ?? 0) + mult));
    }
  }

  // 2. Colour scores: base palette keeps its priority order as a score.
  const colorScores = new Map<string, number>();
  base.palette.forEach((c, i) => {
    const hex = nearestColor(c).hex;
    colorScores.set(hex, Math.max(colorScores.get(hex) ?? 0, base.palette.length - i));
  });
  for (const f of feedback) {
    const { colors } = lookSignals(f.look);
    const mult = f.sentiment === "like" ? 3 : -1.5;
    for (const c of colors) {
      colorScores.set(c, (colorScores.get(c) ?? 0) + mult);
    }
  }

  // 3. Normalize archetypes to 100 (drop zeroes, keep at least 3).
  let archetypes: Record<string, number> = {};
  const ordered = [...weights.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  if (ordered.length === 0) {
    archetypes = { ...base.archetypes };
  } else {
    const total = ordered.reduce((s, [, v]) => s + v, 0);
    let acc = 0;
    ordered.forEach(([id, v], i) => {
      if (i === ordered.length - 1) {
        archetypes[id] = Math.max(0, 100 - acc);
      } else {
        const pct = Math.round((v / total) * 100);
        archetypes[id] = pct;
        acc += pct;
      }
    });
    // Prune 0% entries while keeping the dominant identity.
    const nonzero = Object.entries(archetypes).filter(([, v]) => v > 0);
    if (nonzero.length > 0) {
      archetypes = Object.fromEntries(nonzero);
    }
  }

  // 4. Rebuild the palette by score.
  let palette = [...colorScores.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c).slice(0, 9);
  while (palette.length < 4) {
    const fallback = base.palette[palette.length % base.palette.length];
    const hex = nearestColor(fallback).hex;
    if (!palette.includes(hex)) palette.push(hex);
    else break;
  }

  // 5. Recompute the vibe from the new dominant archetype.
  const topId = Object.entries(archetypes).sort((a, b) => b[1] - a[1])[0][0];
  const top = archetypeMap.get(topId);
  const seasonLabel = seasonMap.get(base.colorSeason ?? "")?.label.toLowerCase();
  const vibe = top
    ? `${top.label}${seasonLabel ? ` teinté ${seasonLabel}` : ""} — affiné par tes likes.`
    : base.vibe;

  return { ...base, archetypes, palette, vibe };
}

/** Keep only colours that are light enough to hold dark text. */
export function readablePalette(hexes: string[]): string[] {
  const out: string[] = [];
  for (const h of hexes) {
    if (isDark(h) && out.length > 0) continue;
    out.push(h);
    if (out.length >= 5) break;
  }
  if (out.length === 0) return ["#d9c6a5"];
  return out;
}
