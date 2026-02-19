# Codex Review (round-009) — Verification Review

## Verdict
APPROVED_WITH_NOTES

All six Round 8 findings have been addressed. Four are fully resolved, one is substantially resolved with a minor residual, and one has a stale acceptance-criteria line that does not match the updated URL schema. No new CRITICAL or HIGH issues exist. Two LOW items documented below do not block implementation but should be cleaned up before the implementing agent begins Task 6.

---

## Round 8 Closure Verification

| Finding | Status | Notes |
|---------|--------|-------|
| PopulationChart tab added to playground | ✓ Resolved | "Population" tab present at line 2367 (desktop `chart-tab` list) and line 2379 (mobile `<select>` dropdown). Confirmed 7 tabs total. |
| `ReservationPolicy` type structure defined in Task 2 | ✓ Resolved | `ReservationPolicy` and `ClassPolicy` interfaces fully defined in Task 2's "Key Type Definitions" block with all Creamy Layer (`creamyLayerEnabled`, `creamyLayerThreshold`) and EWS fields (`ewsEnabled`, `ewsThreshold`, `ewsPercent`). |
| URL encode schema updated for multi-policy state in Task 6 | ✓ Resolved (with residual — see Finding A) | Task 6 now specifies `?seed=abc&year=60&state=<base64-encoded-JSON>` with a complete `ReservationPolicy` JSON blob example. Bootstrap precedence order (URL > localStorage > fresh seed) is also defined. |
| `WhitepaperLink` component assigned to Task 13 | ✓ Resolved | `src/components/ui/WhitepaperLink.tsx` added to Task 13 file list. Implementation details specified: links to `/whitepaper` route (Phase 1 placeholder), reused in `HowItWorksOverlay`. |
| `ExplanationBox` component assigned to Task 9 | ✓ Resolved | `src/components/ui/ExplanationBox.tsx` added to Task 9 file list with description "Reusable info box with ⓘ icon for policy explanations". |
| Component names reconciled between UI-SPEC and PLAN | ✓ Resolved | UI-SPEC.md § 7.1 component table updated: old names `ClassReservationControl`, `ProgressSummary`, `IncomeThresholdSlider` replaced with PLAN.md canonical names `ReservationSlider`, `ProgressCard`, `PolicyToggle`. `ComparisonTable` and `WhitepaperLink` now appear with task references. |

---

## New Findings

### Finding A — `setReservationPolicy` Signature Still Mismatches `ClassPolicy` Type
**Severity**: LOW

**Location**: PLAN.md Task 6, Actions list, item 3

**Problem**: The store action list still reads:

```
setReservationPolicy(enabled, percentage, targetClasses) — User choice
```

This flat three-parameter signature (`enabled: boolean`, `percentage: number`, `targetClasses: ClassTier[]`) is incompatible with the `ClassPolicy` interface now defined in Task 2. The `ClassPolicy` type holds eight fields per class (including `creamyLayerEnabled`, `creamyLayerThreshold`, `ewsEnabled`, `ewsThreshold`, `ewsPercent`). An implementer reading Task 6's action list will build a store action that cannot encode any of the Creamy Layer or EWS state the type system now requires.

Round 8's recommendation was explicit: "update `setReservationPolicy` to accept a typed `ClassPolicy` update for a specific class tier, or split into targeted actions." The `ReservationPolicy` type was added (Finding 2 resolution) but the action signature was not updated.

The test at line 416 (`setReservationPolicy` updates correctly) is also underspecified against the new type shape.

**Impact**: If the implementer reads Task 6 before Task 2 (which is possible — Task 6 is a later task in the dependency graph), they will build the wrong store API. The Creamy Layer policy screens (Task 9, POLICY_CREAMY_LAYER) and EWS screens (Task 9, POLICY_EWS) will then fail to compile or will silently drop policy state.

**Fix**: Update Task 6, Actions item 3 to:

```
setClassPolicy(tier: ClassTier, policy: ClassPolicy) — Set policy for a specific class tier
```

Or alternatively add targeted actions:

```
setCreamyLayer(tier: ClassTier, enabled: boolean, threshold: number)
setEWSPolicy(tier: ClassTier, enabled: boolean, threshold: number, ewsPercent: number)
```

Also update the test description to match the new signature.

---

### Finding B — Task 6 Acceptance Criteria Contains Stale URL Schema
**Severity**: LOW

**Location**: PLAN.md Task 6, Acceptance criteria, line 429

**Problem**: The acceptance criteria reads:

```
- [ ] URL shareable with `?seed=...&policy=...&targets=...&year=...`
```

This is the old single-parameter URL schema from before Round 8. The updated URL schema defined in Task 6 Actions is:

```
?seed=abc&year=60&state=<base64-encoded-JSON>
```

The acceptance criteria still requires `&policy=` and `&targets=` params that will not exist in the new base64 schema. An implementing agent running a checklist against the acceptance criteria will produce a URL with the old schema and incorrectly consider it passing.

**Impact**: LOW — The Actions section is the authoritative spec. The acceptance criteria is a checklist item. However, a discrepancy between the two creates confusion during implementation verification.

**Fix**: Update the acceptance criteria line to:

```
- [ ] URL shareable with `?seed=...&year=...&state=<base64-policy-blob>`
```

---

## Implementation Readiness Assessment

The plan is ready for implementation. All structural requirements are in place:

| Dimension | Status |
|-----------|--------|
| Type system | Complete — all interfaces defined, 12-phase enum matches UI-SPEC.md § 2.2 |
| Math model | Complete — Task 5 references CALIBRATED-MODEL.md with explicit coefficient constants |
| State management | Complete — Zustand store actions cover all 5 policy phases plus undo/redo/persist/URL sync |
| UI component coverage | Complete — all 7 chart types, 5 policy screens, and all overlay components assigned to tasks |
| Dependency graph | Complete — 18 tasks across 10 execution waves, parallelization opportunities identified |
| Rollback strategy | Complete — each task is independently reversible via git revert |
| Test coverage targets | Defined — 95%+ engine, 90%+ store, 80%+ components |

The two new findings (A and B) are LOW severity and do not block implementation of Tasks 1 through 5. They only become actionable when an implementer reaches Task 6. They can be fixed in under 10 minutes by updating two lines in PLAN.md.

---

## Final Notes

**This plan is implementation-ready.** The 5-phase policy journey, 12-phase state machine, class naming convention (`[Prefix] [UniqueClassName]`), calibrated math model, and component inventory are all consistently and completely specified between PLAN.md and UI-SPEC.md. The prior nine rounds of review have systematically closed every blocking gap.

**Recommended action before handing to implementing agent**: Fix Findings A and B in PLAN.md Task 6 (update `setReservationPolicy` signature, update acceptance criteria URL schema). This is a 10-minute fix that prevents a guaranteed implementation error in Task 6.

**Carry-forward non-blockers** (from prior rounds, still open, acceptable for Phase 1):
1. Seed determinism with trait array reordering (Phase 2 risk)
2. POLICY_REMOVAL back-navigation edge case semantics
3. Tooltip character budget for mobile display names

None of these affect MVP functionality or correctness.

**Overall assessment**: APPROVED_WITH_NOTES. The plan is in excellent shape. Address Findings A and B before implementation kickoff.
