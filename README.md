# Niyyah OS

**A personalized behavioral diagnosis & transformation product for traders.**

Niyyah OS is a **premium, one-time-purchase** product sold to traders inside
existing **Discord accountability communities**. It does not replace those
rooms or track behavior over time — the rooms already create accountability and
visibility. Niyyah OS does the thing the rooms can't: it **explains** the
trader's behavior and gives a concrete path to change.

> _Niyyah_ (نيّة) — Arabic for **intention**.

> The rooms **expose** behavior. Niyyah OS **explains** it.
> The rooms create **visibility**. Niyyah OS creates **understanding** and **direction**.

The customer already knows how to trade. He still revenge trades, overtrades,
moves stops, and breaks his rules. He doesn't need information — he needs
self-awareness and a plan.

---

## What the product delivers

One deep assessment → one rich personal report → one 30-day plan:

1. **Behavioral Assessment** — 54 items across nine dimensions.
2. **Trader Archetype** — 1 of 8 (Chaser, Avenger, Gambler, Hesitator,
   Perfectionist, Validation Seeker, Rule Breaker, Overconfident).
3. **Identity Report** — strengths, blind spots, emotional triggers, common rule
   violations, accountability weaknesses, and root causes.
4. **Nafs Analysis** — the dominant inner driver (greed, ego, fear, impatience,
   attachment, validation-seeking, laziness, overconfidence) beneath the mistakes.
5. **Self-Sabotage Loop Mapping** — the exact cycles keeping the trader stuck.
6. **Accountability Recommendations** — a paste-ready daily Discord check-in
   script + a "room briefing card" + what to commit to and monitor.
7. **30-Day Discipline Blueprint** — a personal, week-by-week plan run *through*
   the Discord room.

The report is rendered on the web, **exportable to PDF** (print), with
copy-to-clipboard scripts for Discord. AI (Claude) personalises the prose, with
a deterministic fallback so reports are never empty.

---

## How it's sold

A **one-time purchase**, gated by a **license code** the community owner issues
and distributes. After sign-in, a trader redeems the code at `/unlock` to view
the full report. (Codes live in the `licenseCodes` Firestore collection.)

---

## Try it with no sign-up

- Set `NEXT_PUBLIC_DEMO=1` to make the whole deployment a sample report, **or**
- visit **`/demo`** on any deployment to enable demo mode on that device.

The landing page's **"Explore the live demo"** button drops straight into a
fully-populated sample report (The Chaser).

---

## Tech stack

- **Next.js (App Router)** + **TypeScript** + **Tailwind CSS**
- **Firebase** — Auth (Email + Google) and Firestore (profile, report, license codes)
- **Anthropic Claude** — personalises the report prose (optional; graceful fallback)

### Architecture (deliberately lean)

```
src/
  domain/        Pure logic — assessment scoring, archetypes, nafs profile,
                 self-sabotage content, report generation, 30-day blueprint
  lib/           Firebase client, auth provider, AI layer, demo store, utils
  services/      Firestore access — report + license
  components/    UI primitives + assessment, report, unlock, settings
  app/           Routes: landing, auth, assessment, (app)/report, /unlock, /demo
```

There is no ongoing tracking, no rooms, no realtime, no background jobs — the
product is a near-stateless generator plus a saved artifact.

---

## Getting started

```bash
npm install
cp .env.example .env.local   # add Firebase keys (+ optional Anthropic key)
npm run dev                  # http://localhost:3000
```

Without Firebase, the landing + `/demo` still work. With Firebase, enable
Email/Password + Google sign-in, create Firestore, and deploy rules:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

To issue access codes, add documents to `licenseCodes` (doc id = the code),
each `{ used: false, usedBy: null, batch: "...", createdAt: "..." }`.

## Scripts

- `npm run dev` · `npm run build` · `npm run start` · `npm run lint` · `npm run typecheck`
