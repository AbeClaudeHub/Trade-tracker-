# Niyyah OS — Room Effectiveness Spec (v2.1)

**Status:** Proposal for approval. No implementation until approved.
**Supersedes:** the room-model portion of `ARCHITECTURE_REVISION_v2.md`.

---

## 0. Scope lock (per your direction)

- **One room type. ~7 traders per room.** No pods, no `pair`/`cohort` variants,
  no matchmaking, no micro-groups.
- The room structure is fixed; we are **not** redesigning it. We are making it
  **dramatically more effective**.
- All new work serves five levers: **daily visibility · commitment tracking ·
  behavioral accountability · reflection quality · room-level progress.**

> Reconciliation note: v1 currently ships a 1:1 *partner* system. "Room" is the
> canonical accountability unit going forward (size ≈ 7). The partner concept
> collapses into "rotating in-room accountability pairing" (Lever 3) rather than
> a separate system.

A ~7-person room is small enough that scalability is a non-issue: per-day fan-out
is ≤ 7 tiny docs, no hot-document contention, no sharding/BigQuery needed yet.
This is a feature-depth problem, not a scale problem.

---

## Lever 1 — Daily visibility

**Goal:** within 3 seconds of opening the room, you know exactly who followed
through, who's pending, who disappeared, who improved, who repeated a mistake.

Features:

1. **The Room Board (the app's home screen).** One row per member for *today*:
   `committed? → reviewed? → honored rate → day score → streak → trend ↑/→/↓ → today's top nafs`.
   Live-updating via Firestore listeners.
2. **Member day-states**, color-coded and unambiguous:
   `committed · awaiting review · followed through · repeated mistake · improved ·
   absent today`. Absent members are **shown, not hidden** — visibility is the point.
3. **Room pulse banner:** e.g. *"5/7 committed · 3/7 reviewed · 2 on a streak."*
   A single glance at the room's collective state.
4. **Morning vs evening modes:** before cutoff the board emphasizes commitments;
   after, it emphasizes reviews and outcomes.
5. **Structured nudges (not chat).** Fixed vocabulary only — e.g. *Respect ·
   Stay strong · Check in? · Proud of you*. No free text, no images, no links.
   Keeps presence high and the Discord-ification risk at zero.
6. **Disappearance detection** at the room's daily cutoff (scheduled job): marks
   `absent`, surfaces it on the board, and enables a one-tap "check in?" nudge.

---

## Lever 2 — Commitment tracking

**Goal:** commitments are specific, visible, and measured — so accountability is
about *this promise*, not vague effort.

Features:

1. **Room commitment ledger:** each member's actual commitments (the ☐ items)
   are visible to the room. Accountability becomes concrete: *"you said max 2
   trades."*
2. **Per-commitment honor history:** for each member and each commitment type, a
   visible honor rate + streak (e.g. *"Respect stops: 12/14"*).
3. **Commitment carryover / recommit:** a commitment broken yesterday is flagged
   today with a prompt to recommit — closing the relapse loop at the source.
4. **Room Commitment of the Week:** the room owner (or vote) sets one shared
   commitment everyone adopts (e.g. *"No revenge trading this week"*). Produces a
   **room-level completion %** and a collective goal — without adding structure.
5. **Commitment specificity scoring:** nudge vague commitments toward measurable
   ones (templates with thresholds) so honoring is unambiguous.

---

## Lever 3 — Behavioral accountability

**Goal:** turn the room from passive watching into active accountability and
support, and protect the honesty the whole system depends on.

Features:

1. **Rotating in-room accountability partner.** Each week, every member is paired
   with one other member *inside the same room* to specifically check on. This
   delivers 1:1 obligation **without** a separate pod/partner system — it lives
   inside the 7-person room. Pairings rotate for variety and full coverage.
2. **Pattern flags surfaced to the room (consent-gated):** when a member triggers
   a repeat-violation pattern, peers see a supportive "needs support" flag (never
   a "failure" label) and can send a structured nudge or a partner check-in.
3. **Peer attestation:** members can vouch that a peer's reporting is honest — a
   soft integrity signal that directly counters self-report gaming (the system's
   biggest validity risk). Attestation weight scales with mutual room tenure.
4. **Room discipline standings:** a leaderboard on **Discipline Score, completion
   rate, and consistency** — never PnL. Includes a **"Most Improved"** view so
   newer/struggling members can win on *growth*, not just absolute level.
5. **Support surfacing for the struggling:** members flagged by interventions
   appear with a "send support" affordance (consent-aware) — the room actively
   helps at the exact moment a member would otherwise quietly disappear.

---

## Lever 4 — Reflection quality

**Goal:** reflections become honest, specific, and peer-visible — which raises
their quality and converts them into accountability, not journaling.

Features:

1. **Data-grounded reflection:** pre-fill the weekly reflection with the week's
   facts — score delta, most-broken commitment, top nafs battle, active patterns
   — so reflection starts from truth, not vibes.
2. **Depth-escalating prompts:** guided follow-ups (*"You said ego — when exactly
   did ego show up this week?"*), optionally AI-assisted (Claude asks one
   sharpening question). AI is used only to deepen self-awareness.
3. **Shared reflections in the room (consent-gated):** members can post a weekly
   reflection excerpt to the room; peers respond with **structured** feedback
   (acknowledgement · one thing working · one thing to confront · encouragement).
   People write more honestly when peers will read it.
4. **Rotating-partner reflection review:** your paired member (Lever 3) reads your
   reflection and returns structured feedback — quality + accountability in one.
5. **Reflection completion is tracked behavior:** it scores, it's visible on the
   board, and skipping it is itself an accountability event.

---

## Lever 5 — Room-level progress

**Goal:** the room has its own identity and trajectory; collective progress keeps
a 7-person room alive without a chat feed.

Features:

1. **Room aggregate metrics:** room-average Discipline Score, room completion
   rate, total clean days this week, **collective violation-reduction %**, and a
   **room review streak** (consecutive days all/most members reviewed).
2. **Room transformation over time:** *"This room reduced violations 34% in 30
   days."* The room, not just the individual, evolves.
3. **Room milestones:** collective goals (e.g. *"room hits 90% completion for a
   full week"*) that unlock a shared, calm acknowledgment — pride, not dopamine.
4. **Weekly Room Digest (the heartbeat):** an auto-generated, calm weekly summary
   — who improved most, the room's biggest shared battle, collective wins, who to
   rally around. This is what sustains a small room without notifications or chat.
5. **Room progress share card:** an exportable, beautiful card of the room's
   collective discipline growth — pride in shared transformation (viral loop,
   discipline-only, never PnL).

---

## Data model deltas (additive to v2; sized for ~7-member rooms)

```
rooms/{roomId}
  name, ownerId, memberCount(≈7), cutoffLocalTime, tzAnchor,
  encouragedTemplates[], commitmentOfWeek?, createdAt

rooms/{roomId}/members/{uid}
  role, displayName, archetypeId, joinedAt,
  streak, lastActiveDate, sharing:{score,nafs,reflections},   // per-member consent
  weeklyPartnerUid                                             // rotating pairing (Lever 3)

rooms/{roomId}/board/{date}/rows/{uid}                         // written by each member
  committedCount, reviewed, honoredRate, dayScore, streak,
  trend, topNafs?, absent, shared:{...consented fields}

rooms/{roomId}/feed/{eventId}                                  // structured only
  type: commitment|review|nudge|attestation|sharedReflection|milestone
  fromUid, toUid?, date, payload

rooms/{roomId}/rollups/current                                 // room aggregates (Lever 5)
  avgDiscipline, completionRate, cleanDaysWeek, violationReductionPct,
  reviewStreak, mostImprovedUid, biggestBattle

rooms/{roomId}/digests/{weekId}                                // weekly room digest
```

Per-user data, scoring, nafs, interventions, and identity evolution are unchanged
from `ARCHITECTURE_REVISION_v2.md`. Security rules scope all room reads to current
members and expose only consented fields.

---

## What this explicitly does NOT add

No pods, no matchmaking, no cohorts, no public/global feeds, no free-form chat,
no DMs, no media, no PnL/win-rate/strategy anywhere. The room stays a structured
accountability surface for ~7 people.

---

## Effectiveness → metric mapping

| Feature area | Why it changes behavior | Measured by |
| --- | --- | --- |
| Room Board + absence surfacing | Visibility creates obligation | Daily return rate, % days reviewed |
| Commitment ledger + carryover | Specific, public promises | Commitment Completion Rate ↑ |
| Rotating partner + attestation | 1:1 obligation + honesty pressure | Ghosting ↓, report-confidence ↑ |
| Shared/peer-reviewed reflection | Quality + social stakes | Reflection depth, completion ↑ |
| Room aggregates + digest | Collective identity + heartbeat | Room retention, violation reduction % |

North-star unchanged: **violation rate per active trading day ↓**, surfaced as a
rising **Discipline Score** — now reinforced by room-level visibility and pride.

---

## Remaining decisions before implementation

Your direction resolved the room-model and matchmaking questions. Two gating
technical decisions remain:

1. **Cloud Functions.** Disappearance detection at room cutoff, authoritative
   score rollups (anti-gaming), and time-based interventions want a server.
   *Recommend: add Firebase Cloud Functions.* Alternative: client-only v2 with
   weaker integrity and no true "absent today" detection.
2. **Codebase approach.** *Recommend: greenfield the v2 data model* (reuse v1 UI
   primitives, assessment, and archetype content; replace partner→room). The v1
   schema wasn't designed for rooms/commitments/nafs. Alternative: evolve v1 in
   place (more migration friction, less clean).

On approval + these two answers, I'll implement in the `ARCHITECTURE_REVISION_v2.md`
§15 sequence, starting with the data model, commitments, and scoring.
