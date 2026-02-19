# Claude Review (round-004) — Adversarial Review

## Verdict
**APPROVED_WITH_NOTES**

The plan is comprehensive, well-structured, and ready for execution with the notes below. No critical blockers were found. The issues identified are implementer-solvable and do not require a plan revision cycle.

---

## Summary

PLAN.md is a solid 18-task plan with clear dependency graphs, acceptance criteria, and rollback strategies. UI-SPEC.md is unusually thorough — covering design tokens, ARIA patterns, edge states, and responsive breakpoints. UI-PLAYGROUND.html faithfully implements the spec's visual language. The three artifacts are internally consistent and align well with input documents (PRD, ARCHITECTURE, CALIBRATED-MODEL, RESEARCH).

Previous review rounds (1-3) contained only placeholder templates with no actionable findings. This is the first substantive review.

---

## Findings

### HIGH — Data Model Inconsistency: PRD vs PLAN trait structure

**Source**: PRD.md:236 defines `AbsurdTrait.classNameTemplate` as a single string. PLAN.md:77 and the traits JSON schema in PRD.md:277-289 use `classPatterns` (object with 5 tier keys). RESEARCH.md:45-46 uses yet another shape (`AbsurdTrait` with just `text` and `category`).

**Risk**: Implementer will face conflicting type definitions across input docs. The PLAN's `classPatterns` approach (object with tier keys) is the correct one — it's what the content strategy and world generator actually need.

**Recommendation**: During Task 2 (types), use the `classPatterns` object shape from PLAN.md Task 3. Ignore PRD's `classNameTemplate` string field. The PLAN already resolves this correctly; just be aware the PRD is outdated on this interface.

---

### HIGH — CALIBRATED-MODEL path reference is wrong in PLAN.md

**Source**: PLAN.md:12 references `../../CALIBRATED-MODEL.md`. The actual file is at `.planning/phases/01-research/CALIBRATED-MODEL.md`, which is **three** levels up from the v001 plan directory, not two.

**Risk**: Implementer looking for the calibrated model via the relative path will not find it.

**Recommendation**: Correct reference should be `../../../CALIBRATED-MODEL.md` or use absolute project-relative path. Non-blocking since the file exists and can be found, but should be noted.

---

### HIGH — PRD initial metrics mismatch with CALIBRATED-MODEL

**Source**: PRD US-4 (line 68) says "85% poverty, 2% education access" for the bottom class. CALIBRATED-MODEL.md section 1 (and PLAN.md Task 5 acceptance) uses 65% poverty and 3% education. PLAN.md correctly uses the calibrated values, but PRD is stale.

**Risk**: If anyone references PRD acceptance criteria literally during verification, they'll flag a false mismatch.

**Recommendation**: Use CALIBRATED-MODEL values (65% poverty, 3% education) which the PLAN already does. Note PRD discrepancy as "superseded by calibrated model."

---

### MEDIUM — Missing `worldNames.json` file in ARCHITECTURE.md file structure

**Source**: PLAN.md Task 3 creates `src/data/worldNames.json` (galaxy, planet, nation name pools). ARCHITECTURE.md file structure (line 185-189) only lists `traits.json` and `classTemplates.json` — no `worldNames.json`.

**Risk**: Minor doc inconsistency. PLAN.md is more specific and correct.

**Recommendation**: No action needed — PLAN.md governs execution. Architecture doc is for high-level orientation.

---

### MEDIUM — PLAN Task 3 claims 100 traits for MVP but PRD FR-1 says 200+

**Source**: PLAN.md:102 says "100 total for MVP, Phase 2 adds 100 more." PRD FR-1 (line 126) says "200+ options" and RESEARCH-BRIEF says "100-200." RESEARCH.md says "200+" in the pool.

**Risk**: Implementer may be confused about the trait count target.

**Recommendation**: 100 traits for MVP is the correct interpretation per PLAN.md's explicit Phase 1 scoping. This is fine — 100 with 5 categories provides sufficient variety.

---

### MEDIUM — UI-SPEC section 3.2.4 allows 0% slider edge case that PLAN doesn't handle

**Source**: UI-SPEC.md:393-394 specifies: "0% selected on slider: Warn '0% reservation has no effect. Continue anyway?' — treat as no-reservation path." PLAN.md Task 9 doesn't mention this edge case.

**Risk**: Implementer may miss the 0% warning UX pattern.

**Recommendation**: During Task 9 implementation, include the 0% warning from UI-SPEC. It's a small conditional but important for UX coherence.

---

### MEDIUM — No explicit error boundary task

**Source**: PLAN.md Task 17 (line 598) mentions "Add error boundaries to catch React crashes gracefully" buried in integration testing. This is implementation work, not testing.

**Risk**: Error boundaries might be forgotten since they're listed under a testing task rather than a dedicated component task.

**Recommendation**: Acceptable as-is. During Task 17 execution, create a reusable `ErrorBoundary` component in `src/components/ui/`.

---

### MEDIUM — UI-PLAYGROUND.html pyramid direction contradicts UI-SPEC naming

**Source**: UI-SPEC section 2.2 ClassPyramid says "Inverted trapezoid stack (widest at top = Class 1, narrowest at bottom = Class 5)." The playground HTML renders tier bars as: tier1 100%, tier2 85%, tier3 70%, tier4 55%, tier5 40% — which shows widest at top, narrowest at bottom. This matches the spec text, but contradicts a traditional "pyramid" visual (wider at base). The spec's description is internally consistent — "inverted trapezoid" = wider at top — so this is just a naming confusion ("pyramid" usually implies wider base).

**Risk**: None functionally. The visual correctly represents the social hierarchy with elite (few people, most power) at top being visually wider.

**Recommendation**: No change needed. The "inverted trapezoid" terminology in the spec is accurate. Consider renaming component to `ClassHierarchy` for clarity, but this is cosmetic.

---

### LOW — Wealth chart normalization after `calculateWealth` may drift

**Source**: CALIBRATED-MODEL.md section 3 wealth function uses `Math.max(1, ...)` which means no class can go below 1% wealth share. With 5 classes each guaranteed at least 1%, the normalization to 100% could distort intended gains if multiple classes cluster near the floor.

**Risk**: After many iterations, if bottom classes gain wealth and top classes lose it, the `Math.max(1, ...)` floor plus normalization could produce slight arithmetic drift.

**Recommendation**: In engine.ts (Task 5), after applying gains, re-normalize all wealth shares to sum exactly to 100. PLAN already specifies this in Task 5 line 195: "Normalize wealth shares to sum to 100% each year."

---

### LOW — UI-SPEC section 4.4 URL state shareability may conflict with large simulation state

**Source**: UI-SPEC:613-618 defines URL params `?seed=abc123&policy=27&targets=4,5&year=60`. PLAN Task 6 (Zustand store) mentions `FR-5: persist state in URL`. To reconstruct a simulation at year 60, the app would need to re-run the simulation from year 0 with the given seed.

**Risk**: If simulation is deterministic (same seed + same policy = same results), reconstructing from URL is feasible but could take noticeable time for large year values. 100 years x yearly steps x 5 classes of calculations.

**Recommendation**: Profile during Task 16. Target is < 100ms for simulation — running 100 yearly steps should be well within budget since it's pure arithmetic. No concern expected.

---

### LOW — Missing `WORLD_GEN` phase in playground

**Source**: UI-SPEC section 3.2 lists phases including `WORLD_GEN` between `INTRO` and `TRAIT_REVEAL`. The playground toolbar skips directly from "Intro" to "Trait Reveal" — no "World Gen" screen.

**Risk**: Cosmetic only. `WORLD_GEN` is likely a computation-only phase (no visible UI) that triggers world generation before showing the trait reveal.

**Recommendation**: Confirm during Task 8 implementation. If `WORLD_GEN` has no visible screen, it should be an instant transition phase, not a rendered screen.

---

### LOW — Font loading strategy undocumented in PLAN

**Source**: PLAN.md Task 1 mentions "Inter font" but doesn't specify `next/font/google` usage. UI-SPEC section 8 mentions it. The playground loads from Google Fonts CDN.

**Recommendation**: Use `next/font/google` for Inter (as UI-SPEC recommends). This is standard Next.js practice and avoids the CLS issues of external font loading.

---

## Cross-Document Consistency Matrix

| Aspect | PLAN.md | UI-SPEC.md | Playground | PRD | CALIBRATED-MODEL | Consistent? |
|--------|---------|------------|------------|-----|-------------------|-------------|
| Class count | 5 | 5 | 5 | 5 | 5 | Yes |
| Color system | Matches | Defines | Implements | — | — | Yes |
| Phase sequence | 8 phases | 8 phases | 8 screens | — | — | Yes |
| Population dist | From CAL-MODEL | — | 10/20/30/25/15 | — | 10/20/30/25/15 | Yes |
| Initial education Class 5 | 3% | — | 3% | 2% (stale) | 3% | Plan wins |
| Initial poverty Class 5 | 65% | — | 65% | 85% (stale) | 65% | Plan wins |
| Trait structure | classPatterns obj | — | — | classNameTemplate str (stale) | — | Plan wins |
| Chart types | Line/Area/Bar | Line/Area/Bar | SVG line demo | Line/Area/Bar | — | Yes |
| Responsive breakpoints | Tailwind default | 6 breakpoints defined | Desktop+Mobile | 320px min | — | Yes |

---

## Required Changes
None blocking. All findings are implementer-solvable during execution.

## Recommended Changes (Non-Blocking)
1. Fix the `../../CALIBRATED-MODEL.md` relative path in PLAN.md (should be `../../../CALIBRATED-MODEL.md`)
2. During Task 2, use `classPatterns` object shape, not PRD's `classNameTemplate` string
3. During Task 9, implement the 0% slider warning from UI-SPEC
4. During Task 17, create a reusable ErrorBoundary component

---

*Reviewed by: Claude (Opus 4.6), Round 004*
*Artifacts reviewed: PLAN.md (769 lines), UI-SPEC.md (803 lines), UI-PLAYGROUND.html (1841 lines)*
*Input docs cross-referenced: PRD.md, ARCHITECTURE.md, CALIBRATED-MODEL.md, RESEARCH.md, RESEARCH-BRIEF.md*
