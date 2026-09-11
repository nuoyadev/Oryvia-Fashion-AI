"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "./lib/api";
import type {
  ClosetItem,
  InspirationItem,
  Outfit,
  ShoppingList,
  User,
} from "./types";

interface Toast {
  id: number;
  message: string;
  tone: "ok" | "error";
}

interface AppState {
  user: User | null;
  loading: boolean;
  closet: ClosetItem[];
  outfits: Outfit[];
  shopping: ShoppingList[];
  inspiration: InspirationItem[];
  toasts: Toast[];
  toast: (message: string, tone?: "ok" | "error") => void;
  refreshUser: () => Promise<void>;
  refreshCloset: () => Promise<void>;
  refreshOutfits: () => Promise<void>;
  refreshShopping: () => Promise<void>;
  refreshInspiration: () => Promise<void>;
  refreshAll: () => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [closet, setCloset] = useState<ClosetItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [shopping, setShopping] = useState<ShoppingList[]>([]);
  const [inspiration, setInspiration] = useState<InspirationItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const toast = useCallback((message: string, tone: "ok" | "error" = "ok") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await api<User>("/api/auth/me");
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  const refreshCloset = useCallback(async () => {
    try {
      setCloset(await api<ClosetItem[]>("/api/closet"));
    } catch {
      /* silent */
    }
  }, []);

  const refreshOutfits = useCallback(async () => {
    try {
      setOutfits(await api<Outfit[]>("/api/outfits"));
    } catch {
      /* silent */
    }
  }, []);

  const refreshShopping = useCallback(async () => {
    try {
      setShopping(await api<ShoppingList[]>("/api/shopping"));
    } catch {
      /* silent */
    }
  }, []);

  const refreshInspiration = useCallback(async () => {
    try {
      setInspiration(await api<InspirationItem[]>("/api/inspiration"));
    } catch {
      /* silent */
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshUser(), refreshCloset(), refreshOutfits(), refreshShopping(), refreshInspiration()]);
  }, [refreshUser, refreshCloset, refreshOutfits, refreshShopping, refreshInspiration]);

  const logout = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    (async () => {
      try {
        const u = await api<User>("/api/auth/me");
        setUser(u);
        if (!u.onboardingDone) {
          router.replace("/onboarding");
          setLoading(false);
          return;
        }
        await Promise.all([refreshCloset(), refreshOutfits(), refreshShopping(), refreshInspiration()]);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AppState>(
    () => ({
      user,
      loading,
      closet,
      outfits,
      shopping,
      inspiration,
      toasts,
      toast,
      refreshUser,
      refreshCloset,
      refreshOutfits,
      refreshShopping,
      refreshInspiration,
      refreshAll,
      logout,
    }),
    [user, loading, closet, outfits, shopping, inspiration, toasts, toast, refreshUser, refreshCloset, refreshOutfits, refreshShopping, refreshInspiration, refreshAll, logout]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} />
    </Ctx.Provider>
  );
}

function ToastViewport({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 md:bottom-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-fade-up rounded-2xl px-4 py-3 text-sm shadow-xl ${
            t.tone === "error" ? "bg-[#3a1622] text-[#ffb3c6]" : "bg-card text-cream"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
