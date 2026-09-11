// ────────────────────────────────────────────────────────────────
// Oryvia — colour harmony / complexion analysis
//
// Pure colour math (no Node APIs) so it runs identically in the
// server (saved try-ons) and in the browser (live camera analysis).
// Answers: "does this palette suit my skin tone?"
// ────────────────────────────────────────────────────────────────

import { hexToRgb, luminance, nearestColor, rgbToHex, warmth } from "./palette";

export interface RgbPixel {
  r: number;
  g: number;
  b: number;
}

export interface Complexion {
  undertone: "warm" | "cool" | "neutral";
  lightness: "light" | "medium" | "deep";
  hex: string;
  /** 0..1 — how sure we are the sample really is skin. */
  confidence: number;
}

export interface HarmonyColor {
  hex: string;
  name: string;
  ok: boolean;
  note: string;
}

export interface HarmonyResult {
  score: number; // 0..100
  verdict: string;
  undertoneLabel: string;
  perColor: HarmonyColor[];
  notes: string[];
}

/** Classic skin-tone pixel heuristic (RGB). */
export function isSkinPixel(r: number, g: number, b: number): boolean {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  return (
    r > 95 &&
    g > 40 &&
    b > 20 &&
    r > g &&
    r > b &&
    r - g > 15 &&
    r - b > 15 &&
    mx - mn > 15
  );
}

export function sampleComplexion(pixels: RgbPixel[]): Complexion | null {
  if (!pixels.length) return null;
  const skin = pixels.filter((p) => isSkinPixel(p.r, p.g, p.b));
  // Fall back to the whole frame when skin detection finds nothing
  // (lighting, camera angle…).
  const pool = skin.length >= 15 ? skin : pixels;
  const n = pool.length;
  let r = 0;
  let g = 0;
  let b = 0;
  for (const p of pool) {
    r += p.r;
    g += p.g;
    b += p.b;
  }
  r = Math.round(r / n);
  g = Math.round(g / n);
  b = Math.round(b / n);
  const hex = rgbToHex(r, g, b);
  const w = warmth(hex);
  const lum = luminance(hex);
  const undertone: Complexion["undertone"] = w > 0.12 ? "warm" : w < 0.04 ? "cool" : "neutral";
  const lightness: Complexion["lightness"] = lum > 0.62 ? "light" : lum < 0.38 ? "deep" : "medium";
  const confidence = skin.length >= 15 ? Math.min(1, (skin.length / pixels.length) * 4) : 0.25;
  return { undertone, lightness, hex, confidence };
}

const UNDERTONE_LABEL: Record<Complexion["undertone"], string> = {
  warm: "carnation chaude",
  cool: "carnation froide",
  neutral: "carnation neutre",
};

export function harmonyAgainst(palette: string[], complexion: Complexion | null): HarmonyResult {
  const fallback: HarmonyResult = {
    score: 50,
    verdict: "Place-toi dans la lumière pour analyser ton teint.",
    undertoneLabel: "—",
    perColor: [],
    notes: [],
  };
  if (!complexion || palette.length === 0) return fallback;

  const skinLum = luminance(complexion.hex);
  const skinWarm = warmth(complexion.hex);

  const perColor: HarmonyColor[] = [];
  let totalDelta = 0;

  for (const hex of palette.slice(0, 6)) {
    const c = nearestColor(hex);
    const cLum = luminance(hex);
    const cWarm = warmth(hex);
    const contrast = Math.abs(cLum - skinLum);
    let delta = 0;
    let ok = true;
    const reasons: string[] = [];

    // Contrast (luminance distance) — too close = washed out, too far = harsh.
    if (contrast < 0.12) {
      delta -= 5;
      ok = false;
      reasons.push("se fond dans ton teint");
    } else if (contrast < 0.28) {
      delta += 6;
      reasons.push("harmonise en douceur avec ton teint");
    } else if (contrast < 0.55) {
      delta += 4;
      reasons.push("contraste flatteur");
    } else {
      delta += 1;
      reasons.push("contraste fort, pièce statement");
    }

    // Undertone match.
    const colorWarmish = cWarm > 0.08;
    const colorCoolish = cWarm < -0.02;
    const skinWarmish = skinWarm > 0.08;
    const skinCoolish = skinWarm < -0.02;
    if ((colorWarmish && skinWarmish) || (colorCoolish && skinCoolish)) {
      delta += 4;
      reasons.push("accorde à ta carnation");
    } else if (colorWarmish || colorCoolish) {
      delta -= 3;
      ok = ok && contrast < 0.5;
      reasons.push("à équilibrer avec une base neutre");
    }

    // Neutrals are always safe and lift the whole look.
    if (c.family === "neutral") {
      delta += 3;
      ok = true;
    }

    totalDelta += delta;
    perColor.push({ hex, name: c.name, ok, note: reasons.join(" · ") });
  }

  const avgDelta = totalDelta / perColor.length;
  const score = Math.round(Math.max(0, Math.min(100, 55 + avgDelta * 3.2)));

  const notes: string[] = [];
  if (complexion.undertone === "warm") {
    notes.push("Ta carnation chaude est sublimée par des tons chauds (terracotta, camel, olive, or).");
  } else if (complexion.undertone === "cool") {
    notes.push("Ta carnation froide répond bien aux tons froids (marine, émeraude, lavande, argent).");
  } else {
    notes.push("Carnation neutre : presque toutes les familles te vont, garde juste un bon contraste.");
  }
  if (perColor.some((c) => !c.ok)) {
    notes.push("Les couleurs signalées se fondent ou jurent avec ton teint — remplace-les par une teinte voisine de ta palette.");
  }

  let verdict: string;
  if (score >= 82) verdict = "Ce look illumine ton teint ✨";
  else if (score >= 68) verdict = "Ces couleurs te vont très bien";
  else if (score >= 55) verdict = "Plutôt flatteur, quelques ajustements possibles";
  else if (score >= 42) verdict = "À rééquilibrer : certaines teintes te ternissent";
  else verdict = "Cette palette ne met pas ton teint en valeur";

  return {
    score,
    verdict,
    undertoneLabel: UNDERTONE_LABEL[complexion.undertone],
    perColor,
    notes,
  };
}
