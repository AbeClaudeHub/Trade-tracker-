# Niyyah OS — Complete Project Bundle

> This single document is a self-contained snapshot of the entire Niyyah OS
> project, prepared so another AI agent (or developer) can understand everything
> about it: what it is, how it works, how it's architected, what every screen
> looks like, and the full source code of every file.
>
> Generated from branch `claude/niyyah-os-platform-v8bs7b`.
> Repository: `AbeClaudeHub/Trade-tracker-`.

---

## 1. What this is (in one paragraph)

**Niyyah OS is a behavioral transformation platform for traders — not a trading
course, journal, signals service, or prop dashboard.** Its premise: most traders
don't have an information problem, they have an *execution* problem. They already
know what to do; they sabotage themselves doing it. So Niyyah OS tracks **only
behavior** — never PnL, win rate, or market data — and optimizes for one outcome:
**a reduction in behavioral violations over time.** "Niyyah" (نيّة) is Arabic for
*intention.*

---

## 2. Core philosophy & non-goals

The product is **part behavioral operating system, part accountability platform,
part personal reflection tool.** It deliberately is **not** a trading course, a
trading journal, a signals platform, a prop-firm dashboard, a social network, or
a Discord clone. The intended user feeling: *"This platform understands why I keep
sabotaging myself."*

It optimizes for **reflection, pattern recognition, accountability, and
behavioral awareness** — not charts, indicators, market analysis, or trade ideas.

UX is **calm, minimal, intentional**: no dopamine loops, no addictive streak
mechanics, no notification spam, no gamification engineered around addiction. The
experience encourages reflection, not stimulation.

**Success metric:** not revenue, screen time, or engagement — only whether users
become more disciplined (fewer violations) over time.

---

## 3. The product loop (the entire product)

1. **Create account** (Email or Google).
2. **Complete the behavioral assessment** (54 questions).
3. **Receive a trader archetype** (1 of 8) with a deeply personal report.
4. **Receive strengths & weaknesses** (per-dimension behavioral profile).
5. **Begin the daily accountability process** (pre-market + post-market).
6. **Track a behavior score** (daily / weekly / monthly + trend).
7. **Weekly reflection** (becomes a growth timeline).
8. **Partner accountability** (one partner, consent-gated visibility).
9. **Long-term behavioral transformation** (patterns surface, violations fall).

---

## 4. The seven modules — how each works

### Module 1 — Trader Identity Assessment
- **54 Likert questions** (1–5) across **nine behavioral dimensions**: discipline,
  patience, risk behavior, ego, fear, impulsiveness, consistency, accountability,
  emotional regulation (6 questions each).
- Each question has a **weight** (1–3, how diagnostic it is) and a **reverse**
  flag (items where *agreeing* signals unhealthy behavior, inverted at scoring).
- Scoring (`src/domain/assessment/scoring.ts`): each answer becomes a 0–1 "healthy
  value", weighted and normalized into a **0–100 score per dimension** (higher =
  healthier). Partial assessments still score sensibly.
- Code: `src/domain/assessment/questions.ts`, `scoring.ts`;
  UI: `src/components/assessment/AssessmentFlow.tsx` (one question per screen,
  gentle auto-advance, progress bar — frictionless and mobile-first).

### Module 2 — Trader Archetype Engine
- **Eight archetypes**: The Chaser, The Gambler, The Avenger, The Hesitator, The
  Perfectionist, The Overconfident Trader, The Validation Seeker, The Rule Breaker.
- Each archetype (`src/domain/archetypes/data.ts`) has a full report: description,
  strengths, blind spots, common mistakes, emotional triggers, recommendations,
  and a **dimension "fingerprint"** (which weak dimensions pull a trader toward it).
- The engine (`engine.ts`) computes a **pull score** per archetype from the user's
  dimension deficits, ranks them, and resolves a **primary** + (if close enough) a
  **secondary** archetype.
- An optional **AI interpretation** personalizes the report further.
- UI: `src/components/archetype/ArchetypeReport.tsx`.

### Module 3 — Daily Accountability System
- **Pre-market**: How do I feel today? What is my plan? What could sabotage me
  today? + a 1–5 emotional-state rating.
- **Post-market**: Did I follow my rules? Did I violate risk? Did emotions affect
  decisions? What did I learn? + a behavior checklist that drives the score.
- Designed for **< 5 minutes, mobile-first, frictionless.**
- UI: `src/components/daily/DailyCheckin.tsx`; persistence:
  `src/services/dailyService.ts` (one Firestore doc per day, keyed `yyyy-MM-dd`).

### Module 4 — Behavioral Score Engine
- **No PnL, no win rate.** Behavior only. Scoring vocabulary
  (`src/domain/behavior/actions.ts`): Followed rules **+1**, Waited for setup **+1**,
  Honored stop **+1**, Respected risk **+1**, Overtraded **−1**, Moved stop **−1**,
  Revenge traded **−2**, Chased entries **−1**.
- `scoring.ts` computes daily score, **windowed** weekly/monthly summaries,
  a **consistency streak** (consecutive clean days), a **trend** series, and a calm
  **0–100 "discipline index"** for display. The platform rewards consistency, not
  profitability.

### Module 5 — Pattern Detection
- Analyzes behavioral history (`src/domain/patterns/detect.ts`) and surfaces
  recurring loops, each with a **confidence** score and severity
  (insight / watch / alert). Detectors:
  1. **Violations cluster after difficult days** ("your worst days come in pairs").
  2. **Day-of-week clustering** ("Mondays are your weak point").
  3. **Drift after a clean streak** ("success loosens your grip").
  4. **Emotional-state correlation** (high pre-market emotion → more violations).
  5. **Signature violation** (the single behavior behind most rule-breaks).
- Detectors are **conservative** (need enough sample + effect) so users feel *seen*,
  not lectured. UI: `src/components/patterns/PatternsView.tsx` + `PatternCard.tsx`,
  with an optional AI narrative tying patterns together.

### Module 6 — Weekly Reflection
- Four prompts: What improved? What repeated? What triggered mistakes? What will
  change next week? Stored per ISO week; older weeks form a **growth timeline.**
- Optional AI summary reflects the week back honestly.
- UI: `src/components/reflection/ReflectionView.tsx`; service:
  `reflectionService.ts`.

### Module 7 — Accountability Partner System
- **One** partner (not a social network). Invite by email → accept/decline →
  active. Weekly feedback exchange. **Consent-gated visibility**: the user chooses
  in Settings whether to share their behavior score and/or reflections; only a
  denormalized `sharedSummary` is ever read cross-user.
- UI: `src/components/partner/PartnerView.tsx`; service: `partnerService.ts`.

### Dashboard
- Answers "How disciplined am I becoming?" — discipline index dial, weekly/monthly
  score, consistency streak, 21-day behavior trend sparkline, detected patterns,
  latest reflection, partner status. UI: `src/components/dashboard/Dashboard.tsx`.

---

## 5. Screen-by-screen UI walkthrough (so you can "see" it)

The visual language is **calm and intentional**, built from first principles:

- **Canvas:** warm paper `#F6F4EF`. **Surfaces:** white cards with whisper-soft
  shadows and hairline borders (`#E7E2D8`).
- **Ink:** warm near-black `#1C1B17`; muted `#6E6A61`; faint `#9C968B`.
- **Accent:** evergreen `#2E4A40` (intention / steadiness / growth).
- **Behavioral semantics:** affirm = muted sage `#4F7A5E`; caution = amber
  `#9C7434`; **breach/violation = clay `#A8584A`** (deliberately *not* alarm-red).
- **Type:** Fraunces (serif) for headings and big numbers; Inter (sans) for UI.
- **Motion:** minimal; a single gentle `fade-up`; honors `prefers-reduced-motion`.
- **Brand mark:** a single filled dot inside an open ring — "intention held at the
  center." Wordmark: *Niyyah* in serif with a faint *OS*.

**Screens:**

- **Landing (`/`)** — Centered hero: eyebrow "A behavioral operating system for
  traders", serif headline *"Trade your intention, not your impulse."*, calm
  subcopy, two CTAs (Take the assessment / I have an account), and the line "No
  charts. No signals. No PnL tracking. Just behavior." Below: three principle
  cards, a numbered "product loop" list, and a closing pull-quote *"This platform
  understands why I keep sabotaging myself."*

- **Auth (`/login`, `/signup`)** — Minimal centered card: name (signup only),
  email, password, primary button, an "or" divider, **Continue with Google**. If
  Firebase isn't configured it shows a calm inline notice instead of breaking.

- **Assessment (`/assessment`)** — Full-screen, distraction-free. Top: logo + "n /
  54" counter and a thin progress bar. One question at a time with its dimension
  label, large serif prompt, and five tappable Likert options (radio-style). Gentle
  auto-advance after a tap; Back/Next; final "See my archetype". Footer reminder to
  answer honestly.

- **Archetype report (`/archetype`)** — Header with archetype name + tagline. Main
  column: description card (with an AI "A note for you" callout when available),
  then a 2×2 grid of Strengths / Blind spots / Common mistakes / Emotional
  triggers, then a highlighted "Where to begin" card with recommendations + CTA to
  daily practice. Side column: a ranked **behavioral profile** (dimension bars,
  weakest first) and any secondary archetype.

- **Daily (`/daily`)** — Two cards. "Before the session" (three textareas + a 5-
  button emotional-state selector, Calm→Volatile). "After the session" — affirming
  action chips (green when selected, showing +1) and violation chips (clay,
  showing −1/−2) with a live "Today: +N" badge, three Yes/No reflection toggles
  (colored by whether the answer is the healthy one), and a "What did I learn?"
  textarea.

- **Dashboard (`/dashboard`)** — Personalized header ("How disciplined are you
  becoming, {name}?"). Left: circular **discipline dial** (0–100). Right: four stat
  blocks (this week / this month / streak / affirmations) + a 21-day trend
  sparkline with a dashed zero line. Below: "What we're noticing" (top patterns) +
  side cards for latest reflection and partner status.

- **Patterns (`/patterns`)** — Optional AI "bigger picture" callout, then a grid of
  pattern cards (severity dot + label, confidence %, serif title, detail). Shows a
  calm "not enough signal yet" state until there's enough history.

- **Reflection (`/reflection`)** — The four reflection prompts in a card, a save
  button, an AI "Your week, reflected back" callout, and a "growth timeline" of
  past weeks below.

- **Partner (`/partner`)** — Empty state: invite by email. Pending: waiting or
  accept/decline. Active: partner's name + archetype, their shared progress
  (score/streak/commitment, only what they consented to), and a weekly feedback
  thread.

- **Settings (`/settings`)** — Display name, **partner visibility toggles** (share
  behavior score / share reflections), save, and a "retake the assessment" card.

- **App shell** — Desktop: left sidebar nav (Dashboard, Daily, Patterns, Reflect,
  Archetype, Partner, Settings) + sign out. Mobile: top bar + a 5-item bottom tab
  bar. Routes are auth-guarded; unauthenticated users are redirected to `/login`.

---

## 6. Architecture & tech stack

- **Next.js (App Router) + TypeScript + Tailwind CSS.**
- **Firebase**: Authentication (Email + Google) and Firestore.
- **Anthropic Claude** for self-awareness features (assessment interpretation,
  weekly summaries, pattern narration). Used *only* where it deepens insight; every
  AI call **degrades gracefully** to deterministic local output when no API key is
  set, so the product always works.

Layering keeps the behavioral core portable and testable:

```
src/
  domain/      Pure, framework-free behavioral logic (no React, no Firebase)
               - types.ts, assessment/, archetypes/, behavior/, patterns/
  lib/         Firebase clients, AuthProvider, AI layer, date & class utils
  services/    Firestore data access (collections, assessment, daily, reflection, partner)
  components/  UI primitives (ui/) + layout + per-feature components
  app/         Next.js routes: (auth) group, (app) group (shell), assessment, api/ai/*
```

**Data model (Firestore):**
- `users/{uid}` — profile (displayName, email, archetypeId, partnerVisibility,
  optional consent-gated `sharedSummary`).
- `users/{uid}/assessments/{id}` — responses, dimension scores, archetype, AI
  interpretation.
- `users/{uid}/dailies/{yyyy-MM-dd}` — pre/post-market, selected actions, score,
  `hadViolation`.
- `users/{uid}/reflections/{yyyy-Www}` — weekly reflection + AI summary.
- `partnerLinks/{id}` — `{ members: [uidA, uidB], requestedBy, status }`.
- `partnerFeedback/{id}` — weekly feedback messages.

**Security** (`firestore.rules`): per-user data is private to its owner; partner
data is mediated by an explicit mutual link and the user's own visibility consent.

**Build status:** TypeScript typecheck, ESLint, and `next build` (17 routes) all
pass clean.

---

## 7. How to run / deploy

- **Local:** `npm install` → copy `.env.example` to `.env.local` and add Firebase
  keys → `npm run dev` → http://localhost:3000.
- **Hosted:** Vercel (frontend) + Firebase (auth/data). Full mobile-friendly,
  tap-through instructions are in `DEPLOY.md` (also inlined below).
- AI is optional via `ANTHROPIC_API_KEY` (defaults to `claude-sonnet-4-6`).

Environment variables: the six `NEXT_PUBLIC_FIREBASE_*` keys are required for auth
+ data; `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` are optional. The Firebase Admin
SDK is included but not used by any runtime path, so admin keys aren't needed to
run the product.

---

## 8. Full source code

Every project file follows, in full, with its path. (Lockfile and build artifacts
are intentionally excluded.) This is the complete, authoritative code.

### Project file tree

````
.env.example
.eslintrc.json
.gitignore
DEPLOY.md
README.md
firebase.json
firestore.indexes.json
firestore.rules
next.config.mjs
package.json
postcss.config.mjs
src/app/(app)/archetype/page.tsx
src/app/(app)/daily/page.tsx
src/app/(app)/dashboard/page.tsx
src/app/(app)/layout.tsx
src/app/(app)/partner/page.tsx
src/app/(app)/patterns/page.tsx
src/app/(app)/reflection/page.tsx
src/app/(app)/settings/page.tsx
src/app/(auth)/login/page.tsx
src/app/(auth)/signup/page.tsx
src/app/api/ai/interpret/route.ts
src/app/api/ai/patterns/route.ts
src/app/api/ai/reflect/route.ts
src/app/assessment/page.tsx
src/app/globals.css
src/app/layout.tsx
src/app/page.tsx
src/components/archetype/ArchetypeReport.tsx
src/components/assessment/AssessmentFlow.tsx
src/components/auth/AuthForm.tsx
src/components/auth/RequireAuth.tsx
src/components/daily/DailyCheckin.tsx
src/components/dashboard/Dashboard.tsx
src/components/layout/AppShell.tsx
src/components/layout/Page.tsx
src/components/layout/icons.tsx
src/components/partner/PartnerView.tsx
src/components/patterns/PatternCard.tsx
src/components/patterns/PatternsView.tsx
src/components/reflection/ReflectionView.tsx
src/components/settings/SettingsView.tsx
src/components/ui/Button.tsx
src/components/ui/Card.tsx
src/components/ui/Field.tsx
src/components/ui/Logo.tsx
src/components/ui/ScoreDial.tsx
src/components/ui/Sparkline.tsx
src/domain/archetypes/data.ts
src/domain/archetypes/engine.ts
src/domain/assessment/questions.ts
src/domain/assessment/scoring.ts
src/domain/behavior/actions.ts
src/domain/behavior/scoring.ts
src/domain/patterns/detect.ts
src/domain/types.ts
src/lib/ai/anthropic.ts
src/lib/ai/insights.ts
src/lib/auth/AuthProvider.tsx
src/lib/dates.ts
src/lib/firebase/admin.ts
src/lib/firebase/client.ts
src/lib/utils.ts
src/services/assessmentService.ts
src/services/collections.ts
src/services/dailyService.ts
src/services/partnerService.ts
src/services/reflectionService.ts
tailwind.config.ts
tsconfig.json
````


---

### `.env.example`

````
# ─────────────────────────────────────────────────────────────────────────────
# Niyyah OS environment configuration
# Copy this file to `.env.local` and fill in your values.
# ─────────────────────────────────────────────────────────────────────────────

# Firebase client (browser) — from your Firebase project settings > Web app
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server) — from a service account JSON key.
# Keep the private key on one line with literal \n for newlines.
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# AI (Anthropic Claude) — optional. Without it, the app falls back to
# deterministic, locally-generated insights so everything still works.
ANTHROPIC_API_KEY=
# Optional model override. Defaults to a current, capable Claude model.
ANTHROPIC_MODEL=claude-sonnet-4-6
````

---

### `.eslintrc.json`

````json
{
  "extends": "next/core-web-vitals"
}
````

---

### `.gitignore`

````
# dependencies
/node_modules
/.pnp
.pnp.js

# next.js
/.next/
/out/
next-env.d.ts

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env*.local
.env.local

# vercel
.vercel

# typescript
*.tsbuildinfo

# firebase
.firebase/
firebase-debug.log
serviceAccount*.json
````

---

### `DEPLOY.md`

````markdown
# Deploying Niyyah OS from your phone

Everything below works in **mobile Safari** — no terminal needed. You'll set up
Firebase (auth + database), then deploy to Vercel (the hosted URL).

Total time: ~15 minutes. You'll copy 6 values from Firebase into Vercel.

---

## Part A — Firebase (the backend)

Open **console.firebase.google.com** and sign in with your Google account.

### 1. Create a project
- Tap **Add project** → name it `niyyah-os` → continue (Analytics optional) → create.

### 2. Add a Web app and copy the keys
- On the project home, tap the **`</>`** (Web) icon.
- Nickname it `niyyah-web` → **Register app**.
- You'll see a `firebaseConfig` block. **Keep this screen** — you'll copy these 6
  values into Vercel in Part B:

  | Firebase config field | Vercel variable |
  | --- | --- |
  | `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
  | `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
  | `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
  | `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
  | `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
  | `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

  (You can always find these again under **Project settings → Your apps**.)

### 3. Turn on sign-in
- Left menu → **Build → Authentication → Get started**.
- **Sign-in method** tab → enable **Email/Password** → save.
- Enable **Google** → pick a support email → save.

### 4. Create the database
- Left menu → **Build → Firestore Database → Create database**.
- Choose **Production mode** → pick a region near you → enable.

### 5. Paste the security rules
- In Firestore, open the **Rules** tab.
- Replace everything with the contents of [`firestore.rules`](./firestore.rules)
  in this repo → **Publish**.

> Indexes: the assessment, daily check-in, dashboard, and reflection all work
> immediately. The **Partner** page needs two composite indexes — the first time
> you open it, Firestore prints an error in the browser console with a tap-to-
> create link. Or add them manually in **Firestore → Indexes** using the fields
> listed in [`firestore.indexes.json`](./firestore.indexes.json).

---

## Part B — Vercel (the hosted URL)

Open **vercel.com** and tap **Sign Up** → **Continue with GitHub** (authorize it).

### 1. Import the repo
- **Add New… → Project**.
- Find **`Trade-tracker-`** → **Import**.
  (If you don't see it, tap **Adjust GitHub App Permissions** and grant access to
  the repo.)

### 2. Configure
- **Framework Preset**: Next.js (auto-detected). Leave build settings as-is.
- Expand **Environment Variables** and add the 6 values from Part A, step 2.
- *(Optional)* For AI interpretation & summaries, also add:
  - `ANTHROPIC_API_KEY` = your key from console.anthropic.com
  - `ANTHROPIC_MODEL` = `claude-sonnet-4-6`
  - Without these, the app still works using built-in deterministic insights.

### 3. Deploy
- Tap **Deploy**. After ~1–2 minutes you'll get a live URL like
  `https://trade-tracker.vercel.app`. That's your product. 🎉

---

## Part C — One required post-deploy step

Google sign-in only works on domains Firebase trusts.

- Back in **Firebase → Authentication → Settings → Authorized domains**.
- Tap **Add domain** and add your Vercel domain (e.g. `trade-tracker.vercel.app`).
  - `localhost` is already there for local testing.

Now open your Vercel URL, tap **Begin**, create an account, and take the
assessment.

---

## Updating later
Every push to the default branch (`claude/niyyah-os-platform-v8bs7b`) triggers a
new Vercel deployment automatically. Editing files on github.com from your phone
is enough to ship changes.

## Troubleshooting
- **"Firebase isn't configured yet"** on the app → an env var is missing or
  misspelled in Vercel. Check all 6, then redeploy (Vercel → Deployments →
  ⋯ → Redeploy).
- **Google popup closes / fails** → you skipped Part C (authorized domain).
- **Partner page error** → create the two Firestore indexes (see note above).
````

---

### `README.md`

````markdown
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
````

---

### `firebase.json`

````json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
````

---

### `firestore.indexes.json`

````json
{
  "indexes": [
    {
      "collectionGroup": "partnerLinks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "members", "arrayConfig": "CONTAINS" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "partnerFeedback",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "linkId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
````

---

### `firestore.rules`

````javascript
rules_version = '2';

// Niyyah OS — Firestore security rules.
// Principle: behavioral data is private by default. A user owns everything under
// their own document. Partner access is mediated by an explicit, mutual link
// and by the user's own visibility consent (only the denormalised
// `sharedSummary` and public-ish profile fields are ever read cross-user).

service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return isSignedIn() && request.auth.uid == uid;
    }

    // ── User profiles ──────────────────────────────────────────────────────
    match /users/{uid} {
      // Owner has full access.
      allow read, write: if isOwner(uid);

      // A signed-in user may READ another user's profile only to:
      //  - look them up by email to send a partner request, or
      //  - view a partner's shared summary.
      // Profiles contain no sensitive data beyond what the user chose to share.
      allow read: if isSignedIn();

      // Per-user private subcollections — owner only.
      match /assessments/{doc} {
        allow read, write: if isOwner(uid);
      }
      match /dailies/{doc} {
        allow read, write: if isOwner(uid);
      }
      match /reflections/{doc} {
        allow read, write: if isOwner(uid);
      }
    }

    // ── Partner links ────────────────────────────────────────────────────────
    match /partnerLinks/{linkId} {
      allow read: if isSignedIn() && request.auth.uid in resource.data.members;
      allow create: if isSignedIn()
        && request.auth.uid in request.resource.data.members
        && request.resource.data.requestedBy == request.auth.uid;
      // Either member may accept/decline/end.
      allow update: if isSignedIn() && request.auth.uid in resource.data.members;
    }

    // ── Partner feedback ─────────────────────────────────────────────────────
    match /partnerFeedback/{doc} {
      allow read: if isSignedIn()
        && (request.auth.uid == resource.data.fromUserId
            || request.auth.uid == resource.data.toUserId);
      allow create: if isSignedIn()
        && request.auth.uid == request.resource.data.fromUserId;
    }
  }
}
````

---

### `next.config.mjs`

````js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // firebase-admin uses Node APIs; keep it external to the server bundle.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
````

---

### `package.json`

````json
{
  "name": "niyyah-os",
  "version": "0.1.0",
  "private": true,
  "description": "Niyyah OS — a behavioral transformation platform for traders. Behavior is the product.",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "firebase": "^11.3.0",
    "firebase-admin": "^13.1.0",
    "next": "^15.1.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.0.1"
  },
  "devDependencies": {
    "@types/node": "^22.13.0",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.19.0",
    "eslint-config-next": "^15.1.6",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3"
  },
  "engines": {
    "node": ">=20"
  }
}
````

---

### `postcss.config.mjs`

````js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
````

---

### `src/app/(app)/archetype/page.tsx`

````tsx
import { ArchetypeReport } from "@/components/archetype/ArchetypeReport";

export default function ArchetypePage() {
  return <ArchetypeReport />;
}
````

---

### `src/app/(app)/daily/page.tsx`

````tsx
import { DailyCheckin } from "@/components/daily/DailyCheckin";

export default function DailyPage() {
  return <DailyCheckin />;
}
````

---

### `src/app/(app)/dashboard/page.tsx`

````tsx
import { Dashboard } from "@/components/dashboard/Dashboard";

export default function DashboardPage() {
  return <Dashboard />;
}
````

---

### `src/app/(app)/layout.tsx`

````tsx
import { AppShell } from "@/components/layout/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
````

---

### `src/app/(app)/partner/page.tsx`

````tsx
import { PartnerView } from "@/components/partner/PartnerView";

export default function PartnerPage() {
  return <PartnerView />;
}
````

---

### `src/app/(app)/patterns/page.tsx`

````tsx
import { PatternsView } from "@/components/patterns/PatternsView";

export default function PatternsPage() {
  return <PatternsView />;
}
````

---

### `src/app/(app)/reflection/page.tsx`

````tsx
import { ReflectionView } from "@/components/reflection/ReflectionView";

export default function ReflectionPage() {
  return <ReflectionView />;
}
````

---

### `src/app/(app)/settings/page.tsx`

````tsx
import { SettingsView } from "@/components/settings/SettingsView";

export default function SettingsPage() {
  return <SettingsView />;
}
````

---

### `src/app/(auth)/login/page.tsx`

````tsx
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
````

---

### `src/app/(auth)/signup/page.tsx`

````tsx
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
````

---

### `src/app/api/ai/interpret/route.ts`

````tsx
import { NextResponse } from "next/server";
import { ARCHETYPES } from "@/domain/archetypes/data";
import { interpretAssessment } from "@/lib/ai/insights";
import type { ArchetypeId, DimensionScores } from "@/domain/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { archetypeId, scores } = (await req.json()) as {
      archetypeId: ArchetypeId;
      scores: DimensionScores;
    };
    const archetype = ARCHETYPES[archetypeId];
    if (!archetype) {
      return NextResponse.json({ error: "Unknown archetype" }, { status: 400 });
    }
    const interpretation = await interpretAssessment(archetype, scores);
    return NextResponse.json({ interpretation });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Failed to interpret" },
      { status: 500 },
    );
  }
}
````

---

### `src/app/api/ai/patterns/route.ts`

````tsx
import { NextResponse } from "next/server";
import { narratePatterns } from "@/lib/ai/insights";
import type { DetectedPattern } from "@/domain/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { patterns } = (await req.json()) as { patterns: DetectedPattern[] };
    const narrative = await narratePatterns(patterns ?? []);
    return NextResponse.json({ narrative });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Failed to narrate" },
      { status: 500 },
    );
  }
}
````

---

### `src/app/api/ai/reflect/route.ts`

````tsx
import { NextResponse } from "next/server";
import { summarizeWeek } from "@/lib/ai/insights";
import type { WeeklyReflection } from "@/domain/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { reflection, context } = (await req.json()) as {
      reflection: WeeklyReflection;
      context: { score: number; violations: number; streak: number };
    };
    const summary = await summarizeWeek(reflection, context);
    return NextResponse.json({ summary });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Failed to summarise" },
      { status: 500 },
    );
  }
}
````

---

### `src/app/assessment/page.tsx`

````tsx
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AssessmentFlow } from "@/components/assessment/AssessmentFlow";

export default function AssessmentPage() {
  return (
    <RequireAuth>
      <AssessmentFlow />
    </RequireAuth>
  );
}
````

---

### `src/app/globals.css`

````css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

html {
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

body {
  @apply bg-canvas text-ink font-sans antialiased;
  font-feature-settings: "kern", "liga", "calt";
}

/* Quiet, intentional focus ring */
*:focus-visible {
  @apply outline-none ring-2 ring-accent/40 ring-offset-2 ring-offset-canvas rounded-sm;
}

/* Reusable composition layer — keeps markup calm and consistent */
@layer components {
  .card {
    @apply rounded-2xl border border-line bg-surface shadow-soft;
  }

  .label {
    @apply text-xs font-medium uppercase tracking-[0.14em] text-faint;
  }

  .prose-reflection {
    @apply text-ink/90 leading-relaxed;
  }

  .input-base {
    @apply w-full rounded-xl border border-line bg-raised px-4 py-3 text-ink
           placeholder:text-faint transition-colors
           focus:border-accent/50 focus:bg-surface;
  }
}

/* Honor users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
````

---

### `src/app/layout.tsx`

````tsx
import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthProvider";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Niyyah OS — Trade your intention, not your impulse",
  description:
    "A behavioral transformation platform for traders. Build discipline, expose your patterns, and execute what you already know. Behavior is the product.",
};

export const viewport: Viewport = {
  themeColor: "#F6F4EF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
````

---

### `src/app/page.tsx`

````tsx
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
        <div className="mt-9 flex items-center justify-center gap-3">
          <Link href="/signup">
            <Button size="lg">Take the assessment</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">
              I have an account
            </Button>
          </Link>
        </div>
        <p className="mt-5 text-sm text-faint">
          No charts. No signals. No PnL tracking. Just behavior.
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
````

---

### `src/components/archetype/ArchetypeReport.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getLatestAssessment, saveInterpretation } from "@/services/assessmentService";
import { getArchetype } from "@/domain/archetypes/engine";
import { rankDimensions } from "@/domain/assessment/scoring";
import { DIMENSION_LABELS, type AssessmentResult } from "@/domain/types";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DimensionBar } from "@/components/ui/ScoreDial";

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="label mb-3">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink/90">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/60" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArchetypeReport() {
  const { user } = useAuth();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [interpretation, setInterpretation] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const latest = await getLatestAssessment(user.uid);
      if (cancelled) return;
      setResult(latest);
      setLoading(false);

      if (latest) {
        if (latest.interpretation) {
          setInterpretation(latest.interpretation);
        } else {
          try {
            const res = await fetch("/api/ai/interpret", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                archetypeId: latest.archetypeId,
                scores: latest.dimensionScores,
              }),
            });
            const data = await res.json();
            if (!cancelled && data.interpretation) {
              setInterpretation(data.interpretation);
              saveInterpretation(user.uid, latest.id, data.interpretation).catch(
                () => {},
              );
            }
          } catch {
            /* fall back silently to the static report */
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <Page>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      </Page>
    );
  }

  if (!result) {
    return (
      <Page>
        <Card className="text-center">
          <h2 className="font-serif text-xl text-ink">No assessment yet</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Your archetype is revealed by the behavioral assessment. It takes
            about eight minutes and is the foundation of everything here.
          </p>
          <Link href="/assessment" className="mt-6 inline-block">
            <Button size="lg">Take the assessment</Button>
          </Link>
        </Card>
      </Page>
    );
  }

  const archetype = getArchetype(result.archetypeId);
  const secondary = result.secondaryArchetypeId
    ? getArchetype(result.secondaryArchetypeId)
    : null;
  const ranked = rankDimensions(result.dimensionScores);

  return (
    <Page>
      <PageHeader
        eyebrow="Your trader archetype"
        title={archetype.name}
        description={archetype.tagline}
        action={
          <Link href="/assessment">
            <Button variant="secondary" size="sm">
              Retake
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <p className="prose-reflection text-[15px] md:text-base">
              {archetype.description}
            </p>
            {interpretation ? (
              <div className="mt-5 rounded-xl border border-accent/15 bg-accent-soft/60 p-5">
                <p className="label mb-2 text-accent-ink/70">A note for you</p>
                <p className="prose-reflection whitespace-pre-line text-[15px]">
                  {interpretation}
                </p>
              </div>
            ) : null}
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <Section title="Strengths" items={archetype.strengths} />
            </Card>
            <Card>
              <Section title="Blind spots" items={archetype.blindSpots} />
            </Card>
            <Card>
              <Section title="Common mistakes" items={archetype.commonMistakes} />
            </Card>
            <Card>
              <Section title="Emotional triggers" items={archetype.emotionalTriggers} />
            </Card>
          </div>

          <Card className="border-accent/20 bg-accent-soft/40">
            <Section title="Where to begin" items={archetype.recommendations} />
            <Link href="/daily" className="mt-6 inline-block">
              <Button>Start your daily practice</Button>
            </Link>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="label mb-4">Your behavioral profile</h3>
            <div className="space-y-3.5">
              {ranked.map((d) => (
                <DimensionBar
                  key={d.dimension}
                  label={DIMENSION_LABELS[d.dimension]}
                  value={d.score}
                />
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-faint">
              Higher means healthier behavior. Your lowest dimensions are where
              your archetype lives — and where the work begins.
            </p>
          </Card>

          {secondary ? (
            <Card>
              <h3 className="label mb-2">A secondary pull</h3>
              <p className="font-serif text-lg text-ink">{secondary.name}</p>
              <p className="mt-1 text-sm text-muted">{secondary.tagline}</p>
            </Card>
          ) : null}
        </div>
      </div>
    </Page>
  );
}
````

---

### `src/components/assessment/AssessmentFlow.tsx`

````tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  ASSESSMENT_QUESTIONS,
  LIKERT_LABELS,
} from "@/domain/assessment/questions";
import { DIMENSION_LABELS, type LikertValue } from "@/domain/types";
import { submitAssessment } from "@/services/assessmentService";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const LIKERT: LikertValue[] = [1, 2, 3, 4, 5];

export function AssessmentFlow() {
  const router = useRouter();
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, LikertValue>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = ASSESSMENT_QUESTIONS.length;
  const question = ASSESSMENT_QUESTIONS[index]!;
  const current = answers[question.id];
  const progress = useMemo(
    () => Math.round((Object.keys(answers).length / total) * 100),
    [answers, total],
  );

  function choose(value: LikertValue) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    // Gentle auto-advance keeps friction low without feeling rushed.
    if (index < total - 1) {
      setTimeout(() => setIndex((i) => Math.min(total - 1, i + 1)), 180);
    }
  }

  async function finish() {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitAssessment(user.uid, answers);
      router.push("/archetype?fresh=1");
    } catch (e) {
      setError((e as Error).message ?? "Could not save your assessment.");
      setSubmitting(false);
    }
  }

  const isLast = index === total - 1;
  const allAnswered = Object.keys(answers).length === total;

  return (
    <main className="mx-auto flex min-h-screen max-w-reading flex-col px-5 py-8 md:py-12">
      <div className="mb-10 flex items-center justify-between">
        <Logo />
        <span className="text-sm tabular-nums text-faint">
          {index + 1} / {total}
        </span>
      </div>

      <div className="mb-10 h-1 w-full overflow-hidden rounded-full bg-sand">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div key={question.id} className="flex flex-1 flex-col animate-fade-up">
        <p className="label mb-4">{DIMENSION_LABELS[question.dimension]}</p>
        <h1 className="font-serif text-2xl leading-snug text-ink md:text-3xl">
          {question.prompt}
        </h1>

        <div className="mt-10 space-y-2.5">
          {LIKERT.map((value) => (
            <button
              key={value}
              onClick={() => choose(value)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left transition-all",
                current === value
                  ? "border-accent bg-accent-soft text-accent-ink"
                  : "border-line bg-surface text-ink hover:border-line-strong hover:bg-raised",
              )}
            >
              <span className="text-[15px]">{LIKERT_LABELS[value]}</span>
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border",
                  current === value ? "border-accent bg-accent" : "border-line-strong",
                )}
              >
                {current === value ? (
                  <span className="h-2 w-2 rounded-full bg-white" />
                ) : null}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="mt-6 rounded-lg bg-breachsoft px-3 py-2 text-sm text-breach">
          {error}
        </p>
      ) : null}

      <div className="mt-10 flex items-center justify-between">
        <Button
          variant="quiet"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          Back
        </Button>

        {isLast ? (
          <Button onClick={finish} disabled={!allAnswered || submitting}>
            {submitting ? "Reading your profile…" : "See my archetype"}
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            disabled={current === undefined}
          >
            Next
          </Button>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-faint">
        Answer honestly. No one sees this but you — and honesty is the whole point.
      </p>
    </main>
  );
}
````

---

### `src/components/auth/AuthForm.tsx`

````tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Field";

function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/invalid-credential": "That email and password don't match.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "An account already exists for that email.",
    "auth/weak-password": "Choose a password of at least 6 characters.",
    "auth/invalid-email": "That doesn't look like a valid email.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
  };
  return map[code] ?? (err as Error)?.message ?? "Something went wrong.";
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, configured } =
    useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isSignup) {
        await signUpWithEmail(email.trim().toLowerCase(), password, name.trim());
        router.push("/assessment");
      } else {
        await signInWithEmail(email.trim().toLowerCase(), password);
        router.push("/dashboard");
      }
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      router.push(isSignup ? "/assessment" : "/dashboard");
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="mb-10">
        <Logo />
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="font-serif text-title text-ink">
          {isSignup ? "Begin your transformation" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {isSignup
            ? "Create your account. Your behavioral assessment comes next."
            : "Sign in to continue your daily accountability."}
        </p>

        {!configured ? (
          <div className="mt-6 rounded-xl border border-caution/30 bg-cautionsoft px-4 py-3 text-sm text-ink">
            Firebase isn&apos;t configured yet. Add your{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_FIREBASE_*</code> keys
            (see <code className="font-mono text-xs">.env.example</code>) to enable
            sign-in.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {isSignup ? (
            <div>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                autoComplete="name"
                required
              />
            </div>
          ) : null}
          <div>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-breachsoft px-3 py-2 text-sm text-breach">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={busy || !configured}>
            {busy ? "One moment…" : isSignup ? "Create account" : "Sign in"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-faint">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>

        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={handleGoogle}
          disabled={busy || !configured}
        >
          Continue with Google
        </Button>

        <p className="mt-7 text-center text-sm text-muted">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New to Niyyah OS?{" "}
              <Link href="/signup" className="text-accent hover:underline">
                Begin
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
````

---

### `src/components/auth/RequireAuth.tsx`

````tsx
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
````

---

### `src/components/daily/DailyCheckin.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getDaily, savePreMarket, savePostMarket } from "@/services/dailyService";
import { AFFIRMING_ACTIONS, VIOLATION_ACTIONS } from "@/domain/behavior/actions";
import { scoreActions } from "@/domain/behavior/scoring";
import {
  type BehaviorActionId,
  type DailyEntry,
  type LikertValue,
} from "@/domain/types";
import { todayKey, formatLongDate } from "@/lib/dates";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea, FieldLabel } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

const INTENSITY: { value: LikertValue; label: string }[] = [
  { value: 1, label: "Calm" },
  { value: 2, label: "Settled" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Charged" },
  { value: 5, label: "Volatile" },
];

function ActionChip({
  label,
  description,
  points,
  selected,
  onToggle,
  tone,
}: {
  label: string;
  description: string;
  points: number;
  selected: boolean;
  onToggle: () => void;
  tone: "affirm" | "breach";
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all",
        selected
          ? tone === "affirm"
            ? "border-affirm/50 bg-affirmsoft"
            : "border-breach/50 bg-breachsoft"
          : "border-line bg-surface hover:bg-raised",
      )}
    >
      <span>
        <span className="text-[15px] font-medium text-ink">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted">
          {description}
        </span>
      </span>
      <span
        className={cn(
          "shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
          tone === "affirm" ? "text-affirm" : "text-breach",
        )}
      >
        {points > 0 ? `+${points}` : points}
      </span>
    </button>
  );
}

export function DailyCheckin() {
  const { user } = useAuth();
  const date = todayKey();
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);

  // Pre-market
  const [feeling, setFeeling] = useState("");
  const [plan, setPlan] = useState("");
  const [sabotage, setSabotage] = useState("");
  const [intensity, setIntensity] = useState<LikertValue | null>(null);
  const [savingPre, setSavingPre] = useState(false);

  // Post-market
  const [actions, setActions] = useState<BehaviorActionId[]>([]);
  const [followedRules, setFollowedRules] = useState<boolean | null>(null);
  const [violatedRisk, setViolatedRisk] = useState<boolean | null>(null);
  const [emotionsAffected, setEmotionsAffected] = useState<boolean | null>(null);
  const [learned, setLearned] = useState("");
  const [savingPost, setSavingPost] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const e = await getDaily(user.uid, date);
      if (e) {
        setEntry(e);
        if (e.preMarket) {
          setFeeling(e.preMarket.feeling);
          setPlan(e.preMarket.plan);
          setSabotage(e.preMarket.sabotageRisk);
          setIntensity(e.preMarket.emotionalState);
        }
        if (e.postMarket) {
          setFollowedRules(e.postMarket.followedRules);
          setViolatedRisk(e.postMarket.violatedRisk);
          setEmotionsAffected(e.postMarket.emotionsAffectedDecisions);
          setLearned(e.postMarket.learned);
        }
        setActions(e.actions ?? []);
      }
      setLoading(false);
    })();
  }, [user, date]);

  function toggle(id: BehaviorActionId) {
    setActions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

  async function handleSavePre() {
    if (!user || intensity === null) return;
    setSavingPre(true);
    const updated = await savePreMarket(user.uid, date, {
      feeling,
      plan,
      sabotageRisk: sabotage,
      emotionalState: intensity,
    });
    setEntry(updated);
    setSavingPre(false);
  }

  async function handleSavePost() {
    if (!user) return;
    setSavingPost(true);
    const updated = await savePostMarket(
      user.uid,
      date,
      {
        followedRules: followedRules ?? false,
        violatedRisk: violatedRisk ?? false,
        emotionsAffectedDecisions: emotionsAffected ?? false,
        learned,
      },
      actions,
    );
    setEntry(updated);
    setSavingPost(false);
  }

  const liveScore = scoreActions(actions);
  const preComplete = Boolean(entry?.preMarket);
  const postComplete = Boolean(entry?.postMarket);

  if (loading) {
    return (
      <Page>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      </Page>
    );
  }

  return (
    <Page className="max-w-3xl">
      <PageHeader
        eyebrow={formatLongDate(date)}
        title="Today's accountability"
        description="Two minutes before the open. Two minutes after the close. That's the whole practice."
      />

      {/* PRE-MARKET */}
      <Card className="mb-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink">Before the session</h2>
          {preComplete ? (
            <span className="rounded-full bg-affirmsoft px-2.5 py-1 text-xs font-medium text-affirm">
              Logged
            </span>
          ) : null}
        </div>

        <div className="space-y-5">
          <div>
            <FieldLabel>How do I feel today?</FieldLabel>
            <Textarea
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              placeholder="Name the emotion before it names your trades."
            />
          </div>
          <div>
            <FieldLabel>What is my plan?</FieldLabel>
            <Textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="What will you do — and just as importantly, what won't you do?"
            />
          </div>
          <div>
            <FieldLabel>What could sabotage me today?</FieldLabel>
            <Textarea
              value={sabotage}
              onChange={(e) => setSabotage(e.target.value)}
              placeholder="Name the trap before you walk into it."
            />
          </div>
          <div>
            <FieldLabel>Emotional state at the open</FieldLabel>
            <div className="grid grid-cols-5 gap-2">
              {INTENSITY.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIntensity(opt.value)}
                  className={cn(
                    "rounded-xl border px-2 py-3 text-center text-xs transition-all",
                    intensity === opt.value
                      ? "border-accent bg-accent-soft text-accent-ink"
                      : "border-line bg-surface text-muted hover:bg-raised",
                  )}
                >
                  <span className="block font-serif text-lg text-ink">{opt.value}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={handleSavePre} disabled={savingPre || intensity === null}>
            {savingPre ? "Saving…" : preComplete ? "Update morning check-in" : "Log my intention"}
          </Button>
        </div>
      </Card>

      {/* POST-MARKET */}
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink">After the session</h2>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium tabular-nums",
              liveScore > 0
                ? "bg-affirmsoft text-affirm"
                : liveScore < 0
                  ? "bg-breachsoft text-breach"
                  : "bg-sand text-muted",
            )}
          >
            Today: {liveScore > 0 ? `+${liveScore}` : liveScore}
          </span>
        </div>

        <p className="label mb-3">What did I do well?</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {AFFIRMING_ACTIONS.map((a) => (
            <ActionChip
              key={a.id}
              label={a.label}
              description={a.description}
              points={a.points}
              tone="affirm"
              selected={actions.includes(a.id)}
              onToggle={() => toggle(a.id)}
            />
          ))}
        </div>

        <p className="label mb-3 mt-6">Where did I break?</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {VIOLATION_ACTIONS.map((a) => (
            <ActionChip
              key={a.id}
              label={a.label}
              description={a.description}
              points={a.points}
              tone="breach"
              selected={actions.includes(a.id)}
              onToggle={() => toggle(a.id)}
            />
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <YesNo label="Did I follow my rules?" value={followedRules} onChange={setFollowedRules} good="yes" />
          <YesNo label="Did I violate risk?" value={violatedRisk} onChange={setViolatedRisk} good="no" />
          <YesNo
            label="Did emotions drive decisions?"
            value={emotionsAffected}
            onChange={setEmotionsAffected}
            good="no"
          />
        </div>

        <div className="mt-6">
          <FieldLabel>What did I learn?</FieldLabel>
          <Textarea
            value={learned}
            onChange={(e) => setLearned(e.target.value)}
            placeholder="One honest sentence is enough."
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handleSavePost} disabled={savingPost}>
            {savingPost ? "Saving…" : postComplete ? "Update review" : "Close the day"}
          </Button>
          {postComplete ? (
            <span className="text-sm text-muted">Saved. Rest well — tomorrow you go again.</span>
          ) : null}
        </div>
      </Card>
    </Page>
  );
}

function YesNo({
  label,
  value,
  onChange,
  good,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  good: "yes" | "no";
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <p className="mb-2 text-sm text-ink">{label}</p>
      <div className="flex gap-2">
        {[true, false].map((v) => {
          const isGood = (good === "yes") === v;
          const active = value === v;
          return (
            <button
              key={String(v)}
              type="button"
              onClick={() => onChange(v)}
              className={cn(
                "flex-1 rounded-lg border px-2 py-1.5 text-sm transition-all",
                active
                  ? isGood
                    ? "border-affirm/50 bg-affirmsoft text-affirm"
                    : "border-breach/50 bg-breachsoft text-breach"
                  : "border-line text-muted hover:bg-raised",
              )}
            >
              {v ? "Yes" : "No"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
````

---

### `src/components/dashboard/Dashboard.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { listDailies } from "@/services/dailyService";
import { listReflections } from "@/services/reflectionService";
import { getMyLink } from "@/services/partnerService";
import { getLatestAssessment } from "@/services/assessmentService";
import {
  buildTrend,
  consistencyStreak,
  disciplineIndex,
  summarizeWindow,
} from "@/domain/behavior/scoring";
import { detectPatterns } from "@/domain/patterns/detect";
import { getArchetype } from "@/domain/archetypes/engine";
import type {
  DailyEntry,
  DetectedPattern,
  PartnerLink,
  WeeklyReflection,
} from "@/domain/types";
import { daysAgoKey, todayKey, weekStartKey, formatShortDate } from "@/lib/dates";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScoreDial } from "@/components/ui/ScoreDial";
import { Sparkline } from "@/components/ui/Sparkline";
import { PatternCard } from "@/components/patterns/PatternCard";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="mt-1 font-serif text-2xl text-ink">{value}</p>
      {hint ? <p className="text-xs text-faint">{hint}</p> : null}
    </div>
  );
}

export function Dashboard() {
  const { user, profile } = useAuth();
  const [dailies, setDailies] = useState<DailyEntry[]>([]);
  const [reflections, setReflections] = useState<WeeklyReflection[]>([]);
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [link, setLink] = useState<PartnerLink | null>(null);
  const [hasAssessment, setHasAssessment] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [history, refl, partnerLink, assessment] = await Promise.all([
        listDailies(user.uid, daysAgoKey(90)),
        listReflections(user.uid),
        getMyLink(user.uid),
        getLatestAssessment(user.uid),
      ]);
      setDailies(history);
      setReflections(refl);
      setPatterns(detectPatterns(history).slice(0, 2));
      setLink(partnerLink);
      setHasAssessment(Boolean(assessment));
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <Page>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      </Page>
    );
  }

  if (hasAssessment === false) {
    return (
      <Page>
        <Card className="text-center">
          <h2 className="font-serif text-xl text-ink">Start with the assessment</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Everything in Niyyah OS begins with understanding how you behave.
            Take the behavioral assessment to reveal your archetype.
          </p>
          <Link href="/assessment" className="mt-6 inline-block">
            <Button size="lg">Begin the assessment</Button>
          </Link>
        </Card>
      </Page>
    );
  }

  const weekStart = weekStartKey();
  const weekly = summarizeWindow(dailies.filter((d) => d.date >= weekStart));
  const monthly = summarizeWindow(dailies.filter((d) => d.date >= daysAgoKey(30)));
  const streak = consistencyStreak(dailies, todayKey());
  const trend = buildTrend(dailies.filter((d) => d.date >= daysAgoKey(21)));
  const index = disciplineIndex(monthly.average);
  const archetype = profile?.archetypeId ? getArchetype(profile.archetypeId) : null;
  const latestReflection = reflections[0];

  const firstName = (profile?.displayName ?? "trader").split(" ")[0];

  return (
    <Page>
      <PageHeader
        eyebrow="Dashboard"
        title={`How disciplined are you becoming, ${firstName}?`}
        description={
          archetype
            ? `Tracked as ${archetype.name}. The only metric that matters is whether your violations fall over time.`
            : "The only metric that matters is whether your violations fall over time."
        }
        action={
          <Link href="/daily">
            <Button>Today&apos;s check-in</Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Discipline index */}
        <Card className="flex flex-col items-center justify-center text-center">
          <ScoreDial value={index} label="Discipline" />
          <p className="mt-4 max-w-[220px] text-sm text-muted">
            Your 30-day discipline index, built from behavior alone.
          </p>
        </Card>

        {/* Key numbers */}
        <Card className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Stat
              label="This week"
              value={weekly.total > 0 ? `+${weekly.total}` : `${weekly.total}`}
              hint={`${weekly.days} day${weekly.days === 1 ? "" : "s"} logged`}
            />
            <Stat
              label="This month"
              value={monthly.total > 0 ? `+${monthly.total}` : `${monthly.total}`}
              hint={`${monthly.violations} violation${monthly.violations === 1 ? "" : "s"}`}
            />
            <Stat label="Streak" value={`${streak}`} hint="clean days in a row" />
            <Stat
              label="Affirmations"
              value={`${monthly.affirmations}`}
              hint="disciplined acts (30d)"
            />
          </div>
          <div className="mt-7">
            <p className="label mb-3">Behavior trend · 21 days</p>
            <Sparkline data={trend} />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Patterns */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-ink">What we&apos;re noticing</h2>
            <Link href="/patterns" className="text-sm text-accent hover:underline">
              All patterns
            </Link>
          </div>
          {patterns.length > 0 ? (
            patterns.map((p) => <PatternCard key={p.id} pattern={p} />)
          ) : (
            <Card>
              <p className="text-sm text-muted">
                Keep logging your days. Once there&apos;s enough history, Niyyah OS
                will surface the patterns behind your violations — the ones that
                are hard to see from the inside.
              </p>
            </Card>
          )}
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="label">Latest reflection</h3>
              <Link href="/reflection" className="text-sm text-accent hover:underline">
                Reflect
              </Link>
            </div>
            {latestReflection ? (
              <div>
                <p className="text-xs text-faint">
                  Week of {formatShortDate(latestReflection.weekStart)}
                </p>
                <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink/90">
                  {latestReflection.nextWeek || latestReflection.improved || "—"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted">
                You haven&apos;t reflected yet this week.
              </p>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="label">Accountability partner</h3>
              <Link href="/partner" className="text-sm text-accent hover:underline">
                Manage
              </Link>
            </div>
            {link?.status === "active" ? (
              <p className="text-sm text-ink/90">You have an active partner.</p>
            ) : link?.status === "pending" ? (
              <p className="text-sm text-muted">A partner request is pending.</p>
            ) : (
              <p className="text-sm text-muted">
                No partner yet. One person who sees your behavior changes
                everything.
              </p>
            )}
          </Card>
        </div>
      </div>
    </Page>
  );
}
````

---

### `src/components/layout/AppShell.tsx`

````tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Logo } from "@/components/ui/Logo";
import { Icon, type IconName } from "./icons";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: IconName; primary?: boolean }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", primary: true },
  { href: "/daily", label: "Daily", icon: "daily", primary: true },
  { href: "/patterns", label: "Patterns", icon: "patterns", primary: true },
  { href: "/reflection", label: "Reflect", icon: "reflection", primary: true },
  { href: "/archetype", label: "Archetype", icon: "archetype" },
  { href: "/partner", label: "Partner", icon: "partner", primary: true },
  { href: "/settings", label: "Settings", icon: "settings" },
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
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-raised px-4 py-6 lg:flex">
        <Link href="/dashboard" className="px-2">
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
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-accent-soft font-medium text-accent-ink"
                    : "text-muted hover:bg-sand/60 hover:text-ink",
                )}
              >
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
      <div className="flex items-center justify-between border-b border-line bg-raised px-5 py-4 lg:hidden">
        <Link href="/dashboard">
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
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
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
````

---

### `src/components/layout/Page.tsx`

````tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Page({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow ? <p className="label mb-2">{eyebrow}</p> : null}
        <h1 className="font-serif text-title text-ink">{title}</h1>
        {description ? (
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
````

---

### `src/components/layout/icons.tsx`

````tsx
import type { SVGProps } from "react";

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export type IconName =
  | "dashboard"
  | "daily"
  | "patterns"
  | "reflection"
  | "archetype"
  | "partner"
  | "settings";

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const paths: Record<IconName, React.ReactNode> = {
    dashboard: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 12l4-3" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </>
    ),
    daily: (
      <>
        <rect x="4" y="5" width="16" height="16" rx="2.5" />
        <path d="M4 9h16M8 3v4M16 3v4M9 14l2 2 4-4" />
      </>
    ),
    patterns: (
      <>
        <path d="M4 18l5-6 4 3 7-9" />
        <path d="M20 6h-3M20 6v3" />
      </>
    ),
    reflection: (
      <>
        <path d="M5 6h14M5 12h14M5 18h9" />
      </>
    ),
    archetype: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
      </>
    ),
    partner: (
      <>
        <circle cx="8" cy="9" r="3" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M2.5 19c0-2.8 2.4-5 5.5-5s5.5 2.2 5.5 5M15 19c0-1.8.8-3.4 2-4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
      </>
    ),
  };
  return (
    <svg {...base} {...props}>
      {paths[name]}
    </svg>
  );
}
````

---

### `src/components/partner/PartnerView.tsx`

````tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  endPartnership,
  findUserByEmail,
  getMyLink,
  getPartnerProfile,
  listFeedback,
  requestPartner,
  respondToRequest,
  sendFeedback,
} from "@/services/partnerService";
import { getArchetype } from "@/domain/archetypes/engine";
import type { PartnerFeedback, PartnerLink, UserProfile } from "@/domain/types";
import { weekStartKey, formatShortDate } from "@/lib/dates";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, FieldLabel } from "@/components/ui/Field";

export function PartnerView() {
  const { user } = useAuth();
  const [link, setLink] = useState<PartnerLink | null>(null);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [feedback, setFeedback] = useState<PartnerFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const myLink = await getMyLink(user.uid);
    setLink(myLink);
    if (myLink) {
      const partnerUid = myLink.members.find((m) => m !== user.uid)!;
      const [profile, fb] = await Promise.all([
        getPartnerProfile(partnerUid),
        listFeedback(myLink.id),
      ]);
      setPartner(profile);
      setFeedback(fb);
    } else {
      setPartner(null);
      setFeedback([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleInvite() {
    if (!user || !email.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const target = await findUserByEmail(email.trim().toLowerCase());
      if (!target) throw new Error("No Niyyah OS member found with that email.");
      if (target.uid === user.uid) throw new Error("You can't partner with yourself.");
      await requestPartner(user.uid, target.uid);
      setEmail("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function respond(accept: boolean) {
    if (!link) return;
    setBusy(true);
    await respondToRequest(link.id, accept);
    await load();
    setBusy(false);
  }

  async function handleEnd() {
    if (!link) return;
    setBusy(true);
    await endPartnership(link.id);
    setLink(null);
    setPartner(null);
    setBusy(false);
  }

  async function handleSendFeedback() {
    if (!user || !link || !message.trim()) return;
    setBusy(true);
    await sendFeedback(link, user.uid, weekStartKey(), message.trim());
    setMessage("");
    await load();
    setBusy(false);
  }

  if (loading) {
    return (
      <Page>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      </Page>
    );
  }

  // ── No partner: invite ────────────────────────────────────────────────
  if (!link) {
    return (
      <Page className="max-w-2xl">
        <PageHeader
          eyebrow="Accountability partner"
          title="One person who sees your behavior"
          description="Not a network. Not a feed. A single accountability partner who can see your behavior score and your reflections — and who you can see in return."
        />
        <Card>
          <FieldLabel htmlFor="invite">Invite by email</FieldLabel>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="invite"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@example.com"
              className="flex-1"
            />
            <Button onClick={handleInvite} disabled={busy || !email.trim()}>
              {busy ? "Sending…" : "Send request"}
            </Button>
          </div>
          {error ? (
            <p className="mt-3 rounded-lg bg-breachsoft px-3 py-2 text-sm text-breach">
              {error}
            </p>
          ) : null}
          <p className="mt-4 text-xs leading-relaxed text-faint">
            They must already have a Niyyah OS account. You control exactly what
            they can see in Settings.
          </p>
        </Card>
      </Page>
    );
  }

  // ── Pending ───────────────────────────────────────────────────────────
  if (link.status === "pending") {
    const iRequested = link.requestedBy === user?.uid;
    return (
      <Page className="max-w-2xl">
        <PageHeader eyebrow="Accountability partner" title="Request pending" />
        <Card>
          {iRequested ? (
            <p className="text-muted">
              Your request has been sent. Once {partner?.displayName ?? "they"}{" "}
              accept, you&apos;ll both be able to see each other&apos;s behavior.
            </p>
          ) : (
            <>
              <p className="text-ink">
                <span className="font-medium">
                  {partner?.displayName ?? "A trader"}
                </span>{" "}
                invited you to be accountability partners.
              </p>
              <div className="mt-4 flex gap-3">
                <Button onClick={() => respond(true)} disabled={busy}>
                  Accept
                </Button>
                <Button variant="secondary" onClick={() => respond(false)} disabled={busy}>
                  Decline
                </Button>
              </div>
            </>
          )}
        </Card>
      </Page>
    );
  }

  // ── Active ────────────────────────────────────────────────────────────
  const archetype = partner?.archetypeId ? getArchetype(partner.archetypeId) : null;
  const shared = partner?.sharedSummary;

  return (
    <Page>
      <PageHeader
        eyebrow="Accountability partner"
        title={partner?.displayName ?? "Your partner"}
        description={archetype ? `Tracked as ${archetype.name}.` : undefined}
        action={
          <Button variant="secondary" size="sm" onClick={handleEnd} disabled={busy}>
            End partnership
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h3 className="label mb-4">Their progress</h3>
          {shared?.weeklyScore !== undefined ? (
            <div className="space-y-4">
              <div>
                <p className="font-serif text-3xl text-ink">
                  {shared.weeklyScore > 0 ? `+${shared.weeklyScore}` : shared.weeklyScore}
                </p>
                <p className="text-xs text-faint">behavior score this week</p>
              </div>
              {shared.streak !== undefined ? (
                <div>
                  <p className="font-serif text-2xl text-ink">{shared.streak}</p>
                  <p className="text-xs text-faint">clean-day streak</p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted">
              They haven&apos;t shared their behavior score, or haven&apos;t
              reflected yet this week.
            </p>
          )}
          {shared?.lastReflectionExcerpt ? (
            <div className="mt-5 border-t border-line pt-4">
              <p className="label mb-1">Their commitment</p>
              <p className="text-sm leading-relaxed text-ink/90">
                {shared.lastReflectionExcerpt}
              </p>
            </div>
          ) : null}
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="label mb-4">Weekly feedback</h3>
          <div className="flex flex-col gap-3">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Be honest and specific. Accountability is a gift, not a comfort."
            />
            <div>
              <Button onClick={handleSendFeedback} disabled={busy || !message.trim()}>
                Send feedback
              </Button>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {feedback.length === 0 ? (
              <p className="text-sm text-muted">No feedback exchanged yet.</p>
            ) : (
              feedback.map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl border border-line bg-raised p-4"
                >
                  <p className="mb-1 text-xs text-faint">
                    {f.fromUserId === user?.uid ? "You" : partner?.displayName ?? "Partner"}{" "}
                    · week of {formatShortDate(f.weekStart)}
                  </p>
                  <p className="text-sm leading-relaxed text-ink/90">{f.message}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </Page>
  );
}
````

---

### `src/components/patterns/PatternCard.tsx`

````tsx
import type { DetectedPattern, PatternSeverity } from "@/domain/types";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const TONE: Record<PatternSeverity, { dot: string; label: string; text: string }> = {
  insight: { dot: "bg-accent", label: "Insight", text: "text-accent" },
  watch: { dot: "bg-caution", label: "Watch", text: "text-caution" },
  alert: { dot: "bg-breach", label: "Alert", text: "text-breach" },
};

export function PatternCard({ pattern }: { pattern: DetectedPattern }) {
  const tone = TONE[pattern.severity];
  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <span className={cn("flex items-center gap-2 text-xs font-medium", tone.text)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
          {tone.label}
        </span>
        <span className="text-xs text-faint">
          {Math.round(pattern.confidence * 100)}% confidence
        </span>
      </div>
      <h3 className="font-serif text-lg text-ink">{pattern.title}</h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{pattern.detail}</p>
    </Card>
  );
}
````

---

### `src/components/patterns/PatternsView.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { listDailies } from "@/services/dailyService";
import { detectPatterns } from "@/domain/patterns/detect";
import type { DailyEntry, DetectedPattern } from "@/domain/types";
import { daysAgoKey } from "@/lib/dates";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { PatternCard } from "./PatternCard";

export function PatternsView() {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [narrative, setNarrative] = useState("");
  const [days, setDays] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const history = await listDailies(user.uid, daysAgoKey(180));
      if (cancelled) return;
      const detected = detectPatterns(history);
      setDays(history);
      setPatterns(detected);
      setLoading(false);

      if (detected.length > 0) {
        try {
          const res = await fetch("/api/ai/patterns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patterns: detected }),
          });
          const data = await res.json();
          if (!cancelled && data.narrative) setNarrative(data.narrative);
        } catch {
          /* deterministic cards still stand on their own */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const loggedDays = days.filter((d) => d.postMarket || d.actions.length > 0).length;

  return (
    <Page>
      <PageHeader
        eyebrow="Pattern detection"
        title="The patterns beneath your behavior"
        description="Niyyah OS watches your history for the loops you can't see from the inside. Insights only appear when the evidence is strong enough to trust."
      />

      {loading ? (
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      ) : patterns.length === 0 ? (
        <Card>
          <h2 className="font-serif text-lg text-ink">Not enough signal yet</h2>
          <p className="mt-2 max-w-lg text-muted">
            You&apos;ve logged {loggedDays} day{loggedDays === 1 ? "" : "s"}.
            Patterns surface once there&apos;s enough history to separate a habit
            from a coincidence — usually within a couple of weeks of consistent
            check-ins. Keep showing up.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {narrative ? (
            <Card className="border-accent/20 bg-accent-soft/40">
              <p className="label mb-2 text-accent-ink/70">The bigger picture</p>
              <p className="prose-reflection text-[15px] md:text-base">{narrative}</p>
            </Card>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {patterns.map((p) => (
              <PatternCard key={p.id} pattern={p} />
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}
````

---

### `src/components/reflection/ReflectionView.tsx`

````tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  getReflection,
  listReflections,
  saveReflection,
  saveReflectionSummary,
} from "@/services/reflectionService";
import { listDailies } from "@/services/dailyService";
import { updateSharedSummary } from "@/services/partnerService";
import { consistencyStreak, summarizeWindow } from "@/domain/behavior/scoring";
import type { WeeklyReflection } from "@/domain/types";
import { todayKey, weekId, weekStartKey, formatShortDate } from "@/lib/dates";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea, FieldLabel } from "@/components/ui/Field";

const PROMPTS: {
  key: keyof Pick<WeeklyReflection, "improved" | "repeated" | "triggers" | "nextWeek">;
  label: string;
  placeholder: string;
}[] = [
  { key: "improved", label: "What improved this week?", placeholder: "Name the growth, however small." },
  { key: "repeated", label: "What repeated?", placeholder: "The mistake you keep returning to." },
  { key: "triggers", label: "What triggered your mistakes?", placeholder: "The conditions, emotions, or moments behind them." },
  { key: "nextWeek", label: "What will you change next week?", placeholder: "One specific, behavioral commitment." },
];

export function ReflectionView() {
  const { user, profile } = useAuth();
  const [fields, setFields] = useState({ improved: "", repeated: "", triggers: "", nextWeek: "" });
  const [history, setHistory] = useState<WeeklyReflection[]>([]);
  const [summary, setSummary] = useState("");
  const [context, setContext] = useState({ score: 0, violations: 0, streak: 0 });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const weekStart = weekStartKey();
      const [current, all, weekDailies] = await Promise.all([
        getReflection(user.uid),
        listReflections(user.uid),
        listDailies(user.uid, weekStart),
      ]);
      if (current) {
        setFields({
          improved: current.improved,
          repeated: current.repeated,
          triggers: current.triggers,
          nextWeek: current.nextWeek,
        });
        if (current.summary) setSummary(current.summary);
      }
      setHistory(all);
      const window = summarizeWindow(weekDailies);
      setContext({
        score: window.total,
        violations: window.violations,
        streak: consistencyStreak(weekDailies, todayKey()),
      });
      setLoading(false);
    })();
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const saved = await saveReflection(user.uid, fields);

    // Generate an AI summary of the week (graceful if AI is unconfigured).
    try {
      const res = await fetch("/api/ai/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reflection: saved, context }),
      });
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
        await saveReflectionSummary(user.uid, saved.id, data.summary);
        saved.summary = data.summary;
      }
    } catch {
      /* ignore */
    }

    // Share a consent-gated excerpt with an accountability partner.
    if (profile) {
      updateSharedSummary(user.uid, profile.partnerVisibility, {
        weeklyScore: context.score,
        streak: context.streak,
        lastReflectionExcerpt: fields.nextWeek,
      }).catch(() => {});
    }

    setHistory((prev) => [saved, ...prev.filter((r) => r.id !== saved.id)]);
    setSaving(false);
  }

  if (loading) {
    return (
      <Page>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      </Page>
    );
  }

  const pastWeeks = history.filter((r) => r.id !== weekId());

  return (
    <Page className="max-w-3xl">
      <PageHeader
        eyebrow={`Week of ${formatShortDate(weekStartKey())}`}
        title="Weekly reflection"
        description="Once a week, step back. This is where scattered days become a story you can learn from."
      />

      <Card className="mb-6">
        <div className="space-y-5">
          {PROMPTS.map((p) => (
            <div key={p.key}>
              <FieldLabel>{p.label}</FieldLabel>
              <Textarea
                value={fields[p.key]}
                onChange={(e) => setFields((prev) => ({ ...prev, [p.key]: e.target.value }))}
                placeholder={p.placeholder}
              />
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving your reflection…" : "Save this week"}
          </Button>
        </div>

        {summary ? (
          <div className="mt-6 rounded-xl border border-accent/15 bg-accent-soft/60 p-5">
            <p className="label mb-2 text-accent-ink/70">Your week, reflected back</p>
            <p className="prose-reflection text-[15px]">{summary}</p>
          </div>
        ) : null}
      </Card>

      {pastWeeks.length > 0 ? (
        <section>
          <h2 className="mb-4 font-serif text-lg text-ink">Your growth timeline</h2>
          <div className="space-y-4">
            {pastWeeks.map((r) => (
              <Card key={r.id}>
                <p className="text-xs text-faint">Week of {formatShortDate(r.weekStart)}</p>
                {r.summary ? (
                  <p className="mt-2 prose-reflection text-[15px]">{r.summary}</p>
                ) : (
                  <dl className="mt-3 space-y-2 text-sm">
                    {r.improved ? (
                      <div>
                        <dt className="text-faint">Improved</dt>
                        <dd className="text-ink/90">{r.improved}</dd>
                      </div>
                    ) : null}
                    {r.nextWeek ? (
                      <div>
                        <dt className="text-faint">Committed to</dt>
                        <dd className="text-ink/90">{r.nextWeek}</dd>
                      </div>
                    ) : null}
                  </dl>
                )}
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </Page>
  );
}
````

---

### `src/components/settings/SettingsView.tsx`

````tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { updateDoc } from "firebase/firestore";
import { useAuth } from "@/lib/auth/AuthProvider";
import { paths } from "@/services/collections";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-line-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function SettingsView() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.displayName ?? "");
  const [shareScore, setShareScore] = useState(
    profile?.partnerVisibility.behaviorScore ?? true,
  );
  const [shareReflections, setShareReflections] = useState(
    profile?.partnerVisibility.reflections ?? false,
  );
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    if (!user) return;
    setBusy(true);
    setSaved(false);
    await updateDoc(paths.user(user.uid), {
      displayName: name.trim() || "Trader",
      partnerVisibility: {
        behaviorScore: shareScore,
        reflections: shareReflections,
      },
    });
    await refreshProfile();
    setBusy(false);
    setSaved(true);
  }

  return (
    <Page className="max-w-2xl">
      <PageHeader eyebrow="Settings" title="Your account" />

      <Card className="mb-6">
        <FieldLabel htmlFor="name">Display name</FieldLabel>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        <p className="mt-2 text-xs text-faint">
          Signed in as {profile?.email ?? user?.email}
        </p>
      </Card>

      <Card className="mb-6">
        <h3 className="font-serif text-lg text-ink">Partner visibility</h3>
        <p className="mt-1 text-sm text-muted">
          You control exactly what an accountability partner can see. Nothing is
          shared unless you choose it.
        </p>
        <div className="mt-3 divide-y divide-line">
          <Toggle
            label="Share my behavior score"
            description="Your weekly behavior score and clean-day streak."
            checked={shareScore}
            onChange={setShareScore}
          />
          <Toggle
            label="Share my reflections"
            description="Your weekly commitment, shown to your partner."
            checked={shareReflections}
            onChange={setShareReflections}
          />
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
        {saved ? <span className="text-sm text-affirm">Saved.</span> : null}
      </div>

      <Card className="mt-8">
        <h3 className="font-serif text-lg text-ink">Reassess</h3>
        <p className="mt-1 text-sm text-muted">
          Behavior changes. Retake the assessment to see how your archetype has
          shifted.
        </p>
        <Link href="/assessment" className="mt-4 inline-block">
          <Button variant="secondary">Retake the assessment</Button>
        </Link>
      </Card>
    </Page>
  );
}
````

---

### `src/components/ui/Button.tsx`

````tsx
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "quiet";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover shadow-soft disabled:opacity-50",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-raised disabled:opacity-50",
  ghost: "text-ink hover:bg-sand/60 disabled:opacity-40",
  quiet: "text-muted hover:text-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-11 px-5 text-sm rounded-xl",
  lg: "h-13 px-7 text-base rounded-xl py-3.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all",
        "focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
````

---

### `src/components/ui/Card.tsx`

````tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card p-6", className)} {...props} />;
}

export function CardHeader({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-4", className)}>
      <h3 className="font-serif text-lg text-ink">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-muted">{description}</p>
      ) : null}
    </div>
  );
}
````

---

### `src/components/ui/Field.tsx`

````tsx
import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
      {children}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn("input-base", className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn("input-base min-h-[96px] resize-y leading-relaxed", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";
````

---

### `src/components/ui/Logo.tsx`

````tsx
import { cn } from "@/lib/utils";

/**
 * Niyyah wordmark. The mark is a single deliberate point inside an open ring —
 * intention held at the centre. Quiet, not loud.
 */
export function Logo({
  className,
  showWord = true,
}: {
  className?: string;
  showWord?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative inline-flex h-7 w-7 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-[1.5px] border-accent/70" />
        <span className="h-2 w-2 rounded-full bg-accent" />
      </span>
      {showWord ? (
        <span className="font-serif text-lg leading-none tracking-tight text-ink">
          Niyyah<span className="text-faint"> OS</span>
        </span>
      ) : null}
    </span>
  );
}
````

---

### `src/components/ui/ScoreDial.tsx`

````tsx
import { cn } from "@/lib/utils";

/**
 * A calm circular gauge for the discipline index (0–100). No color alarmism —
 * the arc deepens toward evergreen as discipline grows.
 */
export function ScoreDial({
  value,
  label,
  size = 168,
}: {
  value: number;
  label?: string;
  size?: number;
}) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E7E2D8"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2E4A40"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-4xl text-ink">{Math.round(clamped)}</span>
        {label ? (
          <span className="mt-0.5 text-xs uppercase tracking-[0.14em] text-faint">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function DimensionBar({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("", className)}>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm text-ink">{label}</span>
        <span className="text-sm tabular-nums text-muted">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-sand">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
````

---

### `src/components/ui/Sparkline.tsx`

````tsx
import type { BehaviorTrendPoint } from "@/domain/types";

/** A quiet line of behavior over time. Zero line drawn for reference. */
export function Sparkline({
  data,
  width = 520,
  height = 120,
}: {
  data: BehaviorTrendPoint[];
  width?: number;
  height?: number;
}) {
  if (data.length < 2) {
    return (
      <div className="flex h-[120px] items-center justify-center text-sm text-faint">
        A few more days of check-ins and your trend will appear here.
      </div>
    );
  }

  const pad = 8;
  const scores = data.map((d) => d.score);
  const min = Math.min(-1, ...scores);
  const max = Math.max(1, ...scores);
  const range = max - min || 1;

  const x = (i: number) => pad + (i / (data.length - 1)) * (width - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / range) * (height - pad * 2);

  const line = data.map((d, i) => `${x(i)},${y(d.score)}`).join(" ");
  const zeroY = y(0);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <line x1={pad} y1={zeroY} x2={width - pad} y2={zeroY} stroke="#E7E2D8" strokeWidth={1} strokeDasharray="3 4" />
      <polyline
        points={line}
        fill="none"
        stroke="#2E4A40"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((d, i) => (
        <circle key={d.date} cx={x(i)} cy={y(d.score)} r={2.5} fill="#2E4A40" />
      ))}
    </svg>
  );
}
````

---

### `src/domain/archetypes/data.ts`

````tsx
import type { Archetype, ArchetypeId } from "@/domain/types";

/**
 * The eight initial trader archetypes.
 *
 * Each archetype is a *behavioral* identity, not a strategy. The `fingerprint`
 * maps a low score on a dimension to a pull toward this archetype (the more
 * negative, the stronger the pull when that dimension is weak).
 *
 * Reports are written to feel personal and honest — naming the pattern without
 * shaming the person.
 */
export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  chaser: {
    id: "chaser",
    name: "The Chaser",
    tagline: "You hate watching the move leave without you.",
    description:
      "You see opportunity everywhere, and that is both your gift and your wound. When price runs, something in you refuses to be left behind — so you enter late, into extended moves, paying the worst price for the privilege of feeling involved. The chase is rarely about the trade. It's about not being able to tolerate the feeling of missing out.",
    strengths: [
      "You are alert, engaged, and rarely miss what's happening in the market.",
      "You act decisively when you commit.",
      "Your energy and appetite for opportunity are real assets once channeled.",
    ],
    blindSpots: [
      "You confuse motion with progress — being in a trade feels like winning.",
      "You enter after the edge has already been priced in.",
      "FOMO overrides your plan in the moments that matter most.",
    ],
    commonMistakes: [
      "Buying tops and selling bottoms after a move is already exhausted.",
      "Abandoning your entry criteria to 'get in before it's too late.'",
      "Stacking chase-trades after watching others post gains.",
    ],
    emotionalTriggers: [
      "Seeing a fast, vertical move",
      "Others posting wins you 'should' have caught",
      "The feeling of being left out",
    ],
    recommendations: [
      "Define the exact entry window. If price is past it, the trade is gone — and that is allowed.",
      "Keep a 'missed it on purpose' log. Reward yourself for the trades you didn't chase.",
      "Before any late entry, write one sentence: 'What is my edge here, right now?' If you can't, you don't have one.",
    ],
    fingerprint: { patience: -3, impulsiveness: -2, fear: -1, discipline: -1 },
  },

  gambler: {
    id: "gambler",
    name: "The Gambler",
    tagline: "The thrill is the point — and that's the problem.",
    description:
      "For you, the market is alive in a way it isn't for most people. The uncertainty is intoxicating. You size up when your conviction spikes, you take the trade for the rush as much as the reason, and the line between trading and gambling can quietly disappear. You are capable of real edge — but the part of you that craves the action keeps undoing the part of you that knows better.",
    strengths: [
      "You are comfortable with uncertainty that paralyses others.",
      "You can pull the trigger without endless hesitation.",
      "When disciplined, your tolerance for risk becomes genuine courage.",
    ],
    blindSpots: [
      "You size by feeling, not by formula.",
      "The dopamine of action matters more than the quality of the setup.",
      "You mistake variance for skill after a hot streak.",
    ],
    commonMistakes: [
      "Oversizing on 'sure things.'",
      "Trading for stimulation during dead markets.",
      "Letting a single conviction trade put real damage on the account.",
    ],
    emotionalTriggers: [
      "Boredom and flat markets",
      "A surge of certainty",
      "The desire to feel something",
    ],
    recommendations: [
      "Fix your risk per trade as a hard rule. Conviction does not change position size — ever.",
      "Separate 'I want action' from 'there is a setup.' Name which one you're feeling before entering.",
      "Schedule deliberate screen-off time so trading stops being your only source of stimulation.",
    ],
    fingerprint: { risk: -3, impulsiveness: -2, emotionalRegulation: -1, discipline: -1 },
  },

  avenger: {
    id: "avenger",
    name: "The Avenger",
    tagline: "You don't trade the market — you trade your last loss.",
    description:
      "When the market takes from you, you want it back, and you want it back now. Revenge trading is the signature pattern: a loss lands, the pain spikes, and the next trade is no longer a decision — it's a counterattack. You are loyal, intense, and you care deeply about winning. But the need to get even turns a single loss into a cascade.",
    strengths: [
      "You are tenacious and refuse to be beaten.",
      "You feel things deeply, which can fuel real commitment.",
      "Your competitiveness, once aimed inward at your process, is powerful.",
    ],
    blindSpots: [
      "A loss feels like a personal attack that must be answered.",
      "Your worst trades cluster immediately after your painful ones.",
      "You escalate size to 'make it back fast.'",
    ],
    commonMistakes: [
      "Re-entering immediately after a stop-out, on tilt.",
      "Doubling size to recover a loss in one trade.",
      "Trading well past your daily limit when you're down.",
    ],
    emotionalTriggers: [
      "A loss that felt unfair",
      "Being stopped out just before price reverses",
      "Ending the day red",
    ],
    recommendations: [
      "Install a mandatory cooldown after any loss beyond a threshold — step away, no exceptions.",
      "Set a hard daily loss limit that ends your session automatically.",
      "After a loss, write what you feel before you do anything. Name the urge to get even.",
    ],
    fingerprint: { emotionalRegulation: -3, risk: -2, ego: -1, discipline: -1 },
  },

  hesitator: {
    id: "hesitator",
    name: "The Hesitator",
    tagline: "You see the setup clearly — and freeze.",
    description:
      "You often know exactly what to do, and then watch yourself not do it. Fear of being wrong, of losing, of the discomfort of commitment keeps your finger off the trigger until the move is gone — at which point you chase it, completing the cruelest loop in trading. The irony is that your caution is a strength wearing the mask of a weakness.",
    strengths: [
      "You are thoughtful and rarely reckless.",
      "You respect risk instinctively.",
      "Your patience is real — it just tips into paralysis.",
    ],
    blindSpots: [
      "You treat a valid loss as a personal failure to be avoided at all costs.",
      "You demand certainty the market will never give.",
      "Your missed trades hurt more than your losing ones — but you don't log them.",
    ],
    commonMistakes: [
      "Skipping valid setups and chasing them later.",
      "Cutting winners early out of fear.",
      "Over-analysing until the opportunity passes.",
    ],
    emotionalTriggers: [
      "The moment of committing capital",
      "A recent loss",
      "Ambiguity in the setup",
    ],
    recommendations: [
      "Pre-commit: when criteria are met, you take it. Decide before, not during.",
      "Trade a defined small size while rebuilding trust in your execution.",
      "Log every missed valid setup as a 'cost.' Make inaction visible.",
    ],
    fingerprint: { fear: -3, impulsiveness: 1, accountability: -1, consistency: -1 },
  },

  perfectionist: {
    id: "perfectionist",
    name: "The Perfectionist",
    tagline: "If it isn't flawless, you treat it as a failure.",
    description:
      "You hold yourself to an impossible standard. One rule-break, one imperfect exit, and the whole day is 'ruined' — so you either over-tinker your system endlessly or quit setups that don't look textbook. Your standards are a strength turned against you: you punish good-enough execution and starve yourself of the consistency that actually compounds.",
    strengths: [
      "Your attention to detail and process is genuinely high.",
      "You care about doing things right.",
      "You're capable of real discipline once you accept imperfection.",
    ],
    blindSpots: [
      "All-or-nothing thinking: one mistake voids the whole session.",
      "Endless system-tweaking instead of repetition.",
      "You conflate a clean chart with a valid trade.",
    ],
    commonMistakes: [
      "Abandoning a working system after a normal losing streak.",
      "Refusing 'B+' setups while waiting for the perfect one.",
      "Spiraling after a single rule-break instead of resetting.",
    ],
    emotionalTriggers: [
      "A small, avoidable mistake",
      "A losing streak inside a sound system",
      "Setups that are valid but not pretty",
    ],
    recommendations: [
      "Measure adherence, not perfection. A 90% day is an excellent day.",
      "Freeze your system for a fixed sample size before changing anything.",
      "After a mistake, run a 60-second reset ritual instead of writing off the day.",
    ],
    fingerprint: { consistency: -2, ego: -2, emotionalRegulation: -1, patience: -1 },
  },

  overconfident: {
    id: "overconfident",
    name: "The Overconfident Trader",
    tagline: "Your edge is real — until success convinces you the rules are optional.",
    description:
      "When you're winning, you feel unstoppable — and that's exactly when the danger begins. Success loosens your discipline: size creeps up, rules feel like training wheels, and a hot streak becomes the setup for the drawdown that erases it. Your confidence is earned, but unchecked it stops being an asset and becomes the leak.",
    strengths: [
      "You act decisively and trust your read.",
      "You recover from setbacks without losing belief.",
      "Your self-belief, when paired with humility, is a serious edge.",
    ],
    blindSpots: [
      "You credit wins to skill and losses to bad luck.",
      "Discipline feels unnecessary right when it matters most.",
      "Your biggest drawdowns follow your biggest winning streaks.",
    ],
    commonMistakes: [
      "Increasing size after wins without any change in setup quality.",
      "Skipping your checklist because you 'know' this one.",
      "Ignoring risk rules during a hot streak.",
    ],
    emotionalTriggers: [
      "Two or more wins in a row",
      "Public validation of a call",
      "The feeling of being 'in the zone,'",
    ],
    recommendations: [
      "Tie size strictly to rules, not results. A win does not earn you more risk.",
      "Run your full checklist on streaks — especially when you feel you don't need to.",
      "Track your behavior most closely after wins, not after losses.",
    ],
    fingerprint: { ego: -3, risk: -2, discipline: -1, accountability: -1 },
  },

  validationSeeker: {
    id: "validationSeeker",
    name: "The Validation Seeker",
    tagline: "You trade for the audience, not the account.",
    description:
      "Somewhere along the way, trading became about being seen — proving you were right, sharing the win, belonging to the room. You take trades to have something to post, you let others' opinions move your hand, and your decisions quietly optimise for approval instead of process. The market doesn't care who's watching, but part of you always does.",
    strengths: [
      "You're collaborative and open to learning from others.",
      "You communicate and reflect well when pointed inward.",
      "Your desire for connection can power genuine accountability.",
    ],
    blindSpots: [
      "External approval matters more than your own rules.",
      "You take trades for the story, not the setup.",
      "Others' opinions override your plan mid-trade.",
    ],
    commonMistakes: [
      "Entering trades to have something to share.",
      "Holding losers to avoid admitting a public call was wrong.",
      "Following others into setups you don't actually understand.",
    ],
    emotionalTriggers: [
      "A public prediction or shared position",
      "Others doubting your call",
      "The pull of the crowd's consensus",
    ],
    recommendations: [
      "Trade in private for a defined period. Let the account, not the audience, be the judge.",
      "Before sharing a position, ask: would I take this if no one ever saw it?",
      "Choose one accountability partner over a crowd. Depth over applause.",
    ],
    fingerprint: { ego: -2, accountability: -2, consistency: -1, discipline: -1 },
  },

  ruleBreaker: {
    id: "ruleBreaker",
    name: "The Rule Breaker",
    tagline: "You make good rules — and then negotiate with them.",
    description:
      "You don't lack a plan. You lack obedience to it. In the moment, your rules become suggestions: a stop you move, a limit you stretch, a 'just this once' that becomes most days. You're independent and resourceful, but that same independence rebels against the very structure that would set you free. The fight isn't with the market — it's with your own agreements.",
    strengths: [
      "You're adaptable and think for yourself.",
      "You're capable of creating sound, personal systems.",
      "Your independence becomes power once aimed at keeping your word.",
    ],
    blindSpots: [
      "Rules feel like constraints to negotiate rather than commitments to honor.",
      "You rationalise breaks convincingly in the moment.",
      "Your relationship with your own word is the real battleground.",
    ],
    commonMistakes: [
      "Moving stops to avoid being stopped out.",
      "Exceeding position or daily limits 'just this once.'",
      "Overriding your plan whenever it's inconvenient.",
    ],
    emotionalTriggers: [
      "A rule that's about to cost you",
      "Feeling boxed in by your own system",
      "The urge to make an exception",
    ],
    recommendations: [
      "Make rules physically harder to break — hard stops, locked limits, automation.",
      "Track rule adherence as your single most important metric.",
      "Reframe rules as promises to yourself. Breaking one is breaking your word, not beating the market.",
    ],
    fingerprint: { discipline: -3, accountability: -2, consistency: -1, impulsiveness: -1 },
  },
};

export const ARCHETYPE_LIST: Archetype[] = Object.values(ARCHETYPES);
````

---

### `src/domain/archetypes/engine.ts`

````tsx
import {
  BEHAVIORAL_DIMENSIONS,
  type ArchetypeId,
  type DimensionScores,
} from "@/domain/types";
import { ARCHETYPE_LIST, ARCHETYPES } from "./data";

/**
 * Determine which archetypes a behavioral profile pulls toward.
 *
 * Each archetype has a `fingerprint` weighting certain dimensions. We compute a
 * pull score for each archetype: the weaker a trader is on a fingerprinted
 * dimension, the stronger that archetype's pull. The result is ranked.
 */
export interface ArchetypeMatch {
  archetypeId: ArchetypeId;
  pull: number; // 0–100, relative pull strength
}

export function matchArchetypes(scores: DimensionScores): ArchetypeMatch[] {
  const raw = ARCHETYPE_LIST.map((arch) => {
    let weighted = 0;
    let totalWeight = 0;
    for (const dim of BEHAVIORAL_DIMENSIONS) {
      const w = arch.fingerprint[dim];
      if (w === undefined) continue;
      // "deficit" is how far the trader is from healthy (100) on this dim.
      const deficit = (100 - scores[dim]) / 100; // 0..1
      const magnitude = Math.abs(w);
      // Negative weights: low score increases pull. Positive weights: high
      // score increases pull (used sparingly, e.g. Hesitator + low impulse).
      const contribution = w < 0 ? deficit : 1 - deficit;
      weighted += contribution * magnitude;
      totalWeight += magnitude;
    }
    const pull = totalWeight === 0 ? 0 : (weighted / totalWeight) * 100;
    return { archetypeId: arch.id, pull: Math.round(pull) };
  });

  return raw.sort((a, b) => b.pull - a.pull);
}

/** Resolve the primary and (if meaningfully close) secondary archetype. */
export function resolveArchetype(scores: DimensionScores): {
  primary: ArchetypeId;
  secondary: ArchetypeId | null;
  matches: ArchetypeMatch[];
} {
  const matches = matchArchetypes(scores);
  const primary = matches[0]!.archetypeId;
  const second = matches[1];
  // Only surface a secondary if it's a genuine, near-equal pull.
  const secondary =
    second && matches[0]!.pull - second.pull <= 12 ? second.archetypeId : null;
  return { primary, secondary, matches };
}

export function getArchetype(id: ArchetypeId) {
  return ARCHETYPES[id];
}
````

---

### `src/domain/assessment/questions.ts`

````tsx
import type { AssessmentQuestion } from "@/domain/types";

/**
 * The Trader Identity Assessment.
 *
 * 54 Likert items across nine behavioral dimensions (6 per dimension).
 * Items are written about *behavior under live conditions*, not knowledge.
 *
 * `reverse: true` means agreement signals UNHEALTHY behavior and the score
 * is inverted during scoring, so a high dimension score always means a
 * healthier behavioral profile.
 */
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // ── Discipline ──────────────────────────────────────────────────────────
  { id: "dis1", dimension: "discipline", weight: 3, reverse: false, prompt: "I follow my trading plan even when the market tempts me to deviate." },
  { id: "dis2", dimension: "discipline", weight: 2, reverse: true, prompt: "I take trades that are not in my plan when something 'looks good'." },
  { id: "dis3", dimension: "discipline", weight: 2, reverse: false, prompt: "I have a written set of rules and I can recall them without looking." },
  { id: "dis4", dimension: "discipline", weight: 3, reverse: true, prompt: "Once I'm in front of the screen, my routine tends to fall apart." },
  { id: "dis5", dimension: "discipline", weight: 2, reverse: false, prompt: "I stop trading for the day once I hit my pre-defined limits." },
  { id: "dis6", dimension: "discipline", weight: 1, reverse: true, prompt: "I often tell myself 'just this once' and break a rule." },

  // ── Patience ────────────────────────────────────────────────────────────
  { id: "pat1", dimension: "patience", weight: 3, reverse: false, prompt: "I can sit through hours of no setups without forcing a trade." },
  { id: "pat2", dimension: "patience", weight: 2, reverse: true, prompt: "Waiting for confirmation feels unbearable, so I enter early." },
  { id: "pat3", dimension: "patience", weight: 2, reverse: false, prompt: "I am comfortable missing a move rather than chasing it." },
  { id: "pat4", dimension: "patience", weight: 3, reverse: true, prompt: "I feel I must be in a position to feel like I'm 'working'." },
  { id: "pat5", dimension: "patience", weight: 2, reverse: false, prompt: "I let trades develop instead of micromanaging every tick." },
  { id: "pat6", dimension: "patience", weight: 1, reverse: true, prompt: "Boredom is a common reason I open a position." },

  // ── Risk behavior ───────────────────────────────────────────────────────
  { id: "rsk1", dimension: "risk", weight: 3, reverse: false, prompt: "I size every position according to a fixed risk amount." },
  { id: "rsk2", dimension: "risk", weight: 3, reverse: true, prompt: "I increase my size dramatically when I feel 'sure' about a trade." },
  { id: "rsk3", dimension: "risk", weight: 2, reverse: false, prompt: "I always know my maximum loss before I enter." },
  { id: "rsk4", dimension: "risk", weight: 2, reverse: true, prompt: "I add to losing positions hoping they turn around." },
  { id: "rsk5", dimension: "risk", weight: 2, reverse: true, prompt: "After a win, I risk far more on the next trade." },
  { id: "rsk6", dimension: "risk", weight: 1, reverse: false, prompt: "My risk per trade stays consistent regardless of recent results." },

  // ── Ego ─────────────────────────────────────────────────────────────────
  { id: "ego1", dimension: "ego", weight: 3, reverse: true, prompt: "I find it hard to admit a trade was simply wrong." },
  { id: "ego2", dimension: "ego", weight: 2, reverse: true, prompt: "I need the market to prove me right before I'll exit a loser." },
  { id: "ego3", dimension: "ego", weight: 2, reverse: false, prompt: "I can take a loss without it bruising my sense of self." },
  { id: "ego4", dimension: "ego", weight: 3, reverse: true, prompt: "Being right matters more to me than executing my process." },
  { id: "ego5", dimension: "ego", weight: 2, reverse: true, prompt: "I hold trades to avoid the feeling of being defeated." },
  { id: "ego6", dimension: "ego", weight: 1, reverse: false, prompt: "I separate my identity from the outcome of any single trade." },

  // ── Fear ────────────────────────────────────────────────────────────────
  { id: "fea1", dimension: "fear", weight: 3, reverse: true, prompt: "I close winners too early because I'm afraid of giving profit back." },
  { id: "fea2", dimension: "fear", weight: 2, reverse: true, prompt: "Fear of missing out pushes me into trades I'd otherwise skip." },
  { id: "fea3", dimension: "fear", weight: 2, reverse: true, prompt: "I hesitate to take valid setups after a string of losses." },
  { id: "fea4", dimension: "fear", weight: 3, reverse: false, prompt: "I can execute a valid setup even when I feel afraid." },
  { id: "fea5", dimension: "fear", weight: 2, reverse: true, prompt: "I move my stop further away because I'm scared of being stopped out." },
  { id: "fea6", dimension: "fear", weight: 1, reverse: false, prompt: "Fear rarely changes the way I manage an open position." },

  // ── Impulsiveness ───────────────────────────────────────────────────────
  { id: "imp1", dimension: "impulsiveness", weight: 3, reverse: true, prompt: "I enter trades on a sudden urge before fully checking my criteria." },
  { id: "imp2", dimension: "impulsiveness", weight: 2, reverse: true, prompt: "I react to fast price moves before thinking them through." },
  { id: "imp3", dimension: "impulsiveness", weight: 2, reverse: false, prompt: "I pause and breathe before clicking the button." },
  { id: "imp4", dimension: "impulsiveness", weight: 3, reverse: true, prompt: "I 'click first, justify later' more often than I'd like." },
  { id: "imp5", dimension: "impulsiveness", weight: 2, reverse: true, prompt: "Notifications or news headlines often trigger spontaneous trades." },
  { id: "imp6", dimension: "impulsiveness", weight: 1, reverse: false, prompt: "There is always a deliberate gap between my impulse and my action." },

  // ── Consistency ─────────────────────────────────────────────────────────
  { id: "con1", dimension: "consistency", weight: 3, reverse: false, prompt: "My process looks the same on a good day and a bad day." },
  { id: "con2", dimension: "consistency", weight: 2, reverse: true, prompt: "My approach changes drastically depending on my mood." },
  { id: "con3", dimension: "consistency", weight: 2, reverse: false, prompt: "I journal or review my trading on a regular schedule." },
  { id: "con4", dimension: "consistency", weight: 3, reverse: true, prompt: "I frequently abandon strategies before giving them a fair test." },
  { id: "con5", dimension: "consistency", weight: 2, reverse: false, prompt: "I show up and execute even when I don't feel motivated." },
  { id: "con6", dimension: "consistency", weight: 1, reverse: true, prompt: "I chase whatever strategy worked most recently for others." },

  // ── Accountability ──────────────────────────────────────────────────────
  { id: "acc1", dimension: "accountability", weight: 3, reverse: false, prompt: "When a trade goes wrong, I look first at my own decisions." },
  { id: "acc2", dimension: "accountability", weight: 2, reverse: true, prompt: "I blame the market, news, or 'manipulation' for my losses." },
  { id: "acc3", dimension: "accountability", weight: 2, reverse: false, prompt: "I record my mistakes honestly, even the embarrassing ones." },
  { id: "acc4", dimension: "accountability", weight: 3, reverse: true, prompt: "I avoid reviewing my losing trades because it feels uncomfortable." },
  { id: "acc5", dimension: "accountability", weight: 2, reverse: false, prompt: "I would be comfortable showing my behavior log to someone I trust." },
  { id: "acc6", dimension: "accountability", weight: 1, reverse: true, prompt: "I tend to hide or minimise my worst trading days." },

  // ── Emotional regulation ────────────────────────────────────────────────
  { id: "emo1", dimension: "emotionalRegulation", weight: 3, reverse: true, prompt: "A big loss can ruin the rest of my trading day." },
  { id: "emo2", dimension: "emotionalRegulation", weight: 2, reverse: true, prompt: "I trade to get back to even after a painful loss." },
  { id: "emo3", dimension: "emotionalRegulation", weight: 2, reverse: false, prompt: "I can step away from the screen when I feel emotionally charged." },
  { id: "emo4", dimension: "emotionalRegulation", weight: 3, reverse: true, prompt: "Excitement after a win often leads me to overtrade." },
  { id: "emo5", dimension: "emotionalRegulation", weight: 2, reverse: false, prompt: "I notice my emotional state before it drives my decisions." },
  { id: "emo6", dimension: "emotionalRegulation", weight: 1, reverse: true, prompt: "My emotions swing sharply with each trade's outcome." },
];

export const LIKERT_LABELS: Record<number, string> = {
  1: "Strongly disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly agree",
};

export const ASSESSMENT_LENGTH = ASSESSMENT_QUESTIONS.length;
````

---

### `src/domain/assessment/scoring.ts`

````tsx
import {
  BEHAVIORAL_DIMENSIONS,
  type AssessmentResponses,
  type BehavioralDimension,
  type DimensionScores,
  type LikertValue,
} from "@/domain/types";
import { ASSESSMENT_QUESTIONS } from "./questions";

/**
 * Convert a Likert response into a "healthy behavior" value on a 0–1 scale.
 * Reverse-scored items are inverted so that 1 always means healthier behavior.
 */
function healthyValue(raw: LikertValue, reverse: boolean): number {
  const v = reverse ? 6 - raw : raw; // 1..5
  return (v - 1) / 4; // 0..1
}

/**
 * Produce weighted, normalised (0–100) scores per behavioral dimension.
 * Higher = healthier behavior on that dimension.
 *
 * Missing responses are simply excluded from their dimension's weighting so
 * partial assessments still yield a sensible (if lower-confidence) profile.
 */
export function scoreAssessment(responses: AssessmentResponses): DimensionScores {
  const acc: Record<BehavioralDimension, { sum: number; weight: number }> =
    Object.fromEntries(
      BEHAVIORAL_DIMENSIONS.map((d) => [d, { sum: 0, weight: 0 }]),
    ) as Record<BehavioralDimension, { sum: number; weight: number }>;

  for (const q of ASSESSMENT_QUESTIONS) {
    const raw = responses[q.id];
    if (raw === undefined) continue;
    const value = healthyValue(raw, q.reverse);
    acc[q.dimension].sum += value * q.weight;
    acc[q.dimension].weight += q.weight;
  }

  const scores = {} as DimensionScores;
  for (const d of BEHAVIORAL_DIMENSIONS) {
    const { sum, weight } = acc[d];
    scores[d] = weight === 0 ? 50 : Math.round((sum / weight) * 100);
  }
  return scores;
}

/** Overall behavioral baseline — the mean across all dimensions. */
export function baselineScore(scores: DimensionScores): number {
  const values = BEHAVIORAL_DIMENSIONS.map((d) => scores[d]);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/** Return dimensions sorted ascending (weakest first). */
export function rankDimensions(
  scores: DimensionScores,
): { dimension: BehavioralDimension; score: number }[] {
  return BEHAVIORAL_DIMENSIONS.map((d) => ({ dimension: d, score: scores[d] })).sort(
    (a, b) => a.score - b.score,
  );
}

/** How many of the assessment's items have been answered. */
export function answeredCount(responses: AssessmentResponses): number {
  return ASSESSMENT_QUESTIONS.reduce(
    (n, q) => (responses[q.id] !== undefined ? n + 1 : n),
    0,
  );
}
````

---

### `src/domain/behavior/actions.ts`

````tsx
import type { BehaviorAction, BehaviorActionId } from "@/domain/types";

/**
 * The behavior actions logged in the post-market check-in.
 *
 * This is the entire scoring vocabulary of Niyyah OS. There is no PnL, no win
 * rate, no R-multiple — only behavior. Disciplined actions add; violations
 * subtract. Revenge trading is the single most damaging behavior (-2).
 */
export const BEHAVIOR_ACTIONS: Record<BehaviorActionId, BehaviorAction> = {
  followedRules: {
    id: "followedRules",
    label: "Followed my rules",
    description: "I executed according to my plan, start to finish.",
    points: 1,
    isViolation: false,
    dimension: "discipline",
  },
  waitedForSetup: {
    id: "waitedForSetup",
    label: "Waited for my setup",
    description: "I let the market come to me instead of forcing trades.",
    points: 1,
    isViolation: false,
    dimension: "patience",
  },
  honoredStop: {
    id: "honoredStop",
    label: "Honored my stop",
    description: "I took the loss where I said I would. No negotiation.",
    points: 1,
    isViolation: false,
    dimension: "discipline",
  },
  respectedRisk: {
    id: "respectedRisk",
    label: "Respected my risk",
    description: "I sized correctly and stayed within my limits.",
    points: 1,
    isViolation: false,
    dimension: "risk",
  },
  overtraded: {
    id: "overtraded",
    label: "Overtraded",
    description: "I took trades beyond my plan or for the sake of action.",
    points: -1,
    isViolation: true,
    dimension: "impulsiveness",
  },
  movedStop: {
    id: "movedStop",
    label: "Moved my stop",
    description: "I widened or removed a stop to avoid taking the loss.",
    points: -1,
    isViolation: true,
    dimension: "discipline",
  },
  revengeTraded: {
    id: "revengeTraded",
    label: "Revenge traded",
    description: "I traded to get back a loss, not because of a setup.",
    points: -2,
    isViolation: true,
    dimension: "emotionalRegulation",
  },
  chasedEntries: {
    id: "chasedEntries",
    label: "Chased entries",
    description: "I entered late, into an extended move, off-plan.",
    points: -1,
    isViolation: true,
    dimension: "patience",
  },
};

export const AFFIRMING_ACTIONS: BehaviorAction[] = Object.values(
  BEHAVIOR_ACTIONS,
).filter((a) => !a.isViolation);

export const VIOLATION_ACTIONS: BehaviorAction[] = Object.values(
  BEHAVIOR_ACTIONS,
).filter((a) => a.isViolation);

export const ALL_BEHAVIOR_ACTIONS: BehaviorAction[] =
  Object.values(BEHAVIOR_ACTIONS);
````

---

### `src/domain/behavior/scoring.ts`

````tsx
import {
  type BehaviorActionId,
  type BehaviorTrendPoint,
  type DailyEntry,
  type ScoreWindow,
} from "@/domain/types";
import { BEHAVIOR_ACTIONS } from "./actions";

/** Compute the behavior score for a single day's selected actions. */
export function scoreActions(actions: BehaviorActionId[]): number {
  return actions.reduce((sum, id) => sum + (BEHAVIOR_ACTIONS[id]?.points ?? 0), 0);
}

export function countViolations(actions: BehaviorActionId[]): number {
  return actions.filter((id) => BEHAVIOR_ACTIONS[id]?.isViolation).length;
}

export function hasViolation(actions: BehaviorActionId[]): boolean {
  return actions.some((id) => BEHAVIOR_ACTIONS[id]?.isViolation);
}

/** Aggregate a set of daily entries into a windowed summary. */
export function summarizeWindow(entries: DailyEntry[]): ScoreWindow {
  const scored = entries.filter((e) => e.postMarket || e.actions.length > 0);
  const total = scored.reduce((s, e) => s + e.score, 0);
  const violations = scored.reduce((s, e) => s + countViolations(e.actions), 0);
  const affirmations = scored.reduce(
    (s, e) => s + e.actions.filter((a) => !BEHAVIOR_ACTIONS[a]?.isViolation).length,
    0,
  );
  const days = scored.length;
  return {
    total,
    days,
    average: days === 0 ? 0 : Math.round((total / days) * 10) / 10,
    violations,
    affirmations,
  };
}

/**
 * The consistency streak: consecutive most-recent days (ending today or
 * yesterday) that were completed with zero violations.
 */
export function consistencyStreak(entries: DailyEntry[], todayIso: string): number {
  const byDate = new Map(entries.map((e) => [e.date, e]));
  let streak = 0;
  const cursor = new Date(todayIso + "T00:00:00");

  // Allow the streak to "start" today or yesterday so an as-yet-unfilled
  // today doesn't break a healthy run.
  let started = false;
  for (let i = 0; i < 400; i++) {
    const iso = cursor.toISOString().slice(0, 10);
    const entry = byDate.get(iso);
    const completed = entry && (entry.postMarket || entry.actions.length > 0);

    if (!completed) {
      if (!started && i === 0) {
        // today not done yet — keep looking back one day
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
    started = true;
    if (entry!.hadViolation) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Build a daily trend series (most recent last) for charting. */
export function buildTrend(entries: DailyEntry[]): BehaviorTrendPoint[] {
  return [...entries]
    .filter((e) => e.postMarket || e.actions.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ date: e.date, score: e.score }));
}

/**
 * Map an average daily behavior score to a calm 0–100 discipline index for
 * display. A perfect day is +4 (all four affirmations); we treat +3 as the
 * top of the everyday range so the index is encouraging but honest.
 */
export function disciplineIndex(averageDaily: number): number {
  const clamped = Math.max(-4, Math.min(4, averageDaily));
  return Math.round(((clamped + 4) / 8) * 100);
}
````

---

### `src/domain/patterns/detect.ts`

````tsx
import type { DailyEntry, DetectedPattern } from "@/domain/types";
import { BEHAVIOR_ACTIONS } from "@/domain/behavior/actions";
import { countViolations } from "@/domain/behavior/scoring";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function completed(entries: DailyEntry[]): DailyEntry[] {
  return entries
    .filter((e) => e.postMarket || e.actions.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function ratio(part: number, whole: number): number {
  return whole === 0 ? 0 : part / whole;
}

/** Confidence grows with sample size and effect size, capped at 0.95. */
function confidence(sample: number, effect: number): number {
  const sizeFactor = Math.min(1, sample / 12);
  return Math.round(Math.min(0.95, sizeFactor * effect) * 100) / 100;
}

/**
 * Analyse a trader's history and surface recurring behavioral patterns.
 *
 * Every detector is conservative: it only fires with enough data and a clear
 * enough signal. The goal is for the user to feel *seen*, not lectured.
 */
export function detectPatterns(entries: DailyEntry[]): DetectedPattern[] {
  const days = completed(entries);
  const patterns: DetectedPattern[] = [];
  if (days.length < 5) return patterns;

  const totalViolations = days.reduce((s, e) => s + countViolations(e.actions), 0);
  const baseViolationRate = ratio(
    days.filter((e) => e.hadViolation).length,
    days.length,
  );

  // ── 1. Violations after a difficult day ─────────────────────────────────
  {
    let afterRoughTotal = 0;
    let afterRoughViolations = 0;
    for (let i = 1; i < days.length; i++) {
      const prev = days[i - 1]!;
      const isRough = prev.hadViolation || prev.score < 0;
      if (!isRough) continue;
      afterRoughTotal++;
      if (days[i]!.hadViolation) afterRoughViolations++;
    }
    const rate = ratio(afterRoughViolations, afterRoughTotal);
    if (afterRoughTotal >= 3 && rate > baseViolationRate + 0.2) {
      patterns.push({
        id: "after-rough-day",
        title: "Your worst days come in pairs.",
        detail: `When the day before was difficult, you broke your rules ${Math.round(
          rate * 100,
        )}% of the time — well above your usual ${Math.round(
          baseViolationRate * 100,
        )}%. The loss isn't the problem. What you do the next session is.`,
        severity: "alert",
        confidence: confidence(afterRoughTotal, rate - baseViolationRate + 0.4),
      });
    }
  }

  // ── 2. Day-of-week clustering ───────────────────────────────────────────
  {
    const byDow = new Map<number, { total: number; violations: number }>();
    for (const e of days) {
      const dow = new Date(e.date + "T00:00:00").getDay();
      const slot = byDow.get(dow) ?? { total: 0, violations: 0 };
      slot.total++;
      if (e.hadViolation) slot.violations++;
      byDow.set(dow, slot);
    }
    let worst: { dow: number; rate: number; total: number } | null = null;
    for (const [dow, slot] of byDow) {
      if (slot.total < 3) continue;
      const rate = ratio(slot.violations, slot.total);
      if (!worst || rate > worst.rate) worst = { dow, rate, total: slot.total };
    }
    if (worst && worst.rate > baseViolationRate + 0.2) {
      patterns.push({
        id: `dow-${worst.dow}`,
        title: `${WEEKDAYS[worst.dow]}s are your weak point.`,
        detail: `You break rules far more often on ${WEEKDAYS[worst.dow]}s (${Math.round(
          worst.rate * 100,
        )}%) than on other days. Something about how you start that day deserves attention.`,
        severity: "watch",
        confidence: confidence(worst.total, worst.rate - baseViolationRate + 0.3),
      });
    }
  }

  // ── 3. Breaking rules after a clean streak ──────────────────────────────
  {
    let afterStreakTotal = 0;
    let afterStreakViolations = 0;
    for (let i = 2; i < days.length; i++) {
      const cleanBefore = !days[i - 1]!.hadViolation && !days[i - 2]!.hadViolation;
      if (!cleanBefore) continue;
      afterStreakTotal++;
      if (days[i]!.hadViolation) afterStreakViolations++;
    }
    const rate = ratio(afterStreakViolations, afterStreakTotal);
    if (afterStreakTotal >= 3 && rate > baseViolationRate + 0.15) {
      patterns.push({
        id: "after-clean-streak",
        title: "Success loosens your grip.",
        detail: `After two clean days, your rule-breaking jumps to ${Math.round(
          rate * 100,
        )}%. Watch the moment you start to feel untouchable — that's where the drift begins.`,
        severity: "watch",
        confidence: confidence(afterStreakTotal, rate - baseViolationRate + 0.3),
      });
    }
  }

  // ── 4. Emotional state correlation ──────────────────────────────────────
  {
    let chargedTotal = 0;
    let chargedViolations = 0;
    let calmTotal = 0;
    let calmViolations = 0;
    for (const e of days) {
      const state = e.preMarket?.emotionalState;
      if (state === undefined) continue;
      if (state >= 4) {
        chargedTotal++;
        if (e.hadViolation) chargedViolations++;
      } else if (state <= 2) {
        calmTotal++;
        if (e.hadViolation) calmViolations++;
      }
    }
    const chargedRate = ratio(chargedViolations, chargedTotal);
    const calmRate = ratio(calmViolations, calmTotal);
    if (chargedTotal >= 3 && chargedRate > calmRate + 0.25) {
      patterns.push({
        id: "emotional-state",
        title: "Your emotions are predicting your mistakes.",
        detail: `On days you logged a high emotional state at the open, you broke rules ${Math.round(
          chargedRate * 100,
        )}% of the time — versus ${Math.round(
          calmRate * 100,
        )}% on calm days. Your pre-market feeling is an early warning you can act on.`,
        severity: "alert",
        confidence: confidence(chargedTotal, chargedRate - calmRate + 0.3),
      });
    }
  }

  // ── 5. The signature violation ──────────────────────────────────────────
  {
    const tally = new Map<string, number>();
    for (const e of days) {
      for (const a of e.actions) {
        if (BEHAVIOR_ACTIONS[a]?.isViolation) {
          tally.set(a, (tally.get(a) ?? 0) + 1);
        }
      }
    }
    let top: { id: string; count: number } | null = null;
    for (const [id, count] of tally) {
      if (!top || count > top.count) top = { id, count };
    }
    if (top && totalViolations >= 4 && top.count / totalViolations >= 0.4) {
      const action = BEHAVIOR_ACTIONS[top.id as keyof typeof BEHAVIOR_ACTIONS];
      patterns.push({
        id: `signature-${top.id}`,
        title: `Your signature leak: ${action.label.toLowerCase()}.`,
        detail: `"${action.label}" accounts for ${Math.round(
          (top.count / totalViolations) * 100,
        )}% of every rule you've broken. Fix this one behavior and you fix most of your days.`,
        severity: "insight",
        confidence: confidence(top.count, top.count / totalViolations + 0.2),
      });
    }
  }

  return patterns.sort((a, b) => b.confidence - a.confidence);
}
````

---

### `src/domain/types.ts`

````tsx
/**
 * Niyyah OS — domain model.
 *
 * Behavior is the product. Nothing in this model tracks PnL, win rate, or
 * market data. Everything models the trader's *behavior* and self-awareness.
 */

// ───────────────────────────── Behavioral dimensions ─────────────────────────

/** The nine behavioral dimensions measured across the platform. */
export type BehavioralDimension =
  | "discipline"
  | "patience"
  | "risk"
  | "ego"
  | "fear"
  | "impulsiveness"
  | "consistency"
  | "accountability"
  | "emotionalRegulation";

export const BEHAVIORAL_DIMENSIONS: BehavioralDimension[] = [
  "discipline",
  "patience",
  "risk",
  "ego",
  "fear",
  "impulsiveness",
  "consistency",
  "accountability",
  "emotionalRegulation",
];

export const DIMENSION_LABELS: Record<BehavioralDimension, string> = {
  discipline: "Discipline",
  patience: "Patience",
  risk: "Risk Behavior",
  ego: "Ego",
  fear: "Fear",
  impulsiveness: "Impulsiveness",
  consistency: "Consistency",
  accountability: "Accountability",
  emotionalRegulation: "Emotional Regulation",
};

/** Per-dimension score, normalised 0–100 (higher = healthier behavior). */
export type DimensionScores = Record<BehavioralDimension, number>;

// ───────────────────────────────── Assessment ────────────────────────────────

/**
 * A single Likert assessment question. `weight` reflects how diagnostic the
 * item is for its dimension. `reverse` items are phrased so that agreement
 * indicates *unhealthy* behavior, and are inverted during scoring.
 */
export interface AssessmentQuestion {
  id: string;
  dimension: BehavioralDimension;
  prompt: string;
  reverse: boolean;
  weight: number; // 1–3
}

/** Likert response, 1 (strongly disagree) → 5 (strongly agree). */
export type LikertValue = 1 | 2 | 3 | 4 | 5;

export type AssessmentResponses = Record<string, LikertValue>;

export interface AssessmentResult {
  id: string;
  userId: string;
  completedAt: string; // ISO
  responses: AssessmentResponses;
  dimensionScores: DimensionScores;
  archetypeId: ArchetypeId;
  /** Secondary archetype — the next-strongest pull. */
  secondaryArchetypeId: ArchetypeId | null;
  /** Optional AI-generated interpretation of the result. */
  interpretation?: string;
}

// ───────────────────────────────── Archetypes ────────────────────────────────

export type ArchetypeId =
  | "chaser"
  | "gambler"
  | "avenger"
  | "hesitator"
  | "perfectionist"
  | "overconfident"
  | "validationSeeker"
  | "ruleBreaker";

export interface Archetype {
  id: ArchetypeId;
  name: string;
  tagline: string;
  description: string;
  strengths: string[];
  blindSpots: string[];
  commonMistakes: string[];
  emotionalTriggers: string[];
  recommendations: string[];
  /**
   * Dimension fingerprint. For each dimension, a negative weight means low
   * scores on that dimension pull a trader toward this archetype.
   */
  fingerprint: Partial<Record<BehavioralDimension, number>>;
}

// ──────────────────────────── Daily accountability ───────────────────────────

export interface PreMarketEntry {
  feeling: string;
  plan: string;
  sabotageRisk: string;
  /** 1–5 self-rated emotional intensity at open. */
  emotionalState: LikertValue;
}

export interface PostMarketEntry {
  followedRules: boolean;
  violatedRisk: boolean;
  emotionsAffectedDecisions: boolean;
  learned: string;
}

/** A behavior action toggled in the post-market check-in. */
export type BehaviorActionId =
  | "followedRules"
  | "waitedForSetup"
  | "honoredStop"
  | "respectedRisk"
  | "overtraded"
  | "movedStop"
  | "revengeTraded"
  | "chasedEntries";

export interface BehaviorAction {
  id: BehaviorActionId;
  label: string;
  description: string;
  points: number; // positive = disciplined, negative = violation
  /** Whether selecting this counts as a behavioral violation. */
  isViolation: boolean;
  dimension: BehavioralDimension;
}

export interface DailyEntry {
  id: string; // yyyy-MM-dd
  userId: string;
  date: string; // yyyy-MM-dd (the trading day)
  createdAt: string; // ISO
  preMarket?: PreMarketEntry;
  postMarket?: PostMarketEntry;
  /** Behavior actions selected during the post-market review. */
  actions: BehaviorActionId[];
  /** Computed behavior score for the day. */
  score: number;
  /** Convenience flags derived at write-time for fast queries. */
  hadViolation: boolean;
}

// ───────────────────────────── Weekly reflection ─────────────────────────────

export interface WeeklyReflection {
  id: string; // yyyy-'W'ww
  userId: string;
  weekStart: string; // yyyy-MM-dd (Monday)
  createdAt: string;
  improved: string;
  repeated: string;
  triggers: string;
  nextWeek: string;
  /** Optional AI-generated summary of the week. */
  summary?: string;
}

// ──────────────────────────────── Behavior score ─────────────────────────────

export interface ScoreWindow {
  total: number;
  days: number;
  average: number;
  violations: number;
  affirmations: number;
}

export interface BehaviorTrendPoint {
  date: string; // yyyy-MM-dd
  score: number;
}

// ─────────────────────────────── Pattern detection ───────────────────────────

export type PatternSeverity = "insight" | "watch" | "alert";

export interface DetectedPattern {
  id: string;
  title: string;
  detail: string;
  severity: PatternSeverity;
  /** 0–1 confidence based on sample size + effect strength. */
  confidence: number;
}

// ───────────────────────────────── Partner ───────────────────────────────────

export type PartnerLinkStatus = "pending" | "active" | "declined";

export interface PartnerLink {
  id: string;
  /** The two user ids in the pair, sorted. */
  members: [string, string];
  requestedBy: string;
  status: PartnerLinkStatus;
  createdAt: string;
}

export interface PartnerFeedback {
  id: string;
  linkId: string;
  fromUserId: string;
  toUserId: string;
  weekStart: string;
  message: string;
  createdAt: string;
}

// ───────────────────────────────── User profile ──────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  assessmentCompleted: boolean;
  archetypeId: ArchetypeId | null;
  /** Visibility consent for an accountability partner. */
  partnerVisibility: {
    behaviorScore: boolean;
    reflections: boolean;
  };
  /**
   * Denormalised, consent-gated snapshot a partner is allowed to see. Written
   * only with fields the user has opted to share; absent fields stay private.
   */
  sharedSummary?: SharedSummary;
}

export interface SharedSummary {
  updatedAt: string;
  weeklyScore?: number;
  streak?: number;
  lastReflectionExcerpt?: string;
}
````

---

### `src/lib/ai/anthropic.ts`

````tsx
import Anthropic from "@anthropic-ai/sdk";

/**
 * AI layer for Niyyah OS.
 *
 * Principle: AI is used only where it deepens self-awareness — interpreting a
 * behavioral profile, summarising a week, naming a pattern. Never for gimmicks.
 *
 * Every call degrades gracefully: if no API key is present, callers fall back
 * to deterministic, locally-generated content so the product still works.
 */
export const AI_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

export const isAiConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const SYSTEM_PROMPT = `You are the reflective voice of Niyyah OS, a behavioral transformation platform for traders.

Your purpose is to increase a trader's self-awareness about their *behavior* — not to give trading advice, market analysis, or predictions. Never discuss entries, strategies, indicators, or profit.

Voice: calm, direct, perceptive, and humane. You name patterns honestly without shaming the person. You sound like a wise accountability partner, not a hype coach. Avoid clichés, emojis, and exclamation marks. Be concise.`;

interface GenerateOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

/** Low-level generation helper. Throws if AI is not configured. */
export async function generate({
  prompt,
  maxTokens = 700,
  temperature = 0.6,
}: GenerateOptions): Promise<string> {
  const response = await getClient().messages.create({
    model: AI_MODEL,
    max_tokens: maxTokens,
    temperature,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}
````

---

### `src/lib/ai/insights.ts`

````tsx
import {
  DIMENSION_LABELS,
  type Archetype,
  type DetectedPattern,
  type DimensionScores,
  type WeeklyReflection,
} from "@/domain/types";
import { rankDimensions } from "@/domain/assessment/scoring";
import { generate, isAiConfigured } from "./anthropic";

function scoreLines(scores: DimensionScores): string {
  return rankDimensions(scores)
    .map((d) => `- ${DIMENSION_LABELS[d.dimension]}: ${d.score}/100`)
    .join("\n");
}

/**
 * Interpret a completed assessment for a specific archetype.
 * Falls back to a composed, deterministic interpretation if AI is unavailable.
 */
export async function interpretAssessment(
  archetype: Archetype,
  scores: DimensionScores,
): Promise<string> {
  if (!isAiConfigured) {
    const weakest = rankDimensions(scores).slice(0, 2);
    return [
      `Your profile points most strongly to ${archetype.name}. ${archetype.tagline}`,
      "",
      `Your behavior leans hardest on ${weakest
        .map((d) => DIMENSION_LABELS[d.dimension].toLowerCase())
        .join(" and ")}. ${archetype.description}`,
      "",
      `Start here: ${archetype.recommendations[0]}`,
    ].join("\n");
  }

  const prompt = `A trader completed the behavioral assessment. Their primary archetype is "${archetype.name}" — ${archetype.tagline}

Dimension scores (0 = unhealthy behavior, 100 = healthy):
${scoreLines(scores)}

Write a personal, second-person interpretation (3 short paragraphs, ~140 words total). Help them recognise themselves. Connect their two weakest dimensions to the archetype. End with the single most important behavioral shift to focus on first. Do not give trading advice.`;

  return generate({ prompt, maxTokens: 500 });
}

/** Summarise a week of reflection answers into a short, honest paragraph. */
export async function summarizeWeek(
  reflection: WeeklyReflection,
  context: { score: number; violations: number; streak: number },
): Promise<string> {
  if (!isAiConfigured) {
    return `This week your behavior score was ${context.score} with ${context.violations} violation${
      context.violations === 1 ? "" : "s"
    }. You named that "${reflection.repeated || "—"}" repeated, and you intend to change "${
      reflection.nextWeek || "—"
    }". Hold yourself to that one change.`;
  }

  const prompt = `A trader wrote their weekly reflection. Behavior score: ${context.score}, violations: ${context.violations}, current streak: ${context.streak} days.

What improved: ${reflection.improved || "(blank)"}
What repeated: ${reflection.repeated || "(blank)"}
What triggered mistakes: ${reflection.triggers || "(blank)"}
What they'll change: ${reflection.nextWeek || "(blank)"}

Write a 3-4 sentence summary that reflects their growth honestly, names the pattern they should watch, and affirms the one change they committed to. Calm and direct. No trading advice.`;

  return generate({ prompt, maxTokens: 320 });
}

/** Turn detected patterns into one cohesive, gently confronting narrative. */
export async function narratePatterns(
  patterns: DetectedPattern[],
): Promise<string> {
  if (patterns.length === 0) return "";
  if (!isAiConfigured) {
    return patterns.map((p) => `${p.title} ${p.detail}`).join("\n\n");
  }

  const prompt = `These behavioral patterns were detected in a trader's history:

${patterns.map((p) => `- ${p.title} ${p.detail}`).join("\n")}

Write a short, cohesive reflection (2-3 sentences) that connects these patterns into a single insight about how this trader sabotages themselves. Make them feel seen, not judged. No trading advice.`;

  return generate({ prompt, maxTokens: 240 });
}
````

---

### `src/lib/auth/AuthProvider.tsx`

````tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  getFirebaseAuth,
  getDb,
  googleProvider,
  isFirebaseConfigured,
} from "@/lib/firebase/client";
import type { UserProfile } from "@/domain/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function ensureProfile(user: User): Promise<UserProfile> {
  const db = getDb();
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserProfile;

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? (user.email?.split("@")[0] ?? "Trader"),
    createdAt: new Date().toISOString(),
    assessmentCompleted: false,
    archetypeId: null,
    partnerVisibility: { behaviorScore: true, reflections: false },
  };
  await setDoc(ref, { ...profile, _createdAt: serverTimestamp() });
  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          setProfile(await ensureProfile(u));
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const snap = await getDoc(doc(getDb(), "users", user.uid));
    if (snap.exists()) setProfile(snap.data() as UserProfile);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      configured: isFirebaseConfigured,
      async signUpWithEmail(email, password, name) {
        const auth = getFirebaseAuth();
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(cred.user, { displayName: name });
        setProfile(await ensureProfile(cred.user));
      },
      async signInWithEmail(email, password) {
        await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      },
      async signInWithGoogle() {
        const cred = await signInWithPopup(getFirebaseAuth(), googleProvider);
        setProfile(await ensureProfile(cred.user));
      },
      async signOut() {
        await fbSignOut(getFirebaseAuth());
      },
      refreshProfile,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
````

---

### `src/lib/dates.ts`

````tsx
/**
 * Date helpers. All "day keys" are local-ISO `yyyy-MM-dd` strings, and weeks
 * begin on Monday (ISO week). Kept dependency-light and deterministic.
 */

export function todayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Monday of the week containing `d`, as a `yyyy-MM-dd` key. */
export function weekStartKey(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay(); // 0 = Sun
  const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().slice(0, 10);
}

/** ISO week id, e.g. `2026-W24`. */
export function weekId(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function daysAgoKey(n: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return dayKey(d);
}

export function formatLongDate(key: string): string {
  return new Date(key + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(key: string): string {
  return new Date(key + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
````

---

### `src/lib/firebase/admin.ts`

````tsx
import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Firebase Admin (server) initialisation, used in API routes for privileged
 * operations such as cross-user partner reads gated by consent.
 *
 * Credentials come from a service account provided via environment variables.
 */
let adminApp: App | null = null;

function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length) {
    adminApp = getApp();
    return adminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.",
    );
  }

  adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
  return adminApp;
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
````

---

### `src/lib/firebase/client.ts`

````tsx
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase client (browser) initialisation.
 *
 * Configuration comes from `NEXT_PUBLIC_FIREBASE_*` env vars. Initialisation is
 * lazy and guarded so the app still builds and renders (e.g. marketing pages)
 * when Firebase isn't configured — useful for local previews and CI.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables (see .env.example).",
    );
  }
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

export function getDb(): Firestore {
  if (!dbInstance) dbInstance = getFirestore(getFirebaseApp());
  return dbInstance;
}

export const googleProvider = new GoogleAuthProvider();
````

---

### `src/lib/utils.ts`

````tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
````

---

### `src/services/assessmentService.ts`

````tsx
import {
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { AssessmentResponses, AssessmentResult } from "@/domain/types";
import { scoreAssessment } from "@/domain/assessment/scoring";
import { resolveArchetype } from "@/domain/archetypes/engine";
import { paths } from "./collections";

/**
 * Score and persist a completed assessment, and update the user's profile with
 * their resolved archetype. Returns the stored result.
 */
export async function submitAssessment(
  uid: string,
  responses: AssessmentResponses,
): Promise<AssessmentResult> {
  const dimensionScores = scoreAssessment(responses);
  const { primary, secondary } = resolveArchetype(dimensionScores);

  const id = `assessment-${Date.now()}`;
  const result: AssessmentResult = {
    id,
    userId: uid,
    completedAt: new Date().toISOString(),
    responses,
    dimensionScores,
    archetypeId: primary,
    secondaryArchetypeId: secondary,
  };

  await setDoc(paths.assessment(uid, id), result);
  await updateDoc(paths.user(uid), {
    assessmentCompleted: true,
    archetypeId: primary,
  });

  return result;
}

/** Fetch the most recent assessment result for a user, if any. */
export async function getLatestAssessment(
  uid: string,
): Promise<AssessmentResult | null> {
  const q = query(paths.assessments(uid), orderBy("completedAt", "desc"), limit(1));
  const snap = await getDocs(q);
  const first = snap.docs[0];
  return first ? (first.data() as AssessmentResult) : null;
}

/** Persist an AI interpretation onto an existing assessment. */
export async function saveInterpretation(
  uid: string,
  assessmentId: string,
  interpretation: string,
): Promise<void> {
  await updateDoc(paths.assessment(uid, assessmentId), { interpretation });
}

export async function getAssessment(
  uid: string,
  id: string,
): Promise<AssessmentResult | null> {
  const snap = await getDoc(paths.assessment(uid, id));
  return snap.exists() ? (snap.data() as AssessmentResult) : null;
}
````

---

### `src/services/collections.ts`

````tsx
import { collection, doc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";

/**
 * Centralised Firestore paths. Per-user data lives under `users/{uid}/...`
 * so security rules can scope access to the owner by default.
 */
export const paths = {
  user: (uid: string) => doc(getDb(), "users", uid),
  users: () => collection(getDb(), "users"),

  assessments: (uid: string) => collection(getDb(), "users", uid, "assessments"),
  assessment: (uid: string, id: string) =>
    doc(getDb(), "users", uid, "assessments", id),

  dailies: (uid: string) => collection(getDb(), "users", uid, "dailies"),
  daily: (uid: string, id: string) => doc(getDb(), "users", uid, "dailies", id),

  reflections: (uid: string) => collection(getDb(), "users", uid, "reflections"),
  reflection: (uid: string, id: string) =>
    doc(getDb(), "users", uid, "reflections", id),

  partnerLinks: () => collection(getDb(), "partnerLinks"),
  partnerLink: (id: string) => doc(getDb(), "partnerLinks", id),
  feedback: () => collection(getDb(), "partnerFeedback"),
};
````

---

### `src/services/dailyService.ts`

````tsx
import {
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import type {
  BehaviorActionId,
  DailyEntry,
  PostMarketEntry,
  PreMarketEntry,
} from "@/domain/types";
import { hasViolation, scoreActions } from "@/domain/behavior/scoring";
import { todayKey } from "@/lib/dates";
import { paths } from "./collections";

function blankEntry(uid: string, date: string): DailyEntry {
  return {
    id: date,
    userId: uid,
    date,
    createdAt: new Date().toISOString(),
    actions: [],
    score: 0,
    hadViolation: false,
  };
}

export async function getDaily(
  uid: string,
  date: string = todayKey(),
): Promise<DailyEntry | null> {
  const snap = await getDoc(paths.daily(uid, date));
  return snap.exists() ? (snap.data() as DailyEntry) : null;
}

/** Save the morning (pre-market) check-in. */
export async function savePreMarket(
  uid: string,
  date: string,
  preMarket: PreMarketEntry,
): Promise<DailyEntry> {
  const existing = (await getDaily(uid, date)) ?? blankEntry(uid, date);
  const next: DailyEntry = { ...existing, preMarket };
  await setDoc(paths.daily(uid, date), next);
  return next;
}

/** Save the closing (post-market) review, recomputing the day's score. */
export async function savePostMarket(
  uid: string,
  date: string,
  postMarket: PostMarketEntry,
  actions: BehaviorActionId[],
): Promise<DailyEntry> {
  const existing = (await getDaily(uid, date)) ?? blankEntry(uid, date);
  const next: DailyEntry = {
    ...existing,
    postMarket,
    actions,
    score: scoreActions(actions),
    hadViolation: hasViolation(actions),
  };
  await setDoc(paths.daily(uid, date), next);
  return next;
}

/** List entries on/after `sinceDate` (yyyy-MM-dd), oldest first. */
export async function listDailies(
  uid: string,
  sinceDate: string,
): Promise<DailyEntry[]> {
  const q = query(
    paths.dailies(uid),
    where("date", ">=", sinceDate),
    orderBy("date", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DailyEntry);
}
````

---

### `src/services/partnerService.ts`

````tsx
import {
  addDoc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import type {
  PartnerFeedback,
  PartnerLink,
  SharedSummary,
  UserProfile,
} from "@/domain/types";
import { paths } from "./collections";

/** Deterministic pair key so a link is unique regardless of who requests. */
function members(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function findUserByEmail(
  email: string,
): Promise<UserProfile | null> {
  const q = query(paths.users(), where("email", "==", email.toLowerCase()), limit(1));
  const snap = await getDocs(q);
  const first = snap.docs[0];
  return first ? (first.data() as UserProfile) : null;
}

/** The user's current partner link (active or pending), if any. */
export async function getMyLink(uid: string): Promise<PartnerLink | null> {
  const q = query(
    paths.partnerLinks(),
    where("members", "array-contains", uid),
    where("status", "in", ["active", "pending"]),
    limit(1),
  );
  const snap = await getDocs(q);
  const first = snap.docs[0];
  return first ? ({ ...(first.data() as PartnerLink), id: first.id }) : null;
}

export async function requestPartner(
  fromUid: string,
  toUid: string,
): Promise<PartnerLink> {
  const existing = await getMyLink(fromUid);
  if (existing) throw new Error("You already have a partner or a pending request.");

  const ref = await addDoc(paths.partnerLinks(), {
    members: members(fromUid, toUid),
    requestedBy: fromUid,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  return {
    id: ref.id,
    members: members(fromUid, toUid),
    requestedBy: fromUid,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

export async function respondToRequest(
  linkId: string,
  accept: boolean,
): Promise<void> {
  await updateDoc(paths.partnerLink(linkId), {
    status: accept ? "active" : "declined",
  });
}

export async function endPartnership(linkId: string): Promise<void> {
  await updateDoc(paths.partnerLink(linkId), { status: "declined" });
}

/** Read a partner's consent-gated shared profile. */
export async function getPartnerProfile(
  partnerUid: string,
): Promise<UserProfile | null> {
  const snap = await getDoc(paths.user(partnerUid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/** Update the current user's denormalised, consent-gated shared summary. */
export async function updateSharedSummary(
  uid: string,
  visibility: UserProfile["partnerVisibility"],
  data: { weeklyScore: number; streak: number; lastReflectionExcerpt: string },
): Promise<void> {
  const summary: SharedSummary = { updatedAt: new Date().toISOString() };
  if (visibility.behaviorScore) {
    summary.weeklyScore = data.weeklyScore;
    summary.streak = data.streak;
  }
  if (visibility.reflections && data.lastReflectionExcerpt) {
    summary.lastReflectionExcerpt = data.lastReflectionExcerpt;
  }
  await updateDoc(paths.user(uid), { sharedSummary: summary });
}

export async function sendFeedback(
  link: PartnerLink,
  fromUid: string,
  weekStart: string,
  message: string,
): Promise<void> {
  const toUserId = link.members.find((m) => m !== fromUid)!;
  await addDoc(paths.feedback(), {
    linkId: link.id,
    fromUserId: fromUid,
    toUserId,
    weekStart,
    message,
    createdAt: new Date().toISOString(),
  });
}

export async function listFeedback(linkId: string): Promise<PartnerFeedback[]> {
  const q = query(
    paths.feedback(),
    where("linkId", "==", linkId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as PartnerFeedback), id: d.id }));
}
````

---

### `src/services/reflectionService.ts`

````tsx
import { getDoc, getDocs, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import type { WeeklyReflection } from "@/domain/types";
import { weekId, weekStartKey } from "@/lib/dates";
import { paths } from "./collections";

export async function getReflection(
  uid: string,
  id: string = weekId(),
): Promise<WeeklyReflection | null> {
  const snap = await getDoc(paths.reflection(uid, id));
  return snap.exists() ? (snap.data() as WeeklyReflection) : null;
}

export async function saveReflection(
  uid: string,
  fields: Pick<WeeklyReflection, "improved" | "repeated" | "triggers" | "nextWeek">,
  id: string = weekId(),
): Promise<WeeklyReflection> {
  const existing = await getReflection(uid, id);
  const reflection: WeeklyReflection = {
    id,
    userId: uid,
    weekStart: existing?.weekStart ?? weekStartKey(),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    summary: existing?.summary,
    ...fields,
  };
  await setDoc(paths.reflection(uid, id), reflection);
  return reflection;
}

export async function saveReflectionSummary(
  uid: string,
  id: string,
  summary: string,
): Promise<void> {
  await updateDoc(paths.reflection(uid, id), { summary });
}

/** Full reflection history, most recent first — the personal growth timeline. */
export async function listReflections(uid: string): Promise<WeeklyReflection[]> {
  const q = query(paths.reflections(uid), orderBy("weekStart", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as WeeklyReflection);
}
````

---

### `tailwind.config.ts`

````tsx
import type { Config } from "tailwindcss";

/**
 * Niyyah OS design system — built from first principles.
 *
 * Principle: the interface should feel calm, intentional, and quiet.
 * No dopamine colors, no alarmism. Warm paper canvas, evergreen accent
 * (intention / growth), muted clay for violations rather than red alarm.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces
        canvas: "#F6F4EF", // warm paper — the resting state of the app
        surface: "#FFFFFF",
        raised: "#FCFBF8",
        sand: "#EFE9DD", // soft block fills

        // Ink / text
        ink: "#1C1B17", // warm near-black
        muted: "#6E6A61",
        faint: "#9C968B",

        // Lines
        line: "#E7E2D8",
        "line-strong": "#D8D1C3",

        // Accent — evergreen: intention, steadiness, growth
        accent: {
          DEFAULT: "#2E4A40",
          hover: "#243a32",
          soft: "#E7EDE9",
          ink: "#1A2C26",
        },

        // Behavioral semantics (calm, not loud)
        affirm: "#4F7A5E", // disciplined / positive behavior
        affirmsoft: "#E8F0EA",
        caution: "#9C7434", // drift / watch
        cautionsoft: "#F4ECDD",
        breach: "#A8584A", // violation — clay, not red alarm
        breachsoft: "#F4E5E1",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      fontSize: {
        // A restrained type scale
        display: ["clamp(2.4rem, 5vw, 3.6rem)", { lineHeight: "1.04", letterSpacing: "-0.02em" }],
        title: ["1.75rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        // Whisper-soft shadows only
        soft: "0 1px 2px rgba(28,27,23,0.04), 0 6px 24px -12px rgba(28,27,23,0.10)",
        lift: "0 2px 6px rgba(28,27,23,0.05), 0 18px 40px -20px rgba(28,27,23,0.18)",
      },
      maxWidth: {
        reading: "44rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
````

---

### `tsconfig.json`

````json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "forceConsistentCasingInFileNames": true,
    "noUncheckedIndexedAccess": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
````
