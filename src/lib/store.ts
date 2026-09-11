// ────────────────────────────────────────────────────────────────
// Oryvia — encrypted vault (user photos at rest)
//
// Every uploaded image is encrypted with the user's DEK before it
// ever touches disk. Files live outside any static/public directory,
// and are only ever served through an authenticated, decrypting
// route (see /api/media). This keeps photos unreadable even if the
// server's filesystem is exfiltrated.
// ────────────────────────────────────────────────────────────────

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { decryptBuffer, encryptBuffer, unwrapDek } from "./crypto";

const VAULT_ROOT = path.join(process.cwd(), "data", "vault");

function safePath(rel: string): string {
  const abs = path.resolve(VAULT_ROOT, rel);
  if (!abs.startsWith(VAULT_ROOT + path.sep) && abs !== VAULT_ROOT) {
    throw new Error("Invalid vault path");
  }
  return abs;
}

/** Encrypt `buf` with the user DEK and store it. Returns the vault-relative path. */
export function writeEncrypted(wrappedDek: string, buf: Buffer, ext = "bin"): string {
  const dek = unwrapDek(wrappedDek);
  const rel = `${randomUUID()}.${ext}`;
  const abs = safePath(rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, encryptBuffer(dek, buf));
  return rel;
}

/** Read and decrypt a vault file. */
export function readEncrypted(wrappedDek: string, rel: string): Buffer {
  const dek = unwrapDek(wrappedDek);
  const abs = safePath(rel);
  return decryptBuffer(dek, fs.readFileSync(abs));
}

export function deleteEncrypted(rel: string | null | undefined): void {
  if (!rel) return;
  fs.rmSync(safePath(rel), { force: true });
}
