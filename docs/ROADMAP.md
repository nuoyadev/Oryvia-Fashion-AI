# Oryvia — Feuille de route

## Phase 1 — V1 (livrée dans ce dépôt)

- ✅ Compte sécurisé (bcrypt + JWT + chiffrement des photos)
- ✅ Onboarding : corps, morphologie, carnation → saison colorimétrique
- ✅ Style DNA : archétypes, palette, marques, budget
- ✅ Digital Closet : upload caméra, détection couleur, catégories, suppression/édition
- ✅ AI Outfit Generator : occasion + ville + météo, variantes, conseils morphologie
- ✅ Shopping AI Assistant : budget + objectif → sélection avec raisons
- ✅ AI Stylist chat : intentions (tenue / shopping / conseil / inspiration)
- ✅ Feedback « j'aime / j'aime pas » sur les tenues → ré-entraînement continu du Style DNA
- ✅ Style Learning Engine : inspirations → palette + manques détectés
- ✅ PWA installable (iOS / Android / PC)
- ✅ Architecture IA modulaire + fournisseurs cloud optionnels
- ✅ Schéma Supabase/Postgres + RLS pour la production

**Objectif : 100 utilisateurs test.**

## Phase 2 — Apprentissage & recommandations avancées

- Feedback sur les tenues (« j'aime / j'aime pas ») → ré-entraînement du Style DNA
- Historique d'évolution du style (le « moat »)
- Comparaison de prix réelle multi-sites (API boutiques / affiliation)
- Génération d'images de tenues (diffusion) pour visualiser les looks
- Migrations actives vers Supabase (Postgres + Auth + Storage + Edge Functions)
- Notifications / rappels (« il fait 8°C demain, voici ta tenue »)

## Phase 3 — Immersion & partenariats

- **Virtual Try-On / AR** : essayage par caméra, changement de couleur, avant/après
- Partenariats marques (catalogues + commissions)
- Partage de looks & communautés
- Assistant vocal

## Le moat

Le code est reproductible ; pas les données. La valeur défensive d'Oryvia est **l'historique personnel de chaque utilisateur** — son dressing, ses goûts, son évolution de style — qui rend la relation plus profonde à chaque interaction et impossible à copier.
