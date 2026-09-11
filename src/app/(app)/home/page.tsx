"use client";

import Link from "next/link";
import { useApp } from "@/client/state";
import { Card, SectionTitle } from "@/components/ui";
import { OutfitCard } from "@/components/outfit";
import { ArrowIcon, BagIcon, ChatIcon, HangerIcon, ImageIcon, SparklesIcon } from "@/components/icons";
import { CATEGORY_LABELS, type ClosetCategory } from "@/client/types";

export default function HomePage() {
  const { user, closet, outfits, shopping, inspiration, refreshOutfits } = useApp();

  const name = user?.name ?? "toi";
  const topArchetype = user?.styleDna
    ? Object.entries(user.styleDna.archetypes).sort((a, b) => b[1] - a[1])[0]
    : null;

  const catCount = (c: ClosetCategory) => closet.filter((i) => i.category === c).length;
  const combos =
    Math.max(1, catCount("tops")) * Math.max(1, catCount("bottoms")) * Math.max(1, catCount("shoes"));

  const latest = outfits[0];

  return (
    <div className="animate-fade-up">
      <SectionTitle
        kicker="Aujourd'hui"
        title={`Bonjour, ${name} 👋`}
        sub={
          topArchetype
            ? `Ta signature du moment : ${topArchetype[0].replace(/_/g, " ")} à ${topArchetype[1]}%.`
            : "Complète ton Style DNA pour des recommandations sur mesure."
        }
      />

      {/* stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard value={`${closet.length}`} label="Pièces au dressing" emoji="👗" />
        <StatCard value={`${combos}`} label="Combinaisons possibles" emoji="✨" />
        <StatCard value={`${outfits.length}`} label="Tenues créées" emoji="🪡" />
        <StatCard value={`${shopping.length}`} label="Listes shopping" emoji="🛍️" />
      </div>

      {/* quick actions */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <QuickAction href="/studio" emoji="🪄" title="Créer une tenue" sub="Studio IA" gradient />
        <QuickAction href="/closet" emoji="🧺" title="Scanner mon dressing" sub="Ajouter des pièces" />
        <QuickAction href="/inspiration" emoji="📌" title="Ajouter des inspirations" sub="Pinterest & co" />
        <QuickAction href="/shopping" emoji="🛒" title="Liste shopping" sub="Avec mon budget" />
      </div>

      {/* try-on + 3D CTA */}
      <div className="mb-8 grid gap-3 md:grid-cols-2">
        <Link
          href="/dressing"
          className="flex items-center gap-4 rounded-3xl border border-white/10 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-rose/40"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-2xl">
            🧍
          </span>
          <div className="flex-1">
            <p className="font-display text-lg text-cream">Ton dressing en 3D</p>
            <p className="text-sm text-muted">
              Ton avatar 3D habillé avec tes vêtements et leurs vraies couleurs.
            </p>
          </div>
          <ArrowIcon className="h-5 w-5 text-rose" />
        </Link>
        <Link
          href="/tryon"
          className="flex items-center gap-4 rounded-3xl border border-white/10 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-rose/40"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-2xl">
            📷
          </span>
          <div className="flex-1">
            <p className="font-display text-lg text-cream">Essaye une tenue en temps réel</p>
            <p className="text-sm text-muted">
              Ta caméra analyse ton teint et te dit si ces couleurs te mettent en valeur.
            </p>
          </div>
          <ArrowIcon className="h-5 w-5 text-rose" />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* latest outfit */}
        <div className="lg:col-span-3">
          {latest ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-xl text-cream">Dernière tenue</h2>
                <Link href="/studio" className="flex items-center gap-1 text-sm text-rose hover:underline">
                  Studio <ArrowIcon className="h-4 w-4" />
                </Link>
              </div>
              <OutfitCard
                look={latest.look}
                compact
                outfitId={latest.id}
                feedback={latest.feedback}
                onFeedback={() => refreshOutfits()}
              />
            </div>
          ) : (
            <Card className="flex h-full flex-col items-start justify-center gap-4 p-7">
              <div className="text-3xl">🪄</div>
              <div>
                <h2 className="font-display text-xl text-cream">Ta première tenue t'attend</h2>
                <p className="mt-1 text-sm text-muted">
                  Dis-moi une occasion et je compose un look complet avec ton dressing.
                </p>
              </div>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white"
              >
                <SparklesIcon className="h-4 w-4" /> Ouvrir le Studio
              </Link>
            </Card>
          )}
        </div>

        {/* right rail */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Ton dressing</p>
            <div className="mt-3 space-y-2">
              {(["tops", "bottoms", "outerwear", "dresses", "shoes", "accessories"] as ClosetCategory[]).map((c) => (
                <div key={c} className="flex items-center justify-between text-sm">
                  <span className="text-muted">{CATEGORY_LABELS[c]}</span>
                  <span className="tabular-nums font-semibold text-cream">{catCount(c)}</span>
                </div>
              ))}
            </div>
            {closet.length === 0 && (
              <Link href="/closet" className="mt-4 flex items-center gap-2 text-sm text-rose hover:underline">
                <HangerIcon className="h-4 w-4" /> Ajouter mes vêtements
              </Link>
            )}
          </Card>

          <Card className="bg-brand-gradient bg-clip-padding">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                <ChatIcon className="h-6 w-6 text-white" />
              </span>
              <div>
                <p className="font-display text-lg text-white">Parle à ton styliste</p>
                <p className="mt-0.5 text-sm text-white/80">
                  « Une tenue pour un mariage à Bordeaux » — il s'occupe du reste.
                </p>
                <Link href="/chat" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline">
                  Discuter <ArrowIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Card>

          <Card>
            <div className="grid grid-cols-3 gap-2 text-center">
              <MiniLink href="/style" icon={BagIcon} label="Style DNA" />
              <MiniLink href="/inspiration" icon={ImageIcon} label={`${inspiration.length} inspo`} />
              <MiniLink href="/shopping" icon={BagIcon} label={`${shopping.length} listes`} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, emoji }: { value: string; label: string; emoji: string }) {
  return (
    <Card className="p-4">
      <div className="text-xl">{emoji}</div>
      <div className="mt-2 font-display text-2xl text-cream">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </Card>
  );
}

function QuickAction({ href, emoji, title, sub, gradient }: { href: string; emoji: string; title: string; sub: string; gradient?: boolean }) {
  return (
    <Link
      href={href}
      className={`group rounded-3xl border p-4 transition-all hover:-translate-y-0.5 ${
        gradient ? "border-transparent bg-brand-gradient text-white" : "border-white/[0.07] bg-card"
      }`}
    >
      <div className="text-2xl">{emoji}</div>
      <div className={`mt-2 text-sm font-semibold ${gradient ? "text-white" : "text-cream"}`}>{title}</div>
      <div className={`text-xs ${gradient ? "text-white/80" : "text-muted"}`}>{sub}</div>
    </Link>
  );
}

function MiniLink({ href, icon: Icon, label }: { href: string; icon: typeof BagIcon; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1.5 rounded-2xl p-2 text-muted hover:bg-white/[0.04] hover:text-cream">
      <Icon className="h-5 w-5" />
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
}
