# Codex Review (round-008) — Adversarial Review

## Verdict
APPROVED_WITH_NOTES

All six Gemini Round 7 findings are properly resolved. No new CRITICAL or HIGH blocking defects exist. Three MEDIUM issues and three LOW issues are documented below. None are blockers if the implementing agent reads PLAN.md and UI-SPEC.md as co-equal references, but two of the MEDIUM issues will cause implementation guesswork at Task 6 and Task 11.

---

## Gemini Round 7 Closure Verification

| Finding | Status | Notes |
|---------|--------|-------|
| POLICY_REMOVAL 3-branch semantics defined | ✓ Resolved | Task 9 now has a complete three-branch decision table with store actions and phase transitions for all three buttons. Task 6 adds `clearAllReservations()` and `openSettingsDrawer()`. |
| HowItWorksOverlay assigned to a task | ✓ Resolved | `src/components/ui/HowItWorksOverlay.tsx` added to Task 8 file list with full implementation details (metric explanations, simplified formulas, whitepaper button). |
| Income metric added to ClassMetrics and engine | ✓ Resolved | `incomePerCapita: number` added to `ClassMetrics` in Task 2. `calculateIncome()` and two income constants added to Task 5. Task 11 acceptance criteria references `ClassMetrics.incomePerCapita`. |
| Task 1 typography fixed (Orbitron + Rajdhani) | ✓ Resolved | Task 1 action 7 now reads "Orbitron + Rajdhani fonts (use `next/font/google`)". The Inter reference is gone. |
| Task 11 has all 7 chart types | ✓ Resolved in PLAN.md | PLAN.md Task 11 now lists all 7 components including `WealthPieChart`, `IncomeDistributionChart`, and `PopulationChart`. Note: the playground chart tabs still show only 6 (Population tab absent) — see Finding 1 below. |
| END_SUMMARY uses unique class names | ✓ Resolved | UI-PLAYGROUND.html lines 2308–2310 now read "Lower Deaflings" and "Upper Harmonics" in the key insight body text. The MOST IMPROVED badge (line 2317) also shows "LOWER DEAFLINGS". Both instances are correct. |

---

## New Findings

| # | Finding | Severity | Affected Task/File | Recommendation |
|---|---------|----------|-------------------|----------------|
| 1 | `PopulationChart` tab missing from playground | LOW | UI-PLAYGROUND.html lines 2360–2366 | See detail below |
| 2 | `setReservationPolicy` signature cannot represent Creamy Layer or EWS state | MEDIUM | PLAN.md Task 6, Task 2 (`ReservationPolicy` type) | See detail below |
| 3 | URL encode schema does not account for multi-class, multi-policy state | MEDIUM | PLAN.md Task 6 `urlSync.ts` | See detail below |
| 4 | `WhitepaperLink` component unassigned to any task | LOW | UI-SPEC.md § 7.1, PLAN.md all tasks | Assign to Task 8 or Task 13; add to component file list |
| 5 | `ExplanationBox` component unassigned to any task | LOW | UI-SPEC.md § 7.1, PLAN.md Task 9 | Add as a created file in Task 9 (used on every policy screen) |
| 6 | Component name mismatches persist from Round 7 (unaddressed carry-forward) | MEDIUM | PLAN.md Task 9 vs UI-SPEC.md § 7.1 | See detail below |

---

## Finding 1 Detail: PopulationChart Tab Missing from Playground

PLAN.md Task 11 correctly lists 7 chart types. UI-SPEC.md § 7.2 specifies 7 chart types. However, the playground's chart tabs (lines 2360–2366) show only 6:

```
Education | Employment | Wealth | Poverty | Life Exp. | Income Dist.
```

The `Population` stacked area chart is absent from both the desktop tab list and the mobile dropdown (lines 2371–2378). The playground is the visual reference for the implementing agent. An implementer building the `ChartsPanel` from the playground will create 6 tabs and miss the Population chart.

**Severity**: LOW — PLAN.md is authoritative and correct. The playground is a rendering aid, not the spec. However, since this was exactly the type of visual drift that caused the Round 7 finding (3 charts missing from Task 11), it warrants flagging before implementation starts.

**Recommendation**: Add "Population" as a seventh tab in `UI-PLAYGROUND.html` lines 2360–2366 and in the mobile dropdown. One-line fix.

---

## Finding 2 Detail: `setReservationPolicy` Signature Insufficient for Multi-Policy State

Task 6 defines the store action:

```
setReservationPolicy(enabled, percentage, targetClasses)
```

This flat signature handles the Phase 1 (POLICY_BOTTOM_2) single-percentage model. However, three later policy screens require substantially different state:

**POLICY_CREAMY_LAYER** (Task 9, Year 40) requires storing:
- Whether creamy layer is enabled per class (boolean per class)
- Income threshold value per class (e.g., ₢5,000/month)
- Which classes have creamy layer applied (checkboxes: Lower, Common, Middle)

**POLICY_EWS** (Task 9, Year 60) requires storing:
- EWS income threshold per upper class (e.g., ₢8,000/month)
- EWS reservation percentage per upper class (separate from main reservation %)

**Settings Drawer** (UI-SPEC.md § 4.2) shows per-class sliders including EWS threshold fields for Noble and Upper classes simultaneously.

The `ReservationPolicy` type is listed in Task 2's type inventory (`SimulationState, WorldConfig, ..., ReservationPolicy, ...`) but its structure is never defined in PLAN.md. The engine's `stepSimulation` function accepts policy parameters, but the type is unspecified.

**Impact**: The implementer must invent the `ReservationPolicy` type shape and extend `setReservationPolicy` (or add new actions) without any plan guidance. If they model it incorrectly, the Creamy Layer and EWS mechanics will be wrong, and the URL encode/decode in Task 6 will not capture enough state for a valid deep link.

**Recommendation**: Define the `ReservationPolicy` interface in Task 2's key type definitions section:

```typescript
interface ReservationPolicy {
  classes: Record<ClassTier, ClassPolicy>;
}

interface ClassPolicy {
  reservationPercent: number;           // 0–50
  creamyLayerEnabled: boolean;
  creamyLayerThreshold: number;         // ₢/month
  ewsEnabled: boolean;                  // Only for upper/noble
  ewsThreshold: number;                 // ₢/month, only if ewsEnabled
  ewsPercent: number;                   // 0–50, only if ewsEnabled
}
```

And update `setReservationPolicy` in Task 6 to accept a typed `ClassPolicy` update for a specific class tier, or split into targeted actions (`setCreamyLayer`, `setEWSPolicy`).

---

## Finding 3 Detail: URL Encode Schema Doesn't Cover Multi-Policy State

Task 6 defines the URL schema as:

```
?seed=abc&policy=27&targets=4,5&year=60
```

This was designed for the old single-percentage model (one `policy` value, one `targets` list). With the current 5-phase system, the simulation state at any year includes:
- Per-class reservation percentages (up to 5 values)
- Per-class creamy layer enabled + threshold (up to 3 × 2 values)
- Per-class EWS enabled + threshold + percent (up to 2 × 3 values)

The current URL schema (`?policy=27&targets=4,5`) cannot encode this. The `hydrateFromURL()` function would reconstruct the wrong simulation state for a URL shared after Year 40+ decisions.

**Severity**: MEDIUM — Shared URLs are a PRD FR-5 requirement. A broken encode/decode breaks the share feature silently (state reconstructed but wrong policy applied).

**Recommendation**: Either:
1. Define a JSON-encoded policy blob, base64'd: `?seed=abc&year=60&state=<base64>` (simple, complete), or
2. Define a structured multi-param schema that accounts for all policy fields: `?seed=abc&year=60&r3=27&r4=15&r5=10&cl3=1&clt=5000&...` (verbose but readable).

The choice is implementation detail, but the schema needs to be specified in Task 6 before implementation begins.

---

## Finding 4 Detail: `WhitepaperLink` Component Unassigned

UI-SPEC.md § 7.1 lists `WhitepaperLink` as a component. The playground shows "READ WHITEPAPER" buttons in the END_SUMMARY screen (line 2342) and "VIEW WHITEPAPER" in the HowItWorksOverlay. PLAN.md Task 8 mentions a `"View Whitepaper"` button in the HowItWorksOverlay description, but no task creates a `WhitepaperLink` component. No task defines the whitepaper URL, whether it is an internal route or an external link, or whether it exists at Phase 1.

**Severity**: LOW — The button can be implemented inline without a dedicated component. However, it appears in two separate locations (overlay + end summary), making a shared component reasonable.

**Recommendation**: Add `WhitepaperLink.tsx` to the Task 13 (End Summary) or Task 8 (HowItWorksOverlay) component list. Clarify the whitepaper target (placeholder link for Phase 1 is acceptable).

---

## Finding 5 Detail: `ExplanationBox` Component Unassigned

UI-SPEC.md § 7.1 lists `ExplanationBox` as a component. Every policy screen has multiple `ⓘ` explanation boxes (WHAT IS RESERVATION, WHAT IS CREAMY LAYER, WHAT IS EWS, THE GAP REMAINS). Task 9 does not list `ExplanationBox.tsx` as a created file, implying these will be implemented inline per screen.

This is a DRY violation risk: the same styled card pattern appears 8+ times across 5 policy screens. Inline implementations are likely to diverge in style.

**Severity**: LOW — This will work, but creates maintenance risk. The component is simple enough that an implementer will likely extract it anyway.

**Recommendation**: Add `src/components/ui/ExplanationBox.tsx` to Task 9's file list.

---

## Finding 6 Detail: Component Name Mismatches Persist (Unaddressed Round 7 Carry-Forward)

Round 7 (Finding 2) flagged that UI-SPEC.md § 7.1 uses component names that differ from PLAN.md's component names, and recommended: "pick one canonical name per component and use it everywhere." This was not addressed in the Round 7 resolution.

Current state:

| UI-SPEC.md § 7.1 Name | PLAN.md Name | Status |
|----------------------|--------------|--------|
| `ClassReservationControl` | `ReservationSlider` | Unresolved |
| `ProgressSummary` | `ProgressCard` | Unresolved |
| `IncomeThresholdSlider` | Mentioned inline in Task 9 ("threshold slider"), no dedicated component | Unresolved |
| `ComparisonTable` | Mentioned inline in Task 9 ("Year 0 vs Year 80 comparison"), no dedicated component | Unresolved |

**Severity**: MEDIUM — An implementing agent working from both documents simultaneously will create duplicate components or will not find the expected component by its UI-SPEC name. The divergence affects at minimum Tasks 9 and 11.

**Recommendation**: Reconcile before implementation. The PLAN.md names are acceptable as the canonical names; update UI-SPEC.md § 7.1 to match. Or add a mapping table in PLAN.md Task 9 that cross-references UI-SPEC names to implementation names.

---

## Completeness Assessment

### UI-SPEC.md Components vs PLAN.md Task Assignment

| UI-SPEC Deliverable | PLAN.md Task | Status |
|--------------------|-------------|--------|
| POLICY_BOTTOM_2 screen (§ 3.5) | Task 9 | COVERED |
| POLICY_MIDDLE screen (§ 3.6) | Task 9 | COVERED |
| POLICY_CREAMY_LAYER screen (§ 3.7) | Task 9 | COVERED |
| POLICY_EWS screen (§ 3.8) | Task 9 | COVERED |
| POLICY_REMOVAL screen (§ 3.9) | Task 9 | COVERED |
| END_SUMMARY (§ 3.10) | Task 13 | COVERED |
| Settings Drawer (§ 4) | Task 12 | COVERED |
| HowItWorksOverlay (§ 6) | Task 8 | COVERED (resolved R7) |
| EducationChart (§ 7.2) | Task 11 | COVERED |
| EmploymentChart (§ 7.2) | Task 11 | COVERED |
| PovertyChart (§ 7.2) | Task 11 | COVERED |
| WealthPieChart (§ 7.2) | Task 11 | COVERED |
| IncomeDistributionChart (§ 7.2) | Task 11 | COVERED |
| LifeExpectancyChart (§ 7.2) | Task 11 | COVERED |
| PopulationChart (§ 7.2) | Task 11 (plan only; absent from playground) | COVERED in spec, gap in playground |
| ClassReservationControl (§ 7.1) | Task 9 as `ReservationSlider` | NAME MISMATCH |
| ProgressSummary (§ 7.1) | Task 9 as `ProgressCard` | NAME MISMATCH |
| ExplanationBox (§ 7.1) | No dedicated file in any task | GAP |
| IncomeThresholdSlider (§ 7.1) | Inline in Task 9 (`PolicyToggle`) | NO DEDICATED COMPONENT |
| ComparisonTable (§ 7.1) | Inline in Task 9 | NO DEDICATED COMPONENT |
| WhitepaperLink (§ 7.1) | No task | GAP |
| Typography: Orbitron + Rajdhani (§ 1.4) | Task 1 | COVERED (resolved R7) |
| Currency symbol ₢ (§ 1.5) | No task mentions implementation | NOT SPECIFIED |
| `ReservationPolicy` type structure (Task 2 type list) | Unspecified shape | GAP |

### Chart Types: UI-SPEC.md § 7.2 vs Task 11

All 7 chart types from UI-SPEC.md § 7.2 are present in PLAN.md Task 11. Confirmed match.

### Store Actions vs UI Screen Requirements

| Screen Requirement | Store Action | Status |
|-------------------|-------------|--------|
| POLICY_REMOVAL: Remove all reservations | `clearAllReservations()` | COVERED |
| POLICY_REMOVAL: Open settings for adjustment | `openSettingsDrawer()` | COVERED |
| POLICY_REMOVAL: Continue with current policy | `advanceTime(20)` | COVERED |
| POLICY_CREAMY_LAYER: Set creamy layer threshold | Not specified | MISSING |
| POLICY_EWS: Set EWS threshold + percentage | Not specified | MISSING |
| Settings Drawer: Per-class EWS threshold | Not specified | MISSING |
| Any screen: Phase transition | `setPhase(phase)` | COVERED |

---

## Carry-Forward Issues (not new, from prior rounds)

These remain unaddressed but are not blocking for Phase 1 implementation:

1. **Seed determinism with trait reordering**: If traits.json gains 100 more traits in Phase 2 and insertion changes array indices, existing shared URLs will decode to wrong worlds. Mitigation (sort-by-id before index selection) still not defined.

2. **POLICY_REMOVAL back navigation**: If a user navigates back from END_SUMMARY to POLICY_REMOVAL (year 100 → year 80), the three-branch buttons have undefined semantics. The plan does not address back-navigation edge cases on policy screens.

3. **Long tooltip overflow on mobile**: No defined character budget for `findBiggestImprovement` narrative strings containing display names. Still an open risk at mobile widths.

---

## Final Notes

**The six Gemini Round 7 closures are all legitimate and properly implemented.** The plan is substantially more complete than Round 7. The most important new finding is Finding 2 (the `ReservationPolicy` type shape is undefined), because it is a prerequisite for Task 5 (engine formulas use policy state), Task 6 (store encodes/decodes policy), and Task 6's URL sync. Without a defined type shape, implementations of these three tasks will diverge.

**Finding 3 (URL schema)** is the second-priority fix — it directly affects FR-5 compliance and the share feature.

**Finding 6 (name mismatches)** is the third priority — naming inconsistency between spec documents causes implementers to create duplicate components or miss expected files.

**Findings 1, 4, and 5** are polish-level issues. They do not block the implementation but will cause small inconsistencies if not addressed before coding starts.

**Overall assessment**: The plan is structurally sound. The 5-phase policy journey, 12-phase state machine, class naming convention, and simulation math model are all consistently specified. The gaps above are bounded and addressable. Recommend defining the `ReservationPolicy` type shape and updating the URL schema before marking the plan as implementation-ready.
