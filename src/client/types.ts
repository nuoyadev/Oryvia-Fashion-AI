// Client-facing types (mirror the server domain types).

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
  archetypes: Record<string, number>;
  palette: string[];
  brands: string[];
  budget: number;
  budgetTier: BudgetTier;
  vibe: string;
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
  image: string | null;
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

export interface WeatherInfo {
  city: string;
  tempC: number;
  condition: string;
  icon: string;
  description: string;
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

export interface InspirationItem {
  id: string;
  userId: string;
  source: string;
  note: string | null;
  palette: string[];
  tags: string[];
  image: string | null;
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
  content: ChatReply | string;
  createdAt: number;
}

export interface ChatReply {
  text: string;
  kind: "chat" | "outfit" | "shopping" | "insight";
  outfit?: { occasion: string; look: OutfitLook; alternatives: OutfitLook[]; outfitId: string };
  shopping?: { goal: string; budget: number; style: string; items: ShoppingItem[]; total: number };
  weather?: WeatherInfo;
}

export interface StyleDnaInput {
  lifestyle: string[];
  goals: string[];
  brands: string[];
  favoriteColors: string[];
  styleWords: string;
  inspirationTags: string[];
  budget: number;
  budgetTier: BudgetTier;
}

export const BODY_SHAPES: { id: BodyShape; label: string; emoji: string; hint: string }[] = [
  { id: "hourglass", label: "Sablier", emoji: "⏳", hint: "Taille marquée, épaules ≈ hanches" },
  { id: "rectangle", label: "Rectangle", emoji: "▭", hint: "Lignes alignées, peu de courbes" },
  { id: "inverted_triangle", label: "Triangle inversé", emoji: "▽", hint: "Épaules plus larges que les hanches" },
  { id: "triangle", label: "Triangle", emoji: "△", hint: "Hanches plus larges que les épaules" },
  { id: "oval", label: "Ovale", emoji: "⬭", hint: "Silhouette ronde, centre présent" },
  { id: "athletic", label: "Athlétique", emoji: "⚡", hint: "Épaules développées, taille fine" },
];

export const SKIN_TONES = [
  { id: "clair_froid", label: "Clair · sous-ton froid" },
  { id: "clair_neutre", label: "Clair · neutre" },
  { id: "clair_chaud", label: "Clair · sous-ton chaud" },
  { id: "moyen_froid", label: "Moyen · sous-ton froid" },
  { id: "moyen_neutre", label: "Moyen · neutre" },
  { id: "moyen_chaud", label: "Moyen · sous-ton chaud" },
  { id: "mat_froid", label: "Mat · sous-ton froid" },
  { id: "mat_neutre", label: "Mat · neutre" },
  { id: "mat_chaud", label: "Mat · sous-ton chaud" },
  { id: "foncé_froid", label: "Foncé · sous-ton froid" },
  { id: "foncé_neutre", label: "Foncé · neutre" },
  { id: "foncé_chaud", label: "Foncé · sous-ton chaud" },
];

export const HAIR_COLORS = ["noir", "brun", "châtain", "blond", "roux", "gris", "blanc", "coloré"];
export const EYE_COLORS = ["noirs", "marron", "noisette", "verts", "bleus", "gris"];

export const LIFESTYLE_OPTIONS = [
  "bureau", "télétravail", "étudiante", "étudiant", "soirées", "sport",
  "voyages", "plein air", "ville", "minimaliste", "créatif", "famille",
];

export const GOAL_OPTIONS = [
  "chic", "élégant", "décontracté", "professionnel", "audacieux",
  "confortable", "romantique", "streetwear", "minimal", "luxueux", "coloré",
];

export const BRAND_OPTIONS = [
  "COS", "A.P.C.", "Arket", "Uniqlo", "Nike", "Adidas", "Zara", "H&M",
  "Sézane", "Maje", "Sandro", "Ralph Lauren", "Lacoste", "Carhartt WIP",
  "New Balance", "The Row", "Lemaire", "Jil Sander", "Massimo Dutti",
  "Stüssy", "Fear of God", "Isabel Marant", "Acne Studios", "Ganni",
  "Rouje", "Zimmermann", "Rick Owens", "Lululemon", "On Running", "Drake's",
];

export const BUDGET_TIERS: { id: BudgetTier; label: string; range: string }[] = [
  { id: "essential", label: "Essentiel", range: "< 150 €/mois" },
  { id: "contemporary", label: "Contemporain", range: "150–400 €/mois" },
  { id: "premium", label: "Premium", range: "400–1000 €/mois" },
  { id: "luxury", label: "Luxe", range: "> 1000 €/mois" },
];

export const CATEGORY_LABELS: Record<ClosetCategory, string> = {
  tops: "Hauts",
  bottoms: "Bas",
  outerwear: "Vestes & manteaux",
  dresses: "Robes",
  shoes: "Chaussures",
  accessories: "Accessoires",
};

export const CATEGORY_EMOJI: Record<ClosetCategory, string> = {
  tops: "👕",
  bottoms: "👖",
  outerwear: "🧥",
  dresses: "👗",
  shoes: "👟",
  accessories: "👜",
};

export const OCCASIONS: { id: string; label: string; emoji: string }[] = [
  { id: "everyday", label: "Quotidien", emoji: "☕" },
  { id: "business", label: "Business", emoji: "💼" },
  { id: "date", label: "Rendez-vous", emoji: "🌹" },
  { id: "wedding", label: "Mariage", emoji: "💍" },
  { id: "party", label: "Soirée", emoji: "✨" },
  { id: "sport", label: "Sport", emoji: "🏃" },
  { id: "interview", label: "Entretien", emoji: "🎯" },
  { id: "travel", label: "Voyage", emoji: "✈️" },
];
