// ────────────────────────────────────────────────────────────────
// Oryvia — data access layer (local SQLite via node:sqlite)
//
// The DAO is deliberately thin and isolated behind these helpers so
// the storage engine can be swapped for Supabase/Postgres in
// production (see supabase/schema.sql) without touching features.
// ────────────────────────────────────────────────────────────────

import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "oryvia.db");

type Row = Record<string, string | number | bigint | null | Uint8Array>;

const globalForDb = globalThis as unknown as { __oryviaDb?: DatabaseSync };

function open(): DatabaseSync {
  if (globalForDb.__oryviaDb) return globalForDb.__oryviaDb;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  migrate(db);
  globalForDb.__oryviaDb = db;
  return db;
}

function migrate(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      avatar TEXT,
      data_key_wrapped TEXT NOT NULL,
      body_profile TEXT,
      style_dna TEXT,
      onboarding_done INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS closet_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL DEFAULT '',
      color TEXT,
      color_name TEXT,
      brand TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      image TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_closet_user ON closet_items(user_id);

    CREATE TABLE IF NOT EXISTS outfits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      occasion TEXT NOT NULL,
      city TEXT,
      look TEXT NOT NULL,
      alternatives TEXT NOT NULL DEFAULT '[]',
      feedback TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_outfits_user ON outfits(user_id);

    CREATE TABLE IF NOT EXISTS inspiration_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      source TEXT NOT NULL,
      note TEXT,
      palette TEXT NOT NULL DEFAULT '[]',
      tags TEXT NOT NULL DEFAULT '[]',
      image TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_insp_user ON inspiration_items(user_id);

    CREATE TABLE IF NOT EXISTS shopping_lists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      goal TEXT NOT NULL,
      budget REAL NOT NULL,
      style TEXT NOT NULL,
      items TEXT NOT NULL DEFAULT '[]',
      total REAL NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_shopping_user ON shopping_lists(user_id);

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id);
  `);

  // Lightweight migration for pre-existing databases.
  const outfitCols = db.prepare("PRAGMA table_info(outfits)").all() as { name: string }[];
  if (!outfitCols.some((c) => c.name === "feedback")) {
    db.exec("ALTER TABLE outfits ADD COLUMN feedback TEXT");
  }
}

export function db(): DatabaseSync {
  return open();
}

export function all<T = Row>(sql: string, ...params: (string | number | null)[]): T[] {
  return db().prepare(sql).all(...params) as unknown as T[];
}

export function get<T = Row>(sql: string, ...params: (string | number | null)[]): T | undefined {
  const row = db().prepare(sql).get(...params);
  return (row as unknown as T | undefined) ?? undefined;
}

export function run(sql: string, ...params: (string | number | null)[]): { changes: number; lastInsertRowid: number | bigint } {
  return db().prepare(sql).run(...params) as unknown as { changes: number; lastInsertRowid: number | bigint };
}

export function parseJson<T>(raw: string | number | null | Uint8Array | undefined, fallback: T): T {
  if (typeof raw !== "string") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const toJson = (value: unknown): string => JSON.stringify(value ?? null);
