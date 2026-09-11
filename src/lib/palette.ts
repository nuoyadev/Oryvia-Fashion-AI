// ────────────────────────────────────────────────────────────────
// Oryvia — colour intelligence
//
// Maps arbitrary hex colours to a curated fashion colour vocabulary,
// detects warm/cool tones and luminance, and picks accessible text
// contrast. This powers the "living with colour" identity of Oryvia.
// ────────────────────────────────────────────────────────────────

export interface NamedColor {
  name: string;
  hex: string;
  family: "neutral" | "warm" | "cool" | "bright";
}

const COLORS: NamedColor[] = [
  { name: "Noir", hex: "#111111", family: "neutral" },
  { name: "Blanc", hex: "#f5f5f0", family: "neutral" },
  { name: "Gris clair", hex: "#d6d6d6", family: "neutral" },
  { name: "Gris", hex: "#8a8a8a", family: "neutral" },
  { name: "Anthracite", hex: "#3a3a3e", family: "neutral" },
  { name: "Taupe", hex: "#8b7d6b", family: "warm" },
  { name: "Beige", hex: "#d9c6a5", family: "warm" },
  { name: "Crème", hex: "#efe3c8", family: "warm" },
  { name: "Camel", hex: "#b98a52", family: "warm" },
  { name: "Marron", hex: "#6b4423", family: "warm" },
  { name: "Chocolat", hex: "#4b2e1d", family: "warm" },
  { name: "Terracotta", hex: "#c96f4a", family: "warm" },
  { name: "Rouge", hex: "#c0392b", family: "warm" },
  { name: "Bordeaux", hex: "#6e1f2e", family: "warm" },
  { name: "Rose", hex: "#ef9bb6", family: "warm" },
  { name: "Fuchsia", hex: "#d63384", family: "bright" },
  { name: "Orange", hex: "#e07a2f", family: "warm" },
  { name: "Jaune", hex: "#e8c547", family: "warm" },
  { name: "Moutarde", hex: "#c7911b", family: "warm" },
  { name: "Olive", hex: "#6b6b2f", family: "warm" },
  { name: "Vert sapin", hex: "#1f4032", family: "cool" },
  { name: "Vert émeraude", hex: "#1e7f5c", family: "cool" },
  { name: "Vert", hex: "#4c9a52", family: "cool" },
  { name: "Menthe", hex: "#9fd9c0", family: "cool" },
  { name: "Bleu marine", hex: "#1f2a44", family: "cool" },
  { name: "Bleu nuit", hex: "#16213e", family: "cool" },
  { name: "Bleu", hex: "#2f6db3", family: "cool" },
  { name: "Bleu ciel", hex: "#8ec5e8", family: "cool" },
  { name: "Cyan", hex: "#2fb3c4", family: "cool" },
  { name: "Turquoise", hex: "#34c3a2", family: "cool" },
  { name: "Lavande", hex: "#b0a4e0", family: "cool" },
  { name: "Violet", hex: "#7a4dcc", family: "cool" },
  { name: "Lilas", hex: "#c8a2e8", family: "cool" },
  { name: "Argent", hex: "#c2c6cf", family: "neutral" },
  { name: "Or", hex: "#c9a227", family: "warm" },
  { name: "Rose poudré", hex: "#e6b8b0", family: "warm" },
  { name: "Brique", hex: "#a4472f", family: "warm" },
  { name: "Denim", hex: "#3d5a80", family: "cool" },
  { name: "Kaki", hex: "#7a7d4a", family: "warm" },
  { name: "Corail", hex: "#ef7d6b", family: "bright" },
  { name: "Émeraude", hex: "#0d6b57", family: "cool" },
];

export const allColors = COLORS;

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) => v.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export function isDark(hex: string): boolean {
  return luminance(hex) < 0.5;
}

/** Warmth proxy: red channel vs blue channel. */
export function warmth(hex: string): number {
  const { r, b } = hexToRgb(hex);
  return (r - b) / 255;
}

export function nearestColor(hex: string): NamedColor {
  const { r, g, b } = hexToRgb(hex);
  let best = COLORS[0];
  let bestDist = Infinity;
  for (const c of COLORS) {
    const p = hexToRgb(c.hex);
    const dist = (r - p.r) ** 2 + (g - p.g) ** 2 + (b - p.b) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }
  return best;
}

export function isNeutral(hex: string): boolean {
  return nearestColor(hex).family === "neutral";
}

export function textOn(hex: string): string {
  return isDark(hex) ? "#ffffff" : "#101014";
}
