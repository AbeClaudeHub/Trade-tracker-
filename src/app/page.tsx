import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { RingMotif } from "@/components/ui/RingMotif";
import { Reveal } from "@/components/ui/Reveal";
import { ReportPreview } from "@/components/marketing/ReportPreview";

const STEPS = [
  ["Assess", "A 54-question behavioral assessment maps how you actually act under pressure — not how you think you do."],
  ["Diagnose", "Receive your trader archetype, your blind spots, and the nafs beneath your mistakes."],
  ["See the loop", "We map the exact self-sabotage cycles that repeat, so you can finally name them."],
  ["Get a plan", "A personal 30-day blueprint you run inside your existing accountability room."],
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
    body: "You still revenge trade, overtrade, and move stops. That isn't a knowledge gap — it's a self-awareness gap. We close it.",
  },
  {
    k: "Calm by design",
    title: "A diagnosis, not a dashboard.",
    body: "No streaks engineered for addiction, no noise. One deep read of who you are as a trader, and a plan to change it.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-clip">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="quiet" size="sm">Sign in</Button>
            </Link>
            <Link href="/demo">
              <Button size="sm">View demo</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <RingMotif className="pointer-events-none absolute -right-24 -top-24 h-[34rem] w-[34rem] opacity-70 md:right-0" />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-16 md:grid-cols-[1.05fr_0.95fr] md:pt-24">
          <div className="relative">
            <Pill tone="gold" className="mb-6">A premium behavioral diagnosis for traders</Pill>
            <h1 className="font-serif text-hero text-ink text-balance">
              Understand why you keep <span className="text-gradient">sabotaging</span> yourself.
            </h1>
            <p className="mt-6 max-w-xl lead">
              Niyyah OS reads how you actually behave under pressure and hands you a
              personal diagnosis — your archetype, your blind spots, the nafs beneath
              your mistakes, and a 30-day plan to change them.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/demo">
                <Button size="lg">Explore the live demo</Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary" size="lg">Take the assessment</Button>
              </Link>
            </div>
            <p className="mt-5 text-sm text-faint">
              No sign-up to preview · No charts · No signals · No PnL.
            </p>
          </div>

          <div className="relative md:pl-6">
            <ReportPreview />
          </div>
        </div>
      </section>

      {/* Complement strip */}
      <section className="border-y border-line bg-surface/50">
        <div className="mx-auto grid max-w-5xl gap-px overflow-hidden rounded-none sm:grid-cols-3">
          {[
            ["Rooms expose", "Niyyah OS explains"],
            ["Rooms create visibility", "Niyyah OS creates understanding"],
            ["Rooms hold you accountable", "Niyyah OS gives you direction"],
          ].map(([a, b]) => (
            <div key={a} className="px-6 py-7 text-center">
              <p className="text-sm text-faint">{a}.</p>
              <p className="mt-1 font-serif text-lg text-ink">{b}.</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal
              key={p.k}
              delay={i * 90}
              className="group relative flex flex-col rounded-3xl border border-line bg-surface p-7 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="section-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="label text-gold-ink/70">{p.k}</span>
              </div>
              <h2 className="font-serif text-xl leading-snug text-ink">{p.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Flow */}
      <Reveal className="mx-auto max-w-reading px-6 py-12">
        <p className="label mb-3 text-center">How it works</p>
        <h2 className="text-center font-serif text-title text-ink">One assessment. One diagnosis. One plan.</h2>
        <ol className="mt-12 divide-y divide-line/70">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="group flex gap-6 py-6 transition-colors">
              <span className="font-serif text-3xl tabular-nums text-gold/45 transition-colors group-hover:text-gold/80">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="pt-1.5">
                <h3 className="font-medium text-ink">{title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* Closing */}
      <section className="relative mx-auto max-w-reading px-6 pb-32 pt-12 text-center">
        <RingMotif withOrbit={false} className="absolute left-1/2 top-0 h-[26rem] w-[26rem] -translate-x-1/2 opacity-50" />
        <blockquote className="relative font-serif text-3xl leading-snug text-ink text-balance md:text-[2.6rem]">
          &ldquo;This understands me better than I understand myself.&rdquo;
        </blockquote>
        <div className="relative mt-10">
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
