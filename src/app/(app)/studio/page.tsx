"use client";

import { useState } from "react";
import { api } from "@/client/lib/api";
import { useApp } from "@/client/state";
import { Button, Card, EmptyState, Field, Input, SectionTitle, Select, Spinner } from "@/components/ui";
import { OutfitCard } from "@/components/outfit";
import { fetchWeather } from "@/client/lib/weather";
import { OCCASIONS, type Outfit, type WeatherInfo } from "@/client/types";

export default function StudioPage() {
  const { refreshOutfits, toast } = useApp();
  const [occasion, setOccasion] = useState("everyday");
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<(Outfit & { weather?: WeatherInfo }) | null>(null);
  const [feedback, setFeedback] = useState<Outfit["feedback"]>(null);
  const [tab, setTab] = useState<"look" | "alt">("look");

  async function generate() {
    setBusy(true);
    try {
      const res = await api<Outfit & { weather?: WeatherInfo }>("/api/outfits", {
        method: "POST",
        body: JSON.stringify({ occasion, city: city.trim() || null }),
      });
      // Server couldn't reach the weather API? Try from the browser.
      if (!res.weather && city.trim()) {
        const wx = await fetchWeather(city.trim());
        if (wx) res.weather = wx;
      }
      setResult(res);
      setFeedback(res.feedback ?? null);
      setTab("look");
      await refreshOutfits();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  const weather = result?.weather;
  const weatherLine = weather ? `${weather.icon} ${weather.tempC}°C · ${weather.description} à ${weather.city}` : undefined;

  return (
    <div className="animate-fade-up">
      <SectionTitle
        kicker="AI Outfit Generator"
        title="Studio tenue"
        sub="Choisis l'occasion (et ta ville pour la météo) — Oryvia compose avec ton corps, ton style et ton dressing."
      />

      <Card className="mb-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Field label="Occasion">
            <Select value={occasion} onChange={(e) => setOccasion(e.target.value)}>
              {OCCASIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.emoji} {o.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Ville (pour la météo)" hint="Optionnel">
            <Input placeholder="Paris" value={city} onChange={(e) => setCity(e.target.value)} />
          </Field>
          <div className="flex items-end">
            <Button onClick={generate} loading={busy} className="w-full sm:w-auto">
              Générer ma tenue ✨
            </Button>
          </div>
        </div>
      </Card>

      {!result && !busy && (
        <EmptyState
          emoji="🪄"
          title="Prête à composer ?"
          sub="« J'ai un mariage samedi », « un look business casual »… choisis l'occasion et laisse Oryvia faire."
        />
      )}

      {busy && (
        <div className="flex flex-col items-center gap-4 py-16">
          <Spinner className="h-7 w-7" />
          <p className="text-sm text-muted">Oryvia compose ton look…</p>
        </div>
      )}

      {result && !busy && (
        <div>
          <div className="mb-4 flex gap-2">
            <Button variant={tab === "look" ? "primary" : "secondary"} size="sm" onClick={() => setTab("look")}>
              Ma tenue
            </Button>
            {result.alternatives.map((_, i) => (
              <Button key={i} variant={tab === `alt${i}` ? "primary" : "secondary"} size="sm" onClick={() => setTab(`alt${i}` as "look")}>
                Variante {i + 1}
              </Button>
            ))}
          </div>
          {tab === "look" ? (
            <OutfitCard
              look={result.look}
              weatherLine={weatherLine}
              outfitId={result.id}
              feedback={feedback}
              onFeedback={(fb) => {
                setFeedback(fb);
                refreshOutfits();
              }}
            />
          ) : (
            <OutfitCard look={result.alternatives[Number(tab.replace("alt", ""))]} />
          )}
        </div>
      )}
    </div>
  );
}
