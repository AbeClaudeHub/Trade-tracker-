import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

const LOOP = [
  ["Assess", "A 54-question behavioral assessment maps how you actually act under pressure."],
  ["Recognise", "Receive your trader archetype — the pattern beneath your sabotage."],
  ["Show up", "A two-minute daily check-in, before and after the session."],
  ["Reflect", "Each week, name what improved, what repeated, and what you'll change."],
  ["Transform", "Watch your violations fall over time. That is the only metric that matters."],
];

const PRINCIPLES = [
  {
    title: "Behavior is the product",
    body: "No PnL. No win rate. No charts. We track whether you followed your rules, honored your stops, and respected your risk — nothing else.",
  },
  {
    title: "You don't have an information problem",
    body: "You already know what to do. Niyyah OS exists to help you execute what you know, not to teach you something new.",
  },
  {
    title: "Calm by design",
    body: "No stre­aks engineered for addiction. No dopamine loops. No noise. The experience encourages reflection, not stimulation.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="quiet" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Begin</Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-reading px-6 pb-16 pt-16 text-center md:pt-24">
        <p className="label mb-6">A behavioral operating system for traders</p>
        <h1 className="font-serif text-display text-ink">
          Trade your intention,
          <br />
          not your impulse.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
          Most traders don&apos;t fail because they lack knowledge. They fail
          because they can&apos;t execute what they already know. Niyyah OS is
          built for that gap — discipline, self-awareness, and accountability.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/demo">
            <Button size="lg">Explore the live demo</Button>
          </Link>
          <Link href="/signup">
            <Button variant="secondary" size="lg">
              Take the assessment
            </Button>
          </Link>
        </div>
        <p className="mt-5 text-sm text-faint">
          The demo needs no sign-up. No charts. No signals. No PnL. Just behavior.
        </p>
      </section>

      {/* Principles */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="card p-7">
              <h2 className="font-serif text-xl text-ink">{p.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The loop */}
      <section className="mx-auto max-w-reading px-6 py-16">
        <p className="label mb-3 text-center">The entire product loop</p>
        <h2 className="text-center font-serif text-title text-ink">
          One quiet rhythm, repeated.
        </h2>
        <ol className="mt-10 space-y-1">
          {LOOP.map(([title, body], i) => (
            <li key={title} className="flex gap-5 rounded-2xl px-4 py-4 hover:bg-sand/40">
              <span className="font-serif text-2xl text-accent/40 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-medium text-ink">{title}</h3>
                <p className="mt-0.5 text-[15px] leading-relaxed text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-reading px-6 pb-24 pt-8 text-center">
        <blockquote className="font-serif text-2xl leading-snug text-ink md:text-3xl">
          &ldquo;This platform understands why I keep sabotaging myself.&rdquo;
        </blockquote>
        <div className="mt-10">
          <Link href="/signup">
            <Button size="lg">Begin your transformation</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-faint md:flex-row">
          <Logo />
          <p>Behavior is the product. Niyyah — نيّة — intention.</p>
        </div>
      </footer>
    </main>
  );
}
