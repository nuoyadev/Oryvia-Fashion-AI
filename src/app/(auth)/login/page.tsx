"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/client/lib/api";
import { useApp } from "@/client/state";
import { Button, Field, Input } from "@/components/ui";
import { LockIcon, Logo, ShieldIcon } from "@/components/icons";
import type { User } from "@/client/types";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useApp();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api<{ user: User }>(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      });
      if (mode === "register") {
        toast(`Bienvenue sur Oryvia${name ? `, ${name}` : ""} ✨`);
        router.replace("/onboarding");
      } else {
        router.replace(res.user.onboardingDone ? "/home" : "/onboarding");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* ambient background */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-rose/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-coral/10 blur-[120px]" />

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <div className="mb-10 text-center">
          <Logo className="mx-auto mb-5 h-14 w-14" />
          <h1 className="font-display text-4xl tracking-tight">
            Oryvia
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm text-muted">
            Ton styliste IA personnel. Il comprend ton corps, tes goûts, ton dressing et ton budget.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <Field label="Prénom">
              <Input placeholder="Camille" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
          )}
          <Field label="Email">
            <Input
              type="email"
              required
              placeholder="toi@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field
            label="Mot de passe"
            hint={mode === "register" ? "10 caractères minimum, avec majuscule et chiffre." : undefined}
          >
            <Input
              type="password"
              required
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Button type="submit" size="lg" loading={busy} className="w-full">
            {mode === "register" ? "Créer mon compte" : "Me connecter"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="mt-6 text-center text-sm text-muted hover:text-cream"
        >
          {mode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <span className="font-semibold text-rose">
            {mode === "login" ? "Créer mon profil style" : "Se connecter"}
          </span>
        </button>

        <div className="mt-10 flex items-center justify-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <LockIcon className="h-3.5 w-3.5" /> Données chiffrées
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldIcon className="h-3.5 w-3.5" /> Photos privées
          </span>
        </div>
      </div>
    </div>
  );
}
