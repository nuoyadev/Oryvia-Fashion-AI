"use client";

import { useMemo, useState } from "react";
import { api } from "@/client/lib/api";
import { useApp } from "@/client/state";
import { Button, Card, Chip, cx, EmptyState, Field, Input, Modal, SectionTitle, Select, Spinner } from "@/components/ui";
import { TrashIcon, PlusIcon } from "@/components/icons";
import { UploadField } from "@/components/upload";
import {
  CATEGORY_EMOJI,
  CATEGORY_LABELS,
  type ClosetCategory,
  type ClosetItem,
} from "@/client/types";

const CATEGORIES = ["tops", "bottoms", "outerwear", "dresses", "shoes", "accessories"] as ClosetCategory[];

export default function ClosetPage() {
  const { closet, refreshCloset, toast } = useApp();
  const [filter, setFilter] = useState<ClosetCategory | "all">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<ClosetItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? closet : closet.filter((i) => i.category === filter)),
    [closet, filter]
  );

  async function remove(item: ClosetItem) {
    setBusyId(item.id);
    try {
      await api(`/api/closet/${item.id}`, { method: "DELETE" });
      await refreshCloset();
      toast("Pièce supprimée.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="animate-fade-up">
      <SectionTitle
        kicker="Digital Closet"
        title={`Ton dressing (${closet.length})`}
        sub="Scanne tes vêtements : Oryvia détecte la couleur et la catégorie, puis calcule tes combinaisons."
        action={
          <Button onClick={() => setAddOpen(true)}>
            <PlusIcon className="h-4 w-4" /> Ajouter
          </Button>
        }
      />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>
          Tout
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>
            {CATEGORY_EMOJI[c]} {CATEGORY_LABELS[c]}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          emoji="🧺"
          title={closet.length === 0 ? "Ton dressing est vide" : "Rien dans cette catégorie"}
          sub="Ajoute tes pièces une par une : photos, couleurs et catégories seront analysées automatiquement."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <PlusIcon className="h-4 w-4" /> Ajouter une pièce
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((item) => (
            <Card key={item.id} className="group overflow-hidden p-0">
              <button className="relative block w-full text-left" onClick={() => setEditItem(item)}>
                <div className="relative aspect-square w-full overflow-hidden">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/media/${item.image}`} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-4xl"
                      style={{ background: item.color, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }}
                    >
                      {CATEGORY_EMOJI[item.category]}
                    </div>
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                    {CATEGORY_EMOJI[item.category]} {CATEGORY_LABELS[item.category]}
                  </span>
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-cream">{item.name}</p>
                  <p className="truncate text-xs text-muted">
                    {item.colorName}
                    {item.brand ? ` · ${item.brand}` : ""}
                  </p>
                </div>
              </button>
              <button
                onClick={() => remove(item)}
                className="absolute bottom-2 right-2 rounded-full bg-black/50 p-2 text-muted opacity-0 backdrop-blur transition-opacity hover:text-rose group-hover:opacity-100"
                aria-label="Supprimer"
              >
                {busyId === item.id ? <Spinner className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />}
              </button>
            </Card>
          ))}
        </div>
      )}

      {addOpen && (
        <AddModal
          onClose={() => setAddOpen(false)}
          onDone={() => {
            setAddOpen(false);
            refreshCloset();
          }}
        />
      )}
      {editItem && (
        <EditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onDone={() => {
            setEditItem(null);
            refreshCloset();
          }}
        />
      )}
    </div>
  );
}

function AddModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { toast } = useApp();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ClosetCategory>("tops");
  const [brand, setBrand] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!file) {
      toast("Ajoute une photo de la pièce.", "error");
      return;
    }
    if (!name.trim()) {
      toast("Donne un nom à cette pièce.", "error");
      return;
    }
    setBusy(true);
    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("category", category);
    fd.append("brand", brand.trim());
    fd.append("tags", "[]");
    fd.append("image", file);
    try {
      await api("/api/closet", { method: "POST", body: fd });
      toast("Pièce ajoutée ✨");
      onDone();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Ajouter une pièce" wide>
      <div className="space-y-4">
        <UploadField onFile={setFile} label="Photo de la pièce" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nom">
            <Input placeholder="Chemise Oxford" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Catégorie">
            <Select value={category} onChange={(e) => setCategory(e.target.value as ClosetCategory)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_EMOJI[c]} {CATEGORY_LABELS[c]}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Marque (optionnel)">
          <Input placeholder="COS, Uniqlo…" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </Field>
        <p className="text-xs text-muted">
          ✨ La couleur sera détectée automatiquement sur ta photo.
        </p>
        <Button onClick={submit} loading={busy} className="w-full">
          Ajouter au dressing
        </Button>
      </div>
    </Modal>
  );
}

function EditModal({ item, onClose, onDone }: { item: ClosetItem; onClose: () => void; onDone: () => void }) {
  const { toast } = useApp();
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState<ClosetCategory>(item.category);
  const [brand, setBrand] = useState(item.brand ?? "");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await api(`/api/closet/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim(), category, brand: brand.trim() || null }),
      });
      toast("Pièce mise à jour.");
      onDone();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Modifier la pièce">
      <div className="space-y-4">
        <Field label="Nom">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Catégorie">
          <Select value={category} onChange={(e) => setCategory(e.target.value as ClosetCategory)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_EMOJI[c]} {CATEGORY_LABELS[c]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Marque">
          <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
        </Field>
        <Button onClick={submit} loading={busy} className="w-full">
          Enregistrer
        </Button>
      </div>
    </Modal>
  );
}
