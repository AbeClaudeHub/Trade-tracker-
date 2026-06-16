"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Logo } from "@/components/ui/Logo";
import { Icon, type IconName } from "./icons";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: IconName; primary?: boolean }[] = [
  { href: "/report", label: "My Report", icon: "archetype", primary: true },
  { href: "/assessment", label: "Reassess", icon: "daily", primary: true },
  { href: "/unlock", label: "Unlock", icon: "nafs", primary: true },
  { href: "/settings", label: "Settings", icon: "settings", primary: true },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, configured, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && configured && !user) router.replace("/login");
  }, [loading, user, configured, router]);

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-md">
          <Logo className="mb-6 justify-center" />
          <h1 className="font-serif text-title text-ink">Almost there</h1>
          <p className="mt-3 text-muted">
            Niyyah OS needs Firebase credentials to run. Copy{" "}
            <code className="font-mono text-sm">.env.example</code> to{" "}
            <code className="font-mono text-sm">.env.local</code> and add your
            project keys, then restart.
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

  const primary = NAV.filter((n) => n.primary).slice(0, 5);

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-raised px-4 py-6 lg:flex print:!hidden">
        <Link href="/report" className="px-2">
          <Logo />
        </Link>
        <nav className="mt-8 flex-1 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  active
                    ? "bg-accent-soft font-medium text-accent-ink"
                    : "text-muted hover:bg-sand/60 hover:text-ink",
                )}
              >
                {active ? (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-accent to-gold" />
                ) : null}
                <Icon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => signOut().then(() => router.replace("/"))}
          className="mt-2 rounded-xl px-3 py-2.5 text-left text-sm text-faint hover:bg-sand/60 hover:text-ink"
        >
          Sign out
        </button>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-line bg-raised px-5 py-4 lg:hidden print:hidden">
        <Link href="/report">
          <Logo />
        </Link>
        <button
          onClick={() => signOut().then(() => router.replace("/"))}
          className="text-sm text-faint"
        >
          Sign out
        </button>
      </div>

      {/* Content */}
      <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid border-t border-line bg-surface/95 backdrop-blur lg:hidden print:hidden"
        style={{ gridTemplateColumns: `repeat(${primary.length}, minmax(0, 1fr))` }}
      >
        {primary.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px]",
                active ? "text-accent" : "text-faint",
              )}
            >
              <Icon name={item.icon} width={22} height={22} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
