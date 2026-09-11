// ────────────────────────────────────────────────────────────────
// Oryvia — shared domain types
// ────────────────────────────────────────────────────────────────

export type BodyShape =
  | "hourglass"
  | "rectangle"
  | "inverted_triangle"
  | "triangle"
  | "oval"
  | "athletic";

export type Gender = "woman" | "man" | "non_binary" | "prefer_not_say";

export type ClosetCategory =
  | "tops"
  | "bottoms"
  | "outerwear"
  | "dresses"
  | "shoes"
  | "accessories";

export type BudgetTier = "essential" | "contemporary" | "premium" | "luxury";

export interface BodyProfile {
  heightCm: number | null;
  weightKg: number | null;
  age: number | null;
  gender: Gender | null;
  bodyShape: BodyShape | null;
  skinTone: string | null;
  hairColor: string | null;
  eyeColor: string | null;
  lifestyle: string[];
  goals: string[];
  sizes: Record<string, string>;
}

export interface StyleDna {
  archetypes: Record<string, number>; // archetype key -> percentage (sums to 100)
  palette: string[]; // hex colors
  brands: string[];
  budget: number; // monthly budget in EUR
  budgetTier: BudgetTier;
  vibe: string; // one-line style identity
  colorSeason: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: number;
  bodyProfile: BodyProfile | null;
  styleDna: StyleDna | null;
  onboardingDone: boolean;
  avatar: string | null;
}

export interface ClosetItem {
  id: string;
  userId: string;
  name: string;
  category: ClosetCategory;
  subcategory: string;
  color: string;
  colorName: string;
  brand: string | null;
  tags: string[];
  createdAt: number;
}

export interface OutfitPiece {
  kind: "closet" | "shop";
  closetId?: string | null;
  category: ClosetCategory;
  name: string;
  brand?: string | null;
  color?: string | null;
  price?: number | null;
  reason?: string | null;
  /** Style archetypes this piece represents (used for feedback learning). */
  archetypes?: string[];
}

export interface OutfitLook {
  name: string;
  description: string;
  explanation: string;
  items: OutfitPiece[];
  tips: string[];
  palette: string[];
}

export interface Outfit {
  id: string;
  userId: string;
  occasion: string;
  city: string | null;
  look: OutfitLook;
  alternatives: OutfitLook[];
  feedback: "like" | "dislike" | null;
  createdAt: number;
}

/** A single feedback event, used to re-train the Style DNA. */
export interface FeedbackEntry {
  look: OutfitLook;
  sentiment: "like" | "dislike";
}

export interface InspirationItem {
  id: string;
  userId: string;
  source: string;
  note: string | null;
  palette: string[];
  tags: string[];
  createdAt: number;
}

export interface ShoppingItem {
  name: string;
  brand: string;
  price: number;
  category: ClosetCategory;
  color: string;
  reason: string;
  url: string | null;
}

export interface ShoppingList {
  id: string;
  userId: string;
  goal: string;
  budget: number;
  style: string;
  items: ShoppingItem[];
  total: number;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: unknown;
  createdAt: number;
}

export interface WeatherInfo {
  city: string;
  tempC: number;
  condition: string;
  icon: string;
  description: string;
}
