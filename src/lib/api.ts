// ────────────────────────────────────────────────────────────────
// Oryvia — API helpers (auth session, multipart parsing)
// ────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./auth";
import * as repo from "./repo";

export async function getSessionUser(): Promise<{ id: string; wrappedDek: string } | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const userId = await verifySessionToken(token);
  if (!userId) return null;
  const wrappedDek = repo.getWrappedDek(userId);
  if (!wrappedDek) return null;
  return { id: userId, wrappedDek };
}

export function ok(data: unknown, status = 200): NextResponse {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(message: string, status = 400): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export interface ParsedFile {
  field: string;
  filename: string;
  contentType: string;
  data: Buffer;
}

export async function parseMultipart(req: NextRequest): Promise<{ fields: Record<string, string>; files: ParsedFile[] }> {
  const contentType = req.headers.get("content-type") ?? "";
  const boundary = contentType.split("boundary=")[1];
  if (!boundary) return { fields: {}, files: [] };
  const buf = Buffer.from(await req.arrayBuffer());
  const parts = splitBoundary(buf, Buffer.from(`--${boundary}`));
  const fields: Record<string, string> = {};
  const files: ParsedFile[] = [];

  for (const part of parts) {
    if (part.length === 0) continue;
    const sepIndex = part.indexOf("\r\n\r\n");
    if (sepIndex === -1) continue;
    const headerText = part.subarray(0, sepIndex).toString("utf8");
    let body = part.subarray(sepIndex + 4);
    // strip trailing CRLF before boundary
    if (body.subarray(body.length - 2).toString("latin1") === "\r\n") body = body.subarray(0, body.length - 2);

    const nameMatch = headerText.match(/name="([^"]+)"/);
    const fileMatch = headerText.match(/filename="([^"]*)"/);
    const typeMatch = headerText.match(/Content-Type:\s*([^\s;]+)/i);
    if (!nameMatch) continue;
    if (fileMatch && fileMatch[1]) {
      files.push({
        field: nameMatch[1],
        filename: fileMatch[1],
        contentType: typeMatch?.[1] ?? "application/octet-stream",
        data: body,
      });
    } else {
      fields[nameMatch[1]] = body.toString("utf8");
    }
  }
  return { fields, files };
}

function splitBoundary(buf: Buffer, boundary: Buffer): Buffer[] {
  const out: Buffer[] = [];
  let start = 0;
  let idx = buf.indexOf(boundary, start);
  while (idx !== -1) {
    if (idx > start) out.push(buf.subarray(start, idx));
    start = idx + boundary.length;
    // skip the CRLF right after boundary
    if (buf.subarray(start, start + 2).toString("latin1") === "\r\n") start += 2;
    else if (buf[start] === 0x0a) start += 1;
    idx = buf.indexOf(boundary, start);
  }
  return out;
}

export const LIMIT = 12 * 1024 * 1024; // 12 MB upload cap
