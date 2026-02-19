# Gemini Review (round-007) — Full Adversarial Review

## Verdict
**APPROVED_WITH_NOTES**

No new CRITICAL or HIGH blocking defects were introduced since Round 6. All eight Codex findings are correctly closed. However, five new findings of MEDIUM/LOW severity exist, plus three unresolved carry-forward issues from Round 6 that were tracked as "implementation notes" but remain documentation gaps. None are blocking if the implementer reads both PLAN.md and UI-SPEC.md together — but two of them will cause implementation drift if the implementer works only from PLAN.md.

---

## Codex Round 6 Closure Verification

| Finding | Status | Notes |
|---------|--------|-------|
| 1 — Earlobe example naming inconsistency (Harmonics vs Resonants) | ✓ Resolved | PLAN.md now uses "Harmonics" for the earlobe example. UI-SPEC.md § 1.3 "More Examples" table uses "Resonants" for Earlobes. Resolution: documented as "illustrative alternatives." The playground uses "Harmonics/Vibrants/Oscillants/Buzzers/Deaflings" consistently throughout. Acceptable. |
| 2 — SimulationPhase enum mismatch (8 vs 12 phases) | ✓ Resolved | PLAN.md Task 2 enum now matches UI-SPEC.md § 2.2 exactly: 12 phases including POLICY_BOTTOM_2 through POLICY_REMOVAL. |
| 3 — Chart legend shows prefix-only ("Upper") not full name | ✓ Resolved | UI-PLAYGROUND.html lines 2405–2409 now show "Upper Harmonics", "Noble Vibrants", "Middle Oscillants", "Common Buzzers", "Lower Deaflings". |
| 4 — Pyramid legend prefix-only inconsistent with tier bars | ✓ Resolved | Pyramid legend (lines 1787–1803) now shows "● Harmonics", "● Vibrants", "● Oscillants", "● Buzzers", "● Deaflings" — unique suffix only (no prefix in side legend, full name on tier bar). Internally consistent. |
| 5 — Year 80 comparison table uses generic "UPPER Edu" / "LOWER Edu" | ✓ Resolved | Lines 2248–2263 now read "HARMONICS Edu", "DEAFLINGS Edu", "DEAFLINGS Poverty", "DEAFLINGS Income". Unique suffix used. |
| 6 — END_SUMMARY Key Insight uses generic "Lower class" not display name | ✗ Partially Resolved | PLAN.md Task 13 now explicitly uses `SocialClass.displayName` in the acceptance criteria and action items. However, the UI-PLAYGROUND.html END_SUMMARY key insight card (lines 2308–2310) still reads "Education access for the Lower class went from 3% to 52%" and "the Upper class income is still 6x higher than the Lower class." The MOST IMPROVED badge (line 2317) correctly shows "LOWER DEAFLINGS", but the body text two lines above it is still generic. The playground is the visual reference for implementers. This inconsistency will mislead. |
| 7 — No max-length constraint for class names | ✓ Resolved | UI-SPEC.md § 1.3 adds 12-char max for suffix, 18-char max for full display name. Task 3 acceptance criteria adds validation check. |
| 8 — Uniqueness test missing in Task 3 validation | ✓ Resolved | Task 3 acceptance now reads "Each trait has 5 UNIQUE class names." The "no duplicates" language in tests is clarified by the per-trait uniqueness check in Task 4. |

---

## New Findings

| # | Finding | Severity | Affected Task/File | Recommendation |
|---|---------|----------|-------------------|----------------|
| 1 | POLICY_REMOVAL has three output branches not reflected in state machine or store | MEDIUM | PLAN.md Task 9, Task 10, Task 6 | See detail below. |
| 2 | Seven UI-SPEC components are not assigned to any PLAN.md task | MEDIUM | PLAN.md Tasks 9/11 vs UI-SPEC.md § 7 | See detail below. |
| 3 | Task 11 implements WealthChart (stacked area) but UI-SPEC.md § 5.2 specifies WealthPieChart (pie) | MEDIUM | PLAN.md Task 11 vs UI-SPEC.md § 5.2 and § 7.2 | Reconcile chart type: PLAN.md says stacked area, UI-SPEC.md says pie chart. These are functionally different representations. The playground shows neither — it references "Wealth Distribution" chart only in static mocks. Implementer will guess. |
| 4 | Income metric appears in UI display (Year 80 comparison, EWS screen, End Summary) but is absent from ClassMetrics type and simulation engine | MEDIUM | PLAN.md Task 2 (types), Task 5 (engine) | See detail below. |
| 5 | Seed determinism vulnerability: trait selection by array index, not by trait `id` | LOW | PLAN.md Task 4 (worldGenerator.ts) | Carried forward from Round 6 Finding 5 (edge case). The plan specifies seed-based RNG and "same seed → same world" determinism, but `worldGenerator.ts` picks a trait from the traits.json array. If traits are ever inserted or reordered (e.g., adding 100 more in Phase 2), all existing shared URLs break silently. Fix: select trait by seeded index into a sorted-by-id array, or by hashing the seed against trait ids. |
| 6 | END_SUMMARY playground still uses generic "Lower class" in Key Insight body text (see closure row 6) | LOW | UI-PLAYGROUND.html lines 2308–2310 | Update the key insight body text in the playground to use "Lower Deaflings" to match PLAN.md Task 13 intent. Low severity only because the PLAN.md spec is correct — this is a playground rendering gap, not a logic gap. |

---

## Finding 1 Detail: POLICY_REMOVAL Three-Branch Decision

UI-SPEC.md § 3.9 defines three action buttons on the POLICY_REMOVAL screen:

```
[ REMOVE ALL RESERVATIONS ]
[ CONTINUE WITH CURRENT POLICY → ]
[ ADJUST PERCENTAGES ]
```

This is a three-way branch, not a binary yes/no. PLAN.md Task 9 describes a generic `PolicyScreen` reusable component but documents only the "Apply & Advance" CTA and a "Skip / Reject" secondary. The `variant="removal"` routing in Task 10 acknowledges this screen is distinct, but nowhere does the plan specify:

1. What happens to the Zustand store state when "REMOVE ALL RESERVATIONS" is chosen (all reservation percentages set to 0? new store action needed?)
2. What "ADJUST PERCENTAGES" does — does it open the Settings Drawer? Does it render inline sliders on the same screen? There is no `adjustInline` variant defined.
3. How the simulation engine's 20-year step (Year 80–100) behaves if the user removes all reservations mid-phase vs. continues.

Task 6 store actions list only `setReservationPolicy(enabled, percentage, targetClasses)` — no `removeAllReservations()` action. Task 9 and Task 10 do not define how the removal path advances to `END_SUMMARY` vs. looping back.

**Impact**: The implementer will ship a POLICY_REMOVAL screen with only 1 or 2 buttons, or will invent behavior, because the plan is silent on the three-branch semantics.

**Recommendation**: PLAN.md Task 9 should explicitly document the three POLICY_REMOVAL variants: their store effects, CTA labels, and which phase transition each triggers. Add a `clearAllReservations()` action to Task 6.

---

## Finding 2 Detail: Seven UI-SPEC Components Unassigned

UI-SPEC.md § 7.1 and § 7.2 define these components:

| Component | UI-SPEC.md § | Assigned in PLAN.md? |
|-----------|-------------|----------------------|
| `ClassReservationControl` | 7.1 | No — Task 9 uses `ReservationSlider` instead. Different name for same concept? Or a distinct sub-component? |
| `ProgressSummary` | 7.1 | No — Task 9 uses `ProgressCard`. Same concept, different name. |
| `ExplanationBox` | 7.1 | No — Not mentioned in any task. |
| `IncomeThresholdSlider` | 7.1 | No — Task 9 has `PolicyToggle` with "threshold slider" mentioned inline but no separate component. |
| `ComparisonTable` | 7.1 | No — Only appears in POLICY_REMOVAL variant but no dedicated component defined. |
| `HowItWorksOverlay` | 7.1 | No — Present in the playground (tpl-how-it-works, fully implemented at line 2697), referenced in every policy screen via `[?]` button and in Task 10's global nav. But no PLAN.md task creates it. |
| `WealthPieChart` | 7.2 | No — Task 11 creates `WealthChart.tsx` (stacked area). Spec says pie chart. |
| `IncomeDistributionChart` | 7.2 | No — Not mentioned in Task 11 at all. |
| `PopulationChart` | 7.2 | No — Not mentioned in Task 11 at all. |
| `WhitepaperLink` | 7.1 | No — END_SUMMARY has a "WHITEPAPER" button in the playground (line 2342) and the How It Works overlay has "VIEW WHITEPAPER". No component, no task, no implementation guidance. |

**`HowItWorksOverlay` is the highest-risk gap**: it is fully spec'd in the playground, wired to a `[?]` nav button on every policy screen, but no PLAN.md task creates it. The dependency graph does not list it. An implementer working task-by-task will get to Task 10 and have no component to wire to the `[?]` button.

**Three chart components (`IncomeDistributionChart`, `PopulationChart`, `WealthPieChart`) are completely absent from Task 11**. UI-SPEC.md § 5.2 defines 7 chart types. Task 11 creates only 5. The implementation will ship 2 missing chart types plus the wrong Wealth chart type.

**Recommendation**: Add `HowItWorksOverlay` as a created file in Task 8 or Task 9. Reconcile Task 11 to match UI-SPEC.md § 7.2 chart inventory (7 charts, not 5). Reconcile `ReservationSlider`/`ClassReservationControl` and `ProgressCard`/`ProgressSummary` naming — pick one canonical name per component and use it everywhere.

---

## Finding 3 Detail: Income Metric Missing from Data Model

UI-SPEC.md § 3.8 (POLICY_EWS) shows per-class income in credits/month. UI-SPEC.md § 3.9 (POLICY_REMOVAL) shows income in the Year 0 vs Year 80 comparison table. UI-SPEC.md § 3.10 (END_SUMMARY) shows income in the final results table ("Income | ₢500 | ₢6,800 | +13x").

PLAN.md Task 2 defines `ClassMetrics` as containing: education, employment, wealth, poverty, life expectancy. No `income` field.

PLAN.md Task 5 (engine) defines calculation functions for all five metrics. No income calculation.

PLAN.md Task 13 (End Summary) mentions "Education access... went from 3% to 52%" but does not mention income, even though the playground's final results table prominently shows income.

PLAN.md Task 12 (Settings Drawer) defines the EWS threshold slider as `₢8,000/mo` but there is no corresponding income metric in the data model to validate against.

**Impact**: Income data displayed in three policy screens has no backing type definition, no simulation formula, and no data source. The implementer will either skip income display (making the POLICY_EWS screen's income comparison table impossible to build) or hardcode illustrative values.

**Recommendation**: Add `incomePerCapita: number` (or `monthlyIncome: number`) to `ClassMetrics` in Task 2. Add an income growth formula to Task 5 constants/models. Derive it from wealth share + population, or add it as a direct model. Add it to the Task 5 validation targets.

---

## Completeness Assessment

**Task coverage against UI-SPEC.md deliverables**:

| UI-SPEC Deliverable | PLAN.md Coverage |
|--------------------|-----------------|
| 5 policy screens (3.5–3.9) | COVERED — Task 9 (`PolicyScreen` + variants) |
| END_SUMMARY (3.10) | COVERED — Task 13 |
| Settings Drawer (§ 4) | COVERED — Task 12 |
| Charts Panel (§ 5) | PARTIAL — 5 of 7 chart types covered in Task 11 (see Finding 2) |
| How It Works Overlay (§ 6) | NOT COVERED — No task creates this component |
| Component inventory (§ 7.1) | PARTIAL — 4 of 10 components have name mismatches or are absent |
| Typography (§ 1.4) — Orbitron + Rajdhani | COVERED — Task 1 action 7 mentions Inter font (mismatch — see below) |
| Currency symbol ₢ (§ 1.5) | NOT SPECIFIED — No task mentions ₢ symbol implementation |

**Typography mismatch**: Task 1 action 7 says "Inter font (use `next/font/google`)". UI-SPEC.md § 1.4 specifies **Orbitron** and **Rajdhani**. Inter is a completely different font. The playground correctly loads Orbitron + Rajdhani. This is a stale copy in Task 1 that will cause an implementer to load the wrong font.

---

## Consistency Check

| Item | PLAN.md | UI-SPEC.md | Playground | Status |
|------|---------|------------|------------|--------|
| SimulationPhase enum (12 phases) | ✓ Matches | ✓ Authoritative | N/A (no types) | PASS |
| Class color for Noble (Class 2) | Teal `#2dd4bf` | Teal `#2dd4bf` | `#4ade80` (green) | FAIL — playground uses different hex |
| Class color for Lower (Class 5) | Red `#e94560` | Red `#e94560` | `#ff6b6b` (lighter red) | FAIL — playground uses different hex |
| WealthChart type | Stacked area | Pie chart | Not rendered in mock | FAIL — conflicting specs |
| Font stack | Inter (Task 1 action 7) | Orbitron + Rajdhani | Orbitron + Rajdhani | FAIL — PLAN.md Task 1 is wrong |
| Policy year labels (0/20/40/60/80) | COVERED in Task 9 | Authoritative | Matches | PASS |
| Pyramid legend format (suffix-only in side, full name on bar) | Not explicitly specified | Implied by tier bar wireframe | Suffix-only in legend, full name on bar | ACCEPTABLE but unspecified in PLAN.md |
| Max class name length (12 chars suffix) | ✓ Task 3 | ✓ § 1.3 | Max seen: "Discordants" (10) — PASS | PASS |

**Color inconsistency note**: The playground CSS defines `--class-noble: #4ade80` (green, not the spec's `#2dd4bf` teal) and `--class-lower: #ff6b6b` (lighter red vs spec's `#e94560`). This is stated as intentional in the playground ("Fixed contrast + no blur effects"), but PLAN.md Task 11's color constants reference the spec hex values. This will cause the implementation to look different from the playground reference. The difference is minor but developers should be aware.

---

## Edge Cases Not Addressed (Carry-Forward from Round 6)

These were flagged in Round 6 as unresolved edge cases. None have been addressed in the current revision:

1. **POLICY_REMOVAL back navigation**: If a user clicks back from END_SUMMARY to POLICY_REMOVAL, the simulation is at year 100. Pressing "ADJUST PERCENTAGES" from year 80 is semantically undefined. The store's `goBack()` action pops history but the policy screens are tied to specific years. What renders at year 80 if the user is re-visiting?

2. **Long display names in Recharts tooltip**: No tooltip overflow guidance added. Still an open implementation risk for Phase 1 at mobile widths.

3. **Narrative string character budget**: `findBiggestImprovement` produces strings with embedded display names. No defined max length.

4. **Seed determinism with future trait additions**: The Phase 2 plan adds 100 more traits. If inserted at the beginning of traits.json, all Phase 1 seeds break. No mitigation defined (sort-by-id before index selection).

---

## Final Notes

**All eight Codex Round 6 findings are properly resolved** with one minor exception: the END_SUMMARY playground body text still uses generic "Lower class" while the MOST IMPROVED badge correctly shows "LOWER DEAFLINGS". This is a low-priority playground polish item.

**The three new MEDIUM findings are the primary concern**:

1. **POLICY_REMOVAL three-branch semantics** (Finding 1): Will cause implementation ambiguity. The state machine must know what each of the three buttons does. This needs a one-paragraph clarification in Task 9 — it is not a rewrite.

2. **HowItWorksOverlay not assigned to any task** (Finding 2): This component is fully designed in the playground and wired to every policy screen. If no task creates it, it will be missing from the final implementation. Add it to Task 8 (or create a Task 8.5 / add to Task 9 component list).

3. **Income metric not in data model** (Finding 4): The POLICY_EWS income comparison table and END_SUMMARY results table require income data. Without `ClassMetrics.income` and an engine formula, these UI elements are unbuildable. Add the metric before implementation begins.

**The typography mismatch in Task 1** (Inter vs Orbitron+Rajdhani) is a concrete error that will ship the wrong font if not corrected. This is a one-line fix in Task 1 action 7.

**No new CRITICAL or blocking regressions were introduced by the Round 6 fixes.** The plan is structurally sound for its 12-phase state machine and the class naming convention is fully consistent across all three documents. The gaps above are bounded and addressable without plan restructuring.

**Recommendation**: Address MEDIUM findings 1, 2, and 4 plus the Task 1 typography error before marking the plan implementation-ready. The plan can proceed to implementation with these fixes in-flight, provided the implementing agent reads both PLAN.md and UI-SPEC.md as co-equal references.
