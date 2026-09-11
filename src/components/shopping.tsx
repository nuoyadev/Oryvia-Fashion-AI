"use client";

import { CATEGORY_EMOJI, type ShoppingItem } from "@/client/types";
import { Card } from "./ui";

export function ShoppingListView({
  budget,
  items,
  total,
  goal,
}: {
  budget: number;
  items: ShoppingItem[];
  total: number;
  goal?: string;
}) {
  const remaining = Math.max(0, budget - total);
  return (
    <div className="space-y-2">
      {goal && <p className="mb-3 text-sm text-muted">Objectif : {goal}</p>}
      {items.map((item, i) => (
        <a
          key={`${item.name}-${i}`}
          href={item.url ?? undefined}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 transition-colors hover:border-white/20"
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{ background: item.color, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}
          >
            {CATEGORY_EMOJI[item.category]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-cream">{item.name}</p>
            <p className="truncate text-xs text-muted">{item.brand} · {item.reason}</p>
          </div>
          <span className="shrink-0 text-sm font-bold tabular-nums text-cream">{item.price} €</span>
        </a>
      ))}
      <div className="flex items-center justify-between rounded-2xl bg-white/[0.05] px-4 py-3">
        <span className="text-sm text-muted">Total</span>
        <span className="font-display text-lg text-cream">{total} €</span>
      </div>
      <p className="text-xs text-muted">
        Budget : {budget} € · restant : {remaining} €
      </p>
    </div>
  );
}

export function SavedShoppingCard({ list }: { list: import("@/client/types").ShoppingList }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-cream">{list.goal || "Liste shopping"}</p>
        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-muted">{list.budget} €</span>
      </div>
      <ShoppingListView budget={list.budget} items={list.items} total={list.total} />
    </Card>
  );
}
