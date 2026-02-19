# Codex Review (round-006) — Adversarial Review

## Verdict
**APPROVED_WITH_NOTES**

The class naming convention update is coherent and largely consistent across all three documents. No blocking defects were found. However, five issues of varying severity need tracking before or during implementation — two are architectural mismatches that will cause runtime bugs if left unresolved.

---

## Round-006 Focus: Class Naming Convention

### Consistency Check

| Document | Class Naming Format | Example Used | Status |
|----------|---------------------|--------------|--------|
| PLAN.md Task 2 | `Record<ClassTier, string>` in `AbsurdTrait.classNames` | "Upper Harmonics", "Lower Deaflings" | PASS |
| PLAN.md Task 3 | JSON `classNames` object with 5 unique keys | Earlobe example with Harmonics/Vibrants/Oscillants/Buzzers/Deaflings | PASS |
| PLAN.md Task 4 | `getClassName(trait, tier)` → "Upper Harmonics" | Correctly constructs from prefix + suffix | PASS |
| PLAN.md Task 11 | `ChartLegend` reads `SocialClass.displayName` | "Upper Harmonics", "Noble Vibrants", "Lower Deaflings" | PASS |
| UI-SPEC.md § 1.3 | `[Prefix] [UniqueClassName]` (2 words) | Frequency: Harmonics/Melodics/Acoustics/Statics/Discordants | PASS |
| UI-SPEC.md § 1.3 examples table | Earlobes: Resonants/Vibrants/Oscillants/Buzzers/Deaflings | Earlobes "Upper" = Resonants (differs from PLAN.md) | FLAG (see Finding 1) |
| UI-PLAYGROUND.html | Unique names per tier | Upper Harmonics / Noble Vibrants / Middle Oscillants / Common Buzzers / Lower Deaflings | PASS |

---

### Findings

| # | Finding | Severity | Affected Task/File | Recommendation |
|---|---------|----------|-------------------|----------------|
| 1 | Naming inconsistency between PLAN.md and UI-SPEC.md for the earlobe example | LOW | PLAN.md Task 3 vs. UI-SPEC.md § 1.3 | Reconcile: PLAN.md uses "Harmonics" for Upper earlobe; UI-SPEC uses "Resonants". These are different example names for the same example trait. Playground uses "Upper Harmonics". Either align all to one example or add a note clarifying these are illustrative alternatives. |
| 2 | `SimulationPhase` enum in PLAN.md Task 2 uses OLD phase names; UI-SPEC.md § 2.2 defines a completely different enum | CRITICAL | PLAN.md Task 2 vs. UI-SPEC.md § 2.2 | See details below. This is a structural mismatch that will break the state machine. |
| 3 | Chart legend in playground shows only prefix words ("Upper", "Noble", etc.) — not full display names | MEDIUM | UI-PLAYGROUND.html chart-legend, Task 11 | The chart legend (line 2404-2410) renders "Upper", "Noble", "Middle", "Common", "Lower" — the tier prefix only, not "Upper Harmonics" etc. PLAN.md Task 11 and UI-SPEC.md § 5.5 both require full `displayName`. The playground misrepresents the intended implementation. |
| 4 | Pyramid legend also uses prefix-only labels | LOW | UI-PLAYGROUND.html pyramid-legend (lines 1786-1804) | The side legend on the ClassPyramid screen shows "● Upper", "● Noble" etc. without the unique class suffix. The tier bars themselves correctly show "Upper Harmonics" etc. Inconsistent within the same screen component. |
| 5 | POLICY_REMOVAL screen (Year 80) uses generic "UPPER Edu" / "LOWER Edu" labels in the comparison table — no unique class name | MEDIUM | UI-PLAYGROUND.html tpl-policy-yr80, lines 2248-2253 | The Year 80 comparison table rows read "UPPER Edu", "LOWER Edu", "LOWER Poverty", "LOWER Income". These should use the full display name (e.g., "UPPER HARMONICS Edu") for consistency with other policy screens. This is both a UI inconsistency and a test failure risk for Task 11's test that checks "unique class names, not generic 'Class 1-5'". |
| 6 | END_SUMMARY Key Insight text (in both UI-SPEC.md and playground) uses generic "Lower class" / "Upper class" — not unique display name | LOW | UI-SPEC.md § 3.10, UI-PLAYGROUND.html lines 2308-2310 | The key insight card reads "Education access for the Lower class went from 3% to 52%". Task 13's acceptance criteria say "Key insight highlighted" but doesn't specify that the class name must be unique. However the spirit of the naming convention demands "Lower Deaflings" here. Clarify in Task 13 acceptance criteria. |
| 7 | No truncation or max-length constraint defined for class names | MEDIUM | UI-SPEC.md § 1.3, Task 3, Task 11 | Long fictional class names (e.g., "Noble Chronovibrationists") could break chart legend layout or pyramid tier bars, especially at 390px mobile width. No guidance exists in any document for max character length or overflow handling. |
| 8 | `classNames` uniqueness is tested in Task 4 but NOT in Task 3 validation | LOW | PLAN.md Task 3 Acceptance vs. Task 4 Tests | Task 3 says "no duplicates, all traits have 5 unique class names" as a manual/script check. Task 4 adds a Vitest test for uniqueness. The Task 3 acceptance criterion "no duplicates" is underspecified — it should explicitly say uniqueness is per-trait, not across all traits (which would be impossible at scale). |

---

### Critical Finding Detail: SimulationPhase Enum Mismatch (Finding 2)

**PLAN.md Task 2** defines this enum:
```
INTRO | WORLD_GEN | TRAIT_REVEAL | PRE_RESERVATION | CHOICE | TIME_LOOP | CHARTS | END_SUMMARY
```
(8 phases — includes `CHOICE` and `TIME_LOOP` as generic phases)

**UI-SPEC.md § 2.2** defines this enum:
```
INTRO, WORLD_GEN, TRAIT_REVEAL, PRE_RESERVATION,
POLICY_BOTTOM_2, POLICY_MIDDLE, POLICY_CREAMY_LAYER, POLICY_EWS, POLICY_REMOVAL,
END_SUMMARY, CHARTS, SETTINGS
```
(12 phases — 5 distinct policy phases replace the generic CHOICE/TIME_LOOP)

These are incompatible. PLAN.md's state machine components (Task 8, 9, 10) are built around the old 8-phase model. The UI-SPEC.md § 2.1 flow diagram is the authoritative design — it describes 5 distinct policy screens at years 0/20/40/60/80. The PLAN.md Task 2 enum was never updated when the UI-SPEC was redesigned. The implementer will follow the types definition in Task 2 and build the wrong state machine.

**Required fix**: Task 2 enum must be updated to match UI-SPEC.md § 2.2. Tasks 8, 9, and 10 must be revised — Task 9 (`ReservationChoice`) becomes `PolicyScreen` (reusable component for all 5 policy phases), and Task 10 must route 5 distinct phases instead of a single generic TIME_LOOP.

---

### Completeness Assessment

Tasks directly modified for class naming (2, 3, 4, 11): **All updated and internally consistent.**

Tasks NOT updated that reference class names in their acceptance criteria or UI strings:

- **Task 8** (`TraitReveal`, `ClassPyramid`): Acceptance criterion says "5 classes shown with generated names" — sufficient, but the pyramid legend inconsistency from Finding 4 is not flagged.
- **Task 9** (`ReservationChoice`): Asks user "Do you wish to provide reservation for the [class name]?" — expects unique display name, which is correct by implication, but no explicit test validates the display name is the full unique form.
- **Task 13** (`EndSummary`): Action item 2 reads "Education access for the Frequency-Deaf went from 3% to 28%". "Frequency-Deaf" is a legacy naming style (trait-based compound) from a prior convention. This should reference `SocialClass.displayName` (e.g., "Lower Deaflings"). This is a stale copy-paste from an earlier plan version and will mislead the implementer.

---

### Edge Cases Not Addressed

1. **Long display names at mobile width (390px)**: Tier bars in the `ClassPyramid` show both the display name and a percentage. A name like "Noble Chronovibrationists" at 390px could overflow or wrap awkwardly. No `text-overflow: ellipsis` or `max-length` constraint is defined. The playground uses short example names (max: "Middle Oscillants" = 16 chars) that don't stress-test this.

2. **Display name in Recharts tooltip**: When hovering a line in the chart, the tooltip series label will show the full display name. Recharts default tooltip width is narrow. A name like "Upper Chronovibrationists" could truncate or overflow in the default tooltip style. No tooltip styling guidance exists in UI-SPEC.md or Task 11.

3. **Display name in time-series narrative string**: `TimeJumpNarrative` (Task 10) and `findBiggestImprovement` (Task 5) produce strings like "Education access improved most for [class]". No defined character budget for this string. If the display name is long, the narrative card could reflow unexpectedly.

4. **Trait `classNames` key exhaustion**: The `ClassTier` type is `'upper' | 'noble' | 'middle' | 'common' | 'lower'`. If a future phase adds a 6th tier, the discriminated union breaks. This is acceptable for Phase 1 scope but should be noted as a future risk.

5. **Seed determinism with class names**: `worldGenerator.ts` (Task 4) picks a random trait and generates class names from it. The test verifies same seed → same world. However, if the traits.json array is ever reordered (e.g., adding traits at the beginning), existing seeds break. No mitigation (such as seeding by trait `id` rather than array index) is specified.

---

## Previous Round Closure

Confirming Round 5 findings remain resolved:

| Round 5 Finding | Status |
|----------------|--------|
| Task 1: temp scaffold copies node_modules | Resolved — `--skip-install --no-git` + rsync excludes |
| URL vs localStorage precedence | Resolved — bootstrap order documented in Task 6 |
| WORLD_GEN phase under-specified | Resolved — defined as 500ms max non-visual transition |

No regressions introduced by Round 6 changes to the above.

---

## Final Notes

**The class naming convention update is well-executed** for its primary scope: Tasks 2, 3, 4, and 11 are mutually consistent, the type definitions are sound, the JSON schema example is clear, and the playground correctly demonstrates "Upper Harmonics / Noble Vibrants / Middle Oscillants / Common Buzzers / Lower Deaflings".

**The blocking concern is the SimulationPhase enum mismatch (Finding 2).** This predates the Round 6 changes but was not caught because the naming update touched only the data model, not the phase routing. The implementer will hit this when writing `simulate/page.tsx` in Task 10. It must be resolved before Task 2 is executed — it is a one-line fix in Task 2 but has cascading rewrites in Tasks 8, 9, and 10.

**Finding 3 (chart legend uses prefix-only)** is also implementation-relevant: the playground currently misrepresents the spec, which means a developer using the playground as a visual reference will ship a non-compliant chart legend. The playground should be updated to show "Upper Harmonics", "Noble Vibrants" etc. in the legend row.

**Recommendation**: Fix the Phase enum in PLAN.md Task 2 and update the playground chart legend before marking this plan as implementation-ready. All other findings are low-risk and can be tracked as implementation notes.
