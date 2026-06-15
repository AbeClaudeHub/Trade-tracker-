"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Logo } from "@/components/ui/Logo";

/** Guards standalone (full-screen) authed pages that live outside the app shell. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && configured && !user) router.replace("/login");
  }, [loading, user, configured, router]);

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-md">
          <Logo className="mb-6 justify-center" />
          <p className="text-muted">
            Add your Firebase credentials (see{" "}
            <code className="font-mono text-sm">.env.example</code>) to continue.
          </p>
        </div>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  return <>{children}</>;
}
