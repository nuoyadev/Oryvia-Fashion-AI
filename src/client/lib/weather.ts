// Client-side weather (Open-Meteo, no key). Used as a fallback when
// the server cannot reach external APIs (e.g. restricted preview
// sandboxes). Open-Meteo is CORS-enabled, so the user's browser can
// call it directly.
import type { WeatherInfo } from "../types";

const CODES: Record<number, { fr: string; icon: string; day: string; night: string }> = {
  0: { fr: "Ciel dégagé", icon: "☀️", day: "Grand soleil", night: "Ciel clair" },
  1: { fr: "Plutôt dégagé", icon: "🌤️", day: "Largement ensoleillé", night: "Peu nuageux" },
  2: { fr: "Partiellement nuageux", icon: "⛅", day: "Éclaircies", night: "Éclaircies" },
  3: { fr: "Couvert", icon: "☁️", day: "Ciel voilé", night: "Ciel voilé" },
  45: { fr: "Brouillard", icon: "🌫️", day: "Brouillard", night: "Brouillard" },
  48: { fr: "Brouillard givrant", icon: "🌫️", day: "Brouillard givrant", night: "Brouillard givrant" },
  51: { fr: "Bruine légère", icon: "🌦️", day: "Bruine légère", night: "Bruine légère" },
  61: { fr: "Pluie légère", icon: "🌧️", day: "Pluie légère", night: "Pluie légère" },
  63: { fr: "Pluie", icon: "🌧️", day: "Pluie", night: "Pluie" },
  65: { fr: "Pluie forte", icon: "🌧️", day: "Pluie forte", night: "Pluie forte" },
  71: { fr: "Neige légère", icon: "🌨️", day: "Neige légère", night: "Neige légère" },
  73: { fr: "Neige", icon: "🌨️", day: "Neige", night: "Neige" },
  80: { fr: "Averses", icon: "🌧️", day: "Averses", night: "Averses" },
  95: { fr: "Orage", icon: "⛈️", day: "Orage", night: "Orage" },
};

export async function fetchWeather(city: string): Promise<WeatherInfo | null> {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`
    );
    if (!geoRes.ok) return null;
    const geo = (await geoRes.json()) as { results?: { name: string; latitude: number; longitude: number }[] };
    const g = geo.results?.[0];
    if (!g) return null;

    const wxRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${g.latitude}&longitude=${g.longitude}&current=temperature_2m,weather_code,is_day`
    );
    if (!wxRes.ok) return null;
    const wx = (await wxRes.json()) as { current?: { temperature_2m?: number; weather_code?: number; is_day?: number } };
    const c = wx.current;
    if (!c || c.temperature_2m === undefined) return null;
    const meta = CODES[c.weather_code ?? 3] ?? CODES[3];
    return {
      city: g.name,
      tempC: Math.round(c.temperature_2m),
      condition: meta.fr,
      icon: meta.icon,
      description: c.is_day === 1 ? meta.day : meta.night,
    };
  } catch {
    return null;
  }
}
