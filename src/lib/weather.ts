// ────────────────────────────────────────────────────────────────
// Oryvia — weather context (Open-Meteo, no API key required)
// ────────────────────────────────────────────────────────────────

import type { WeatherInfo } from "./types";

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

export async function geocodeCity(city: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { results?: GeoResult[] };
    return json.results?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function getWeather(latitude: number, longitude: number): Promise<WeatherInfo | null> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,weather_code,is_day`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number; is_day?: number };
    };
    const c = json.current;
    if (!c || c.temperature_2m === undefined) return null;
    const { condition, icon, description } = describeCode(c.weather_code ?? 0, c.is_day === 1);
    return {
      city: "",
      tempC: Math.round(c.temperature_2m),
      condition,
      icon,
      description,
    };
  } catch {
    return null;
  }
}

const CODES: Record<number, { fr: string; icon: string; day: string; night: string }> = {
  0: { fr: "Ciel dégagé", icon: "☀️", day: "Grand soleil", night: "Ciel clair" },
  1: { fr: "Plutôt dégagé", icon: "🌤️", day: "Largement ensoleillé", night: "Peu nuageux" },
  2: { fr: "Partiellement nuageux", icon: "⛅", day: "Éclaircies", night: "Éclaircies" },
  3: { fr: "Couvert", icon: "☁️", day: "Ciel voilé", night: "Ciel voilé" },
  45: { fr: "Brouillard", icon: "🌫️", day: "Brouillard", night: "Brouillard" },
  48: { fr: "Brouillard givrant", icon: "🌫️", day: "Brouillard givrant", night: "Brouillard givrant" },
  51: { fr: "Bruine légère", icon: "🌦️", day: "Bruine légère", night: "Bruine légère" },
  53: { fr: "Bruine", icon: "🌦️", day: "Bruine", night: "Bruine" },
  55: { fr: "Bruine dense", icon: "🌧️", day: "Bruine dense", night: "Bruine dense" },
  61: { fr: "Pluie légère", icon: "🌧️", day: "Pluie légère", night: "Pluie légère" },
  63: { fr: "Pluie", icon: "🌧️", day: "Pluie", night: "Pluie" },
  65: { fr: "Pluie forte", icon: "🌧️", day: "Pluie forte", night: "Pluie forte" },
  71: { fr: "Neige légère", icon: "🌨️", day: "Neige légère", night: "Neige légère" },
  73: { fr: "Neige", icon: "🌨️", day: "Neige", night: "Neige" },
  75: { fr: "Neige forte", icon: "❄️", day: "Neige forte", night: "Neige forte" },
  80: { fr: "Averses", icon: "🌧️", day: "Averses", night: "Averses" },
  81: { fr: "Averses", icon: "🌧️", day: "Averses", night: "Averses" },
  82: { fr: "Averses violentes", icon: "⛈️", day: "Averses violentes", night: "Averses violentes" },
  95: { fr: "Orage", icon: "⛈️", day: "Orage", night: "Orage" },
};

function describeCode(code: number, isDay: boolean): { condition: string; icon: string; description: string } {
  const c = CODES[code] ?? CODES[3];
  return {
    condition: c.fr,
    icon: c.icon,
    description: isDay ? c.day : c.night,
  };
}
