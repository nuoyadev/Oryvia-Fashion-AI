// ────────────────────────────────────────────────────────────────
// Oryvia — repositories (domain queries over the DAO)
// ────────────────────────────────────────────────────────────────

import { randomUUID } from "node:crypto";
import { all, get, parseJson, run, toJson } from "./db";
import { generateDek, wrapDek } from "./crypto";
import type {
  BodyProfile,
  ChatMessage,
  ClosetItem,
  InspirationItem,
  Outfit,
  OutfitLook,
  ShoppingList,
  StyleDna,
  User,
} from "./types";

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  avatar: string | null;
  data_key_wrapped: string;
  body_profile: string | null;
  style_dna: string | null;
  onboarding_done: number;
  created_at: number;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar: row.avatar,
    createdAt: row.created_at,
    bodyProfile: parseJson<BodyProfile | null>(row.body_profile, null),
    styleDna: parseJson<StyleDna | null>(row.style_dna, null),
    onboardingDone: row.onboarding_done === 1,
  };
}

// ── users ───────────────────────────────────────────────────────

export function createUser(input: {
  email: string;
  passwordHash: string;
  name?: string | null;
}): { user: User; wrappedDek: string } {
  const id = randomUUID();
  const wrappedDek = wrapDek(generateDek());
  const now = Date.now();
  run(
    `INSERT INTO users (id, email, password_hash, name, data_key_wrapped, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    id,
    input.email.toLowerCase(),
    input.passwordHash,
    input.name ?? null,
    wrappedDek,
    now
  );
  const row = get<UserRow>(`SELECT * FROM users WHERE id = ?`, id)!;
  return { user: toUser(row), wrappedDek };
}

export function findUserByEmail(email: string): (UserRow & { user: User }) | null {
  const row = get<UserRow>(`SELECT * FROM users WHERE email = ?`, email.toLowerCase());
  if (!row) return null;
  return { ...row, user: toUser(row) };
}

export function findUserById(id: string): (UserRow & { user: User }) | null {
  const row = get<UserRow>(`SELECT * FROM users WHERE id = ?`, id);
  if (!row) return null;
  return { ...row, user: toUser(row) };
}

export function getWrappedDek(userId: string): string | null {
  return get<{ data_key_wrapped: string }>(
    `SELECT data_key_wrapped FROM users WHERE id = ?`,
    userId
  )?.data_key_wrapped ?? null;
}

export function updateUserProfile(
  userId: string,
  input: { bodyProfile: BodyProfile; styleDna: StyleDna }
): User {
  run(
    `UPDATE users SET body_profile = ?, style_dna = ?, onboarding_done = 1 WHERE id = ?`,
    toJson(input.bodyProfile),
    toJson(input.styleDna),
    userId
  );
  return findUserById(userId)!.user;
}

export function updateUserName(userId: string, name: string): void {
  run(`UPDATE users SET name = ? WHERE id = ?`, name, userId);
}

export function setUserAvatar(userId: string, rel: string): void {
  run(`UPDATE users SET avatar = ? WHERE id = ?`, rel, userId);
}

export function deleteUser(userId: string): void {
  run(`DELETE FROM users WHERE id = ?`, userId);
}

// ── closet ──────────────────────────────────────────────────────

interface ClosetRow {
  id: string;
  user_id: string;
  name: string;
  category: string;
  subcategory: string;
  color: string | null;
  color_name: string | null;
  brand: string | null;
  tags: string;
  image: string | null;
  created_at: number;
}

function toClosetItem(row: ClosetRow): ClosetItem & { image: string | null } {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    category: row.category as ClosetItem["category"],
    subcategory: row.subcategory,
    color: row.color ?? "#888888",
    colorName: row.color_name ?? "—",
    brand: row.brand,
    tags: parseJson<string[]>(row.tags, []),
    image: row.image,
    createdAt: row.created_at,
  };
}

export function listCloset(userId: string): (ClosetItem & { image: string | null })[] {
  const rows = all<ClosetRow>(
    `SELECT * FROM closet_items WHERE user_id = ? ORDER BY created_at DESC`,
    userId
  );
  return rows.map(toClosetItem);
}

export function getClosetItem(userId: string, id: string): (ClosetItem & { image: string | null }) | null {
  const row = get<ClosetRow>(`SELECT * FROM closet_items WHERE id = ? AND user_id = ?`, id, userId);
  return row ? toClosetItem(row) : null;
}

export function addClosetItem(
  userId: string,
  input: {
    name: string;
    category: ClosetItem["category"];
    subcategory: string;
    color: string;
    colorName: string;
    brand?: string | null;
    tags: string[];
    image: string | null;
  }
): ClosetItem & { image: string | null } {
  const id = randomUUID();
  run(
    `INSERT INTO closet_items (id, user_id, name, category, subcategory, color, color_name, brand, tags, image, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    userId,
    input.name,
    input.category,
    input.subcategory,
    input.color,
    input.colorName,
    input.brand ?? null,
    toJson(input.tags),
    input.image,
    Date.now()
  );
  return getClosetItem(userId, id)!;
}

export function updateClosetItem(
  userId: string,
  id: string,
  input: { name?: string; category?: string; subcategory?: string; color?: string; colorName?: string; brand?: string | null; tags?: string[] }
): void {
  const existing = getClosetItem(userId, id);
  if (!existing) return;
  run(
    `UPDATE closet_items SET name = ?, category = ?, subcategory = ?, color = ?, color_name = ?, brand = ?, tags = ? WHERE id = ? AND user_id = ?`,
    input.name ?? existing.name,
    input.category ?? existing.category,
    input.subcategory ?? existing.subcategory,
    input.color ?? existing.color,
    input.colorName ?? existing.colorName,
    input.brand !== undefined ? input.brand : existing.brand,
    toJson(input.tags ?? existing.tags),
    id,
    userId
  );
}

export function deleteClosetItem(userId: string, id: string): { image: string | null } | null {
  const existing = getClosetItem(userId, id);
  if (!existing) return null;
  run(`DELETE FROM closet_items WHERE id = ? AND user_id = ?`, id, userId);
  return { image: existing.image };
}

// ── outfits ─────────────────────────────────────────────────────

interface OutfitRow {
  id: string;
  user_id: string;
  occasion: string;
  city: string | null;
  look: string;
  alternatives: string;
  feedback: string | null;
  created_at: number;
}

function toOutfit(row: OutfitRow): Outfit {
  return {
    id: row.id,
    userId: row.user_id,
    occasion: row.occasion,
    city: row.city,
    look: parseJson<OutfitLook>(row.look, null as unknown as OutfitLook),
    alternatives: parseJson<OutfitLook[]>(row.alternatives, []),
    feedback: (row.feedback === "like" || row.feedback === "dislike" ? row.feedback : null) as Outfit["feedback"],
    createdAt: row.created_at,
  };
}

export function addOutfit(
  userId: string,
  input: { occasion: string; city: string | null; look: OutfitLook; alternatives: OutfitLook[] }
): Outfit {
  const id = randomUUID();
  run(
    `INSERT INTO outfits (id, user_id, occasion, city, look, alternatives, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    id,
    userId,
    input.occasion,
    input.city,
    toJson(input.look),
    toJson(input.alternatives),
    Date.now()
  );
  return getOutfit(userId, id)!;
}

export function getOutfit(userId: string, id: string): Outfit | null {
  const row = get<OutfitRow>(`SELECT * FROM outfits WHERE id = ? AND user_id = ?`, id, userId);
  return row ? toOutfit(row) : null;
}

export function listOutfits(userId: string): Outfit[] {
  return all<OutfitRow>(`SELECT * FROM outfits WHERE user_id = ? ORDER BY created_at DESC`, userId).map(toOutfit);
}

export function setOutfitFeedback(userId: string, id: string, feedback: "like" | "dislike" | null): Outfit | null {
  const existing = getOutfit(userId, id);
  if (!existing) return null;
  run(`UPDATE outfits SET feedback = ? WHERE id = ? AND user_id = ?`, feedback, id, userId);
  return getOutfit(userId, id);
}

/** All feedback events, ordered most recent first. */
export function listOutfitFeedback(userId: string): { look: OutfitLook; sentiment: "like" | "dislike" }[] {
  return all<{ look: string; feedback: string }>(
    `SELECT look, feedback FROM outfits WHERE user_id = ? AND feedback IS NOT NULL ORDER BY created_at DESC`,
    userId
  ).map((row) => ({
    look: parseJson<OutfitLook>(row.look, null as unknown as OutfitLook),
    sentiment: row.feedback as "like" | "dislike",
  }));
}

export function clearOutfitFeedback(userId: string): void {
  run(`UPDATE outfits SET feedback = NULL WHERE user_id = ?`, userId);
}

export function deleteOutfit(userId: string, id: string): void {
  run(`DELETE FROM outfits WHERE id = ? AND user_id = ?`, id, userId);
}

// ── inspiration ─────────────────────────────────────────────────

interface InspirationRow {
  id: string;
  user_id: string;
  source: string;
  note: string | null;
  palette: string;
  tags: string;
  image: string | null;
  created_at: number;
}

function toInspiration(row: InspirationRow): InspirationItem & { image: string | null } {
  return {
    id: row.id,
    userId: row.user_id,
    source: row.source,
    note: row.note,
    palette: parseJson<string[]>(row.palette, []),
    tags: parseJson<string[]>(row.tags, []),
    image: row.image,
    createdAt: row.created_at,
  };
}

export function listInspiration(userId: string): (InspirationItem & { image: string | null })[] {
  return all<InspirationRow>(
    `SELECT * FROM inspiration_items WHERE user_id = ? ORDER BY created_at DESC`,
    userId
  ).map(toInspiration);
}

export function addInspiration(
  userId: string,
  input: { source: string; note: string | null; palette: string[]; tags: string[]; image: string | null }
): InspirationItem & { image: string | null } {
  const id = randomUUID();
  run(
    `INSERT INTO inspiration_items (id, user_id, source, note, palette, tags, image, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    userId,
    input.source,
    input.note ?? null,
    toJson(input.palette),
    toJson(input.tags),
    input.image,
    Date.now()
  );
  return listInspiration(userId).find((i) => i.id === id)!;
}

export function deleteInspiration(userId: string, id: string): { image: string | null } | null {
  const row = get<{ image: string | null }>(
    `SELECT image FROM inspiration_items WHERE id = ? AND user_id = ?`,
    id,
    userId
  );
  if (!row) return null;
  run(`DELETE FROM inspiration_items WHERE id = ? AND user_id = ?`, id, userId);
  return { image: row.image };
}

// ── shopping ────────────────────────────────────────────────────

interface ShoppingRow {
  id: string;
  user_id: string;
  goal: string;
  budget: number;
  style: string;
  items: string;
  total: number;
  created_at: number;
}

export function addShoppingList(
  userId: string,
  input: { goal: string; budget: number; style: string; items: ShoppingList["items"]; total: number }
): ShoppingList {
  const id = randomUUID();
  run(
    `INSERT INTO shopping_lists (id, user_id, goal, budget, style, items, total, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    userId,
    input.goal,
    input.budget,
    input.style,
    toJson(input.items),
    input.total,
    Date.now()
  );
  return getShoppingList(userId, id)!;
}

export function getShoppingList(userId: string, id: string): ShoppingList | null {
  const row = get<ShoppingRow>(`SELECT * FROM shopping_lists WHERE id = ? AND user_id = ?`, id, userId);
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    goal: row.goal,
    budget: row.budget,
    style: row.style,
    items: parseJson<ShoppingList["items"]>(row.items, []),
    total: row.total,
    createdAt: row.created_at,
  };
}

export function listShoppingLists(userId: string): ShoppingList[] {
  return all<ShoppingRow>(`SELECT * FROM shopping_lists WHERE user_id = ? ORDER BY created_at DESC`, userId).map((row) => ({
    id: row.id,
    userId: row.user_id,
    goal: row.goal,
    budget: row.budget,
    style: row.style,
    items: parseJson<ShoppingList["items"]>(row.items, []),
    total: row.total,
    createdAt: row.created_at,
  }));
}

// ── chat ────────────────────────────────────────────────────────

export function addChatMessage(userId: string, role: "user" | "assistant", content: unknown): ChatMessage {
  const id = randomUUID();
  const createdAt = Date.now();
  run(
    `INSERT INTO chat_messages (id, user_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)`,
    id,
    userId,
    role,
    toJson(content),
    createdAt
  );
  return { id, userId, role, content, createdAt };
}

export function listChatMessages(userId: string, limit = 40): ChatMessage[] {
  return all<{ id: string; user_id: string; role: string; content: string; created_at: number }>(
    `SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    userId,
    limit
  )
    .reverse()
    .map((row) => ({
      id: row.id,
      userId: row.user_id,
      role: row.role as "user" | "assistant",
      content: parseJson<unknown>(row.content, null),
      createdAt: row.created_at,
    }));
}

export function clearChat(userId: string): void {
  run(`DELETE FROM chat_messages WHERE user_id = ?`, userId);
}
