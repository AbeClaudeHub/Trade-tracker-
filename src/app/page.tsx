import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";

const STEPS = [
  ["Assess", "A 54-question behavioral assessment maps how you actually act under pressure."],
  ["Diagnose", "Receive your trader archetype, your blind spots, and the nafs beneath your mistakes."],
  ["See the loop", "We map the exact self-sabotage cycles keeping you stuck."],
  ["Get a plan", "A personal 30-day blueprint you run inside your accountability room."],
];

const PILLARS = [
  {
    k: "Explains, not exposes",
    title: "Your room shows what. Niyyah OS shows why.",
    body: "Your accountability room already makes your behavior visible. Niyyah OS makes it understandable — and gives you a direction.",
  },
  {
    k: "Not more information",
    title: "You already know how to trade.",
    body: "You still revenge trade, overtrade, and move stops. That isn't a knowledge gap. It's a self-awareness gap. We close it.",
  },
  {
    k: "Calm by design",
    title: "A diagnosis, not a dashboard.",
    body: "No streaks engineered for addiction, no noise. One deep read of who you are as a trader — and a plan to change it.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="quiet" size="sm">Sign in</Button>
          </Link>
          <Link href="/demo">
            <Button size="sm">View demo</Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-reading px-6 pb-20 pt-14 text-center md:pt-24">
        <div className="mb-7 flex justify-center">
          <Pill tone="gold">A premium behavioral diagnosis for traders</Pill>
        </div>
        <h1 className="font-serif text-hero text-ink text-balance">
          Understand why you
          <br className="hidden sm:block" /> keep <span className="text-gradient">sabotaging</span> yourself.
        </h1>
        <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted text-pretty">
          Niyyah OS reads how you actually behave under pressure and hands you a
          personal diagnosis — your archetype, your blind spots, the nafs beneath
          your mistakes, and a 30-day plan to change them.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/demo">
            <Button size="lg">Explore the live demo</Button>
          </Link>
          <Link href="/signup">
            <Button variant="secondary" size="lg">Take the assessment</Button>
          </Link>
        </div>
        <p className="mt-5 text-sm text-faint">
          No sign-up to preview. No charts. No signals. No PnL. Just you.
        </p>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-5 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.k}
              className="group rounded-3xl border border-line bg-surface p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <p className="label mb-4 text-gold-ink/70">{p.k}</p>
              <h2 className="font-serif text-xl leading-snug text-ink">{p.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The flow */}
      <section className="mx-auto max-w-reading px-6 py-16">
        <p className="label mb-3 text-center">How it works</p>
        <h2 className="text-center font-serif text-title text-ink">One assessment. One diagnosis. One plan.</h2>
        <ol className="mt-12 space-y-2">
          {STEPS.map(([title, body], i) => (
            <li
              key={title}
              className="flex gap-5 rounded-2xl px-5 py-5 transition-colors hover:bg-surface"
            >
              <span className="font-serif text-3xl tabular-nums text-gold/50">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="pt-1">
                <h3 className="font-medium text-ink">{title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-reading px-6 pb-28 pt-6 text-center">
        <blockquote className="font-serif text-3xl leading-snug text-ink text-balance md:text-4xl">
          &ldquo;This understands me better
          <br className="hidden sm:block" /> than I understand myself.&rdquo;
        </blockquote>
        <div className="mt-10">
          <Link href="/demo">
            <Button size="lg">See your diagnosis</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-faint md:flex-row">
          <Logo />
          <p>Niyyah — نيّة — intention. Behavior is the product.</p>
        </div>
      </footer>
    </main>
  );
}
