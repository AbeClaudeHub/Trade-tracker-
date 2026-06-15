"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { enableDemo } from "@/lib/demo/isDemo";
import { Logo } from "@/components/ui/Logo";

/** Entry point for demo mode: enables the flag, then drops into the dashboard. */
export default function DemoEntry() {
  const router = useRouter();
  useEffect(() => {
    enableDemo();
    // Full reload so providers re-read the demo flag from the start.
    window.location.replace("/report");
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5">
      <Logo />
      <p className="text-muted">Opening the demo…</p>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
    </main>
  );
}
