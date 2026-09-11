"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/client/lib/api";
import { useApp } from "@/client/state";
import { Button, Card, Chip, EmptyState, SectionTitle, Spinner, cx } from "@/components/ui";
import { CameraIcon, TrashIcon } from "@/components/icons";
import { harmonyAgainst, sampleComplexion, type HarmonyResult, type RgbPixel } from "@/lib/harmony";
import { textOn } from "@/lib/palette";
import { CATEGORY_EMOJI, type Outfit, type TryOn } from "@/client/types";

function mediaSize(src: HTMLVideoElement | HTMLImageElement): { w: number; h: number } {
  if (src instanceof HTMLVideoElement) return { w: src.videoWidth, h: src.videoHeight };
  return { w: src.naturalWidth, h: src.naturalHeight };
}

function mapCamError(e: unknown): string {
  const err = e as { name?: string } | null;
  if (typeof navigator !== "undefined" && !navigator.mediaDevices?.getUserMedia) {
    return "La caméra n'est pas disponible sur cet appareil. Utilise un selfie.";
  }
  if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
    return "Accès caméra refusé. Autorise-le, ou utilise un selfie.";
  }
  if (err?.name === "NotFoundError") return "Aucune caméra détectée. Utilise un selfie.";
  if (err?.name === "NotReadableError") return "Caméra déjà utilisée ailleurs. Utilise un selfie.";
  return "Impossible d'accéder à la caméra. Utilise un selfie.";
}

export default function TryOnPage() {
  const { outfits, toast } = useApp();
  const [outfitId, setOutfitId] = useState<string>("");
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [camError, setCamError] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<HarmonyResult | null>(null);
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [positions, setPositions] = useState<Record<string, { x: number; y: number; size: number }>>({});
  const [saving, setSaving] = useState(false);
  const [gallery, setGallery] = useState<TryOn[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("outfit");
    if (p) setOutfitId(p);
    api<TryOn[]>("/api/tryons").then(setGallery).catch(() => {});
  }, []);

  const outfit: Outfit | null = outfits.find((o) => o.id === outfitId) ?? outfits[0] ?? null;
  const look = outfit?.look ?? null;
  const palette = look?.palette ?? [];

  const pieces = useMemo(
    () =>
      (look?.items ?? []).map((it, i) => ({
        key: `${i}`,
        name: it.name,
        color: it.color ?? "#666666",
        emoji: CATEGORY_EMOJI[it.category],
      })),
    [look]
  );

  // Reset overlays when the look changes.
  useEffect(() => {
    const pos: Record<string, { x: number; y: number; size: number }> = {};
    pieces.forEach((p, i) => {
      pos[p.key] = { x: 16 + (i % 2) * 46, y: 12 + Math.floor(i / 2) * 118, size: 42 };
    });
    setPositions(pos);
    setVisible(new Set(pieces.slice(0, 3).map((p) => p.key)));
    setVerdict(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [look?.name, pieces.length]);

  // Camera lifecycle.
  useEffect(() => {
    if (mode !== "camera") return;
    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCamError(null);
      } catch (e) {
        if (!cancelled) {
          setCamError(mapCamError(e));
          setMode("upload");
        }
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [mode]);

  // Live analysis loop.
  useEffect(() => {
    if (!palette.length) return;
    const id = setInterval(runAnalysis, 900);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, uploadUrl, palette.join(",")]);

  function runAnalysis() {
    const src: HTMLVideoElement | HTMLImageElement | null =
      mode === "camera" ? videoRef.current : imgRef.current;
    if (!src || !analysisRef.current || !palette.length) return;
    const { w, h } = mediaSize(src);
    if (!w || !h) return;
    const canvas = analysisRef.current;
    const cw = 64;
    const ch = Math.max(1, Math.round((cw * h) / w));
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(src, 0, 0, cw, ch);
    let data: ImageData;
    try {
      data = ctx.getImageData(0, 0, cw, ch);
    } catch {
      return;
    }
    const pixels: RgbPixel[] = [];
    for (let i = 0; i < data.data.length; i += 8) {
      pixels.push({ r: data.data[i], g: data.data[i + 1], b: data.data[i + 2] });
    }
    const complexion = sampleComplexion(pixels);
    setVerdict(harmonyAgainst(palette, complexion));
  }

  function togglePiece(key: string) {
    setVisible((v) => {
      const n = new Set(v);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  }

  function onOverlayDown(e: React.PointerEvent, key: string) {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const start = positions[key];
    if (!start) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const move = (ev: PointerEvent) => {
      const nx = Math.max(0, Math.min(start.x + (ev.clientX - startX), rect.width - start.size));
      const ny = Math.max(0, Math.min(start.y + (ev.clientY - startY), rect.height - start.size * 1.35));
      setPositions((p) => ({ ...p, [key]: { ...p[key], x: nx, y: ny } }));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function onUploadFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUploadUrl(reader.result as string);
      setCamError(null);
    };
    reader.readAsDataURL(file);
  }

  async function capture() {
    const container = containerRef.current;
    const src: HTMLVideoElement | HTMLImageElement | null =
      mode === "camera" ? videoRef.current : imgRef.current;
    if (!container || !src || !captureRef.current) {
      toast("Choisis d'abord un selfie ou une tenue.", "error");
      return;
    }
    const scale = 2;
    const W = container.clientWidth * scale;
    const H = container.clientHeight * scale;
    const canvas = captureRef.current;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0e0d12";
    ctx.fillRect(0, 0, W, H);

    const { w, h } = mediaSize(src);
    if (w && h) {
      const s = Math.max(W / w, H / h);
      const dw = w * s;
      const dh = h * s;
      ctx.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh);
    }

    const rectW = container.clientWidth || 1;
    const rectH = container.clientHeight || 1;
    for (const p of pieces) {
      if (!visible.has(p.key)) continue;
      const pos = positions[p.key];
      if (!pos) continue;
      drawGhost(ctx, (pos.x / rectW) * W, (pos.y / rectH) * H, (pos.size / rectW) * W, p);
    }

    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png"));
    if (!blob) {
      toast("Capture impossible.", "error");
      return;
    }
    setSaving(true);
    const fd = new FormData();
    fd.append("image", blob, "tryon.png");
    fd.append("outfitId", outfit?.id ?? "");
    fd.append("lookName", look?.name ?? "Essai");
    fd.append(
      "verdict",
      JSON.stringify({ score: verdict?.score ?? 0, verdict: verdict?.verdict ?? "", palette })
    );
    try {
      await api("/api/tryons", { method: "POST", body: fd });
      toast("Essai enregistré 🔒");
      setGallery(await api<TryOn[]>("/api/tryons"));
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setSaving(false);
    }
  }

  async function removeTryOn(item: TryOn) {
    setBusyId(item.id);
    try {
      await api(`/api/tryons/${item.id}`, { method: "DELETE" });
      setGallery((g) => g.filter((t) => t.id !== item.id));
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setBusyId(null);
    }
  }

  if (outfits.length === 0) {
    return (
      <EmptyState
        emoji="📷"
        title="Génère d'abord une tenue"
        sub="L'essai caméra se fait sur une tenue : crée un look dans le Studio, puis reviens l'essayer sur toi."
        action={
          <Link href="/studio" className="rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white">
            Ouvrir le Studio
          </Link>
        }
      />
    );
  }

  return (
    <div className="animate-fade-up">
      <SectionTitle
        kicker="Virtual Try-On"
        title="Essai caméra"
        sub="Ta caméra analyse ton teint en temps réel et te dit si les couleurs de la tenue te mettent en valeur. Place les pièces sur ton image et capture."
      />

      {/* outfit picker */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {outfits.slice(0, 8).map((o) => (
          <Chip key={o.id} active={o.id === outfit?.id} onClick={() => setOutfitId(o.id)} className="shrink-0">
            {o.look.name}
          </Chip>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* left: camera + overlays */}
        <div className="space-y-4 lg:col-span-3">
          <div className="relative">
            <div
              ref={containerRef}
              className="relative aspect-[3/4] w-full touch-none overflow-hidden rounded-3xl border border-white/10 bg-black"
            >
              {mode === "camera" ? (
                <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
              ) : uploadUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img ref={imgRef} src={uploadUrl} alt="Selfie" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
                  <CameraIcon className="h-8 w-8 text-muted" />
                  <p className="text-sm text-muted">Télécharge un selfie pour l'analyse.</p>
                  <label className="cursor-pointer rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white">
                    Choisir une photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        onUploadFile(e.target.files?.[0] ?? null);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              )}

              {/* piece overlays */}
              {pieces.map((p) =>
                visible.has(p.key) ? (
                  <div
                    key={p.key}
                    onPointerDown={(e) => onOverlayDown(e, p.key)}
                    style={{
                      left: positions[p.key]?.x,
                      top: positions[p.key]?.y,
                      width: positions[p.key]?.size,
                      height: (positions[p.key]?.size ?? 42) * 1.35,
                      background: p.color,
                      color: textOn(p.color),
                    }}
                    className="absolute flex cursor-grab select-none flex-col items-center justify-center rounded-xl border border-white/30 shadow-lg active:cursor-grabbing"
                  >
                    <span className="text-lg leading-none">{p.emoji}</span>
                    <span className="mt-0.5 px-1 text-center text-[9px] font-bold leading-tight">{p.name}</span>
                  </div>
                ) : null
              )}

              {/* live verdict mini */}
              {verdict && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5 rounded-2xl bg-black/60 px-3.5 py-2.5 backdrop-blur">
                  <span className="text-lg">{verdict.score >= 68 ? "✨" : verdict.score >= 55 ? "👌" : "⚠️"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">{verdict.verdict}</p>
                    <p className="text-[10px] text-white/60">{verdict.undertoneLabel} · score {verdict.score}/100</p>
                  </div>
                </div>
              )}
            </div>
            <canvas ref={analysisRef} className="hidden" />
            <canvas ref={captureRef} className="hidden" />
          </div>

          {/* mode toggle + capture */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={mode === "camera" ? "primary" : "secondary"} size="sm" onClick={() => setMode("camera")}>
              <CameraIcon className="h-4 w-4" /> Caméra en direct
            </Button>
            <Button variant={mode === "upload" ? "primary" : "secondary"} size="sm" onClick={() => setMode("upload")}>
              📷 Selfie
            </Button>
            {mode === "upload" && (
              <label className="cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-semibold text-muted hover:text-cream">
                Changer la photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    onUploadFile(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
            <Button onClick={capture} loading={saving} className="ml-auto">
              Capturer mon essai
            </Button>
          </div>
          {camError && (
            <p className="rounded-2xl bg-[#3a1622]/60 px-4 py-3 text-xs text-[#ffb3c6]">{camError}</p>
          )}

          {/* pieces toggle */}
          <Card>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Pièces à positionner (glisse-les sur ton image)
            </p>
            <div className="flex flex-wrap gap-2">
              {pieces.map((p) => (
                <Chip key={p.key} active={visible.has(p.key)} onClick={() => togglePiece(p.key)}>
                  <span className="h-3.5 w-3.5 rounded-full border border-white/30" style={{ background: p.color }} />
                  {p.emoji} {p.name}
                </Chip>
              ))}
            </div>
          </Card>
        </div>

        {/* right: verdict + gallery */}
        <div className="space-y-4 lg:col-span-2">
          <VerdictPanel verdict={verdict} palette={palette} />

          {gallery.length > 0 && (
            <Card>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Mes essais</p>
              <div className="grid grid-cols-2 gap-3">
                {gallery.slice(0, 6).map((t) => (
                  <div key={t.id} className="group relative overflow-hidden rounded-2xl border border-white/[0.06]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/media/${t.image}`} alt={t.lookName} className="aspect-[3/4] w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="truncate text-[11px] font-semibold text-white">{t.lookName}</p>
                      <p className="text-[10px] text-white/70">{t.verdict.score}/100 · {t.verdict.verdict}</p>
                    </div>
                    <button
                      onClick={() => removeTryOn(t)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                    >
                      {busyId === t.id ? <Spinner className="h-3.5 w-3.5" /> : <TrashIcon className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function drawGhost(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  p: { name: string; color: string; emoji: string }
) {
  const h = size * 1.35;
  const r = size * 0.22;
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + size, y, x + size, y + h, r);
  ctx.arcTo(x + size, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + size, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = textOn(p.color);
  ctx.font = `${Math.max(10, size * 0.28)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(p.emoji, x + size / 2, y + h * 0.42);
  ctx.font = `bold ${Math.max(8, size * 0.13)}px sans-serif`;
  ctx.fillText(p.name.slice(0, 14), x + size / 2, y + h * 0.62);
  ctx.restore();
}

function VerdictPanel({ verdict, palette }: { verdict: HarmonyResult | null; palette: string[] }) {
  if (!verdict) {
    return (
      <Card className="text-center">
        <p className="text-2xl">🎨</p>
        <p className="mt-2 text-sm text-muted">
          {palette.length
            ? "L'analyse démarre dès que la caméra capte ton visage…"
            : "Choisis une tenue pour lancer l'analyse."}
        </p>
      </Card>
    );
  }

  const r = 34;
  const c = 2 * Math.PI * r;
  const color = verdict.score >= 68 ? "#34c3a2" : verdict.score >= 55 ? "#e8c547" : "#e8609e";

  return (
    <Card>
      <div className="flex items-center gap-4">
        <svg width="88" height="88" viewBox="0 0 88 88" className="shrink-0">
          <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${(verdict.score / 100) * c} ${c}`}
            transform="rotate(-90 44 44)"
          />
          <text x="44" y="49" textAnchor="middle" fill="#f4f1ec" fontSize="20" fontWeight="700">
            {verdict.score}
          </text>
        </svg>
        <div>
          <p className="font-display text-lg text-cream">{verdict.verdict}</p>
          <p className="text-xs text-muted">{verdict.undertoneLabel}</p>
        </div>
      </div>

      {verdict.perColor.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {verdict.perColor.map((c) => (
            <div key={c.hex} className="flex items-center gap-2.5 text-xs">
              <span className="h-5 w-5 shrink-0 rounded-full border border-white/20" style={{ background: c.hex }} />
              <span className="w-24 shrink-0 font-medium text-cream">{c.name}</span>
              <span className={cx("min-w-0 flex-1 truncate", c.ok ? "text-muted" : "text-[#ffb3c6]")}>
                {c.ok ? "✓" : "△"} {c.note}
              </span>
            </div>
          ))}
        </div>
      )}

      {verdict.notes.length > 0 && (
        <div className="mt-4 space-y-1.5 border-t border-white/[0.06] pt-3.5">
          {verdict.notes.map((n, i) => (
            <p key={i} className="text-xs leading-relaxed text-muted">
              💡 {n}
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}
