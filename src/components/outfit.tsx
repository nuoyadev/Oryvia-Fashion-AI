"use client";

import { CATEGORY_EMOJI, type OutfitLook, type OutfitPiece } from "@/client/types";
import { Card, cx } from "./ui";

function PieceRow({ piece, index }: { piece: OutfitPiece; index: number }) {
  const fromCloset = piece.kind === "closet";
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ background: piece.color ?? "#333", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}
      >
        {CATEGORY_EMOJI[piece.category]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-cream">{piece.name}</span>
          {fromCloset && (
            <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              Dans ton dressing
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted">
          {piece.brand ? `${piece.brand} · ` : ""}
          {piece.color ? piece.color : ""}
          {piece.price ? ` · ${piece.price} €` : ""}
        </p>
      </div>
      {piece.reason && (
        <span className="hidden max-w-[10rem] shrink-0 text-right text-[11px] leading-tight text-muted sm:block">
          {piece.reason}
        </span>
      )}
    </div>
  );
}

export function OutfitCard({
  look,
  weatherLine,
  compact,
  footer,
}: {
  look: OutfitLook;
  weatherLine?: string;
  compact?: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <Card className={cx("overflow-hidden", compact && "p-0")}>
      <div className={cx(compact ? "p-4" : "p-5")}>
        <div className="mb-1 flex items-center justify-between gap-3">
          <h3 className="font-display text-xl text-cream">{look.name}</h3>
          {weatherLine && <span className="shrink-0 text-xs text-muted">{weatherLine}</span>}
        </div>
        {look.description && <p className="mb-4 text-xs text-muted">{look.description}</p>}

        <div className="space-y-2">
          {look.items.map((piece, i) => (
            <PieceRow key={`${piece.name}-${i}`} piece={piece} index={i} />
          ))}
        </div>

        {look.palette.length > 0 && (
          <div className="mt-4 flex items-center gap-1.5">
            {look.palette.map((c, i) => (
              <span key={i} className="h-5 w-5 rounded-full border border-white/20" style={{ background: c }} />
            ))}
            <span className="ml-2 text-xs text-muted">Palette de la tenue</span>
          </div>
        )}

        <p className="mt-4 text-sm leading-relaxed text-muted">{look.explanation}</p>

        {look.tips.length > 0 && !compact && (
          <div className="mt-4 space-y-1.5 rounded-2xl bg-white/[0.03] p-4">
            {look.tips.map((tip, i) => (
              <p key={i} className="flex gap-2 text-xs text-muted">
                <span className="text-rose">✦</span>
                {tip}
              </p>
            ))}
          </div>
        )}
      </div>
      {footer}
    </Card>
  );
}
