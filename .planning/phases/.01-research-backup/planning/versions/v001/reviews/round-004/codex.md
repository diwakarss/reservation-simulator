# Codex Review (round-004) — Adversarial Review

## Verdict
**NEEDS_WORK**

The artifacts are close, but there are execution-blocking and acceptance-level inconsistencies that should be resolved before implementation starts.

## Prioritized Findings

### CRITICAL

1. **Task 1 scaffolding command is not executable in the current repo layout**
- Evidence: `PLAN.md:45` requires `npx create-next-app@latest reservation-simulator ...`.
- Evidence: The target path `projects/reservation-simulator` already exists and is non-empty (contains at least `.planning` and `.git`).
- Risk: Task 1 fails immediately or creates nested structure (`reservation-simulator/reservation-simulator`), invalidating downstream paths.
- Required change: Rewrite Task 1 bootstrap steps for an existing non-empty directory (temp scaffold + merge, or manual Next.js bootstrap in-place).

### HIGH

2. **FR-5 URL-state requirement is declared but not planned**
- Evidence: `PLAN.md:252` claims all FR-5 requirements will be met.
- Evidence: Task 6 actions (`PLAN.md:228-240`) omit URL encode/decode/hydration actions.
- Evidence: `UI-SPEC.md:611-619` requires shareable URL state (`seed`, `policy`, `targets`, `year`) and deep-link jump behavior.
- Risk: A stated acceptance requirement cannot be met with the current task plan.
- Required change: Add explicit URL sync/hydration actions and tests in Task 6/Task 10.

3. **Undo/redo acceptance criterion is not implementable from listed store API**
- Evidence: `PLAN.md:253` requires "Undo/redo for time jumps works".
- Evidence: Store actions include only `goBack()` for undo (`PLAN.md:233`); no redo action is defined.
- Evidence: Tests only cover `goBack` (`PLAN.md:245`).
- Risk: Acceptance becomes ambiguous or untestable.
- Required change: Either add a redo action + tests or reduce acceptance text to undo-only.

4. **TimeDial behavior is internally contradictory in PLAN vs UI-SPEC**
- Evidence: `PLAN.md:367` defines click-to-advance by default jump size.
- Evidence: `PLAN.md:389` acceptance says "Dial allows jumping to any year".
- Evidence: `UI-SPEC.md:162-163` also defines click/tap advance (not free scrubbing).
- Risk: Team may implement unnecessary complex dial scrubbing that conflicts with the spec.
- Required change: Align acceptance with click-to-advance model, and keep year scrubbing in charts.

### MEDIUM

5. **`WORLD_GEN` phase exists in PLAN/SPEC but is missing from playground coverage**
- Evidence: `PLAN.md:84` includes `WORLD_GEN` enum phase.
- Evidence: `UI-SPEC.md:233` and `UI-SPEC.md:567` include `WORLD_GEN` in the phase flow.
- Evidence: `UI-PLAYGROUND.html:1302-1309` exposes screens without `WORLD_GEN`; no `tpl-worldgen` template exists.
- Risk: Design review cannot validate this phase or its transition contract.
- Required change: Add explicit `WORLD_GEN` preview state or document it as intentionally non-visual.

6. **Target-class eligibility differs between PLAN and UI-SPEC**
- Evidence: `UI-SPEC.md:178` restricts targets to Classes 3/4/5 only (Class 1/2 not selectable).
- Evidence: `PLAN.md:333` and `PLAN.md:448` describe generic target-class checkboxes with no restriction.
- Risk: Implementers may allow policy targeting elite classes, deviating from design intent.
- Required change: Add explicit target-class constraints in Task 9 and Task 12.

7. **Choice-screen edge-case requirements from UI-SPEC are not carried into PLAN and not shown in playground**
- Evidence: `UI-SPEC.md:393-394` mandates 0% warning and disabled CTA when no class is selected.
- Evidence: Task 9 acceptance (`PLAN.md:346-349`) does not include either edge case.
- Evidence: Playground `BEGIN SIMULATION` CTA is always present (`UI-PLAYGROUND.html:1511`) with no 0% warning state.
- Risk: Behavior divergence at a key policy decision point.
- Required change: Add explicit acceptance/tests for both edge cases in Task 9.

8. **Accessibility contract in UI-SPEC is not represented in playground interaction primitives**
- Evidence: `UI-SPEC.md:697-709` requires ARIA roles/labels across controls.
- Evidence: `UI-SPEC.md:703` expects native range slider semantics.
- Evidence: `UI-PLAYGROUND.html` contains no `aria-*`, no `role=`, and no `<input type="range">` controls.
- Risk: Prototype may mislead implementers on accessibility requirements.
- Required change: Add minimal ARIA and semantic control examples in the playground, or add a visible note that a11y semantics are intentionally omitted in this artifact.

### LOW

9. **Broken relative path to calibrated model in PLAN inputs section**
- Evidence: `PLAN.md:12` references `../../CALIBRATED-MODEL.md`.
- Evidence: From `v001/`, `../../CALIBRATED-MODEL.md` is missing; `../../../CALIBRATED-MODEL.md` exists.
- Risk: Minor onboarding friction when tracing source model.
- Required change: Fix the relative path in `PLAN.md` inputs list.

10. **CosmicBackground layer count mismatches spec**
- Evidence: `UI-SPEC.md:129` calls for 3 star layers.
- Evidence: Playground uses 2 star layers in templates (`UI-PLAYGROUND.html:1343-1345`, `UI-PLAYGROUND.html:1362-1364`).
- Risk: Minor visual fidelity drift.
- Required change: Add a third star layer or update spec wording.

## Suggested Go/No-Go
**No-go until CRITICAL + HIGH findings are resolved.** After those are addressed, the plan should be executable with manageable medium/low polish gaps.
