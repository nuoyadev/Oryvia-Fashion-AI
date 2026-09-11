// ────────────────────────────────────────────────────────────────
// Oryvia — Fashion Knowledge Base
//
// A curated, versionable fashion ontology: body shapes, colour
// seasons, style archetypes, brands and pieces. This is the "moat"
// data that makes Oryvia's recommendations feel like a stylist who
// knows you — not a generic chatbot.
// ────────────────────────────────────────────────────────────────

import type { BodyShape, ClosetCategory, Gender } from "./types";

export interface SeasonPalette {
  id: string;
  label: string;
  description: string;
  colors: string[];
  metals: string;
}

export const colorSeasons: SeasonPalette[] = [
  {
    id: "winter",
    label: "Hiver",
    description: "Contraste fort, teintes froides et franches.",
    colors: ["#111111", "#ffffff", "#c0392b", "#1f2a44", "#7a4dcc", "#1e7f5c", "#f5f5f0"],
    metals: "Argent",
  },
  {
    id: "summer",
    label: "Été",
    description: "Teintes douces, froides et poudrées.",
    colors: ["#8a8a8a", "#8ec5e8", "#b0a4e0", "#9fd9c0", "#e6b8b0", "#d6d6d6", "#1f2a44"],
    metals: "Argent",
  },
  {
    id: "autumn",
    label: "Automne",
    description: "Teintes chaudes, profondes et terreuses.",
    colors: ["#b98a52", "#6b4423", "#c96f4a", "#6b6b2f", "#c7911b", "#6e1f2e", "#d9c6a5"],
    metals: "Or",
  },
  {
    id: "spring",
    label: "Printemps",
    description: "Teintes claires, chaudes et lumineuses.",
    colors: ["#e8c547", "#ef9bb6", "#34c3a2", "#c8a2e8", "#efe3c8", "#c0392b", "#8ec5e8"],
    metals: "Or",
  },
];

export interface ShapeGuidance {
  id: BodyShape;
  label: string;
  description: string;
  do: string[];
  avoid: string[];
}

export const bodyShapes: ShapeGuidance[] = [
  {
    id: "hourglass",
    label: "Sablier",
    description: "Épaules et hanches alignées, taille marquée.",
    do: [
      "Vestes cintrées qui soulignent la taille",
      "Pantalons taille haute et droits",
      "Robes portefeuille et coupes ajustées",
      "Ceintures pour accentuer la taille",
    ],
    avoid: ["Coupes oversized qui noient la silhouette", "Tissus rigides sans structure"],
  },
  {
    id: "rectangle",
    label: "Rectangle",
    description: "Épaules, taille et hanches sur la même ligne.",
    do: [
      "Vestes structurées pour créer des épaules",
      "Jeux de volumes (ample en haut, ajusté en bas)",
      "Ceintures et tailles marquées",
      "Superpositions et layering",
    ],
    avoid: ["Coupes droites monotones", "Tissus mous sans tenue"],
  },
  {
    id: "inverted_triangle",
    label: "Triangle inversé",
    description: "Épaules plus larges que les hanches.",
    do: [
      "Bas fluides et évasés pour équilibrer",
      "Cols V qui allongent le buste",
      "Pantalons larges ou cargos",
      "Couleurs sombres en haut, claires en bas",
    ],
    avoid: ["Épaules structurées imposantes", "Mancherons et volumes en haut"],
  },
  {
    id: "triangle",
    label: "Triangle (poire)",
    description: "Hanches plus larges que les épaules.",
    do: [
      "Hauts clairs et structurés qui élargissent les épaules",
      "Vestes à épaules marquées",
      "Pantalons droits ou légèrement fuselés",
      "Détails au niveau du buste",
    ],
    avoid: ["Bas très serrés ou brillants", "Poches volumineuses sur les hanches"],
  },
  {
    id: "oval",
    label: "Ovale",
    description: "Silhouette ronde, centre du corps présent.",
    do: [
      "Coupes fluides qui tombent sans serrer",
      "Vestes longues non boutonnées",
      "Cols V et encolures dégagées",
      "Monochromes qui allongent la silhouette",
    ],
    avoid: ["Tissus moulants", "Ceintures serrées", "Imprimés chargés"],
  },
  {
    id: "athletic",
    label: "Athlétique",
    description: "Épaules développées, taille fine, hanches étroites.",
    do: [
      "Pantalons amples ou cargos pour équilibrer",
      "Hauts ajustés qui valorisent le travail du corps",
      "Layering souple",
      "Couleurs et détails en bas",
    ],
    avoid: ["Épaules encore plus élargies", "Bas trop moulants"],
  },
];

export interface Archetype {
  id: string;
  label: string;
  emoji: string;
  description: string;
  colors: string[];
  keywords: string[];
  brands: string[];
  luxe: number; // 0 essential .. 3 luxury
}

export const archetypes: Archetype[] = [
  {
    id: "minimal_luxury",
    label: "Minimal Luxury",
    emoji: "🕊️",
    description: "Pureté des lignes, matières nobles, palette neutre.",
    colors: ["#111111", "#f5f5f0", "#d6d6d6", "#d9c6a5", "#8b7d6b"],
    keywords: ["épuré", "minimal", "luxe discret", "intemporel", "tailleur", "sobre", "chic"],
    brands: ["COS", "A.P.C.", "Arket", "The Row", "Toteme", "Lemaire", "Jil Sander", "Uniqlo U"],
    luxe: 2,
  },
  {
    id: "streetwear",
    label: "Streetwear",
    emoji: "🛹",
    description: "Culture urbaine, coupes amples, logos et sneakers.",
    colors: ["#111111", "#c0392b", "#1f2a44", "#8a8a8a", "#e07a2f"],
    keywords: ["oversize", "urban", "sneakers", "logo", "street", "cargo", "capuche", "skate"],
    brands: ["Nike", "Adidas", "Stüssy", "Carhartt WIP", "Palace", "Fear of God", "New Balance", "Bape"],
    luxe: 1,
  },
  {
    id: "old_money",
    label: "Old Money",
    emoji: "🏛️",
    description: "Élégance héritée, matières riches, coupes classiques.",
    colors: ["#4b2e1d", "#1f2a44", "#efe3c8", "#b98a52", "#6b4423"],
    keywords: ["preppy", "classique", "chic", "polo", "blazer", "tennis", "héritage", "élégant"],
    brands: ["Ralph Lauren", "Lacoste", "Brooks Brothers", "Barbour", "Drake's", "Gant", "Sézane", "Massimo Dutti"],
    luxe: 3,
  },
  {
    id: "scandi",
    label: "Scandinave",
    emoji: "❄️",
    description: "Fonctionnel, lumineux, confortable et durable.",
    colors: ["#d6d6d6", "#efe3c8", "#8a8a8a", "#8ec5e8", "#1f2a44"],
    keywords: ["scandi", "nordique", "cosy", "fonctionnel", "naturel", "durable", "hygge"],
    brands: ["COS", "Arket", "& Other Stories", "Ganni", "Filippa K", "Acne Studios", "Weekday"],
    luxe: 2,
  },
  {
    id: "boho",
    label: "Bohème",
    emoji: "🌾",
    description: "Fluide, imprimés, textures naturelles et esprit libre.",
    colors: ["#c96f4a", "#6b6b2f", "#d9c6a5", "#c7911b", "#a4472f"],
    keywords: ["boho", "fluide", "imprimé", "vintage", "ethnique", "dentelle", "70s"],
    brands: ["Free People", "Anthropologie", "Isabel Marant", "Rouje", "Zimmermann", "Sézane"],
    luxe: 2,
  },
  {
    id: "classic",
    label: "Classique",
    emoji: "🎩",
    description: "Intemporel, structuré, taillé pour durer.",
    colors: ["#1f2a44", "#8a8a8a", "#ffffff", "#6e1f2e", "#4b2e1d"],
    keywords: ["classique", "intemporel", "tailleur", "costume", "chemise", "chic", "sobre"],
    brands: ["Hugo Boss", "Massimo Dutti", "Reiss", "Suitsupply", "Sandro", "Uniqlo"],
    luxe: 2,
  },
  {
    id: "parisian",
    label: "Parisien",
    emoji: "🥐",
    description: "Effortless chic, basique bien coupé, touche nonchalante.",
    colors: ["#111111", "#f5f5f0", "#1f2a44", "#6e1f2e", "#d9c6a5"],
    keywords: ["parisien", "effortless", "chic", "marinière", "blazer", "ballerine", "nonchalant"],
    brands: ["Sézane", "Rouje", "Maje", "Sandro", "Ba&sh", "A.P.C.", "Isabel Marant"],
    luxe: 2,
  },
  {
    id: "romantic",
    label: "Romantique",
    emoji: "🌷",
    description: "Douceur, volants, pastels et féminité affirmée.",
    colors: ["#ef9bb6", "#c8a2e8", "#e6b8b0", "#efe3c8", "#6e1f2e"],
    keywords: ["romantique", "fleur", "volant", "dentelle", "pastel", "robe", "féminin"],
    brands: ["Zimmermann", "LoveShackFancy", "Rixo", "Sandro", "Maje", "For Love & Lemons"],
    luxe: 2,
  },
  {
    id: "avant_garde",
    label: "Avant-garde",
    emoji: "🎭",
    description: "Expérimental, architectural, silhouettes sculpturales.",
    colors: ["#111111", "#8a8a8a", "#c0392b", "#7a4dcc", "#f5f5f0"],
    keywords: ["avant-garde", "conceptuel", "architectural", "dark", "asymétrique", "expérimental"],
    brands: ["Rick Owens", "Yohji Yamamoto", "Comme des Garçons", "Ann Demeulemeester", "Issey Miyake"],
    luxe: 3,
  },
  {
    id: "athleisure",
    label: "Athleisure",
    emoji: "🏃",
    description: "Performance et style au quotidien, confort technique.",
    colors: ["#111111", "#2f6db3", "#c0392b", "#8a8a8a", "#e07a2f"],
    keywords: ["sport", "legging", "jogging", "sneakers", "performance", "gym", "confort"],
    brands: ["Nike", "Adidas", "Lululemon", "Alo Yoga", "Gymshark", "New Balance", "On Running"],
    luxe: 1,
  },
  {
    id: "coastal",
    label: "Coastal",
    emoji: "🌊",
    description: "Léger, lumineux, esprit vacances et bord de mer.",
    colors: ["#f5f5f0", "#8ec5e8", "#34c3a2", "#d9c6a5", "#2f6db3"],
    keywords: ["coastal", "lin", "été", "vacances", "marine", "léger", "bord de mer"],
    brands: ["Sezane", "Ralph Lauren", "Club Monaco", "Arket", "Reformation"],
    luxe: 2,
  },
  {
    id: "dark_academia",
    label: "Dark Academia",
    emoji: "📚",
    description: "Intellectuel, textures riches, tons profonds.",
    colors: ["#4b2e1d", "#6b4423", "#1f2a44", "#6b6b2f", "#111111"],
    keywords: ["academia", "tweed", "intello", "vintage", "universitaire", "sombre", "rétro"],
    brands: ["Ralph Lauren", "Barbour", "Brooks Brothers", "Drake's", "A.P.C."],
    luxe: 2,
  },
];

export interface PieceDef {
  category: ClosetCategory;
  subcategory: string;
  label: string;
  color: string;
  keywords: string[];
  archetype: string[];
  price: number;
  luxe: number;
  seasons: string[];
  base: string;
}

export const catalog: PieceDef[] = [
  // tops
  { category: "tops", subcategory: "t-shirt", label: "T-shirt premium", color: "#f5f5f0", keywords: ["basique", "coton", "essentiel"], archetype: ["minimal_luxury", "parisian", "coastal"], price: 29, luxe: 0, seasons: ["all"], base: "un t-shirt" },
  { category: "tops", subcategory: "chemise", label: "Chemise Oxford", color: "#d6d6d6", keywords: ["chemise", "classique", "oxford"], archetype: ["old_money", "classic", "dark_academia"], price: 39, luxe: 1, seasons: ["all"], base: "une chemise" },
  { category: "tops", subcategory: "chemise", label: "Chemise en soie", color: "#efe3c8", keywords: ["soie", "fluide", "élégant"], archetype: ["minimal_luxury", "old_money"], price: 79, luxe: 2, seasons: ["all"], base: "une chemise" },
  { category: "tops", subcategory: "pull", label: "Pull col rond laine mérinos", color: "#1f2a44", keywords: ["laine", "pull", "hiver"], archetype: ["minimal_luxury", "old_money", "scandi"], price: 59, luxe: 2, seasons: ["winter", "spring", "autumn"], base: "un pull" },
  { category: "tops", subcategory: "pull", label: "Pull col roulé", color: "#4b2e1d", keywords: ["col roulé", "pull", "chic"], archetype: ["minimal_luxury", "parisian", "dark_academia"], price: 49, luxe: 1, seasons: ["winter", "autumn"], base: "un pull" },
  { category: "tops", subcategory: "hoodie", label: "Hoodie oversize", color: "#111111", keywords: ["oversize", "capuche", "street"], archetype: ["streetwear", "athleisure"], price: 69, luxe: 1, seasons: ["all"], base: "un hoodie" },
  { category: "tops", subcategory: "t-shirt", label: "T-shirt graphique", color: "#c0392b", keywords: ["logo", "graphique", "street"], archetype: ["streetwear", "athleisure"], price: 25, luxe: 0, seasons: ["all"], base: "un t-shirt" },
  { category: "tops", subcategory: "blouse", label: "Blouse fluide", color: "#e6b8b0", keywords: ["fluide", "blouse", "féminin"], archetype: ["romantic", "boho", "parisian"], price: 45, luxe: 1, seasons: ["all"], base: "une blouse" },
  { category: "tops", subcategory: "polo", label: "Polo piqué", color: "#1f2a44", keywords: ["polo", "preppy", "tennis"], archetype: ["old_money", "coastal", "classic"], price: 45, luxe: 1, seasons: ["spring", "summer"], base: "un polo" },
  { category: "tops", subcategory: "mariniere", label: "Marinière", color: "#f5f5f0", keywords: ["marinière", "rayures", "parisien"], archetype: ["parisian", "coastal"], price: 35, luxe: 1, seasons: ["spring", "summer"], base: "une marinière" },
  { category: "tops", subcategory: "tank", label: "Débardeur maille", color: "#d9c6a5", keywords: ["débardeur", "maille", "été"], archetype: ["minimal_luxury", "scandi"], price: 25, luxe: 1, seasons: ["summer"], base: "un débardeur" },
  // bottoms
  { category: "bottoms", subcategory: "pantalon", label: "Pantalon droit laine", color: "#8a8a8a", keywords: ["droit", "laine", "tailleur"], archetype: ["minimal_luxury", "old_money", "classic"], price: 89, luxe: 2, seasons: ["all"], base: "un pantalon droit" },
  { category: "bottoms", subcategory: "jean", label: "Jean droit brut", color: "#3d5a80", keywords: ["jean", "denim", "brut"], archetype: ["parisian", "classic", "scandi"], price: 79, luxe: 1, seasons: ["all"], base: "un jean droit" },
  { category: "bottoms", subcategory: "jean", label: "Jean baggy", color: "#2f6db3", keywords: ["baggy", "ample", "street"], archetype: ["streetwear", "athleisure"], price: 69, luxe: 1, seasons: ["all"], base: "un jean baggy" },
  { category: "bottoms", subcategory: "pantalon", label: "Pantalon fluide satin", color: "#111111", keywords: ["fluide", "satin", "soir"], archetype: ["minimal_luxury", "avant_garde"], price: 99, luxe: 2, seasons: ["all"], base: "un pantalon fluide" },
  { category: "bottoms", subcategory: "cargo", label: "Cargo ample", color: "#6b6b2f", keywords: ["cargo", "ample", "utilitaire"], archetype: ["streetwear", "athleisure"], price: 75, luxe: 1, seasons: ["all"], base: "un pantalon cargo" },
  { category: "bottoms", subcategory: "chino", label: "Chino beige", color: "#d9c6a5", keywords: ["chino", "beige", "classique"], archetype: ["old_money", "coastal", "classic"], price: 59, luxe: 1, seasons: ["spring", "summer"], base: "un chino" },
  { category: "bottoms", subcategory: "jupe", label: "Jupe midi satin", color: "#6e1f2e", keywords: ["jupe", "midi", "satin"], archetype: ["parisian", "romantic", "old_money"], price: 65, luxe: 2, seasons: ["all"], base: "une jupe midi" },
  { category: "bottoms", subcategory: "pantalon", label: "Pantalon jogging premium", color: "#8a8a8a", keywords: ["jogging", "confort", "sport"], archetype: ["athleisure", "streetwear"], price: 55, luxe: 1, seasons: ["all"], base: "un jogging" },
  { category: "bottoms", subcategory: "jupe", label: "Jupe plissée", color: "#b0a4e0", keywords: ["plissé", "jupe", "fēminin"], archetype: ["romantic", "classic"], price: 55, luxe: 1, seasons: ["spring", "summer"], base: "une jupe plissée" },
  { category: "bottoms", subcategory: "short", label: "Short en lin", color: "#efe3c8", keywords: ["lin", "short", "été"], archetype: ["coastal", "old_money", "scandi"], price: 39, luxe: 1, seasons: ["summer"], base: "un short en lin" },
  // outerwear
  { category: "outerwear", subcategory: "blazer", label: "Blazer structuré", color: "#1f2a44", keywords: ["blazer", "structuré", "tailleur"], archetype: ["classic", "old_money", "minimal_luxury", "parisian"], price: 129, luxe: 2, seasons: ["all"], base: "un blazer" },
  { category: "outerwear", subcategory: "manteau", label: "Manteau en laine", color: "#4b2e1d", keywords: ["manteau", "laine", "hiver"], archetype: ["minimal_luxury", "old_money"], price: 149, luxe: 2, seasons: ["winter", "autumn"], base: "un manteau en laine" },
  { category: "outerwear", subcategory: "veste", label: "Veste en jean", color: "#3d5a80", keywords: ["jean", "veste", "denim"], archetype: ["parisian", "classic", "scandi"], price: 69, luxe: 1, seasons: ["spring", "summer", "autumn"], base: "une veste en jean" },
  { category: "outerwear", subcategory: "veste", label: "Veste bomber", color: "#111111", keywords: ["bomber", "street", "urbain"], archetype: ["streetwear", "athleisure"], price: 89, luxe: 1, seasons: ["spring", "autumn", "winter"], base: "une veste bomber" },
  { category: "outerwear", subcategory: "manteau", label: "Trench-coat", color: "#d9c6a5", keywords: ["trench", "classique", "imperméable"], archetype: ["parisian", "old_money", "classic"], price: 139, luxe: 2, seasons: ["spring", "autumn"], base: "un trench" },
  { category: "outerwear", subcategory: "veste", label: "Veste en cuir", color: "#111111", keywords: ["cuir", "perfecto", "rock"], archetype: ["avant_garde", "parisian", "streetwear"], price: 199, luxe: 3, seasons: ["spring", "autumn"], base: "une veste en cuir" },
  { category: "outerwear", subcategory: "manteau", label: "Doudoune technique", color: "#2f6db3", keywords: ["doudoune", "technique", "sport"], archetype: ["streetwear", "athleisure"], price: 119, luxe: 1, seasons: ["winter"], base: "une doudoune" },
  { category: "outerwear", subcategory: "cardigan", label: "Cardigan maille", color: "#efe3c8", keywords: ["cardigan", "maille", "doux"], archetype: ["scandi", "dark_academia", "old_money"], price: 59, luxe: 1, seasons: ["spring", "autumn", "winter"], base: "un cardigan" },
  // dresses
  { category: "dresses", subcategory: "robe", label: "Robe portefeuille", color: "#6e1f2e", keywords: ["robe", "portefeuille", "taille"], archetype: ["parisian", "classic", "romantic"], price: 85, luxe: 2, seasons: ["all"], base: "une robe portefeuille" },
  { category: "dresses", subcategory: "robe", label: "Robe midi fluide", color: "#b0a4e0", keywords: ["midi", "fluide", "robe"], archetype: ["romantic", "boho", "minimal_luxury"], price: 75, luxe: 2, seasons: ["spring", "summer"], base: "une robe midi" },
  { category: "dresses", subcategory: "robe", label: "Robe noire ajustée", color: "#111111", keywords: ["noire", "soir", "ajustée"], archetype: ["classic", "minimal_luxury", "avant_garde"], price: 95, luxe: 2, seasons: ["all"], base: "une robe noire" },
  { category: "dresses", subcategory: "robe", label: "Robe chemise", color: "#f5f5f0", keywords: ["chemise", "robe", "casual"], archetype: ["coastal", "old_money", "scandi"], price: 65, luxe: 1, seasons: ["spring", "summer"], base: "une robe chemise" },
  { category: "dresses", subcategory: "robe", label: "Robe de soirée", color: "#1f2a44", keywords: ["soirée", "mariage", "élégante"], archetype: ["romantic", "classic", "old_money"], price: 149, luxe: 3, seasons: ["all"], base: "une robe de soirée" },
  // shoes
  { category: "shoes", subcategory: "sneakers", label: "Sneakers minimalistes", color: "#f5f5f0", keywords: ["sneakers", "blanc", "basique"], archetype: ["minimal_luxury", "scandi", "parisian"], price: 89, luxe: 1, seasons: ["all"], base: "des sneakers" },
  { category: "shoes", subcategory: "sneakers", label: "Sneakers 990", color: "#8a8a8a", keywords: ["sneakers", "990", "new balance"], archetype: ["old_money", "streetwear", "athleisure"], price: 112, luxe: 1, seasons: ["all"], base: "des sneakers" },
  { category: "shoes", subcategory: "bottes", label: "Bottes en cuir", color: "#4b2e1d", keywords: ["bottes", "cuir", "hiver"], archetype: ["parisian", "classic", "dark_academia"], price: 129, luxe: 2, seasons: ["autumn", "winter"], base: "des bottes en cuir" },
  { category: "shoes", subcategory: "mocassins", label: "Mocassins en cuir", color: "#6b4423", keywords: ["mocassins", "cuir", "preppy"], archetype: ["old_money", "classic", "coastal"], price: 99, luxe: 2, seasons: ["spring", "summer", "autumn"], base: "des mocassins" },
  { category: "shoes", subcategory: "escarpins", label: "Escarpins", color: "#111111", keywords: ["escarpins", "talon", "soir"], archetype: ["classic", "romantic", "minimal_luxury"], price: 109, luxe: 2, seasons: ["all"], base: "des escarpins" },
  { category: "shoes", subcategory: "sandales", label: "Sandales en cuir", color: "#d9c6a5", keywords: ["sandales", "été", "cuir"], archetype: ["coastal", "boho", "minimal_luxury"], price: 69, luxe: 1, seasons: ["summer"], base: "des sandales" },
  { category: "shoes", subcategory: "baskets", label: "Baskets rétro", color: "#c0392b", keywords: ["baskets", "rétro", "street"], archetype: ["streetwear", "athleisure"], price: 99, luxe: 1, seasons: ["all"], base: "des baskets" },
  // accessories
  { category: "accessories", subcategory: "sac", label: "Sac en cuir structuré", color: "#4b2e1d", keywords: ["sac", "cuir", "structuré"], archetype: ["minimal_luxury", "old_money", "classic"], price: 149, luxe: 2, seasons: ["all"], base: "un sac en cuir" },
  { category: "accessories", subcategory: "ceinture", label: "Ceinture en cuir", color: "#111111", keywords: ["ceinture", "cuir", "boucle"], archetype: ["classic", "old_money", "minimal_luxury"], price: 49, luxe: 1, seasons: ["all"], base: "une ceinture en cuir" },
  { category: "accessories", subcategory: "lunettes", label: "Lunettes de soleil", color: "#111111", keywords: ["lunettes", "soleil", "accessoire"], archetype: ["parisian", "old_money", "coastal"], price: 79, luxe: 1, seasons: ["summer", "spring"], base: "des lunettes de soleil" },
  { category: "accessories", subcategory: "echarpe", label: "Écharpe en laine", color: "#8b7d6b", keywords: ["écharpe", "laine", "hiver"], archetype: ["scandi", "old_money", "dark_academia"], price: 39, luxe: 1, seasons: ["winter", "autumn"], base: "une écharpe en laine" },
  { category: "accessories", subcategory: "casquette", label: "Casquette", color: "#1f2a44", keywords: ["casquette", "street", "cap"], archetype: ["streetwear", "athleisure"], price: 29, luxe: 0, seasons: ["all"], base: "une casquette" },
  { category: "accessories", subcategory: "montre", label: "Montre minimaliste", color: "#c2c6cf", keywords: ["montre", "minimal", "argent"], archetype: ["minimal_luxury", "classic", "old_money"], price: 119, luxe: 2, seasons: ["all"], base: "une montre" },
  { category: "accessories", subcategory: "chapeau", label: "Chapeau en paille", color: "#d9c6a5", keywords: ["chapeau", "paille", "été"], archetype: ["coastal", "boho"], price: 45, luxe: 1, seasons: ["summer"], base: "un chapeau" },
];

export const occasions: Record<string, { label: string; emoji: string; needs: ClosetCategory[] }> = {
  wedding: { label: "Mariage", emoji: "💍", needs: ["dresses", "outerwear", "shoes", "accessories"] },
  date: { label: "Rendez-vous", emoji: "🌹", needs: ["tops", "bottoms", "shoes"] },
  business: { label: "Business casual", emoji: "💼", needs: ["tops", "bottoms", "outerwear", "shoes"] },
  everyday: { label: "Quotidien", emoji: "☕", needs: ["tops", "bottoms", "shoes"] },
  sport: { label: "Sport", emoji: "🏃", needs: ["tops", "bottoms", "shoes"] },
  party: { label: "Soirée", emoji: "✨", needs: ["dresses", "shoes", "accessories"] },
  interview: { label: "Entretien", emoji: "🎯", needs: ["tops", "bottoms", "outerwear", "shoes"] },
  travel: { label: "Voyage", emoji: "✈️", needs: ["tops", "bottoms", "outerwear", "shoes"] },
};

export const archetypeMap = new Map(archetypes.map((a) => [a.id, a]));
export const seasonMap = new Map(colorSeasons.map((s) => [s.id, s]));
export const shapeMap = new Map(bodyShapes.map((s) => [s.id, s]));

export function shapeFor(gender: Gender | null, shape: BodyShape | null): ShapeGuidance | null {
  if (shape && shapeMap.has(shape)) return shapeMap.get(shape)!;
  return null;
}
