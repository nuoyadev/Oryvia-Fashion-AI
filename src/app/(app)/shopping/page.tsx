"use client";

import { useState } from "react";
import { api } from "@/client/lib/api";
import { useApp } from "@/client/state";
import { Button, Card, EmptyState, Field, Input, SectionTitle, Textarea } from "@/components/ui";
import { ShoppingListView, SavedShoppingCard } from "@/components/shopping";
import type { ShoppingList } from "@/client/types";

export default function ShoppingPage() {
  const { shopping, refreshShopping, toast, user } = useApp();
  const [budget, setBudget] = useState(user?.styleDna?.budget ?? 300);
  const [goal, setGoal] = useState("");
  const [style, setStyle] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ShoppingList | null>(null);

  async function generate() {
    setBusy(true);
    try {
      const res = await api<ShoppingList>("/api/shopping", {
        method: "POST",
        body: JSON.stringify({ budget, goal: goal.trim(), style: style.trim() }),
      });
      setResult(res);
      await refreshShopping();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <SectionTitle
        kicker="Shopping AI Assistant"
        title="Shopping intelligent"
        sub="« Je veux un style old money avec 300 € » — Oryvia comble les manques de ton dressing en respectant ton budget."
      />

      <Card className="mb-6">
        <div className="grid gap-3 sm:grid-cols-[auto_1fr_1fr_auto]">
          <Field label={`Budget : ${budget} €`}>
            <input
              type="range"
              min={20}
              max={2000}
              step={10}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full sm:w-40"
            />
          </Field>
          <Field label="Objectif">
            <Input placeholder="Améliorer mon style streetwear" value={goal} onChange={(e) => setGoal(e.target.value)} />
          </Field>
          <Field label="Style visé (optionnel)">
            <Input placeholder="old money, minimal…" value={style} onChange={(e) => setStyle(e.target.value)} />
          </Field>
          <div className="flex items-end">
            <Button onClick={generate} loading={busy}>
              Créer ma sélection
            </Button>
          </div>
        </div>
      </Card>

      {result && !busy && (
        <Card className="mb-8">
          <p className="mb-4 font-display text-xl text-cream">Ta sélection ({result.total} €)</p>
          <ShoppingListView budget={result.budget} items={result.items} total={result.total} goal={result.goal} />
        </Card>
      )}

      {shopping.length > 0 ? (
        <div className="space-y-4">
          <h2 className="font-display text-xl text-cream">Listes précédentes</h2>
          {shopping.slice(0, 3).map((list) => (
            <SavedShoppingCard key={list.id} list={list} />
          ))}
        </div>
      ) : (
        !result && (
          <EmptyState
            emoji="🛍️"
            title="Pas encore de liste shopping"
            sub="Définis un objectif et un budget, Oryvia te compose une sélection de pièces cohérente avec ton style."
          />
        )
      )}
    </div>
  );
}
