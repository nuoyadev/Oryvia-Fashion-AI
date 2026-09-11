// Generates Oryvia brand icons (PNG) deterministically — no binary
// assets committed by hand. Run: node scripts/gen-icons.mjs
import { deflateSync } from "node:zlib";
import fs from "node:fs";
import path from "node:path";

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function gradient(t) {
  // violet -> rose -> coral
  const stops = [
    [124, 92, 255],
    [232, 96, 158],
    [255, 158, 107],
  ];
  const seg = t * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(seg));
  const f = seg - i;
  return [
    Math.round(lerp(stops[i][0], stops[i + 1][0], f)),
    Math.round(lerp(stops[i][1], stops[i + 1][1], f)),
    Math.round(lerp(stops[i][2], stops[i + 1][2], f)),
  ];
}

function drawIcon(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const outer = size * 0.42;
  const inner = size * 0.28;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const ang = Math.atan2(dy, dx); // -PI..PI
      const t = (ang / (2 * Math.PI)) + 0.5;

      let r = 14, g = 13, b = 18, a = 0; // transparent
      if (d <= outer && d >= inner) {
        const [rr, gg, bb] = gradient(t);
        r = rr; g = gg; b = bb; a = 255;
      }
      // sparkle dot (upper right)
      const sd = Math.hypot(x - (cx + outer * 0.78), y - (cy - outer * 0.78));
      if (sd <= size * 0.045) {
        r = 255; g = 255; b = 255; a = 255;
      }
      // small center dot
      if (d <= size * 0.055) {
        const [rr, gg, bb] = gradient(0.5);
        r = rr; g = gg; b = bb; a = 255;
      }
      rgba[i] = r; rgba[i + 1] = g; rgba[i + 2] = b; rgba[i + 3] = a;
    }
  }
  return encodePng(size, size, rgba);
}

const outDir = path.join(process.cwd(), "public", "icons");
fs.mkdirSync(outDir, { recursive: true });
for (const size of [512, 192, 96]) {
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), drawIcon(size));
}
fs.writeFileSync(path.join(process.cwd(), "public", "icon-192.png"), drawIcon(192));
console.log("Icons generated in public/icons");
