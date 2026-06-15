# Niyyah OS

**Trade your intention, not your impulse.**

Niyyah OS is a **behavioral transformation platform for traders** — not a trading
course, journal, signals service, or prop dashboard. Most traders don't have an
information problem; they have an *execution* problem. Niyyah OS exists to help
traders execute what they already know by building discipline, self-awareness,
and accountability.

> _Niyyah_ (نيّة) — Arabic for **intention**.

**Behavior is the product.** There is no PnL, no win rate, no charts. The only
metric that matters is whether your behavioral violations fall over time.

---

## The product loop

1. **Assess** — a 54-question behavioral assessment across nine dimensions.
2. **Recognise** — receive your trader archetype and a deeply personal report.
3. **Show up** — a frictionless pre- and post-market daily check-in (< 5 min).
4. **Score** — a behavior score built only from disciplined acts and violations.
5. **Reflect** — a weekly reflection that becomes a growth timeline.
6. **See yourself** — automatic pattern detection exposes hidden loops.
7. **Stay accountable** — one accountability partner, consent-gated visibility.

---

## Modules

| Module | Where it lives |
| --- | --- |
| Trader Identity Assessment | `src/domain/assessment`, `src/components/assessment` |
| Trader Archetype Engine | `src/domain/archetypes`, `src/components/archetype` |
| Daily Accountability | `src/components/daily`, `src/services/dailyService.ts` |
| Behavioral Score Engine | `src/domain/behavior` |
| Pattern Detection | `src/domain/patterns`, `src/components/patterns` |
| Weekly Reflection | `src/components/reflection`, `src/services/reflectionService.ts` |
| Accountability Partner | `src/components/partner`, `src/services/partnerService.ts` |
| Dashboard | `src/components/dashboard` |

The nine behavioral dimensions: discipline, patience, risk behavior, ego, fear,
impulsiveness, consistency, accountability, and emotional regulation.

The eight archetypes: The Chaser, The Gambler, The Avenger, The Hesitator, The
Perfectionist, The Overconfident Trader, The Validation Seeker, The Rule Breaker.

---

## Tech stack

- **Next.js (App Router)** + **TypeScript** + **Tailwind CSS**
- **Firebase**: Authentication (Email + Google) and Firestore
- **Anthropic Claude** for self-awareness features (interpretation, weekly
  summaries, pattern narration) — used only where it deepens insight, never for
  gimmicks. Every AI feature degrades gracefully to deterministic output when no
  API key is present, so the product always works.

### Architecture

```
src/
  domain/      Pure, framework-free behavioral logic (typed, unit-testable)
  lib/         Firebase clients, auth provider, AI layer, utilities
  services/    Firestore data access
  components/  UI primitives + feature components
  app/         Next.js routes (App Router)
```

The `domain/` layer contains no React or Firebase — just the scoring engines,
archetype matching, and pattern detection. This keeps the behavioral core
portable and easy to reason about.

---

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase (and optional AI) keys
npm run dev
```

Open http://localhost:3000. Without Firebase credentials the marketing pages
render and the app explains what's missing; add the keys to enable sign-in.

### Firebase setup

1. Create a Firebase project and a Web app; copy the config into the
   `NEXT_PUBLIC_FIREBASE_*` variables.
2. Enable **Email/Password** and **Google** sign-in providers.
3. Create a **Firestore** database.
4. Deploy security rules and indexes:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```
5. (Optional, for privileged server features) add a service account to the
   `FIREBASE_*` admin variables.

### AI setup (optional)

Set `ANTHROPIC_API_KEY` to enable AI interpretation and summaries. Without it,
the app falls back to composed, deterministic insights.

---

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint
- `npm run typecheck` — TypeScript check

---

## Design principles

- **Calm by design.** No dopamine loops, no addictive streak mechanics, no
  noise. The experience encourages reflection, not stimulation.
- **Privacy first.** Behavioral data is private by default; partner visibility is
  explicit and consent-gated.
- **Honest, not shaming.** The product names your patterns so you feel *seen*,
  not judged.

The success metric is a **reduction in behavioral violations over time**. If
users become more disciplined, the product succeeds.
