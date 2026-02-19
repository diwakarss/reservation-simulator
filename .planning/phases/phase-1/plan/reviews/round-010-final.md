# Final Adversarial Review (round-010)

## Verdict

APPROVED

All Round 9 findings are closed. Cross-document consistency is sound. Implementation completeness is high. Remaining issues are all LOW severity and documented below as implementation notes rather than blockers.

---

## Round 9 Closure Verification

Round 9 (codex) raised two LOW findings. Both are resolved in the current PLAN.md.

### Finding A — `setReservationPolicy` Signature Mismatch

**Status**: RESOLVED

PLAN.md Task 6 Actions item 3 now reads:

```
setClassPolicy(tier: ClassTier, policy: Partial<ClassPolicy>) — Update policy for a specific class tier
setCreamyLayer(tier: ClassTier, enabled: boolean, threshold: number) — Set creamy layer for a class
setEWSPolicy(tier: ClassTier, enabled: boolean, threshold: number, ewsPercent: number) — Set EWS for upper classes
```

The old flat `setReservationPolicy(enabled, percentage, targetClasses)` signature is gone. The test list at Task 6 line 419 references `setClassPolicy`, `setCreamyLayer`, and `setEWSPolicy` by name. Finding A is fully closed.

### Finding B — Stale URL Acceptance Criteria

**Status**: RESOLVED

Task 6 acceptance criteria now reads:

```
- [ ] URL shareable with `?seed=...&year=...&state=<base64-policy-blob>`
```

The old `?seed=...&policy=...&targets=...&year=...` format no longer appears. Finding B is fully closed.

---

## Cross-Document Consistency

### Component Inventory: UI-SPEC.md § 7.1 vs. PLAN.md

| UI-SPEC § 7.1 Component | PLAN.md Task | Status |
|-------------------------|-------------|--------|
| `PolicyScreen` | Task 9 | Match |
| `ReservationSlider` | Task 9 | Match |
| `ProgressCard` | Task 9 | Match |
| `ExplanationBox` | Task 9 | Match |
| `PolicyToggle` | Task 9 | Match |
| `ComparisonTable` | Task 9 | Match |
| `HowItWorksOverlay` | Task 8 | Match |
| `WhitepaperLink` | Task 13 | Match |

All 8 components in § 7.1 have explicit task assignments. No orphaned components.

### Chart Components: UI-SPEC.md § 7.2 vs. PLAN.md Task 11

| UI-SPEC § 7.2 Component | PLAN.md Task 11 | Status |
|------------------------|----------------|--------|
| `EducationChart` | Listed | Match |
| `EmploymentChart` | Listed | Match |
| `PovertyChart` | Listed | Match |
| `WealthPieChart` | Listed | Match |
| `IncomeDistributionChart` | Listed | Match |
| `LifeExpectancyChart` | Listed | Match |
| `PopulationChart` | Listed | Match |

All 7 chart types match. Confirmed also present in UI-PLAYGROUND.html desktop tabs (Education, Employment, Wealth, Poverty, Life Exp., Income Dist., Population) and mobile `<select>` dropdown. Round 8 closure verified against actual HTML.

### Store Actions vs. UI Screen Requirements

Every store action needed by the five policy screens exists in Task 6:

| UI Screen | Required Action | Task 6 Status |
|-----------|----------------|--------------|
| POLICY_BOTTOM_2 | `setClassPolicy(lower/common, ...)` | Present |
| POLICY_MIDDLE | `setClassPolicy(middle, ...)` | Present |
| POLICY_CREAMY_LAYER | `setCreamyLayer(tier, ...)` | Present |
| POLICY_EWS | `setEWSPolicy(tier, ...)` | Present |
| POLICY_REMOVAL (Remove All) | `clearAllReservations()` | Present |
| POLICY_REMOVAL (Adjust) | `openSettingsDrawer()` | Present |
| All phases | `setPhase(SimulationPhase)` | Present |
| All phases | `advanceTime(years)` | Present |
| Navigation | `goBack()`, `goForward()` | Present |

Coverage is complete.

### SimulationPhase Enum: Task 2 vs. UI-SPEC.md § 2.2

Both documents define the identical 12-member enum:

```
INTRO, WORLD_GEN, TRAIT_REVEAL, PRE_RESERVATION,
POLICY_BOTTOM_2, POLICY_MIDDLE, POLICY_CREAMY_LAYER,
POLICY_EWS, POLICY_REMOVAL, END_SUMMARY, CHARTS, SETTINGS
```

Both annotate WORLD_GEN as non-visual and sub-500ms. Both annotate CHARTS and SETTINGS as overlays that do not interrupt simulation flow. The enum is consistent across documents.

### Class Colors: PLAN.md Task 11 vs. UI-SPEC.md § 1.2

| Class | UI-SPEC.md § 1.2 | PLAN.md Task 11 | Status |
|-------|-----------------|----------------|--------|
| Upper (Class 1) | `#e2b714` Gold | `#e2b714` Gold | Match |
| Noble (Class 2) | `#2dd4bf` Teal | `#2dd4bf` Teal | Match |
| Middle (Class 3) | `#60a5fa` Blue | `#60a5fa` Blue | Match |
| Common (Class 4) | `#a78bfa` Purple | `#a78bfa` Purple | Match |
| Lower (Class 5) | `#e94560` Red | `#e94560` Red | Match |

**Note on playground divergence (LOW, non-blocking)**: UI-PLAYGROUND.html uses lighter variants for contrast (`#f4c430`, `#4ade80`, `#ff6b6b`, `#c4b5fd`) rather than the spec-canonical values. The playground is an exploratory HTML prototype, not the implementation source. Both PLAN.md and UI-SPEC.md are internally consistent. The implementing agent uses the spec hex values, not the playground. This divergence is expected and acceptable.

### Typography: Task 1 vs. UI-SPEC.md § 1.4

Task 1 action 7 specifies: "Set up global CSS with dark cosmic background, Orbitron + Rajdhani fonts (use `next/font/google`)"

UI-SPEC.md § 1.4 specifies Orbitron (700/600/300/400) for display/narrative/metric, Rajdhani (600/400/500) for cards/body/labels, loaded via `next/font/google`.

Both documents agree on the two-font stack. The Inter mismatch from Round 7 is fully resolved.

---

## Implementation Completeness

### All 18 Tasks: Acceptance Criteria Check

| Task | Acceptance Criteria Present | Clear? |
|------|----------------------------|--------|
| 1 | 5 criteria | Yes |
| 2 | 5 criteria | Yes |
| 3 | 6 criteria | Yes |
| 4 | 5 criteria | Yes |
| 5 | 4 criteria | Yes |
| 6 | 6 criteria | Yes |
| 7 | 4 criteria | Yes |
| 8 | 5 criteria | Yes |
| 9 | 6 criteria | Yes |
| 10 | 5 criteria | Yes |
| 11 | 7 criteria | Yes |
| 12 | 4 criteria | Yes |
| 13 | 4 criteria | Yes |
| 14 | 4 criteria | Yes |
| 15 | 4 criteria | Yes |
| 16 | 4 criteria | Yes |
| 17 | 5 criteria | Yes |
| 18 | 3 criteria | Yes |

All 18 tasks have checkable, unambiguous acceptance criteria. No task is specified only by intent without a verifiable outcome.

### Dependency Graph Completeness

The dependency graph correctly represents:

- Task 1 (scaffold) as the sole root dependency
- Tasks 2 and 3 running in parallel after Task 1
- Tasks 4 and 5 running in parallel after Task 2 and 3
- Task 6 (store) waiting on Task 5 (engine) and Task 4 (content loader)
- UI tasks 7-13 branching from Task 6
- Tasks 14, 15, 16, 17, 18 as sequential polish waves

One subtle dependency is correctly implied but not explicitly stated: Task 8 (narrative components) depends on Task 4 (content loader) because `GalaxyIntro` and `TraitReveal` render world-generated content. The graph shows "Task 8 ← needs store + content" which is sufficient. No hidden circular dependencies exist.

### Test Coverage Targets

| Suite | Target | Realism Assessment |
|-------|--------|-------------------|
| Simulation engine | 95%+ | Achievable — pure functions, deterministic, testable in isolation |
| Content generation | 90%+ | Achievable — pure functions with known inputs |
| State store | 90%+ | Achievable — Zustand stores test well with vitest |
| Component render | 80%+ | Realistic — RTL snapshot + behavior tests |

Targets are realistic. The 95%+ engine target is appropriate given the educational accuracy requirement (CALIBRATED-MODEL.md § 4 validation targets).

### Rollback Strategy

Every task has an explicit rollback:

- Code tasks: `git revert` the task's commit
- Data tasks: delete JSON files
- Config tasks: revert config file changes
- No database means no migration rollback complexity

The strategy is complete and each task is independently reversible. The "no database, fully client-side" constraint makes rollback trivial for all 18 tasks.

---

## Edge Cases & Risks

### FINDING 1 — SETTINGS Phase: "Full Page" vs. Overlay Contradiction (LOW)

**Location**: PLAN.md Task 10, phase router table, line 599

**Problem**: The phase routing comment reads:
```
SETTINGS → SettingsScreen (full page)
```

But two lines later, the same task states:
```
CHARTS and SETTINGS are overlays that don't interrupt simulation state
```

And UI-SPEC.md § 4.1 explicitly states Settings "Does NOT interrupt simulation flow." Task 12 implements it as `SettingsDrawer.tsx` — a slide-out drawer, not a full page. The "(full page)" annotation on line 599 is a stale label.

**Impact**: LOW — The surrounding text and UI-SPEC are consistent. An implementer reading the full task context will correctly build a drawer. However, an implementer who reads only the routing table could build a full-page replacement.

**Recommended fix before implementation**: Change line 599 annotation from `SettingsScreen (full page)` to `SettingsDrawer (overlay, slide-out)`.

---

### FINDING 2 — Pyramid Legend Shows Suffix-Only Names, Not Full Display Names (LOW)

**Location**: UI-PLAYGROUND.html, pyramid legend section, lines 1787-1805

**Problem**: The pyramid's sidebar legend shows suffix-only names:
```
● Harmonics    10%
● Vibrants     20%
● Oscillants   30%
● Buzzers      25%
● Deaflings    15%
```

The pyramid bars themselves correctly show full names ("Upper Harmonics", "Noble Vibrants", etc.). The legend inconsistency means users hovering or reading the legend lose the tier prefix.

**Impact**: LOW — The playground is a prototype. PLAN.md Task 8 states `ClassPyramid` should show "5 classes, color-coded, with population %." The full name behavior is established by the UI-SPEC class naming convention (§ 1.3). An implementer building the real component will follow the spec, not the playground legend.

**Recommended fix**: Update playground legend to show full names ("Upper Harmonics", etc.) for implementation fidelity. Not a blocker.

---

### FINDING 3 — POLICY_CREAMY_LAYER Progress Summary Uses Generic "LOWER/COMMON/MIDDLE" Labels (LOW)

**Location**: UI-PLAYGROUND.html, POLICY_CREAMY_LAYER screen (~line 2034)

**Problem**: The "40 years of progress" card shows:
```
LOWER: Education 3% → 22%
COMMON: Education 10% → 28%
MIDDLE: Education 20% → 32%
```

These use the prefix-only labels rather than full display names ("LOWER DEAFLINGS", "COMMON BUZZERS", "MIDDLE OSCILLANTS").

**Impact**: LOW — The playground is exploratory. PLAN.md Task 9 `ProgressCard` component is directed to show class progress, and the naming convention established in Task 2-4 ensures the implementing agent will use `SocialClass.displayName`. The spec intent is clear.

**Recommended fix for playground fidelity only** — not a PLAN.md gap.

---

### FINDING 4 — `POLICY_REMOVAL` Back-Navigation Semantics Undefined (LOW, carry-forward)

**Location**: PLAN.md Task 9 (POLICY_REMOVAL three-branch decision), PLAN.md Task 10

**Problem**: The "ADJUST PERCENTAGES" path leaves the user on POLICY_REMOVAL while the Settings Drawer is open. After closing the drawer, the user must click "REMOVE ALL RESERVATIONS" or "CONTINUE WITH CURRENT POLICY" to proceed. However, there is no specified behavior for what happens if the user navigates backwards (using `goBack()`) from POLICY_REMOVAL.

The undo stack at year 80 would pop to year 60 (POLICY_EWS state). Whether POLICY_REMOVAL re-renders after goBack() or whether the phase resets to POLICY_EWS is unspecified.

**Impact**: LOW — Round 9 noted this as a carry-forward non-blocker. The simulation can complete without back-navigation from POLICY_REMOVAL. A sensible default (goBack() on POLICY_REMOVAL pops to POLICY_EWS phase) is straightforward to implement. No confusion will arise during the primary user journey.

---

### FINDING 5 — `incomePerCapita` Initial Values Not in Simulation Constants (LOW)

**Location**: PLAN.md Task 5 constants, PLAN.md Task 2 `ClassMetrics`

**Problem**: Task 5 defines `BASE_INCOME_BY_CLASS = [40000, 25000, 12000, 6000, 500]` (initial ₢/month per class, ordered upper→lower). Task 2 defines `incomePerCapita` as a field in `ClassMetrics`. However, the POLICY_EWS screen (UI-SPEC.md § 3.8) shows Year 60 income values:

```
UPPER class:  ₢ 45,000/month
NOBLE class:  ₢ 28,000/month
MIDDLE class: ₢ 12,000/month
COMMON class: ₢  6,500/month
LOWER class:  ₢  3,200/month
```

These are plausible 60-year-grown values from the base incomes, but the growth rate constants (`INCOME_GROWTH_FROM_EDUCATION = 0.02`, `INCOME_GROWTH_FROM_EMPLOYMENT = 0.03`) are defined in Task 5. The implementing agent should verify that `calculateIncome()` produces approximately these Year 60 values to ensure the EWS screen's narrative ("14x gap still exists") remains accurate. The CALIBRATED-MODEL.md is referenced but income validation targets are not listed in Task 5's test section.

**Impact**: LOW — The simulation engine tests (Task 5) focus on education/poverty/life expectancy targets from CALIBRATED-MODEL.md § 4. Income targets are absent from the test suite. An implementer who doesn't manually verify income ranges could produce a Year 60 income comparison that contradicts the UI-SPEC example values (which are used to make the satirical point about persistent inequality).

**Recommended fix**: Add one test to Task 5: "Year 60 income ratio (Upper/Lower) exceeds 10x with default policy." This ensures the EWS screen's narrative claim remains true.

---

### FINDING 6 — `hydrateFromURL` Re-Simulation Strategy Not Fully Specified (LOW)

**Location**: PLAN.md Task 6, URL state sync section

**Problem**: The URL schema stores `seed`, `year`, and the full `ReservationPolicy` blob. On hydration, the plan says "re-run simulation to target year." However, if the year is 60 (POLICY_EWS phase), the simulation must reconstruct the 60-year history by running the engine from year 0 to 60 using the stored policy. The policy blob only captures the state at the time of sharing — it does not capture per-phase policy changes (e.g., the user set Lower to 27% at year 0, then added Middle at 10% at year 20).

The base64 blob encodes the final `ReservationPolicy` object, but not the policy timeline. Re-running from year 0 to year 60 with the final policy applied uniformly will produce different intermediate results than the original run (where policies were added progressively).

**Impact**: LOW for MVP — The primary value of URL sharing is showing the final outcome state, not exact historical reproduction. A user sharing a Year 60 URL wants to show "this is what the simulation looks like at Year 60 with these policies." Exact intermediate history fidelity is a Phase 2 concern. However, the plan should acknowledge this limitation explicitly.

**Recommended note**: Add to Task 6 URL sync: "URL reconstruction applies the stored policy uniformly from Year 0. Progressive policy additions are not preserved in URL share. Intermediate metric values may differ from the original session."

---

### Mobile / Responsive Gaps

No new gaps found. Task 14 covers 320px minimum, touch targets, chart tabs, and swipe gestures. UI-PLAYGROUND.html demonstrates correct responsive behavior: `.mobile .policy-content` collapses to single column, `.mobile .metrics-grid` collapses to 2-column, `.mobile .tier-bar` caps at 40px. The responsive strategy is adequately specified.

---

## Final Assessment

### Summary of Findings

| Finding | Severity | Blocking? |
|---------|----------|-----------|
| SETTINGS annotation "full page" vs. overlay contradiction | LOW | No |
| Pyramid legend suffix-only in playground | LOW | No |
| Progress card generic labels in playground | LOW | No |
| POLICY_REMOVAL back-navigation semantics undefined | LOW | No (carry-forward) |
| Income validation targets absent from Task 5 test suite | LOW | No |
| `hydrateFromURL` policy timeline limitation undocumented | LOW | No |

**CRITICAL findings**: 0
**HIGH findings**: 0
**MEDIUM findings**: 0
**LOW findings**: 6 (of which 1 is a carry-forward from Round 9)

### Plan Quality Assessment

After 10 rounds of adversarial review, this plan is in production-quality shape:

- The type system is complete, internally consistent, and covers all UI requirements (Creamy Layer, EWS, income, class naming).
- The 12-phase state machine matches between PLAN.md and UI-SPEC.md exactly.
- The 5 policy screens have clear acceptance criteria, component assignments, and store action mappings.
- All 7 chart types are assigned to Task 11 and verified present in the playground.
- The math model references CALIBRATED-MODEL.md with explicit constants and validation targets.
- Rollback is defined for all 18 tasks.
- Dependency graph is complete with parallelization opportunities identified.

The six LOW findings identified above are appropriate for the implementing agent to handle inline during Task execution — none require changes to the plan before implementation begins. The most actionable fix is FINDING 1 (the "full page" annotation), which takes 10 seconds to correct and prevents a possible misread.

### Recommended Pre-Implementation Fix

Before handing to the implementing agent, update one line in PLAN.md Task 10, the phase router comment:

```
# Current (misleading)
SETTINGS → SettingsScreen (full page)

# Corrected
SETTINGS → SettingsDrawer (overlay, slide-out)
```

This is the only change warranted. Everything else can be resolved at implementation time with the surrounding context.

### Implementation Readiness

The plan is ready for implementation. Start with Wave 1 (Task 1: scaffolding).

---

*Review by: claude-sonnet-4-5-20250929 (adversarial reviewer, round-010)*
*Date: 2026-02-20*
