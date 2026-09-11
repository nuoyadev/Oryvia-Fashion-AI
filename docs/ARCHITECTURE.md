# Oryvia — Architecture technique

## Principes

1. **Privé par défaut** : le moteur de style local tourne sans clé API et sans service externe. Les fournisseurs cloud sont des *améliorations*, pas des dépendances.
2. **Déterminisme des actions** : les actions à enjeu (tenue, liste shopping) sont calculées par un moteur déterministe et explicable. Seul le texte de conversation peut être délégué à un LLM.
3. **Chiffrement dès la conception** : une photo n'est jamais écrite en clair.
4. **Portabilité du stockage** : le DAO SQLite est isolé ; le schéma Supabase/Postgres le reflète 1:1.

## Couches

### 1. Présentation (client)
- React 18 + Next.js App Router, TypeScript.
- État global via un `AppProvider` (contexte) : user, closet, outfits, shopping, inspiration, toasts.
- UI « premium » : fond sombre, typographie display (Fraunces) + sans (Manrope), dégradé de marque (violet → rose → corail), PWA installable.
- Navigation : barre latérale (desktop) / barre d'onglets + bouton central Studio (mobile).

### 2. API (route handlers)
- `auth/*` : register, login, logout, me, delete.
- `profile` : GET/POST — le POST reçoit `bodyProfile` + `styleInput` et construit le Style DNA côté serveur.
- `closet`, `closet/[id]` : CRUD + upload multipart avec analyse d'image.
- `outfits` : génération de tenues (météo optionnelle via Open-Meteo).
- `shopping` : génération de listes shopping.
- `chat` : orchestrateur IA conversationnel.
- `inspiration` : Style Learning Engine.
- `media/[file]` : service des photos déchiffrées (auth + propriété).

### 3. Couche IA (modulaire)
- **Vision Analysis Service** (`analyze.ts`) : décode JPEG/PNG en pur JS (`jpeg-js` + décodeur PNG maison) et extrait couleur dominante, palette, luminosité, chaleur.
- **Colour Harmony Engine** (`harmony.ts`) : détecte la carnation (sous-ton, clarté) d'une photo ou d'un flux caméra et score l'accord d'une palette de tenue avec le teint (pur TS, exécuté côté client **et** serveur).
- **Style Recommendation Engine** (`recommend.ts`) : détection de saison colorimétrique, calcul des archétypes, génération de tenues, génération shopping, **ré-entraînement du Style DNA par feedback** (`effectiveStyleDna`).
- **Fashion Knowledge Base** (`fashion.ts`) : morphologies, saisons, 12 archétypes, ~50 pièces de catalogue, occasions.
- **AI Orchestrator** (`ai.ts`) : détection d'intention (tenue/shopping/conseil/inspiration/greeting), extraction d'occasion, de ville et de budget, appel des fournisseurs cloud optionnels, fallback local.

### 3b. Couche 3D (avatar paramétrique)
- `components/three/metrics.ts` : transforme le BodyProfile en proportions 3D (morphologie, mensurations, poids, carnation, cheveux) — pur TS, testable.
- `components/three/avatar.tsx` : avatar stylisé (tronc par révolution, membres en capsules, visage/cheveux) + vêtements paramétriques (tops, bas, robes, vestes, chaussures, accessoires) habillés de la couleur détectée sur la photo.
- `components/three/scene.tsx` : scène react-three-fiber (éclairage, ombres de contact, OrbitControls) — chargée dynamiquement (`ssr:false`) pour ne pas alourdir le bundle partagé.

### 4. Sécurité
- `crypto.ts` : AES-256-GCM, enveloppe DEK/KEK.
- `auth.ts` : bcrypt, JWT HS256 (jose), cookie httpOnly.
- `store.ts` : vault chiffré (hors public).

### 5. Données
- SQLite (`node:sqlite`), mode WAL.
- Tables : `users`, `closet_items`, `outfits`, `inspiration_items`, `shopping_lists`, `chat_messages`, `style_snapshots`, `tryons`.
- Production : `supabase/schema.sql` avec Row Level Security par `auth.uid()` et bucket privé `oryvia-vault`.

## Flux clés

### Ajout d'un vêtement
1. `POST /api/closet` (multipart) → `parseMultipart`.
2. `analyzeImage` → couleur dominante nommée.
3. `writeEncrypted(DEK, bytes)` → fichier `.png/.jpg` chiffré dans `data/vault`.
4. `addClosetItem` → ligne SQLite avec `image = <chemin vault>`.

### Génération d'une tenue
1. `POST /api/outfits {occasion, city?}`.
2. Géocodage + météo (Open-Meteo) si ville fournie.
3. `generateOutfit` : besoins par occasion (ajustés au genre), score par pièce (archétype + palette + saison + niveau de luxe), dressing d'abord puis catalogue.
4. Sauvegarde + réponse avec `look`, `alternatives`, `weather`.

### Chat
1. `POST /api/chat {text}`.
2. `detectIntent` + extraction occasion/ville/budget.
3. Action structurée calculée localement ; texte via provider si clé présente.
4. Persistance des messages (user + assistant) en JSON.

## Configuration

Voir `.env.example`. En l'absence de clés, l'application est 100 % fonctionnelle en local (météo et texte LLM se dégradent proprement).
