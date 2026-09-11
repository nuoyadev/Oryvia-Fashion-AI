# Oryvia — Ton styliste IA personnel

> Oryvia comprend ton **corps**, ton **visage**, tes **goûts**, ton **dressing** et ton **budget** pour créer ton style idéal.
> Ce n'est pas « Quelle tenue porter ? » — c'est **« Voici ton identité stylistique complète et comment l'améliorer. »**

Oryvia est une **web app** (installable sur iOS / Android / PC en PWA), conçue comme une **V1 complète et fonctionnelle** — pas une maquette. Elle tourne localement sans aucune clé API (moteur de style déterministe embarqué) et peut se brancher sur OpenAI / Anthropic / Gemini ainsi que sur Supabase pour la production.

---

## ✨ Fonctionnalités (V1)

| # | Module | Ce que ça fait |
|---|--------|----------------|
| 1 | **AI Body & Style Analysis** | Questionnaire (taille, poids, âge, morphologie, carnation, cheveux, yeux) + détection de la **saison colorimétrique** + recommandations de coupes (à privilégier / à éviter). |
| 2 | **Style Learning Engine** | Upload de photos d'inspiration (Pinterest, Instagram…) → extraction de la **palette**, agrégation des goûts, détection des **couleurs manquantes** dans ton dressing. |
| 3 | **Style DNA** | Profil généré : répartition d'archétypes (Minimal Luxury, Streetwear, Old Money, Parisien…), palette, marques, budget. |
| 4 | **Digital Closet** | Ajout de vêtements par **photo (caméra)** → détection automatique de la **couleur**, catégories, inventaire, statistiques et **combinaisons possibles**. |
| 5 | **AI Outfit Generator** | Génère une tenue complète (occasion + ville + **météo**) à partir de ton corps, ton Style DNA et ton dressing, avec explication, conseils et **variantes**. |
| 5b | **Feedback j'aime / j'aime pas** | Chaque tenue générée est notée ❤️/👎 : Oryvia **ré-entraîne ton Style DNA** (archétypes + couleurs) en continu, et tu peux réinitialiser. |
| 6 | **Shopping AI Assistant** | « Améliore mon style old money avec 300 € » → analyse des manques de ta garde-robe, sélection de pièces dans le budget, avec raisons et liens. |
| 7 | **AI Stylist (chat)** | Conversation en français qui comprend les intentions (tenue, shopping, conseil, inspiration) et renvoie des actions structurées. |
| 8 | **Virtual Try-On (préparé)** | Architecture de stockage chiffré + PWA caméra prête pour l'AR (phase 3). |

**La couleur est vivante** : Oryvia ne se limite pas au sobre — il détecte, recommande et harmonise des palettes complètes (terracotta, émeraude, corail, lavande…) selon ta saison colorimétrique et tes goûts.

---

## 🧱 Architecture

```
Next.js 14 (App Router, RSC)
        │
        ├── Client (React / TS) ── SwiftUI-like premium UI, PWA
        │        MVVM-ish : Context state + composants de présentation
        │
        ├── Route Handlers (API) ── auth, closet, outfits, shopping, chat…
        │
        ├── AI Layer (modulaire)
        │     ├── Vision Analysis Service      (analyse.ts — JPEG/PNG, couleurs)
        │     ├── Style Recommendation Engine  (recommend.ts — Style DNA, tenues, shopping)
        │     ├── Fashion Knowledge Base       (fashion.ts — morphologies, archétypes, catalogue)
        │     └── AI Orchestrator              (ai.ts — intentions + providers optionnels)
        │
        ├── Security (crypto.ts, auth.ts, store.ts)
        │     ├── AES-256-GCM (enveloppe de clés : DEK par utilisateur, KEK maître)
        │     ├── bcrypt (mots de passe) + JWT httpOnly (sessions)
        │     └── Vault chiffré pour toutes les photos
        │
        └── Database
              ├── SQLite local (node:sqlite) — zéro dépendance de service
              └── Supabase/Postgres en production (supabase/schema.sql + RLS)
```

### Couche IA — fonctionne **sans clé**
- **Local Fashion Engine (par défaut)** : déterminisme, confidentialité totale, zéro coût.
- **Fournisseurs cloud (optionnels)** : renseigne `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` ou `GOOGLE_GENERATIVE_AI_API_KEY` dans `.env.local` — le texte de conversation devient généré par le modèle, les actions structurées (tenue/shopping) restent déterministes pour la fiabilité.

---

## 🔐 Sécurité & chiffrement

Conçu pour recevoir des **photos de personnes** :

1. **Chaque utilisateur possède une clé de chiffrement (DEK)** générée à l'inscription.
2. La DEK est **enveloppée** avec une clé maîtresse (KEK) et stockée sur l'utilisateur.
3. **Toute photo** (dressing, inspiration, avatar) est chiffrée **AES-256-GCM** *avant* d'être écrite sur disque, dans un **vault hors du répertoire public**.
4. Les images ne sont servies que via `/api/media/…` après **authentification + vérification de propriété** (HTTP 401 sinon).
5. Mots de passe **bcrypt** (coût 12), sessions **JWT signées dans un cookie httpOnly** (jamais de localStorage).
6. **Suppression totale de compte** : toutes les lignes et toutes les photos chiffrées sont effacées.

> ⚠️ En production, définissez `ORVYIA_JWT_SECRET` et `ORVYIA_ENC_KEY` (voir `.env.example`).

---

## 🚀 Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
```

Créer un compte (ou utiliser l'email/mot de passe de test si créé), puis compléter l'onboarding pour générer ton Style DNA.

### Scripts
```bash
npm run dev        # développement
npm run build      # build de production
npm run start      # serveur de production
npm run typecheck  # vérification TypeScript
```

### Production avec Supabase
1. Crée un projet Supabase.
2. Applique `supabase/schema.sql` (tables + RLS + bucket privé).
3. Renseigne les variables Supabase dans `.env.local`.

---

## 📁 Structure du projet

```
src/
├── app/                     # Routes (pages + API)
│   ├── page.tsx             # Entrée → redirection selon session
│   ├── (auth)/login         # Connexion / inscription
│   ├── (onboarding)         # Parcours de création du Style DNA
│   ├── (app)/               # App authentifiée (shell + navigation)
│   │   ├── home/            # Tableau de bord
│   │   ├── style/           # Style DNA + conseils morphologie
│   │   ├── closet/          # Dressing (photos + couleurs auto)
│   │   ├── studio/          # Générateur de tenues (météo)
│   │   ├── chat/            # Styliste IA conversationnel
│   │   ├── inspiration/     # Style Learning Engine
│   │   ├── shopping/        # Shopping AI Assistant
│   │   └── profile/         # Compte, sécurité, suppression
│   └── api/                 # Route handlers (auth, closet, outfits…)
├── lib/                     # Cœur serveur (crypto, db, ai, fashion, recommend…)
├── client/                  # État, types, helpers côté client
└── components/              # UI partagée (shell, cartes, upload…)

supabase/schema.sql           # Schéma Postgres + RLS (production)
scripts/gen-icons.mjs         # Génération des icônes PNG
docs/ARCHITECTURE.md          # Détail technique
docs/ROADMAP.md               # Feuille de route
```

---

## 🗺️ Feuille de route (résumé)

- **Phase 1 — V1 (ce dépôt, livré)** : profil, Style DNA, dressing, générateur de tenues, shopping, chat, chiffrement, PWA.
- **Phase 2** : apprentissage continu du style (feedback sur tenues), recommandations avancées, comparaison de prix multi-sites réels, Supabase en production.
- **Phase 3** : essayage virtuel / AR, partenariats marques, multi-comptes, partage de looks.

Le **moat** d'Oryvia n'est pas le code — c'est **ton historique personnel** : ton dressing, tes goûts, ton évolution de style. Chaque interaction affine le modèle.
