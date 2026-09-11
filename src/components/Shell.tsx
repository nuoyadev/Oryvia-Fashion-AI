"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/client/state";
import { cx, Spinner } from "@/components/ui";
import {
  BagIcon,
  ChatIcon,
  HangerIcon,
  HomeIcon,
  ImageIcon,
  Logo,
  PaletteIcon,
  SparklesIcon,
  UserIcon,
} from "@/components/icons";

const NAV = [
  { href: "/home", label: "Accueil", icon: HomeIcon },
  { href: "/style", label: "Style DNA", icon: PaletteIcon },
  { href: "/closet", label: "Dressing", icon: HangerIcon },
  { href: "/studio", label: "Studio", icon: SparklesIcon },
  { href: "/chat", label: "Styliste IA", icon: ChatIcon },
  { href: "/inspiration", label: "Inspiration", icon: ImageIcon },
  { href: "/shopping", label: "Shopping", icon: BagIcon },
  { href: "/profile", label: "Profil", icon: UserIcon },
];

const MOBILE_NAV = [
  { href: "/home", label: "Accueil", icon: HomeIcon },
  { href: "/closet", label: "Dressing", icon: HangerIcon },
  { href: "/studio", label: "Studio", icon: SparklesIcon, center: true },
  { href: "/chat", label: "Styliste", icon: ChatIcon },
  { href: "/profile", label: "Profil", icon: UserIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user && !user.onboardingDone && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo className="h-12 w-12 animate-float" />
          <Spinner className="h-5 w-5" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.06] bg-ink/80 p-5 backdrop-blur-xl lg:flex">
        <Link href="/home" className="mb-8 flex items-center gap-3 px-2">
          <Logo />
          <span className="font-display text-2xl tracking-tight">Oryvia</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-white/[0.08] text-cream" : "text-muted hover:bg-white/[0.04] hover:text-cream"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-gradient" />}
              </Link>
            );
          })}
        </nav>
        <Link href="/profile" className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-card p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">
            {(user.name ?? user.email)[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-cream">{user.name ?? "Moi"}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
        </Link>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.06] bg-ink/70 px-5 py-3 backdrop-blur-xl lg:hidden">
        <Link href="/home" className="flex items-center gap-2.5">
          <Logo className="h-7 w-7" />
          <span className="font-display text-xl">Oryvia</span>
        </Link>
        <Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
          {(user.name ?? user.email)[0]?.toUpperCase()}
        </Link>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-5xl px-5 pb-32 pt-6 md:pb-16 lg:pl-72 lg:pr-10 lg:pt-10">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="glass fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 pb-safe">
          {MOBILE_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "flex flex-col items-center gap-0.5 px-3 py-2.5 text-[10px] font-semibold",
                  active ? "text-cream" : "text-muted"
                )}
              >
                {item.center ? (
                  <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient shadow-[0_8px_24px_-6px_rgba(232,96,158,0.7)]">
                    <item.icon className="h-6 w-6 text-white" />
                  </span>
                ) : (
                  <item.icon className="h-5 w-5" />
                )}
                <span className={cx(item.center && "mt-1")}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
