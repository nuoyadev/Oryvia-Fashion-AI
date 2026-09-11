"use client";

import type { StyleDna, BodyProfile } from "@/client/types";
import { Card } from "./ui";

const ARCHETYPE_LABELS: Record<string, { label: string; emoji: string }> = {
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

const SEASON_LABELS: Record<string, string> = {
  winter: "Hiver",
  summer: "Été",
  autumn: "Automne",
  spring: "Printemps",
};

export function StyleDnaCard({ dna, body }: { dna: StyleDna; body: BodyProfile | null }) {
  const entries = Object.entries(dna.archetypes).sort((a, b) => b[1] - a[1]);
  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-gradient opacity-20 blur-3xl" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">Your Style DNA</p>
        <h2 className="mt-2 font-display text-2xl text-cream">{dna.vibe.split("—")[0].trim()}</h2>
        {dna.colorSeason && (
          <p className="mt-1 text-sm text-muted">Saison colorimétrique : {SEASON_LABELS[dna.colorSeason] ?? dna.colorSeason}</p>
        )}

        <div className="mt-6 space-y-3">
          {entries.map(([id, pct]) => {
            const meta = ARCHETYPE_LABELS[id] ?? { label: id, emoji: "✦" };
            return (
              <div key={id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-cream">
                    {meta.emoji} {meta.label}
                  </span>
                  <span className="tabular-nums text-muted">{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-brand-gradient"
                    style={{ width: `${Math.max(3, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {dna.palette.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Couleurs préférées</p>
            <div className="flex flex-wrap gap-2">
              {dna.palette.map((c, i) => (
                <span key={i} className="h-9 w-9 rounded-full border border-white/20" style={{ background: c }} />
              ))}
            </div>
          </div>
        )}

        {dna.brands.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Marques</p>
            <div className="flex flex-wrap gap-1.5">
              {dna.brands.map((b) => (
                <span key={b} className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-muted">
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-3 border-t border-white/[0.06] pt-4 text-xs text-muted">
          {body?.heightCm ? <span>{body.heightCm} cm</span> : null}
          {body?.weightKg ? <span>{body.weightKg} kg</span> : null}
          {body?.age ? <span>{body.age} ans</span> : null}
          <span className="ml-auto font-semibold text-cream">{dna.budget} €/mois</span>
        </div>
      </div>
    </Card>
  );
}
