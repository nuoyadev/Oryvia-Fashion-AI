"use client";

import Link from "next/link";
import { useApp } from "@/client/state";
import { Card, EmptyState, SectionTitle } from "@/components/ui";
import { StyleDnaCard } from "@/components/styledna";

export default function StylePage() {
  const { user } = useApp();
  const dna = user?.styleDna;
  const body = user?.bodyProfile;

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

  const shapeLabel =
    { hourglass: "Sablier", rectangle: "Rectangle", inverted_triangle: "Triangle inversé", triangle: "Triangle", oval: "Ovale", athletic: "Athlétique" }[body.bodyShape ?? "rectangle"] ?? body.bodyShape;

  const dos = shapeAdvice(body.bodyShape ?? "rectangle").do;
  const donts = shapeAdvice(body.bodyShape ?? "rectangle").avoid;

  return (
    <div className="animate-fade-up">
      <SectionTitle kicker="Identité stylistique" title="Your Style DNA" sub={dna.vibe} />

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
              {dos.map((d, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted">
                  <span className="text-emerald-400">✓</span> {d}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-coral">À éviter</p>
            <ul className="mt-3 space-y-2">
              {donts.map((d, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted">
                  <span className="text-rose">✕</span> {d}
                </li>
              ))}
            </ul>
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
