"use client";

import { useMemo, useState } from "react";
import { api } from "@/client/lib/api";
import { useApp } from "@/client/state";
import { Button, Card, Chip, cx, EmptyState, Field, Input, Modal, SectionTitle, Spinner, Textarea } from "@/components/ui";
import { TrashIcon } from "@/components/icons";
import { UploadField } from "@/components/upload";
import { COLORS } from "@/client/colors";
import type { InspirationItem } from "@/client/types";

export default function InspirationPage() {
  const { inspiration, closet, refreshInspiration, toast } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function remove(item: InspirationItem) {
    setBusyId(item.id);
    try {
      await api(`/api/inspiration/${item.id}`, { method: "DELETE" });
      await refreshInspiration();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setBusyId(null);
    }
  }

  const insight = useMemo(() => {
    const paletteCount = new Map<string, number>();
    const tagCount = new Map<string, number>();
    for (const insp of inspiration) {
      for (const c of insp.palette) paletteCount.set(c, (paletteCount.get(c) ?? 0) + 1);
      for (const t of insp.tags) if (t) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
    }
    const palette = [...paletteCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c]) => c);
    const tags = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => t);
    const closetColors = new Set(closet.map((i) => i.color.toLowerCase()));
    const gaps = palette.filter((c) => !closetColors.has(c.toLowerCase())).slice(0, 3);
    return { palette, tags, gaps };
  }, [inspiration, closet]);

  return (
    <div className="animate-fade-up">
      <SectionTitle
        kicker="Style Learning Engine"
        title="Inspirations"
        sub="Montre à Oryvia ce que tu aimes (Pinterest, Instagram, looks de célébrités). Il apprend tes couleurs, ton esthétique et tes envies."
        action={
          <Button onClick={() => setAddOpen(true)}>Ajouter une inspiration</Button>
        }
      />

      {inspiration.length === 0 ? (
        <EmptyState
          emoji="📌"
          title="Aucune inspiration pour l'instant"
          sub="Ajoute des photos de looks qui te plaisent : Oryvia détecte leur palette et affine ton style."
          action={<Button onClick={() => setAddOpen(true)}>Importer une photo</Button>}
        />
      ) : (
        <>
          {insight.palette.length > 0 && (
            <Card className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose">Ce que tu aimes</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {insight.palette.map((c) => {
                  const named = COLORS.find((x) => x.hex.toLowerCase() === c.toLowerCase());
                  return (
                    <span key={c} className="flex items-center gap-1.5 rounded-full bg-white/[0.05] py-1 pl-1 pr-3 text-xs text-muted">
                      <span className="h-5 w-5 rounded-full border border-white/20" style={{ background: c }} />
                      {named?.name ?? c}
                    </span>
                  );
                })}
              </div>
              {insight.gaps.length > 0 && (
                <p className="mt-3 text-xs text-muted">
                  💡 Il te manque dans ton dressing :{" "}
                  {insight.gaps.map((c) => COLORS.find((x) => x.hex.toLowerCase() === c.toLowerCase())?.name ?? c).join(", ")}.
                  Oryvia en tiendra compte dans tes listes shopping.
                </p>
              )}
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {inspiration.map((item) => (
              <Card key={item.id} className="group overflow-hidden p-0">
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/media/${item.image}`} alt={item.source} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl">🖼️</div>
                  )}
                  <button
                    onClick={() => remove(item)}
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-muted opacity-0 backdrop-blur transition-opacity hover:text-rose group-hover:opacity-100"
                  >
                    {busyId === item.id ? <Spinner className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />}
                  </button>
                </div>
                <div className="p-3">
                  <p className="truncate text-xs font-semibold text-muted">{item.source}</p>
                  {item.note && <p className="mt-0.5 line-clamp-2 text-xs text-muted">{item.note}</p>}
                  <div className="mt-2 flex gap-1">
                    {item.palette.slice(0, 5).map((c, i) => (
                      <span key={i} className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ background: c }} />
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {addOpen && (
        <AddInspirationModal
          onClose={() => setAddOpen(false)}
          onDone={() => {
            setAddOpen(false);
            refreshInspiration();
          }}
        />
      )}
    </div>
  );
}

function AddInspirationModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { toast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState("Pinterest");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!file) {
      toast("Ajoute une photo.", "error");
      return;
    }
    setBusy(true);
    const fd = new FormData();
    fd.append("image", file);
    fd.append("source", source.trim() || "Inspiration");
    fd.append("note", note.trim());
    fd.append("tags", "[]");
    try {
      await api("/api/inspiration", { method: "POST", body: fd });
      toast("Inspiration enregistrée ✨");
      onDone();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Ajouter une inspiration" wide>
      <div className="space-y-4">
        <UploadField onFile={setFile} label="Photo d'un look" className="!aspect-[4/3]" />
        <Field label="Source">
          <Input placeholder="Pinterest, Instagram…" value={source} onChange={(e) => setSource(e.target.value)} />
        </Field>
        <Field label="Note (optionnel)">
          <Textarea rows={2} placeholder="Ce que j'aime dans ce look…" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <Button onClick={submit} loading={busy} className="w-full">
          Analyser et enregistrer
        </Button>
      </div>
    </Modal>
  );
}
