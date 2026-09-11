"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/client/state";
import { Spinner } from "@/components/ui";
import { Logo } from "@/components/icons";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo className="h-12 w-12 animate-float" />
          <Spinner />
        </div>
      </div>
    );
  }

  return <div className="min-h-screen pb-safe">{children}</div>;
}
