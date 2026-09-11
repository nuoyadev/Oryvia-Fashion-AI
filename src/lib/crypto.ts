// ────────────────────────────────────────────────────────────────
// Oryvia — cryptography (envelope encryption, AES-256-GCM)
//
// Every user owns a Data Encryption Key (DEK). The DEK is wrapped
// with a master Key Encryption Key (KEK) and stored on the user row.
// Photos and personal data are encrypted at rest with the user DEK,
// so a database leak alone never exposes images or measurements.
// ────────────────────────────────────────────────────────────────

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

const VERSION = 1;
const GCM_IV = 12;
const GCM_TAG = 16;

function deriveMasterKey(): Buffer {
  const env = process.env.ORVYIA_ENC_KEY;
  if (env && /^[0-9a-fA-F]{64}$/.test(env)) {
    return Buffer.from(env, "hex");
  }
  // Deterministic dev fallback derived from the JWT secret — still
  // encrypts at rest, but production MUST set ORVYIA_ENC_KEY.
  const secret = process.env.ORVYIA_JWT_SECRET || "oryvia-dev-secret-change-me";
  return createHash("sha256").update(`oryvia::kek::v1::${secret}`).digest();
}

let cachedMaster: Buffer | null = null;

export function masterKey(): Buffer {
  if (!cachedMaster) cachedMaster = deriveMasterKey();
  return cachedMaster;
}

export function generateDek(): Buffer {
  return randomBytes(32);
}

/** Wrap a user DEK with the master KEK (returns base64). */
export function wrapDek(dek: Buffer): string {
  const iv = randomBytes(GCM_IV);
  const cipher = createCipheriv("aes-256-gcm", masterKey(), iv);
  const ct = Buffer.concat([cipher.update(dek), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([Buffer.from([VERSION]), iv, tag, ct]).toString("base64");
}

/** Unwrap a user DEK with the master KEK. */
export function unwrapDek(wrapped: string): Buffer {
  const raw = Buffer.from(wrapped, "base64");
  if (raw[0] !== VERSION) throw new Error("Unsupported key version");
  const iv = raw.subarray(1, 1 + GCM_IV);
  const tag = raw.subarray(1 + GCM_IV, 1 + GCM_IV + GCM_TAG);
  const ct = raw.subarray(1 + GCM_IV + GCM_TAG);
  const decipher = createDecipheriv("aes-256-gcm", masterKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}

/** Encrypt a payload with a user DEK. Layout: [v1][iv12][tag16][ct]. */
export function encryptBuffer(dek: Buffer, plain: Buffer): Buffer {
  const iv = randomBytes(GCM_IV);
  const cipher = createCipheriv("aes-256-gcm", dek, iv);
  const ct = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([Buffer.from([VERSION]), iv, tag, ct]);
}

/** Decrypt a payload produced by encryptBuffer. */
export function decryptBuffer(dek: Buffer, data: Buffer): Buffer {
  if (data[0] !== VERSION) throw new Error("Unsupported payload version");
  const iv = data.subarray(1, 1 + GCM_IV);
  const tag = data.subarray(1 + GCM_IV, 1 + GCM_IV + GCM_TAG);
  const ct = data.subarray(1 + GCM_IV + GCM_TAG);
  const decipher = createDecipheriv("aes-256-gcm", dek, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
