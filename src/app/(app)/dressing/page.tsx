"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/client/state";
import { Button, Card, Chip, SectionTitle, cx } from "@/components/ui";
import { buildBodyMetrics, type GarmentSpec } from "@/components/three/metrics";
import type { BackgroundKey } from "@/components/three/scene";
import { CATEGORY_EMOJI, CATEGORY_LABELS, type ClosetCategory, type ClosetItem } from "@/client/types";

const Scene = dynamic(() => import("@/components/three/scene").then((m) => m.DressingScene), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted">Chargement du studio 3D…</div>
  ),
});

const CATEGORIES = ["tops", "bottoms", "outerwear", "dresses", "shoes", "accessories"] as ClosetCategory[];

export default function DressingPage() {
  const { outfits, closet, user } = useApp();
  const [mode, setMode] = useState<"outfit" | "closet">("outfit");
  const [outfitId, setOutfitId] = useState<string>("");
  const [fit, setFit] = useState(1.08);
  const [autoRotate, setAutoRotate] = useState(true);
  const [background, setBackground] = useState<BackgroundKey>("dark");
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [closetPick, setClosetPick] = useState<Record<ClosetCategory, string>>({
    tops: "",
    bottoms: "",
    outerwear: "",
    dresses: "",
    shoes: "",
    accessories: "",
  });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("outfit");
    if (p && outfits.some((o) => o.id === p)) {
      setOutfitId(p);
      setMode("outfit");
    } else if (outfits[0]) {
      setOutfitId(outfits[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = useMemo(() => buildBodyMetrics(user?.bodyProfile ?? null), [user?.bodyProfile]);

  const outfit = outfits.find((o) => o.id === outfitId) ?? outfits[0] ?? null;

  const items: GarmentSpec[] = useMemo(() => {
    if (mode === "outfit" && outfit) {
      return outfit.look.items.map((piece, i) => ({
        key: `o-${i}`,
        category: piece.category,
        subcategory: piece.subcategory ?? "",
        name: piece.name,
        color: piece.color ?? "#8a8a8a",
      }));
    }
    return CATEGORIES.filter((c) => closetPick[c])
      .map((c) => {
        const item = closet.find((i) => i.id === closetPick[c]);
        if (!item) return null;
        return { key: item.id, category: item.category, subcategory: item.subcategory, name: item.name, color: item.color };
      })
      .filter(Boolean) as GarmentSpec[];
  }, [mode, outfit, closetPick, closet]);

  const palette = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.color));
    return [...set].slice(0, 8);
  }, [items]);

  function toggle(key: string) {
    setHidden((h) => {
      const n = new Set(h);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  }

  function resetOutfit() {
    setClosetPick({ tops: "", bottoms: "", outerwear: "", dresses: "", shoes: "", accessories: "" });
    setHidden(new Set());
    setFit(1.08);
  }

  if (outfits.length === 0 && closet.length === 0) {
    return (
      <div className="animate-fade-up">
        <SectionTitle kicker="3D Wardrobe" title="Dressing 3D" />
        <Card className="mx-auto max-w-md text-center">
          <p className="text-3xl">🧍</p>
          <p className="mt-2 font-display text-lg text-cream">Ton avatar 3D t'attend</p>
          <p className="mt-1 text-sm text-muted">
            Complète ton profil (morphologie) et ajoute quelques vêtements : Oryvia habillera ton avatar en 3D avec leurs vraies couleurs.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link href="/closet" className="rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white">
              Ajouter des vêtements
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <SectionTitle
        kicker="3D Wardrobe"
        title="Dressing 3D"
        sub="Ton avatar est généré à partir de ta morphologie. Chaque vêtement devient un modèle 3D habillé de la couleur détectée sur sa photo."
      />

      {/* mode toggle */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant={mode === "outfit" ? "primary" : "secondary"} size="sm" onClick={() => setMode("outfit")}>
          🪄 Tenue générée
        </Button>
        <Button variant={mode === "closet" ? "primary" : "secondary"} size="sm" onClick={() => setMode("closet")}>
          🧺 Composer depuis mon dressing
        </Button>
        {mode === "outfit" && outfits.length > 0 && (
          <select
            value={outfit?.id ?? ""}
            onChange={(e) => setOutfitId(e.target.value)}
            className="ml-auto max-w-[220px] rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-cream outline-none focus:border-rose/60"
          >
            {outfits.slice(0, 10).map((o) => (
              <option key={o.id} value={o.id}>
                {o.look.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* 3D canvas */}
        <div className="lg:col-span-3">
          <div className="relative h-[62vh] min-h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-[#0e0d12]">
            <Scene metrics={metrics} items={items} fit={fit} hidden={hidden} autoRotate={autoRotate} background={background} />
            <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
              🖱️ Glisse pour tourner · molette pour zoomer
            </div>
          </div>
        </div>

        {/* controls */}
        <div className="space-y-4 lg:col-span-2">
          {/* closet mode picker */}
          {mode === "closet" && (
            <Card>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Choisis une pièce par catégorie</p>
              <div className="space-y-3">
                {CATEGORIES.map((c) => {
                  const available = closet.filter((i) => i.category === c);
                  if (available.length === 0) return null;
                  return (
                    <div key={c}>
                      <p className="mb-1.5 text-xs text-muted">
                        {CATEGORY_EMOJI[c]} {CATEGORY_LABELS[c]}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {available.map((item: ClosetItem) => (
                          <button
                            key={item.id}
                            onClick={() => setClosetPick((p) => ({ ...p, [c]: item.id }))}
                            className={cx(
                              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                              closetPick[c] === item.id
                                ? "border-transparent bg-brand-gradient text-white"
                                : "border-white/10 bg-white/[0.04] text-muted hover:text-cream"
                            )}
                          >
                            <span className="h-3 w-3 rounded-full border border-white/30" style={{ background: item.color }} />
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button variant="ghost" size="sm" onClick={resetOutfit} className="mt-3">
                Tout enlever
              </Button>
            </Card>
          )}

          {/* garment toggles */}
          <Card>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Pièces affichées</p>
            {items.length === 0 ? (
              <p className="text-sm text-muted">
                {mode === "closet" ? "Sélectionne des pièces ci-dessus." : "Cette tenue ne contient pas encore de pièces."}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {items.map((it) => (
                  <Chip key={it.key} active={!hidden.has(it.key)} onClick={() => toggle(it.key)}>
                    <span className="h-3 w-3 rounded-full border border-white/30" style={{ background: it.color }} />
                    {CATEGORY_EMOJI[it.category]} {it.name}
                  </Chip>
                ))}
              </div>
            )}
          </Card>

          {/* fit + scene controls */}
          <Card className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
                <span className="font-semibold uppercase tracking-wider">Coupe</span>
                <span>{fit < 1.05 ? "Ajustée" : fit < 1.15 ? "Standard" : "Ample"}</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={1.3}
                step={0.01}
                value={fit}
                onChange={(e) => setFit(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">Ambiance</p>
              <div className="flex gap-2">
                {(["dark", "light", "sand"] as BackgroundKey[]).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBackground(b)}
                    className={cx(
                      "h-9 w-9 rounded-full border-2 transition-transform hover:scale-110",
                      background === b ? "border-white" : "border-white/20"
                    )}
                    style={{ background: b === "dark" ? "#0e0d12" : b === "light" ? "#ece8e2" : "#d9c6a5" }}
                    aria-label={b}
                  />
                ))}
              </div>
            </div>
            <label className="flex cursor-pointer items-center justify-between text-sm text-cream">
              <span>Rotation automatique</span>
              <input
                type="checkbox"
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
                className="h-5 w-5 accent-[#7c5cff]"
              />
            </label>
          </Card>

          {/* palette + profile summary */}
          {palette.length > 0 && (
            <Card>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Palette de la tenue</p>
              <div className="flex flex-wrap gap-2">
                {palette.map((c) => (
                  <span key={c} className="h-8 w-8 rounded-full border border-white/20" style={{ background: c }} />
                ))}
              </div>
            </Card>
          )}

          <Card className="text-xs leading-relaxed text-muted">
            <p className="mb-1.5 font-semibold text-cream">🧍 Ton avatar</p>
            {user?.bodyProfile?.heightCm ? <p>{user.bodyProfile.heightCm} cm · {user.bodyProfile.weightKg} kg</p> : <p>Profil corps non renseigné (silhouette par défaut).</p>}
            <p className="mt-1.5">
              La silhouette et les proportions s'adaptent à ta morphologie et à tes mensurations. Complète ton profil pour un avatar plus fidèle.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
