"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/client/lib/api";
import { useApp } from "@/client/state";
import { Button, Card, EmptyState, SectionTitle, Spinner } from "@/components/ui";
import { StyleDnaCard } from "@/components/styledna";
import type { StyleDna } from "@/client/types";

interface StyleResponse {
  base: StyleDna | null;
  effective: StyleDna | null;
  stats: { likes: number; dislikes: number; total: number };
}

export default function StylePage() {
  const { user, toast } = useApp();
  const [data, setData] = useState<StyleResponse | null>(null);
  const [resetting, setResetting] = useState(false);

  const load = () => api<StyleResponse>("/api/style").then(setData).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const body = user?.bodyProfile;
  const dna = data?.effective ?? user?.styleDna;

  if (!dna || !body) {
    return (
      <EmptyState
        emoji="🧬"
        title="Ton Style DNA n'est pas encore créé"
        sub="Réponds au questionnaire pour révéler ton identité stylistique complète."
        action={
          <Link href="/onboarding" className="rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white">
            Créer mon Style DNA
          </Link>
        }
      />
    );
  }

  const hasFeedback = (data?.stats.total ?? 0) > 0;
  const shapeLabel =
    { hourglass: "Sablier", rectangle: "Rectangle", inverted_triangle: "Triangle inversé", triangle: "Triangle", oval: "Ovale", athletic: "Athlétique" }[body.bodyShape ?? "rectangle"] ?? body.bodyShape;

  const advice = shapeAdvice(body.bodyShape ?? "rectangle");

  async function reset() {
    setResetting(true);
    try {
      await api("/api/style/reset", { method: "POST" });
      toast("Feedback réinitialisé — retour à ton Style DNA d'origine.");
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <SectionTitle
        kicker="Identité stylistique"
        title="Your Style DNA"
        sub={dna.vibe}
        action={
          hasFeedback ? (
            <Button variant="secondary" size="sm" onClick={reset} loading={resetting}>
              Réinitialiser
            </Button>
          ) : undefined
        }
      />

      {hasFeedback && (
        <Card className="mb-6 border-rose/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <p className="text-sm font-semibold text-cream">Ton style s'affine avec tes retours</p>
                <p className="text-xs text-muted">
                  {data!.stats.likes} ❤️ · {data!.stats.dislikes} 👎 — chaque like renforce une direction, chaque dislike l'éloigne.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                {data!.stats.likes} j'aime
              </span>
              <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-muted">
                {data!.stats.dislikes} je n'aime pas
              </span>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <StyleDnaCard dna={dna} body={body} />
        </div>
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Ta morphologie</p>
            <p className="mt-2 font-display text-xl text-cream">{shapeLabel}</p>
            <p className="mt-1 text-sm text-muted">{shapeDesc(body.bodyShape ?? "rectangle")}</p>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose">À privilégier</p>
            <ul className="mt-3 space-y-2">
              {advice.do.map((d, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted">
                  <span className="text-emerald-400">✓</span> {d}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-coral">À éviter</p>
            <ul className="mt-3 space-y-2">
              {advice.avoid.map((d, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted">
                  <span className="text-rose">✕</span> {d}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="text-xs leading-relaxed text-muted">
            <p className="mb-1.5 font-semibold text-cream">💡 Comment ça marche</p>
            Like une tenue générée dans le Studio ou via le chat : Oryvia augmente les archétypes et les couleurs de ce look dans ton DNA. Dislike : il les atténue. Tu peux réinitialiser à tout moment pour revenir à ton profil d'onboarding.
          </Card>
        </div>
      </div>
    </div>
  );
}

function shapeAdvice(shape: string): { do: string[]; avoid: string[] } {
  const map: Record<string, { do: string[]; avoid: string[] }> = {
    hourglass: {
      do: ["Vestes cintrées qui soulignent la taille", "Pantalons taille haute et droits", "Robes portefeuille", "Ceintures pour accentuer la taille"],
      avoid: ["Coupes oversized qui noient la silhouette", "Tissus rigides sans structure"],
    },
    rectangle: {
      do: ["Vestes structurées pour créer des épaules", "Jeux de volumes", "Tailles marquées", "Superpositions"],
      avoid: ["Coupes droites monotones", "Tissus mous sans tenue"],
    },
    inverted_triangle: {
      do: ["Bas fluides et évasés", "Cols V qui allongent le buste", "Pantalons larges ou cargos", "Sombres en haut, clairs en bas"],
      avoid: ["Épaules structurées imposantes", "Volumes en haut"],
    },
    triangle: {
      do: ["Hauts clairs et structurés", "Vestes à épaules marquées", "Pantalons droits ou fuselés", "Détails au niveau du buste"],
      avoid: ["Bas très serrés ou brillants", "Poches volumineuses sur les hanches"],
    },
    oval: {
      do: ["Coupes fluides qui tombent", "Vestes longues non boutonnées", "Cols V dégagés", "Monochromes allongeants"],
      avoid: ["Tissus moulants", "Ceintures serrées", "Imprimés chargés"],
    },
    athletic: {
      do: ["Pantalons amples ou cargos", "Hauts ajustés", "Layering souple", "Couleurs et détails en bas"],
      avoid: ["Épaules encore plus élargies", "Bas trop moulants"],
    },
  };
  return map[shape] ?? map.rectangle;
}

function shapeDesc(shape: string): string {
  const map: Record<string, string> = {
    hourglass: "Épaules et hanches alignées, taille marquée.",
    rectangle: "Épaules, taille et hanches sur la même ligne.",
    inverted_triangle: "Épaules plus larges que les hanches.",
    triangle: "Hanches plus larges que les épaules.",
    oval: "Silhouette ronde, centre du corps présent.",
    athletic: "Épaules développées, taille fine.",
  };
  return map[shape] ?? "";
}
