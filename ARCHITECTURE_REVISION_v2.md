# Niyyah OS — Architecture Revision v2

**Status:** Proposal for approval. No implementation until approved.
**Author:** Engineering review against the v2 product mandate.
**Branch context:** `claude/niyyah-os-platform-v8bs7b` (v1 is built; this revises it.)

---

## 0. The thesis correction

**v1 drifted into a reflection platform.** It records behavior beautifully but
does not *force* behavioral change. The correction:

> A journal asks "what happened?" Niyyah OS must ask "what did you commit to, did
> you do it, and who is watching?"

The mechanism of change is **commitment + visibility + consequence**, repeated
daily, made measurable, and surfaced as identity progress over time. This is the
behavior-change literature in one line: *implementation intentions (commitments)
+ social accountability (rooms) + feedback loops (score/patterns) + friction on
relapse (interventions) → durable habit change.*

Everything below serves the single success metric: **a measured reduction in
behavioral violations per active trading day over time**, expressed to the user
as a rising **Discipline Score**.

### The two design tensions we must hold (read first)

The new mandate introduces two tensions with the original "calm, intentional, not
a Discord clone" positioning. We resolve them explicitly, because getting these
wrong destroys the product:

1. **Rooms vs. "not a social feed."** Rooms add social visibility, which can rot
   into a chat/Discord/influencer feed. **Resolution:** rooms are *structured
   accountability boards*, not free-form chat. The only first-class objects are
   *commitments*, *reviews*, *scores*, and *structured nudges/reviews*. There is
   no open chat, no images, no links, no PnL, no "calls." Interaction is
   constrained to accountability primitives. (See §2.)
2. **Share cards / streaks vs. "no dopamine gamification."** **Resolution:** we
   reward *consistency and progress*, never frequency or time-on-app. Streaks
   count clean days, not logins. Share cards are *outputs of real progress*, not
   engagement bait. No variable-reward mechanics, no infinite feeds, no
   notification spam. Pride in discipline, not stimulation. (See §8, §9.)

These two rules are positioning guardrails and must be enforced in code review.

---

## 1. Revised feature hierarchy

| Rank | Feature | Role |
| --- | --- | --- |
| 1 | **Accountability Rooms** | The centerpiece. The product. |
| 2 | **Daily Commitments** | The atomic unit of behavior change (intention → measurement). |
| 3 | **Behavioral Score Engine** | The primary KPI; the language of progress. |
| 4 | **Nafs Battle Tracker** | Flagship differentiator; roots violations in internal causes. |
| 5 | **Pattern Detection Engine** | Turns history into confrontation and intervention triggers. |
| 6 | **Accountability Partner Reviews** | High-trust 1:1 layer beneath rooms. |
| 7 | **Weekly Reflection** | Consolidation, not the centerpiece. |
| 8 | **Trader Archetypes** | Baseline + the canvas for *Identity Evolution* (progress), not identity. |

**Refactor map from v1 → v2** (so we know the blast radius before coding):

- `daily/` → split into **Commitments** (morning) + **Review** (evening); review
  gains **Nafs categorization**.
- `partner/` → generalized into **Rooms** (1:1 partner becomes a room of size 2).
- `behavior/` scoring → expanded engine producing multiple indices + rollups.
- `patterns/` → add nafs + commitment-failure + intervention-trigger outputs.
- `archetype/` → demoted from centerpiece; gains **Identity Evolution** snapshots.
- **New**: Intervention/Consequence engine, Identity Evolution, Share Cards,
  Room feed + denormalized status boards, scheduled jobs (Cloud Functions).
- `reflection/` → unchanged in spirit, demoted in placement.

---

## 2. Accountability Rooms architecture

### Room model

- **Room types:**
  - `pod` — 3–8 members, the default and the heart of the product.
  - `pair` — exactly 2 (this *replaces* the v1 partner concept; partner reviews
    in §6 are a feature of `pair` and `pod` rooms).
  - `cohort` — time-boxed challenge group (e.g., "30-Day Discipline Sprint"),
    larger (up to ~50), with a defined start/end. Drives the viral/growth loop.
- **Roles:** `owner`, `moderator`, `member`. Owners set room rules (which
  commitment templates are encouraged, the daily cutoff time, the timezone
  anchor, visibility defaults).
- **Joining:** invite code / link; optional approval. Matchmaking queue (see
  retention §C) for solo users who want a pod but have no friends to invite.

### What room members see (and never see)

| Visible | Never visible |
| --- | --- |
| Daily commitment status (posted? honored?) | Trade entries / tickers |
| Behavior/Discipline score (if shared) | PnL, account size, returns |
| Weekly consistency + current streak | Win rate |
| Nafs battle summary (if shared) | Strategy / signals / "calls" |
| Recent reflection excerpts (if shared) | Free-form chat, images, links |
| Structured nudges & partner reviews | DMs |

Privacy is **schema-enforced**: PnL fields do not exist in the data model, so
they cannot leak. Per-field sharing is consent-gated (§7 dashboard + settings).

### Daily room workflow

- **Morning:** each member posts commitments → a `commitment` event lands on the
  room board.
- **Evening:** each member posts their review (honored?/violations/nafs) → a
  `review` event updates their board row.
- **Room board** (the core screen) shows, per member, for *today*:
  `committed? → reviewed? → honored rate → today's score → streak → trend arrow`.
- The board makes four states instantly legible — the accountability payload:
  **who followed through, who disappeared, who improved, who repeated mistakes.**

### Technical shape (Firestore + denormalization)

Cross-user reads are blocked by per-user privacy, so room visibility is powered
by **denormalized, consent-filtered status docs** that each user writes for
themselves:

```
rooms/{roomId}                      // name, type, ownerId, settings, memberCount,
                                    // cutoffLocalTime, tzAnchor, encouragedTemplates[]
rooms/{roomId}/members/{uid}        // role, joinedAt, displayName, archetypeId,
                                    // streak, lastActiveDate (denormalized)
rooms/{roomId}/board/{date}/rows/{uid}   // THE board row, written by the owner-user:
                                    // { committedCount, reviewed, honoredRate,
                                    //   dayScore, streak, trend, nafsTop?, shared:{...} }
rooms/{roomId}/feed/{eventId}       // append-only: {type: commitment|review|nudge|
                                    //   partnerReview|interventionPublic, uid, date, payload}
rooms/{roomId}/nudges/{id}          // structured: {fromUid, toUid, kind, date}
```

- **Write path:** when a user commits/reviews, the client writes their own day
  doc *and* fan-out writes their `board/{date}/rows/{uid}` row to each room they
  belong to (capped: a user may belong to ≤ N rooms, see scalability §D).
- **"Who disappeared":** a scheduled Cloud Function runs at each room's cutoff,
  finds members with no `committed`/`reviewed` row for the day, and writes a
  `missed` state + emits a feed event (and partner notification per §4).
- **Hot-doc avoidance:** we use a **row-per-member subcollection** under
  `board/{date}` rather than one fat day document, so concurrent member writes
  don't contend on a single doc.

---

## 3. Daily Commitments

The atomic unit. The platform creates **commitment BEFORE action** and
**review AFTER action** — this ordering is non-negotiable and enforced by the UI
(you cannot review a day you didn't commit to without an explicit "unplanned
day" path that is itself scored).

### Commitment catalog

System templates (extensible), each mapped to the behavior it governs:

```
no_revenge_trading      → guards: revengeTraded         (nafs: ego, fear)
max_trades_2            → guards: overtraded            (nafs: impatience, greed)
respect_stop_loss       → guards: movedStop             (nafs: fear, ego)
no_impulsive_entries    → guards: chasedEntries/impulse (nafs: impatience)
follow_trading_plan     → guards: ruleBreak             (nafs: ego, laziness)
no_chasing_entries      → guards: chasedEntries         (nafs: greed, validation)
stop_after_max_loss     → guards: brokeRiskRules        (nafs: ego, attachment)
```

Plus user-defined custom commitments (text + optional mapped behavior + nafs
tag). Multiple per day. Each commitment is a measurable object:

```
users/{uid}/days/{yyyy-MM-dd}/commitments  (embedded array on the day doc):
  { id, templateId|custom, text, mappedBehavior?, nafsTags[],
    status: 'pending'|'honored'|'broken', note? }
```

### End-of-day measurement

At review the system asks, per commitment, **"Did you honor this?"** →
`honored | broken`. Commitment completion feeds the score (§4) heavily, and a
broken commitment **must** route into the Nafs categorization flow (§4 below).

**Commitment Completion Rate** becomes a first-class shareable metric.

---

## 4. Nafs Battle Tracker (flagship)

The differentiator. Trading mistakes are *symptoms*; nafs patterns are the
*root cause*. Every violation is categorized to an internal driver.

### Categories (canonical, 8)

`greed · fear · ego · impatience · attachment · validation_seeking · laziness ·
overconfidence`

### Capture flow

When a user logs a violation **or** marks a commitment `broken`, the system
asks: **"What was the root cause?"** → user selects one or more nafs categories
(+ optional one-line note). This produces a `NafsIncident`:

```
users/{uid}/nafsIncidents/{id}
  { date, categories: NafsCategory[], sourceType: 'violation'|'broken_commitment',
    sourceRef, note?, intensity?: 1-3 }
```

### Analytics

Rolling **7 / 30 / 90-day** incident counts and *rates* per category, e.g.:

```
Greed:    14 incidents (30d)  ↑   |  rate 0.47/active day
Fear:      4 incidents (30d)  ↓
Ego:      11 incidents (30d)  →
```

- Surfaced as the **Nafs Battle Summary** (top recurring battles) on the
  dashboard and (if shared) on room boards.
- Feeds the **Nafs Control Index** (§5 scoring) and **interventions** (§5b): a
  spiking category triggers targeted awareness, not punishment.
- This is the data spine for the "recurring internal battles" insight and the
  identity-evolution narrative ("ego incidents down 28%").

---

## 5. Behavioral Scoring Engine (the primary KPI)

**Never tracked:** profit, win rate, account size. **Tracked:** behavior only.

### Daily inputs & weights (proposal — tunable)

Affirmations (per occurrence):
```
+2  honored each daily commitment
+1  followed plan        +1  honored stop loss     +1  respected max loss
+1  waited for setup     +1  completed reflection
```
Violations (per occurrence):
```
-3  revenge traded       -3  broke risk rules
-2  overtraded           -2  moved stop            -2  chased entries
-2  ignored a commitment (== broken commitment)
```

> Note: "ignored commitment" and "broken commitment" are the *same event* — we
> count it once, via the commitment object, to avoid double penalty. Commitments
> are the spine; loose violations exist for behaviors not covered by a commitment.

### Derived metrics (the things users see and share)

1. **Day Score (0–100):**
   `dayScore = clamp01( 0.6·commitmentRate + 0.4·affirmationRate − violationPenalty ) ·100`
   where `commitmentRate = honored/total`, `affirmationRate` is normalized
   affirmations, and `violationPenalty` = Σ severity (capped). A no-commitment
   day is penalized (max 60).
2. **Discipline Score (0–100):** EWMA of Day Score with a ~30-day half-life
   (`α ≈ 0.045`). Stable, slow-moving, the hero KPI. Resistant to one good/bad day.
3. **Consistency Score (0–100):** % of last 30 *calendar* days with a completed
   commit→review cycle. Rewards showing up, not outcomes.
4. **Commitment Completion Rate (%):** honored/total over 7/30/90d.
5. **Nafs Control Index (0–100):** `100 − normalized nafs-incident-rate`,
   trended; rising = fewer internal-battle losses per active day.
6. **30/90-Day Growth Score:** `DisciplineScore(now) − DisciplineScore(now−N)`
   plus **Behavioral Improvement %** = reduction in violation rate vs baseline
   window (first 14 active days).
7. **Streak metrics:** current/longest clean-day streak (a clean day = reviewed,
   zero violations, ≥1 commitment honored).

### Aggregation & storage

To keep reads cheap and analytics fast, daily writes update **rollup docs**
rather than recomputing from raw history on every dashboard load:

```
users/{uid}/rollups/current     // live indices: discipline, consistency, nafsIndex,
                                 // completionRate, streak, lastComputedDate
users/{uid}/rollups/{yyyy-MM}    // monthly buckets for trend + growth deltas
users/{uid}/rollups/baseline     // first-14-active-day reference for improvement %
```

Rollups are updated transactionally on each day write (client) and reconciled by
a nightly Cloud Function (authoritative, prevents drift/gaming — see §A).

---

## 5b. Intervention / Consequence Engine

Reflection alone rarely changes behavior. Violations create **friction**, never
punishment. The engine is a **rules → actions** state machine with cooldowns and
an escalation ladder.

### Triggers (examples, all tunable)

```
SAME_VIOLATION_REPEAT     same behavior ≥3× in 7 days
COMMITMENT_RELAPSE        a specific commitment broken ≥3× in 14 days
SCORE_DROP                Discipline Score falls ≥10 pts in 7 days
NAFS_SPIKE                one category ≥40% of incidents in 14 days (n≥5)
DISAPPEARANCE             no commit/review for 3 consecutive active days
STREAK_BREAK_AFTER_LONG   clean streak ≥14 broken by a violation
```

### Interventions (escalation ladder, low → high friction)

```
1. pattern_warning        a calm banner naming the loop (awareness)
2. extra_reflection       one targeted prompt added to next review
3. mandatory_review       next-day commit is GATED until the review is completed
4. commitment_reset       force a simplified, smaller commitment set ("get back to basics")
5. focus_challenge        opt-in N-day micro-challenge (e.g., "3 days, 1 commitment, honor it")
6. partner_notification    your pair/room is notified you're struggling (consent-aware)
```

### State & safety

```
users/{uid}/interventions/{id}
  { type, triggerRule, createdAt, dueAt, status: 'active'|'acknowledged'|'resolved'|'expired',
    escalationLevel, cooldownUntil, resolutionNote? }
```

- **Anti-shame guardrails:** language is supportive; partner notifications are
  consent-gated and framed as "needs support," not "failed"; interventions expire;
  no permanent scarlet letters. Escalation de-escalates automatically on recovery.
- **Evaluation:** lightweight rules run client-side on review submit (immediate
  awareness) + a scheduled Cloud Function for time-based triggers (disappearance).

---

## 6. Accountability Partner Reviews

The high-trust 1:1 layer (a `pair` room, or a within-pod pairing).

- **Weekly partner review:** structured, not chat. Partner sees the week's
  Discipline Score, completion rate, top nafs battle, streak, and the user's
  stated next-week commitment, then submits a **structured review**:
  `{ acknowledgement, oneThingWorking, oneThingToConfront, encouragement }`.
- **Reciprocity required:** reviews are mutual; a partner who ghosts loses review
  privileges and the system suggests re-pairing.
- **Verification role:** partners can *attest* ("I believe this report is honest")
  — a soft integrity signal that combats self-report gaming (§A).
- Feeds the feed + can trigger `partner_notification` interventions.

---

## 7. Weekly Reflection (consolidation)

Unchanged in spirit (improved / repeated / triggers / next-week), but now:

- **Pre-filled with data:** the week's score delta, top nafs battle, most-broken
  commitment, and active patterns are injected so reflection is grounded in fact,
  not vibes.
- **Outputs a commitment:** the "what will change" answer becomes a *suggested
  commitment template* for next week — closing the reflect → commit loop.
- Demoted in navigation; it is the weekly cadence, not the daily product.

---

## 8. Identity Evolution (archetypes, reimagined)

Archetypes stop being static labels and become a **progress canvas**.

- **Behavior-derived dimension scores:** because every action/violation maps to a
  behavioral dimension (and now a nafs category), we recompute *live* dimension
  scores from actual behavior — independent of the original assessment.
- **Snapshots:** `users/{uid}/identitySnapshots/{period}` store dimension scores,
  archetype-tendency strengths, and nafs rates at intervals (weekly + 30/60/90d).
- **Transformation report:** compares now vs baseline and renders the narrative:
  ```
  You started as "The Chaser."
  Chasing behavior ↓ 42%   ·   Discipline ↑ 31%   ·   Emotional violations ↓ 28%
  Your dominant nafs battle shifted from Greed → Impatience.
  ```
- Users buy **progress**, not a label. Archetype can "evolve" (tendency strengths
  shift), which is the emotional payoff and the share-card centerpiece.

---

## 9. Dashboard architecture

One question: **"Am I becoming more disciplined?"** Time-of-day adaptive.

**Priority stack (top → bottom):**
1. **Discipline Score** hero — current value, 90-day sparkline, Δ vs baseline.
2. **Today's Commitments** — morning: "Set today's commitments." Evening:
   "Review today." (The single most important action, always actionable.)
3. **Commitment Completion %** (7/30d).
4. **Nafs Battle Summary** — top 2–3 recurring battles with trend arrows.
5. **Behavioral Trend** — 30/90-day.
6. **Consistency Streak.**
7. **Accountability Room Activity** — your pod's board (who's followed through
   today), nudges waiting.
8. **Partner Review Status** — review due / received.
9. **Weekly Improvements** — auto-surfaced wins.
10. **Active Interventions** — anything requiring action, with the supportive framing.

Everything reinforces transformation; nothing is a passive log.

---

## 10. Revised user journey

**Onboarding (activation-focused):**
`signup → assessment → archetype (framed as "your starting line") → JOIN OR CREATE
A ROOM (the critical activation step) → set your first daily commitments.`
> Activation metric: *posted first commitment into a room within 24h.* This, not
> "completed assessment," is the true north of onboarding.

**Daily loop:** morning commit (→ room) → trade → evening review + nafs
categorize (→ room) → see who followed through → interventions if drift.

**Weekly loop:** reflection (data-grounded) → partner review (mutual) → identity
progress check → next-week commitment.

**Long-term loop:** 30/60/90-day **Transformation Report** → share card →
identity evolves → deeper room investment.

---

## 11. Growth loops

1. **Accountability retention loop (core):** rooms create social obligation →
   daily return → streak → harder to abandon (you'd let your pod down). This is
   the primary retention engine, not notifications.
2. **Invite loop:** rooms need members; pods and cohorts have built-in invite
   pressure. Empty rooms die, so we add **matchmaking** to seed pods for solo
   users (supply side of the loop).
3. **Identity-progress viral loop:** Transformation Reports + share cards
   ("Discipline 43 → 82 in 90 days", "0 max-risk violations in 90 days") posted
   to social → curiosity → signups. Pride in discipline is the shareable.
4. **Cohort challenge loop:** time-boxed "30-Day Discipline Sprint" cohorts create
   urgency, group identity, and natural shareable end-of-cohort results.

K-factor levers: invite friction (low), share-card quality (high craft),
cohort cadence (regular public sprints).

---

## 12. Monetization

Behavior, never profit/signals — monetize *transformation and accountability*.

| Tier | Who | What |
| --- | --- | --- |
| **Free** | Solo starter | Assessment, 1 room, daily commitments, Day/Discipline score, basic nafs counts, weekly reflection. |
| **Pro** (subscription) | Serious individuals | Unlimited rooms, 30/90-day analytics, full Nafs Battle Tracker, Pattern Engine, Intervention Engine, AI coaching summaries, Identity Evolution + Transformation Reports, premium share cards. |
| **Coach / Community** (B2B2C) | Mentors, educators | Host branded rooms/cohorts, member discipline dashboards, cohort tooling. *Positioned as accountability infrastructure, NOT a signals/prop funnel.* |
| **Teams / Prop** (B2B) | Prop firms, desks | Aggregate (privacy-respecting) discipline dashboards for risk/behavior oversight; white-label. |

**High-leverage opportunity (flagged, needs scrutiny):** *Commitment staking* —
users stake a small amount, refunded on honoring commitments, forfeited (to
charity / a pool) on repeated breaks. Extremely powerful behavior-change
mechanic and revenue source, **but** carries regulatory, ethical, and
gambling-adjacency risk; must be opt-in, capped, charity-routed, and legally
reviewed. Recommend as a later experiment, not v2 launch.

---

## 13. How every feature maps to measurable transformation

| Feature | Mechanism of change | Measured by |
| --- | --- | --- |
| Rooms | Social accountability / obligation | Return rate, completion rate inside rooms vs solo |
| Daily Commitments | Implementation intentions (pre-commitment) | Commitment Completion Rate ↑ |
| Behavioral Score | Feedback loop / goal-gradient | Discipline Score ↑, violation rate ↓ |
| Nafs Tracker | Root-cause awareness | Nafs incident rate ↓ per category |
| Pattern Engine | Confrontation of blind spots | Repeat-violation rate ↓ after detection |
| Interventions | Friction on relapse | Recovery time ↓; repeat triggers ↓ |
| Partner Reviews | High-trust accountability + honesty signal | Streaks ↑, ghosting ↓ |
| Weekly Reflection | Consolidation → next commitment | Reflection→commitment conversion |
| Identity Evolution | Progress as motivation | Δ Discipline, Δ nafs, retention at 30/60/90d |

**North-star metric:** violation rate per active trading day, trended per cohort.
**Primary KPI surfaced to users:** Discipline Score. The two must move together.

---

# Critical analysis

## A. Self-report integrity (the existential weakness)

Niyyah OS has **no ground truth** — users self-report whether they revenge-traded
or honored a stop. A user can inflate their Discipline Score by logging only
positives. This is the single biggest threat to product validity.

Mitigations (layered, none perfect):
- **Partner attestation** (§6) — social cost to dishonesty.
- **Internal consistency checks** — implausible patterns (100% honored, zero
  nafs, every day) lower a hidden *confidence* weight on shared metrics and flag
  for gentle prompts ("be honest — this is only useful if it's true").
- **Framing** — relentlessly position honesty as self-interest, not performance.
- **Optional broker/journal verification (roadmap)** — integrate MT4/5,
  TradingView, broker APIs, or trade-journal imports to *verify* claimed
  behaviors (trade count, stop adherence) without ever storing PnL as a metric.
  This is the long-term moat and the answer to "is this real?"
- **Server-authoritative rollups** (§5) — scores recomputed server-side to prevent
  client tampering of the *math* (separate from honesty of *inputs*).

## B. Edge cases

- **Timezones & cutoffs:** rooms anchor to a tz; "today" and disappearance
  detection must use the room's local cutoff, and the user's own day key must be
  consistent (store explicit tz on profile).
- **Non-daily traders** (swing/position): daily commitment cadence punishes them.
  Solution: per-user **trading schedule** (active days), and "no-trade day"
  commitments ("I will not trade today") that still score as discipline.
- **Multiple sessions / markets** in one day; **late edits** (allow review edits
  within a grace window, version them, freeze after cutoff for room integrity).
- **Onboarding cold-start:** no history → patterns/interventions/growth are empty.
  Need graceful empty states and a baseline window before judgments.
- **Backfilling / retroactive logging** can game streaks → restrict edits to the
  current day + grace window.

## C. Abuse scenarios

- **Score gaming** (only-positives) → §A mitigations + confidence weighting.
- **Room harassment / shaming** — even structured nudges can be weaponized.
  Mitigate: fixed nudge vocabulary (no free text in nudges), report/mute/leave,
  moderator tools, rate limits, and a hard "supportive-only" content policy.
- **Fake/farming rooms** to juice referrals → invite/abuse rate limits, room
  caps, dedupe by device/identity.
- **Privacy leakage** — a member screenshots another's shared data. We can't stop
  screenshots, but we *can* ensure only consented fields ever render, watermark
  share cards, and keep the data behavioral-only (low harm even if leaked).
- **Cross-user data scraping** via the denormalized board → security rules must
  scope board reads to room members only, and only expose consented fields.
- **Sock-puppet partners** to self-attest → tie attestation weight to account age
  / mutual activity.

## D. Scalability concerns

- **Fan-out write amplification:** committing/reviewing writes to every room a
  user is in. Cap rooms-per-user (e.g., 5 active) and board rows are small docs.
- **Hot documents:** never a single room/day doc; use `board/{date}/rows/{uid}`
  subcollection (done above) to spread writes.
- **Scheduled jobs at scale:** disappearance + rollup reconciliation across all
  users/rooms. Shard by room/tz, run incrementally; consider task queues. At
  larger scale, move heavy analytics (90-day, cohort north-star) to **BigQuery**
  via Firestore export rather than reading raw docs.
- **Read cost:** dashboards read rollups (O(1)), not raw history. Room boards read
  one subcollection per room per day. Both bounded.
- **Cohorts (50+):** board reads grow with size; paginate and summarize.

## E. Retention risks

- **Shame backfire:** negative accountability can cause avoidance/churn (the user
  who's slipping stops opening the app precisely when they need it). This is the
  top retention risk. Mitigate: supportive framing, *re-entry* flows ("welcome
  back, let's reset" — never "you failed for 6 days"), interventions that lower
  friction rather than scold.
- **Streak loss demotivation:** one bad day nuking a 40-day streak is crushing.
  Mitigate: separate *clean-day streak* from *consistency* (showing-up) so a
  single violation doesn't erase all evidence of progress; offer "streak freeze"
  sparingly (but avoid Duolingo-style manipulation — must stay calm).
- **Room death spiral:** a quiet pod kills everyone's motivation. Mitigate:
  matchmaking, minimum-viable-pod sizing, gentle re-activation nudges, cohort
  injections.
- **Notification tension:** accountability wants nudges; positioning wants calm.
  Resolution: *scheduled, predictable* prompts (morning commit, evening review)
  + meaningful events (partner review, intervention) only. No engagement-bait
  notifications, ever.

## F. Opportunities to make it dramatically more valuable

1. **Broker/journal verification** → turns self-report into verified discipline;
   the credibility moat and an enterprise wedge.
2. **AI Accountability Coach** (Claude) → not summaries, but a daily 1:1 that
   confronts patterns, helps phrase commitments, and de-escalates relapse — the
   premium hook. (Used only where it changes behavior, per the AI principle.)
3. **Cohort sprints as a content/growth engine** → public "30-Day Discipline
   Sprint" leaderboards (discipline, not PnL) → recurring acquisition events.
4. **Transformation Report as the flagship shareable** → the emotional + viral
   payoff; invest real design craft here.
5. **Prop-firm / desk B2B** → firms care about trader behavior and blowups;
   privacy-respecting discipline dashboards are a real budget.
6. **Research credibility** → lean into the behavioral-science + nafs framing as a
   defensible, ownable position no journal competitor has.

---

## 14. Open decisions needed before implementation

These change the build meaningfully; I recommend the **bolded** option:

1. **Room model for v2:** start with **`pod` + `pair` only** (defer `cohort` to a
   fast-follow), or build all three now?
2. **Matchmaking at launch:** **invite-only first** (simpler, validates loop) or
   build matchmaking immediately to solve cold-start?
3. **Scheduled jobs:** introduce **Cloud Functions now** (needed for disappearance
   + authoritative rollups + interventions) — confirm we add Firebase Functions to
   the stack, or do a client-only v2 with weaker integrity?
4. **Commitment staking:** **defer** (regulatory review) or scope a charity-only
   pilot?
5. **Broker verification:** roadmap item (**defer**) or in-scope wedge for v2?
6. **Migration:** evolve the existing v1 schema in place, or **greenfield the v2
   data model** and treat v1 as a prototype? (Recommend greenfield model; reuse
   v1 UI primitives + assessment/archetype content.)

---

## 15. Recommended build sequence (once approved)

1. Data model + security rules + rollups (foundation, server-authoritative).
2. Daily Commitments (commit → review) + expanded Behavioral Scoring.
3. Nafs Battle Tracker (capture + 7/30/90 analytics).
4. Accountability Rooms (pod/pair) + denormalized boards + scheduled disappearance.
5. Intervention Engine.
6. Pattern Engine v2 (nafs + commitment-failure).
7. Dashboard redesign around the above.
8. Identity Evolution + Transformation Reports + Share Cards.
9. Partner Reviews, Weekly Reflection (data-grounded), Archetype demotion.
10. Growth: cohorts, matchmaking, AI coach, verification (phased).

**No code will be written until this document is approved.** On approval, I'll
confirm the §14 decisions and proceed in the §15 order.
