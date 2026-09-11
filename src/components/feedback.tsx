"use client";

import { useState } from "react";
import { api } from "@/client/lib/api";
import { useApp } from "@/client/state";
import { cx } from "./ui";
import type { Outfit } from "@/client/types";

export function FeedbackButtons({
  outfitId,
  feedback,
  onFeedback,
  size = "md",
}: {
  outfitId: string;
  feedback: Outfit["feedback"];
  onFeedback?: (fb: Outfit["feedback"]) => void;
  size?: "sm" | "md";
}) {
  const { toast } = useApp();
  const [busy, setBusy] = useState(false);

  async function send(fb: "like" | "dislike" | null) {
    // toggle off when clicking the same state
    const next = feedback === fb ? null : fb;
    setBusy(true);
    try {
      await api<Outfit>(`/api/outfits/${outfitId}`, {
        method: "POST",
        body: JSON.stringify({ feedback: next }),
      });
      onFeedback?.(next);
      if (next === "like") toast("Noté ! J'affine ton Style DNA ❤️");
      else if (next === "dislike") toast("Compris, j'ajuste ton profil 👎");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  const dims = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => send("like")}
        aria-label="J'aime"
        className={cx(
          "flex items-center justify-center rounded-full border transition-all active:scale-95 disabled:opacity-50",
          dims,
          feedback === "like"
            ? "border-transparent bg-brand-gradient text-white shadow-[0_4px_16px_-4px_rgba(232,96,158,0.7)]"
            : "border-white/10 bg-white/[0.04] text-muted hover:border-rose/50 hover:text-rose"
        )}
      >
        ♥
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => send("dislike")}
        aria-label="Je n'aime pas"
        className={cx(
          "flex items-center justify-center rounded-full border transition-all active:scale-95 disabled:opacity-50",
          dims,
          feedback === "dislike"
            ? "border-white/20 bg-white/[0.12] text-cream"
            : "border-white/10 bg-white/[0.04] text-muted hover:border-white/30 hover:text-cream"
        )}
      >
        ✕
      </button>
    </div>
  );
}
