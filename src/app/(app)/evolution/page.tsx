"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/client/lib/api";
import { Card, EmptyState, SectionTitle, cx } from "@/components/ui";
import { OutfitCard } from "@/components/outfit";
import { TrendIcon } from "@/components/icons";
import type { Outfit, StyleSnapshot } from "@/client/types";

interface EvolutionResponse {
  snapshots: StyleSnapshot[];
  likedOutfits: Outfit[];
  stats: { snapshots: number; likes: number; firstAt: number | null; lastAt: number | null };
}

const ARCHETYPE_META: Record<string, { label: string; emoji: string }> = {
  minimal_luxury: { label: "Minimal Luxury", emoji: "🕊️" },
  streetwear: { label: "Streetwear", emoji: "🛹" },
  old_money: { label: "Old Money", emoji: "🏛️" },
  scandi: { label: "Scandinave", emoji: "❄️" },
  boho: { label: "Bohème", emoji: "🌾" },
  classic: { label: "Classique", emoji: "🎩" },
  parisian: { label: "Parisien", emoji: "🥐" },
  romantic: { label: "Romantique", emoji: "🌷" },
  avant_garde: { label: "Avant-garde", emoji: "🎭" },
  athleisure: { label: "Athleisure", emoji: "🏃" },
  coastal: { label: "Coastal", emoji: "🌊" },
  dark_academia: { label: "Dark Academia", emoji: "📚" },
};

const TRIGGER_LABEL: Record<StyleSnapshot["trigger"], string> = {
  onboarding: "Onboarding",
  like: "J'aime ❤️",
  dislike: "Je n'aime pas 👎",
  reset: "Réinitialisé",
};

const LINE_COLORS = ["#a78bfa", "#e8609e", "#ff9e6b", "#34c3a2", "#8ec5e8"];

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function EvolutionPage() {
  const [data, setData] = useState<EvolutionResponse | null>(null);

  useEffect(() => {
    api<EvolutionResponse>("/api/evolution").then(setData).catch(() => {});
  }, []);

  const { snapshots, likedOutfits, stats } = data ?? { snapshots: [], likedOutfits: [], stats: { snapshots: 0, likes: 0, firstAt: null, lastAt: null } };

  const tracked = useMemo(() => {
    const count = new Map<string, number>();
    for (const s of snapshots) {
      for (const [id, pct] of Object.entries(s.dna.archetypes)) {
        count.set(id, (count.get(id) ?? 0) + pct);
      }
    }
    return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id]) => id);
  }, [snapshots]);

  const hasEvolution = snapshots.length >= 2;

  if (!data) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="text-sm text-muted">Chargement de ton évolution…</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <SectionTitle
        kicker="Ton moat"
        title="Mon évolution de style"
        sub="Chaque like, chaque dislike, chaque essai affine la façon dont Oryvia te comprend. Voici ta trajectoire."
      />

      {snapshots.length === 0 ? (
        <EmptyState
          emoji="📈"
          title="Ton histoire commence ici"
          sub="Crée des tenues et note-les avec ❤️ / 👎 : Oryvia enregistrera l'évolution de ton Style DNA."
          action={
            <Link href="/studio" className="rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white">
              Générer ma première tenue
            </Link>
          }
        />
      ) : (
        <>
          {/* stats */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            <Stat value={`${stats.snapshots}`} label="Étapes enregistrées" />
            <Stat value={`${stats.likes}`} label="Looks approuvés ❤️" />
            <Stat value={stats.firstAt ? fmtDate(stats.firstAt) : "—"} label="Début du suivi" />
          </div>

          {/* evolution chart */}
          <Card className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-cream">
                <TrendIcon className="h-4 w-4 text-rose" /> Évolution de tes archétypes
              </p>
              {!hasEvolution && <span className="text-xs text-muted">Encore une étape pour tracer la courbe</span>}
            </div>

            {hasEvolution ? (
              <>
                <EvolutionChart snapshots={snapshots} tracked={tracked} />
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                  {tracked.map((id, i) => (
                    <span key={id} className="flex items-center gap-1.5 text-xs text-muted">
                      <span className="h-2 w-2 rounded-full" style={{ background: LINE_COLORS[i % LINE_COLORS.length] }} />
                      {ARCHETYPE_META[id]?.emoji} {ARCHETYPE_META[id]?.label ?? id}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-6 text-center text-sm text-muted">Ta courbe apparaîtra dès que tu auras noté des tenues.</p>
            )}
          </Card>

          {/* timeline */}
          <div className="mb-8">
            <h2 className="mb-4 font-display text-xl text-cream">Chronologie</h2>
            <div className="relative space-y-4 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
              {[...snapshots].reverse().map((s) => {
                const top = Object.entries(s.dna.archetypes).sort((a, b) => b[1] - a[1]).slice(0, 3);
                const dominant = top[0];
                const meta = ARCHETYPE_META[dominant[0]] ?? { label: dominant[0], emoji: "✦" };
                return (
                  <div key={s.id} className="relative flex gap-4 pl-0">
                    <span
                      className={cx(
                        "relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm",
                        s.trigger === "like" ? "bg-brand-gradient" : s.trigger === "dislike" ? "bg-white/10" : "bg-card border border-white/15"
                      )}
                    >
                      {s.trigger === "like" ? "❤️" : s.trigger === "dislike" ? "👎" : s.trigger === "onboarding" ? "🧬" : "↺"}
                    </span>
                    <Card className="flex-1 !p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-cream">
                            {meta.emoji} {meta.label} {dominant[1]}%
                          </p>
                          <p className="text-xs text-muted">{fmtDate(s.createdAt)} · {TRIGGER_LABEL[s.trigger]}</p>
                        </div>
                        <div className="flex gap-1.5">
                          {s.dna.palette.slice(0, 5).map((c, i) => (
                            <span key={i} className="h-5 w-5 rounded-full border border-white/20" style={{ background: c }} />
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {top.map(([id, pct]) => (
                          <span key={id} className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] text-muted">
                            {ARCHETYPE_META[id]?.label ?? id} · {pct}%
                          </span>
                        ))}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {/* liked gallery */}
          <div>
            <h2 className="mb-4 font-display text-xl text-cream">Tes looks approuvés</h2>
            {likedOutfits.length === 0 ? (
              <Card className="text-center text-sm text-muted">
                Aucun look liké pour l'instant. Clique sur ❤️ sous une tenue générée.
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {likedOutfits.slice(0, 6).map((o) => (
                  <OutfitCard key={o.id} look={o.look} compact outfitId={o.id} feedback={o.feedback} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <Card className="p-4">
      <p className="font-display text-2xl text-cream">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </Card>
  );
}

function EvolutionChart({ snapshots, tracked }: { snapshots: StyleSnapshot[]; tracked: string[] }) {
  const W = 600;
  const H = 200;
  const padX = 30;
  const padY = 14;

  const pointsFor = (id: string) =>
    snapshots.map((s, i) => {
      const x = padX + (i / Math.max(1, snapshots.length - 1)) * (W - padX * 2);
      const y = H - padY - (s.dna.archetypes[id] ?? 0) * ((H - padY * 2) / 100);
      return { x, y };
    });

  const pathFor = (id: string) =>
    pointsFor(id)
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* gridlines */}
      {[0, 25, 50, 75, 100].map((v) => {
        const y = H - padY - v * ((H - padY * 2) / 100);
        return (
          <g key={v}>
            <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={padX - 6} y={y + 3} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.35)">
              {v}
            </text>
          </g>
        );
      })}
      {tracked.map((id, i) => (
        <g key={id}>
          <path d={pathFor(id)} fill="none" stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {pointsFor(id).map((p, j) => (
            <circle key={j} cx={p.x} cy={p.y} r="3" fill={LINE_COLORS[i % LINE_COLORS.length]} />
          ))}
        </g>
      ))}
    </svg>
  );
}
