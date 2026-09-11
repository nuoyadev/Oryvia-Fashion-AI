"use client";

import { clsx } from "clsx";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function cx(...args: (string | false | null | undefined)[]): string {
  return clsx(args);
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white",
        className
      )}
    />
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  loading,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}) {
  return (
    <button
      className={cx(
        "inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "px-3.5 py-2 text-sm",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-7 py-3.5 text-base",
        variant === "primary" && "bg-brand-gradient text-white shadow-[0_8px_30px_-8px_rgba(232,96,158,0.6)] hover:brightness-110",
        variant === "secondary" && "border border-white/10 bg-white/5 text-cream hover:bg-white/10",
        variant === "ghost" && "text-muted hover:bg-white/5 hover:text-cream",
        variant === "danger" && "bg-[#3a1622] text-[#ffb3c6] hover:bg-[#4a1c2a]",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cx("rounded-3xl border border-white/[0.07] bg-card p-5", className)}>
      {children}
    </div>
  );
}

export function Field({ label, hint, children }: { label?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>}
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted/80">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-cream outline-none transition-colors placeholder:text-muted/60 focus:border-violet/60 focus:bg-white/[0.06]",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cx(
        "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-cream outline-none transition-colors placeholder:text-muted/60 focus:border-violet/60 focus:bg-white/[0.06]",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cx(
        "w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-cream outline-none focus:border-violet/60",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
        active
          ? "border-transparent bg-brand-gradient text-white"
          : "border-white/10 bg-white/[0.04] text-muted hover:border-white/25 hover:text-cream",
        className
      )}
    >
      {children}
    </button>
  );
}

export function Swatch({ color, size = "md", active, onClick, label }: { color: string; size?: "sm" | "md" | "lg"; active?: boolean; onClick?: () => void; label?: string }) {
  const dims = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      style={{ background: color }}
      className={cx(
        "rounded-full border border-white/20 shadow-inner transition-transform hover:scale-110",
        dims,
        active && "ring-2 ring-white ring-offset-2 ring-offset-ink"
      )}
    />
  );
}

export function EmptyState({ emoji, title, sub, action }: { emoji: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 px-6 py-14 text-center">
      <div className="mb-3 text-4xl">{emoji}</div>
      <h3 className="font-display text-xl text-cream">{title}</h3>
      {sub && <p className="mt-1 max-w-sm text-sm text-muted">{sub}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center md:p-4" onClick={onClose}>
      <div
        className={cx(
          "max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-ink-2 p-6 md:rounded-3xl",
          wide ? "md:max-w-2xl" : "md:max-w-md"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-cream">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-muted hover:bg-white/5 hover:text-cream">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SectionTitle({ kicker, title, sub, action }: { kicker?: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {kicker && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose">{kicker}</p>}
        <h1 className="font-display text-3xl leading-tight text-cream md:text-4xl">{title}</h1>
        {sub && <p className="mt-1.5 max-w-xl text-sm text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
