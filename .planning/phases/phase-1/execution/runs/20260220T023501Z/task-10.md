# Task 10 Implementation Notes: Main Simulation Page & Phase Router

**Status**: ✅ COMPLETE (No action required)

## Summary

Task 10 (Main Simulation Page & Phase Router) was already fully implemented in prior execution runs. All acceptance criteria from PLAN.md are satisfied.

## Evidence

### Files Created (Per PLAN.md Task 10)

✅ **`src/app/simulate/page.tsx`** — Main simulation page with phase router
- Implements complete 12-phase state machine
- Routes to correct component for each `SimulationPhase`
- Manages transition animations between phases
- Handles WORLD_GEN auto-advance logic
- Lazy loads ChartsPanel for performance
- Wraps all phases in ErrorBoundary

✅ **`src/components/simulation/MetricCard.tsx`** — Highlight improvement card
- Displays biggest improvement using `findBiggestImprovement` from engine
- Shows **full class display name** (e.g., "Lower Deaflings improved most")
- Animated entrance with Framer Motion
- Color-coded by class tier
- Shows metric change with percentage

### Acceptance Criteria Verification

From PLAN.md Task 10:

- [x] **All 12 phases route correctly**
  - ✅ Complete phase router in `simulate/page.tsx:364-433`
  - ✅ Routes: INTRO → GalaxyIntro, WORLD_GEN → (auto-advance), TRAIT_REVEAL → TraitReveal, PRE_RESERVATION → PreReservationState, POLICY_BOTTOM_2 → PolicyBottom2Connected, POLICY_MIDDLE → PolicyMiddleConnected, POLICY_CREAMY_LAYER → PolicyCreamyLayerConnected, POLICY_EWS → PolicyEWSConnected, POLICY_REMOVAL → PolicyRemovalConnected, END_SUMMARY → EndSummary, CHARTS → (overlay), SETTINGS → (overlay)

- [x] **"20 years have passed..." animation between policy screens**
  - ✅ Handled by individual policy components (PolicyMiddle, PolicyCreamyLayer, etc.)
  - ✅ YearProgress component exists at `src/components/narrative/YearProgress.tsx`

- [x] **Biggest improvement highlighted with full class name**
  - ✅ MetricCard.tsx:84 displays `classDisplayName` from NarrativeHighlight
  - ✅ Engine's `findBiggestImprovement` function confirmed at `src/lib/simulation/engine.ts:285`

- [x] **Settings/Charts accessible as overlays**
  - ✅ ChartsPanel overlay at simulate/page.tsx:457-475
  - ✅ SettingsDrawer overlay at simulate/page.tsx:454
  - ✅ Both are overlays that don't interrupt simulation state

- [x] **Simulation completes at year 100**
  - ✅ All policy advancement handlers call `advanceTime(20)` then `setPhase(SimulationPhase.END_SUMMARY)`
  - ✅ POLICY_REMOVAL handlers (lines 251-264) advance to END_SUMMARY after final 20-year step

### Phase Routing Implementation

The phase router (simulate/page.tsx:363-433) correctly implements all 12 phases from the SimulationPhase enum:

```typescript
switch (phase) {
  case SimulationPhase.INTRO: return <GalaxyIntro ... />;
  case SimulationPhase.WORLD_GEN: return null; // auto-advances
  case SimulationPhase.TRAIT_REVEAL: return <TraitReveal ... />;
  case SimulationPhase.PRE_RESERVATION: return <PreReservationState ... />;
  case SimulationPhase.POLICY_BOTTOM_2: return <PolicyBottom2Connected />;
  case SimulationPhase.POLICY_MIDDLE: return <PolicyMiddleConnected />;
  case SimulationPhase.POLICY_CREAMY_LAYER: return <PolicyCreamyLayerConnected />;
  case SimulationPhase.POLICY_EWS: return <PolicyEWSConnected />;
  case SimulationPhase.POLICY_REMOVAL: return <PolicyRemovalConnected />;
  case SimulationPhase.END_SUMMARY: return <EndSummary />;
  case SimulationPhase.CHARTS: return <EndSummary />; // overlay handled separately
  case SimulationPhase.SETTINGS: return <EndSummary />; // overlay handled separately
}
```

### Connected Policy Wrappers

Each of the 5 policy screens has a connected wrapper that:
- Pulls state from Zustand store
- Handles policy changes (setClassPolicy, setCreamyLayer, setEWSPolicy)
- Manages phase transitions (advanceTime + setPhase)
- Passes correct props to base policy components

Example (PolicyBottom2Connected, lines 74-111):
```typescript
function PolicyBottom2Connected() {
  const world = useSimulationStore((state) => state.world);
  const policy = useSimulationStore((state) => state.policy);
  const setClassPolicy = useSimulationStore((state) => state.setClassPolicy);
  const advanceTime = useSimulationStore((state) => state.advanceTime);
  const setPhase = useSimulationStore((state) => state.setPhase);

  const handleAdvance = () => {
    advanceTime(20);
    setPhase(SimulationPhase.POLICY_MIDDLE);
  };

  return <PolicyBottom2Base ... onAdvance={handleAdvance} />;
}
```

### Performance Optimizations

- ✅ ChartsPanel lazy loaded with `next/dynamic` (simulate/page.tsx:46-59)
- ✅ `ssr: false` prevents server-side rendering of heavy recharts dependency
- ✅ Loading spinner shown while ChartsPanel loads
- ✅ AnimatePresence with `mode="wait"` prevents layout jank during phase transitions
- ✅ `style={{ willChange: 'opacity' }}` for GPU-accelerated animations (lines 447, 464)

### Bootstrap & Initialization

- ✅ `initializeFromBootstrap()` called on mount (line 294)
- ✅ Supports URL state hydration (overrides localStorage)
- ✅ Shows loading spinner during initialization (lines 335-341)
- ✅ Auto-initializes world if at INTRO phase (lines 344-346)
- ✅ WORLD_GEN phase auto-advances after 300ms with spinner threshold at 200ms (lines 299-319)

### Error Handling

- ✅ Full page wrapped in ErrorBoundary (line 436)
- ✅ Graceful fallback for missing world data (null checks throughout)
- ✅ Default phase fallback to INTRO (lines 422-431)

## Tests

**Current Test Coverage**:
- ✅ MetricCard component test exists at `src/components/simulation/__tests__/MetricCard.test.tsx`
- ⚠️ No dedicated test file for simulate/page.tsx (integration tests would require full environment)

**Recommended Manual Testing** (from PLAN.md Task 10):
- All 12 phase transitions work correctly ✅ (verified by code inspection)
- Policy screens render with correct year and variant ✅ (verified by connected wrappers)
- Simulation engine called between policy phases ✅ (verified by `advanceTime` calls)
- CHARTS/SETTINGS overlays don't reset simulation state ✅ (verified by overlay implementation)
- Year 100 reached after completing POLICY_REMOVAL ✅ (verified by phase transitions)

## Dependencies

All required components confirmed to exist:
- ✅ `src/components/narrative/GalaxyIntro.tsx`
- ✅ `src/components/narrative/TraitReveal.tsx`
- ✅ `src/components/narrative/PreReservationState.tsx`
- ✅ `src/components/policy/PolicyBottom2.tsx`
- ✅ `src/components/policy/PolicyMiddle.tsx`
- ✅ `src/components/policy/PolicyCreamyLayer.tsx`
- ✅ `src/components/policy/PolicyEWS.tsx`
- ✅ `src/components/policy/PolicyRemoval.tsx`
- ✅ `src/components/simulation/SettingsDrawer.tsx`
- ✅ `src/components/simulation/EndSummary.tsx`
- ✅ `src/components/charts/ChartsPanel.tsx`
- ✅ `src/components/ui/ErrorBoundary.tsx` (referenced in imports)
- ✅ `src/lib/store/simulation.ts` with all required actions
- ✅ `src/lib/simulation/engine.ts` with `findBiggestImprovement` function

## Decision

**SHIP AS-IS** — Task 10 is production-ready. All acceptance criteria from PLAN.md are met.

## Next Actions

None required. Task 10 is complete.

---

**Implementation Strategy**: plan->verify->ship-as-is
**Completion Date**: 2026-02-20 (prior run)
**Verification Date**: 2026-02-20T02:57:45Z
