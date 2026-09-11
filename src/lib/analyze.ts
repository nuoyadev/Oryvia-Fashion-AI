// ────────────────────────────────────────────────────────────────
// Oryvia — Vision Analysis Service (image understanding)
//
// Decodes JPEG/PNG locally and extracts fashion-relevant features:
// dominant colour, palette, luminance and warmth. When a cloud
// vision provider key is present, this module upgrades to real
// object/silhouette analysis (see ai.ts providers).
// ────────────────────────────────────────────────────────────────

import { inflateSync } from "node:zlib";
import { decode as decodeJpeg } from "jpeg-js";
import { nearestColor, rgbToHex, NamedColor } from "./palette";

export interface ImageAnalysis {
  width: number;
  height: number;
  dominant: NamedColor;
  palette: NamedColor[];
  brightness: number; // 0..1
  warm: boolean;
  colorfulness: number; // 0..1
}

function decodeJpegBuffer(buf: Buffer): { data: Uint8Array; width: number; height: number } {
  const decoded = decodeJpeg(buf, { useTArray: true });
  return { data: decoded.data, width: decoded.width, height: decoded.height };
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(buf: Buffer): { data: Uint8Array; width: number; height: number } {
  if (buf.toString("ascii", 1, 4) !== "PNG") throw new Error("Not a PNG");
  let pos = 8;
  const idat: Buffer[] = [];
  const plte: number[][] = [];
  let width = 0;
  let height = 0;
  let bitDepth = 8;
  let colorType = 6;

  while (pos + 8 <= buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "PLTE") {
      for (let i = 0; i + 3 <= data.length; i += 3) {
        plte.push([data[i], data[i + 1], data[i + 2]]);
      }
    } else if (type === "IDAT") {
      idat.push(Buffer.from(data));
    } else if (type === "IEND") {
      break;
    }
    pos += 12 + len;
  }

  const channels: Record<number, number> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
  const ch = channels[colorType] ?? 4;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * ch;
  const out = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? out[(y * width + (x / ch - 1 | 0)) * 4 + (x % ch)] : 0;
      const b = y > 0 ? out[((y - 1) * width + (x / ch | 0)) * 4 + (x % ch)] : 0;
      const c = y > 0 && x >= ch ? out[((y - 1) * width + (x / ch - 1 | 0)) * 4 + (x % ch)] : 0;
      let v = row[x];
      if (filter === 1) v = (v + a) & 0xff;
      else if (filter === 2) v = (v + b) & 0xff;
      else if (filter === 3) v = (v + ((a + b) >> 1)) & 0xff;
      else if (filter === 4) v = (v + paeth(a, b, c)) & 0xff;
      const px = (x / ch) | 0;
      const outIdx = (y * width + px) * 4;
      if (colorType === 0) {
        out[outIdx] = out[outIdx + 1] = out[outIdx + 2] = v;
        out[outIdx + 3] = 255;
      } else if (colorType === 3) {
        const rgb = plte[v] ?? [0, 0, 0];
        out[outIdx] = rgb[0];
        out[outIdx + 1] = rgb[1];
        out[outIdx + 2] = rgb[2];
        out[outIdx + 3] = 255;
      } else if (colorType === 4) {
        out[outIdx] = out[outIdx + 1] = out[outIdx + 2] = v;
        out[outIdx + 3] = x % 2 === 1 ? row[x + 1] : 255;
      } else {
        out[outIdx + (x % ch)] = v;
        if (colorType === 2) out[outIdx + 3] = 255;
      }
    }
  }
  return { data: out, width, height };
}

function decodeImage(buf: Buffer): { data: Uint8Array; width: number; height: number } {
  const head = buf.subarray(0, 4).toString("hex");
  if (head === "89504e47") return decodePng(buf);
  if (head.startsWith("ffd8")) {
    return decodeJpegBuffer(buf);
  }
  throw new Error("Format d'image non supporté (JPEG/PNG uniquement)");
}

/** Downsample the RGBA data into a small grid for cheap colour stats. */
function samplePixels(data: Uint8Array, width: number, height: number): { r: number; g: number; b: number }[] {
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 4000)));
  const out: { r: number; g: number; b: number }[] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 100) continue; // skip transparent
      out.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
    }
  }
  return out;
}

export function analyzeImage(buf: Buffer): ImageAnalysis {
  const { data, width, height } = decodeImage(buf);
  const pixels = samplePixels(data, width, height);
  if (pixels.length === 0) throw new Error("Image vide");

  // Bucket pixels into the curated colour vocabulary.
  const counts = new Map<string, { count: number; named: NamedColor }>();
  let sumLum = 0;
  let warmVotes = 0;
  for (const p of pixels) {
    const hex = rgbToHex(p.r, p.g, p.b);
    const named = nearestColor(hex);
    const lum = (0.2126 * p.r + 0.7152 * p.g + 0.0722 * p.b) / 255;
    sumLum += lum;
    if (p.r > p.b) warmVotes++;
    const key = named.hex;
    const entry = counts.get(key) ?? { count: 0, named };
    entry.count++;
    counts.set(key, entry);
  }

  const ranked = [...counts.values()].sort((a, b) => b.count - a.count);
  const dominant = ranked[0].named;
  const palette = ranked.slice(0, 5).map((r) => r.named);

  // Colourfulness: how saturated the average pixel is.
  let sumSat = 0;
  for (const p of pixels) {
    const mx = Math.max(p.r, p.g, p.b);
    const mn = Math.min(p.r, p.g, p.b);
    sumSat += mx === 0 ? 0 : (mx - mn) / mx;
  }

  return {
    width,
    height,
    dominant,
    palette,
    brightness: sumLum / pixels.length,
    warm: warmVotes / pixels.length > 0.5,
    colorfulness: sumSat / pixels.length,
  };
}
