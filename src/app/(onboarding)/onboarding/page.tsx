"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/client/lib/api";
import { useApp } from "@/client/state";
import { Button, Chip, Field, Input, Select, Swatch, cx } from "@/components/ui";
import { COLORS } from "@/client/colors";
import {
  BODY_SHAPES,
  BRAND_OPTIONS,
  BUDGET_TIERS,
  EYE_COLORS,
  GOAL_OPTIONS,
  HAIR_COLORS,
  LIFESTYLE_OPTIONS,
  SKIN_TONES,
  type BodyProfile,
  type Gender,
  type StyleDnaInput,
  type User,
} from "@/client/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useApp();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  // body
  const [gender, setGender] = useState<Gender | null>(null);
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [age, setAge] = useState("");
  const [bodyShape, setBodyShape] = useState<string | null>(null);
  const [skinTone, setSkinTone] = useState(SKIN_TONES[1].id);
  const [hairColor, setHairColor] = useState("brun");
  const [eyeColor, setEyeColor] = useState("marron");

  // style
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [styleWords, setStyleWords] = useState("");
  const [budgetTier, setBudgetTier] = useState<StyleDnaInput["budgetTier"]>("contemporary");
  const [budget, setBudget] = useState(250);

  const totalSteps = 3;
  const canNext = useMemo(() => {
    if (step === 0) return !!gender && !!bodyShape && !!heightCm && !!weightKg && !!age;
    if (step === 1) return favoriteColors.length >= 2 && lifestyle.length >= 1;
    return true;
  }, [step, gender, bodyShape, heightCm, weightKg, age, favoriteColors, lifestyle]);

  function toggle(set: React.Dispatch<React.SetStateAction<string[]>>, value: string) {
    set((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : prev.length >= 6 ? prev : [...prev, value]));
  }

  async function finish() {
    setBusy(true);
    const bodyProfile: BodyProfile = {
      heightCm: Number(heightCm) || null,
      weightKg: Number(weightKg) || null,
      age: Number(age) || null,
      gender,
      bodyShape: bodyShape as BodyProfile["bodyShape"],
      skinTone,
      hairColor,
      eyeColor,
      lifestyle,
      goals,
      sizes: {},
    };
    const styleInput: StyleDnaInput = {
      lifestyle,
      goals,
      brands,
      favoriteColors,
      styleWords,
      inspirationTags: [],
      budget,
      budgetTier,
    };
    try {
      await api<User>("/api/profile", { method: "POST", body: JSON.stringify({ bodyProfile, styleInput }) });
      toast("Ton Style DNA est prêt ✨");
      router.replace("/home");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-8">
      {/* progress */}
      <div className="mb-8 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted">
          Étape {step + 1}/{totalSteps}
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={cx("h-1.5 rounded-full transition-all", i <= step ? "w-8 bg-brand-gradient" : "w-4 bg-white/10")}
            />
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="animate-fade-up space-y-7">
          <header>
            <h1 className="font-display text-3xl text-cream">Fais connaissance avec ton corps</h1>
            <p className="mt-2 text-sm text-muted">
              Ces informations restent chiffrées et ne servent qu'à adapter les coupes et les couleurs à ta morphologie.
            </p>
          </header>

          <Field label="Comment t'habilles-tu ?">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "woman", label: "Femme" },
                { id: "man", label: "Homme" },
                { id: "non_binary", label: "Non-binaire" },
                { id: "prefer_not_say", label: "Je préfère ne pas dire" },
              ].map((g) => (
                <Chip key={g.id} active={gender === g.id} onClick={() => setGender(g.id as Gender)}>
                  {g.label}
                </Chip>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Taille (cm)">
              <Input type="number" inputMode="decimal" placeholder="170" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            </Field>
            <Field label="Poids (kg)">
              <Input type="number" inputMode="decimal" placeholder="65" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </Field>
            <Field label="Âge">
              <Input type="number" inputMode="numeric" placeholder="28" value={age} onChange={(e) => setAge(e.target.value)} />
            </Field>
          </div>

          <Field label="Ta morphologie">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {BODY_SHAPES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setBodyShape(s.id)}
                  className={cx(
                    "rounded-2xl border p-4 text-left transition-all",
                    bodyShape === s.id ? "border-rose/70 bg-rose/10" : "border-white/[0.07] bg-white/[0.03] hover:border-white/20"
                  )}
                >
                  <div className="text-xl">{s.emoji}</div>
                  <div className="mt-1.5 text-sm font-semibold text-cream">{s.label}</div>
                  <div className="mt-0.5 text-xs text-muted">{s.hint}</div>
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Peau">
              <Select value={skinTone} onChange={(e) => setSkinTone(e.target.value)}>
                {SKIN_TONES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Cheveux">
              <Select value={hairColor} onChange={(e) => setHairColor(e.target.value)}>
                {HAIR_COLORS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </Select>
            </Field>
            <Field label="Yeux">
              <Select value={eyeColor} onChange={(e) => setEyeColor(e.target.value)}>
                {EYE_COLORS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="animate-fade-up space-y-7">
          <header>
            <h1 className="font-display text-3xl text-cream">Qu'est-ce qui te fait vibrer ?</h1>
            <p className="mt-2 text-sm text-muted">
              Oryvia ne fait pas dans le sobre : choisis les couleurs qui te ressemblent, elles deviendront ta signature.
            </p>
          </header>

          <Field label={`Tes couleurs (${favoriteColors.length}/6)`} hint="Sélectionne 2 à 6 couleurs que tu adores porter.">
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <div key={c.hex} className="flex flex-col items-center gap-1">
                  <Swatch
                    color={c.hex}
                    label={c.name}
                    active={favoriteColors.includes(c.hex)}
                    onClick={() => toggle(setFavoriteColors, c.hex)}
                  />
                  <span className="text-[9px] text-muted">{c.name}</span>
                </div>
              ))}
            </div>
          </Field>

          <Field label={`Tes marques préférées (${brands.length}/6)`}>
            <div className="flex flex-wrap gap-2">
              {BRAND_OPTIONS.map((b) => (
                <Chip key={b} active={brands.includes(b)} onClick={() => toggle(setBrands, b)}>
                  {b}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Ton quotidien" hint="Choisis ce qui décrit le mieux ta vie.">
            <div className="flex flex-wrap gap-2">
              {LIFESTYLE_OPTIONS.map((l) => (
                <Chip key={l} active={lifestyle.includes(l)} onClick={() => toggle(setLifestyle, l)}>
                  {l}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Ton objectif style">
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((g) => (
                <Chip key={g} active={goals.includes(g)} onClick={() => toggle(setGoals, g)}>
                  {g}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Décris ton style en quelques mots" hint="Ex. : minimal luxe, oversize, années 90, tailleur…">
            <Input placeholder="minimal, tailleur, sneakers blanches…" value={styleWords} onChange={(e) => setStyleWords(e.target.value)} />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-up space-y-7">
          <header>
            <h1 className="font-display text-3xl text-cream">Ton budget mode</h1>
            <p className="mt-2 text-sm text-muted">Pour des recommandations shopping toujours réalistes.</p>
          </header>

          <div className="grid grid-cols-2 gap-2.5">
            {BUDGET_TIERS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setBudgetTier(t.id);
                  setBudget(t.id === "essential" ? 80 : t.id === "contemporary" ? 250 : t.id === "premium" ? 600 : 1200);
                }}
                className={cx(
                  "rounded-2xl border p-4 text-left transition-all",
                  budgetTier === t.id ? "border-rose/70 bg-rose/10" : "border-white/[0.07] bg-white/[0.03] hover:border-white/20"
                )}
              >
                <div className="text-sm font-semibold text-cream">{t.label}</div>
                <div className="mt-0.5 text-xs text-muted">{t.range}</div>
              </button>
            ))}
          </div>

          <Field label={`Budget mensuel : ${budget} €`}>
            <input
              type="range"
              min={20}
              max={2000}
              step={10}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full"
            />
          </Field>

          <div className="rounded-3xl border border-white/[0.07] bg-card p-5 text-sm text-muted">
            <p className="font-semibold text-cream">🔒 Tes données</p>
            <p className="mt-1.5">
              Chaque photo est chiffrée (AES-256) avec une clé qui t'appartient. Même Oryvia ne peut pas lire tes images sans toi.
            </p>
          </div>
        </div>
      )}

      {/* footer */}
      <div className="mt-auto flex items-center justify-between pt-10">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          ← Retour
        </Button>
        {step < totalSteps - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
            Continuer →
          </Button>
        ) : (
          <Button onClick={finish} loading={busy}>
            Créer mon Style DNA ✨
          </Button>
        )}
      </div>
    </div>
  );
}
