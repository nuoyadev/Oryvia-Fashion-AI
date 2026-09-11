// ────────────────────────────────────────────────────────────────
// Oryvia — parametric body metrics for the 3D avatar
//
// Turns the user's BodyProfile (measurements, body shape, skin and
// hair) into a stylized-but-personalized set of proportions in
// meters (feet at y = 0). The same metrics drive the garment shells
// so every closet item fits the avatar.
// ────────────────────────────────────────────────────────────────

import type { BodyShape, BodyProfile, ClosetCategory } from "@/client/types";

export interface BodyMetrics {
  height: number; // meters
  legL: number;
  torsoH: number;
  shoulderY: number; // top of torso
  hipY: number; // crotch
  waistY: number;
  kneeY: number;
  neckTopY: number;
  headCenterY: number;
  shoulderR: number;
  chestR: number;
  waistR: number;
  hipR: number;
  armR: number;
  legR: number;
  neckR: number;
  headR: number;
  armL: number;
  skin: string;
  hair: string;
}

export interface GarmentSpec {
  key: string;
  category: ClosetCategory;
  subcategory: string;
  name: string;
  color: string;
}

export type SleeveKind = "none" | "short" | "long";

const SHAPE_MUL: Record<BodyShape, { chest: number; waist: number; hip: number }> = {
  hourglass: { chest: 1.0, waist: 0.78, hip: 1.0 },
  rectangle: { chest: 1.0, waist: 0.92, hip: 1.0 },
  inverted_triangle: { chest: 1.14, waist: 0.86, hip: 0.9 },
  triangle: { chest: 0.9, waist: 0.86, hip: 1.16 },
  oval: { chest: 1.06, waist: 1.06, hip: 1.02 },
  athletic: { chest: 1.1, waist: 0.8, hip: 0.92 },
};

const SKIN_HEX: Record<string, string> = {
  clair_froid: "#f2cdc4",
  clair_neutre: "#f2d5c0",
  clair_chaud: "#f0cbb0",
  moyen_froid: "#e0b0a0",
  moyen_neutre: "#dfb29a",
  moyen_chaud: "#dda98a",
  mat_froid: "#c08a70",
  mat_neutre: "#bd8a6a",
  mat_chaud: "#b87f5f",
  fonce_froid: "#8a5a44",
  fonce_neutre: "#845238",
  fonce_chaud: "#7c4a32",
  "foncé_froid": "#8a5a44",
  "foncé_neutre": "#845238",
  "foncé_chaud": "#7c4a32",
};

const HAIR_HEX: Record<string, string> = {
  noir: "#14100e",
  brun: "#3a2a22",
  "châtain": "#6b4a2f",
  "chatain": "#6b4a2f",
  blond: "#d8b878",
  roux: "#b04a2a",
  gris: "#9a9a9a",
  blanc: "#e8e8e8",
  "coloré": "#b04a9a",
  "colore": "#b04a9a",
};

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function buildBodyMetrics(body: BodyProfile | null): BodyMetrics {
  const H = body?.heightCm ? body.heightCm / 100 : 1.7;
  const shape = (body?.bodyShape ?? "rectangle") as BodyShape;
  const mul = SHAPE_MUL[shape] ?? SHAPE_MUL.rectangle;

  // Weight → overall girth (BMI based).
  const bmi =
    body?.weightKg && body?.heightCm
      ? body.weightKg / (body.heightCm / 100) ** 2
      : 22;
  const w = clamp(0.78 + (bmi - 21) * 0.025, 0.82, 1.35);

  // Gender tweaks.
  const g =
    body?.gender === "man"
      ? { s: 1.06, h: 0.94, waist: 0.93 }
      : body?.gender === "woman"
      ? { s: 0.95, h: 1.05, waist: 1.0 }
      : { s: 1, h: 1, waist: 1 };

  const legL = 0.47 * H;
  const torsoH = 0.3 * H;
  const shoulderY = legL + torsoH;
  const hipY = legL;
  const waistY = legL + torsoH * 0.42;
  const kneeY = legL * 0.42;
  const neckH = 0.028 * H;
  const neckTopY = shoulderY + neckH;
  const headR = 0.09 * H;
  const headCenterY = neckTopY + headR * 0.95;

  const shoulderR = 0.118 * H * w * g.s;
  const chestR = 0.1 * H * w * mul.chest;
  const waistR = 0.074 * H * w * mul.waist * g.waist;
  const hipR = 0.096 * H * w * mul.hip * g.h;
  const armR = 0.028 * H * w;
  const legR = 0.05 * H * w;
  const neckR = 0.03 * H;
  const armL = 0.43 * H;

  const skin = SKIN_HEX[body?.skinTone ?? ""] ?? "#e2b39b";
  const hair = HAIR_HEX[body?.hairColor ?? ""] ?? "#3a2a22";

  return {
    height: H,
    legL,
    torsoH,
    shoulderY,
    hipY,
    waistY,
    kneeY,
    neckTopY,
    headCenterY,
    shoulderR,
    chestR,
    waistR,
    hipR,
    armR,
    legR,
    neckR,
    headR,
    armL,
    skin,
    hair,
  };
}

export function sleeveKind(category: ClosetCategory, subcategory: string): SleeveKind {
  const s = (subcategory || "").toLowerCase();
  if (category === "outerwear") return "long";
  if (category === "dresses") {
    return /(sans manche|bustier)/.test(s) ? "none" : "short";
  }
  if (/(tank|d[ée]bardeur|sans manche|bustier|crop)/.test(s)) return "none";
  if (/(t-shirt|tee|polo|marini[èe]re)/.test(s)) return "short";
  if (/(chemise|pull|sweat|hoodie|blouse|cardigan|maille|col roul)/.test(s)) return "long";
  return "short";
}

export function isSkirt(subcategory: string): boolean {
  return /jupe/.test((subcategory || "").toLowerCase());
}

export function isShorts(subcategory: string): boolean {
  return /short|bermuda/.test((subcategory || "").toLowerCase());
}

/** Rendering order so outerwear covers tops and accessories sit last. */
const LAYER_RANK: Record<ClosetCategory, number> = {
  tops: 0,
  bottoms: 1,
  dresses: 2,
  outerwear: 3,
  shoes: 4,
  accessories: 5,
};

export function layerRank(category: ClosetCategory): number {
  return LAYER_RANK[category] ?? 0;
}
