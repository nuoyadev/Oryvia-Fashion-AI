"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/client/lib/api";
import { useApp } from "@/client/state";
import { Button, Card, Field, Input, SectionTitle } from "@/components/ui";
import { LockIcon, LogoutIcon, ShieldIcon, TrashIcon } from "@/components/icons";
import { StyleDnaCard } from "@/components/styledna";

export default function ProfilePage() {
  const { user, logout, refreshUser, toast, closet, outfits } = useApp();
  const [name, setName] = useState(user?.name ?? "");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function saveName() {
    setBusy(true);
    try {
      await api("/api/profile", { method: "POST", body: JSON.stringify({ name: name.trim() }) });
      await refreshUser();
      toast("Profil mis à jour.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  async function deleteAccount() {
    setBusy(true);
    try {
      await api("/api/auth/delete", { method: "POST" });
      window.location.href = "/login";
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur", "error");
      setBusy(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <SectionTitle kicker="Compte" title="Profil & confidentialité" />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Card>
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-xl font-bold text-white">
                {(user?.name ?? user?.email ?? "?")[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-display text-lg text-cream">{user?.name ?? "Moi"}</p>
                <p className="text-sm text-muted">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton prénom" className="max-w-xs" />
              <Button onClick={saveName} loading={busy} variant="secondary">
                Enregistrer
              </Button>
            </div>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">En bref</p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="font-display text-2xl text-cream">{closet.length}</p>
                <p className="text-xs text-muted">pièces</p>
              </div>
              <div>
                <p className="font-display text-2xl text-cream">{outfits.length}</p>
                <p className="text-xs text-muted">tenues</p>
              </div>
              <div>
                <p className="font-display text-2xl text-cream">{user?.styleDna?.budget ?? "—"} €</p>
                <p className="text-xs text-muted">budget / mois</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <ShieldIcon className="mt-0.5 h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-cream">Chiffrement de bout en bout</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Chaque photo (dressing, inspirations, corps) est chiffrée en AES-256-GCM avec une clé qui t'est
                  propre avant d'être écrite sur disque. Elle n'est servie qu'à toi, après authentification. Les mots de
                  passe sont hachés (bcrypt) et les sessions signées (JWT) dans un cookie httpOnly.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-rose/20">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <TrashIcon className="mt-0.5 h-5 w-5 text-rose" />
                <div>
                  <p className="text-sm font-semibold text-cream">Supprimer mon compte</p>
                  <p className="mt-1 text-xs text-muted">
                    Supprime définitivement ton profil, ton dressing et toutes tes photos chiffrées.
                  </p>
                </div>
              </div>
              {confirmDelete ? (
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setConfirmDelete(false)}>
                    Annuler
                  </Button>
                  <Button size="sm" variant="danger" loading={busy} onClick={deleteAccount}>
                    Confirmer
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>
                  Supprimer
                </Button>
              )}
            </div>
          </Card>

          <Button variant="ghost" onClick={logout} className="w-full">
            <LogoutIcon className="h-4 w-4" /> Se déconnecter
          </Button>
        </div>

        <div className="lg:col-span-2">
          {user?.styleDna ? (
            <StyleDnaCard dna={user.styleDna} body={user.bodyProfile} />
          ) : (
            <Card className="text-center">
              <LockIcon className="mx-auto h-6 w-6 text-muted" />
              <p className="mt-3 text-sm text-muted">Ton Style DNA n'est pas encore créé.</p>
              <Link href="/onboarding" className="mt-3 inline-block rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white">
                Compléter mon profil
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
