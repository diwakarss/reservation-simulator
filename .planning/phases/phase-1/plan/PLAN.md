# Phase 1 Implementation Plan: Reservation Simulator MVP

## Phase Goal
Deliver a working, deployable story-driven reservation simulator that lets users experience how reservation policies affect socio-economic outcomes across 5 fictional social classes in a satirical sci-fi setting.

## Inputs Consumed
- `inputs/RESEARCH-BRIEF.md` — Scope, constraints, success criteria
- `inputs/RESEARCH.md` — Tech stack, data model, UX flow, math model
- `inputs/ARCHITECTURE.md` — System diagram, component breakdown, file structure
- `inputs/PRD.md` — User stories (US-1 through US-9), functional/non-functional requirements
- `inputs/RESEARCH-CHECK.md` — Verdict: PASS
- `../research/CALIBRATED-MODEL.md` — Corrected mathematical model with validation targets

## Tech Stack (Confirmed)
| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.4.x |
| Charts | Recharts | latest |
| Animation | Framer Motion | latest |
| State | Zustand | latest |
| Testing | Vitest + React Testing Library | latest |
| Deployment | Vercel | — |

---

## Task Plan

### Task 1: Project Scaffolding
**Goal**: Initialize Next.js project with all dependencies and base configuration.

**Note**: The project directory already exists with `.planning/` and `.git/`. We use a temp-scaffold approach to avoid `create-next-app` conflicts.

**Files created**:
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `tailwind.config.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/styles/globals.css`
- `vitest.config.ts`
- `.gitignore` (merged with existing)

**Actions**:
1. **Scaffold in temp directory** (avoids non-empty directory error):
   ```bash
   cd ~/claude-projects/projects
   npx create-next-app@latest reservation-simulator-temp --typescript --tailwind --app --src-dir --no-import-alias --skip-install --no-git
   ```
2. **Merge into existing project** (exclude transient directories):
   ```bash
   # Copy source files only, exclude node_modules/.git/.next
   rsync -av --exclude='node_modules' --exclude='.git' --exclude='.next' \
     reservation-simulator-temp/ reservation-simulator/
   # Clean up temp scaffold
   rm -rf reservation-simulator-temp
   ```
3. Install dependencies: `npm install zustand framer-motion recharts`
4. Install dev dependencies: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react`
5. Configure Vitest in `vitest.config.ts` with jsdom environment
6. Configure Tailwind 3.4 with dark sci-fi theme colors in `tailwind.config.ts`:
   - Deep purple: `#1a1a2e`
   - Cosmic blue: `#16213e`
   - Accent gold: `#e2b714`
   - Highlight red: `#e94560`
   - Muted text: `#a7a7c4`
7. Set up global CSS with dark cosmic background, Orbitron + Rajdhani fonts (use `next/font/google`)
8. Create base layout with metadata (title, description, OG tags)
9. Merge `.gitignore` to preserve any existing ignores

**Tests**: `npm run build` succeeds, `npm run dev` starts without errors.

**Rollback**: `git checkout -- .` to restore pre-scaffold state (preserves `.planning/`).

**Acceptance**:
- [ ] Next.js 15 app boots in dev mode
- [ ] Tailwind dark theme renders
- [ ] All dependencies install cleanly
- [ ] `.planning/` directory preserved
- [ ] `.git/` history preserved

---

### Task 2: Type Definitions & Data Model
**Goal**: Define all TypeScript interfaces and types matching the PRD data model.

**Files created**:
- `src/lib/simulation/types.ts`

**Types to define** (from PRD § Technical Specifications):
```
SimulationState, WorldConfig, AbsurdTrait, TraitCategory,
SocialClass, ClassMetrics, ReservationPolicy, YearSnapshot,
AggregateMetrics, SimulationPhase, NarrativeHighlight, ClassTier
```

**Actions**:
1. Create `src/lib/simulation/types.ts` with all interfaces from PRD
2. Add `SimulationPhase` enum matching UI-SPEC.md § 2.2:
   ```typescript
   enum SimulationPhase {
     INTRO,              // Galaxy intro sequence
     WORLD_GEN,          // Non-visual, <500ms, auto-advances
     TRAIT_REVEAL,       // Trait + class pyramid reveal
     PRE_RESERVATION,    // Show bottom class suffering
     POLICY_BOTTOM_2,    // Year 0: Bottom 2 classes
     POLICY_MIDDLE,      // Year 20: Middle class extension
     POLICY_CREAMY_LAYER,// Year 40: Creamy layer exclusion
     POLICY_EWS,         // Year 60: EWS reservation demand
     POLICY_REMOVAL,     // Year 80: Removal protests
     END_SUMMARY,        // Year 100: Final results
     CHARTS,             // Overlay (doesn't interrupt flow)
     SETTINGS            // Overlay (doesn't interrupt flow)
   }
   ```
   - **`WORLD_GEN` is a non-visual transition phase** (no rendered component)
   - Max duration: 500ms — generates world, then auto-advances to `TRAIT_REVEAL`
   - Shows loading spinner overlay if generation exceeds 200ms
   - **5 distinct policy phases** (POLICY_BOTTOM_2 through POLICY_REMOVAL) replace generic CHOICE/TIME_LOOP
3. Add `NarrativeHighlight` type for biggest-improvement logic
4. Add `ClassTier` type for tier prefixes and naming
5. Export all types

**Key Type Definitions**:
```typescript
// Class tier for naming (UI-SPEC.md § 1.3)
type ClassTier = 'upper' | 'noble' | 'middle' | 'common' | 'lower';

// Trait with unique class names per tier
interface AbsurdTrait {
  id: string;
  text: string;
  category: TraitCategory;
  classNames: Record<ClassTier, string>;  // 5 unique names
}

// Social class with display name
interface SocialClass {
  tier: ClassTier;
  displayName: string;  // "Upper Harmonics", "Lower Deaflings", etc.
  population: number;
  metrics: ClassMetrics;
}

// Class metrics including income (required for EWS/comparison screens)
interface ClassMetrics {
  education: number;      // % with access (0-100)
  employment: number;     // % with formal jobs (0-100)
  wealth: number;         // % of total economy (all classes sum to 100)
  poverty: number;        // % living below threshold (0-100)
  lifeExpectancy: number; // Average years (0-80)
  incomePerCapita: number; // Monthly income in credits (₢)
}

// Reservation policy state (supports Creamy Layer + EWS)
interface ReservationPolicy {
  classes: Record<ClassTier, ClassPolicy>;
}

interface ClassPolicy {
  reservationPercent: number;     // 0-50, main reservation percentage
  creamyLayerEnabled: boolean;    // Whether creamy layer exclusion applies
  creamyLayerThreshold: number;   // ₢/month income threshold for exclusion
  ewsEnabled: boolean;            // Only applicable for 'upper' and 'noble' tiers
  ewsThreshold: number;           // ₢/month income threshold for EWS eligibility
  ewsPercent: number;             // 0-50, EWS-specific reservation percentage
}
```

**Tests**: TypeScript compilation (`npx tsc --noEmit`) passes with no errors.

**Rollback**: Delete `types.ts`.

**Acceptance**:
- [ ] All PRD data model types are defined
- [ ] Types compile without errors
- [ ] Simulation phases cover the full user journey
- [ ] `AbsurdTrait.classNames` supports 5 unique names per trait
- [ ] `SocialClass.displayName` holds full formatted name

---

### Task 3: Pre-Generated Content Data
**Goal**: Create the static JSON data files for traits, class templates, and world names.

**Files created**:
- `src/data/traits.json` — 100 absurd traits (5 categories × 20 each)
- `src/data/classTemplates.json` — Name patterns for 5 tiers
- `src/data/worldNames.json` — Galaxy, planet, nation name pools (30+ each)

**Actions**:
1. Create trait categories: Celestial, Auditory, Culinary, Temporal, Arbitrary
2. Write 20 traits per category (100 total for MVP, Phase 2 adds 100 more)
3. Each trait has: `id`, `text`, `category`, `classNames` (5 UNIQUE names per trait)
4. Create world name pools (galaxy names, planet names, nation names)

**Class Naming Convention** (from UI-SPEC.md v2 § 1.3):
- **Format**: `[Prefix] [UniqueClassName]` (exactly 2 words)
- **Each class has a UNIQUE fictional name** (not the same base name for all tiers)
- **Prefixes**: Upper, Noble, Middle, Common, Lower
- **Example for Earlobes trait**:
  ```json
  {
    "id": "earlobe-frequency",
    "text": "Those whose earlobes vibrate at exactly 432Hz were chosen by the cosmos",
    "category": "Auditory",
    "classNames": {
      "upper": "Harmonics",
      "noble": "Vibrants",
      "middle": "Oscillants",
      "common": "Buzzers",
      "lower": "Deaflings"
    }
  }
  ```
- Upper classes get grandiose names; lower classes get diminutive names
- Full display name = Prefix + classNames[tier] (e.g., "Upper Harmonics")

**Content guidelines** (from RESEARCH-BRIEF § Constraints):
- Satirical but not offensive to marginalized communities
- Focus ridicule on arbitrary basis of hierarchy, not victims
- Absurd enough to be clearly fictional

**Tests**: JSON schema validation (manual or script), no duplicates, all traits have 5 unique class names, max 12 chars per suffix.

**Rollback**: Delete data files.

**Acceptance**:
- [ ] 100 traits across 5 categories
- [ ] Each trait has 5 UNIQUE class names (not same base name)
- [ ] 30+ names in each world name pool
- [ ] Tone is satirical without being offensive
- [ ] Class names reflect tier hierarchy (grandiose → diminutive)
- [ ] **Max 12 characters per class name suffix** (per UI-SPEC.md § 1.3)

---

### Task 4: Content Loader & World Generation
**Goal**: Implement functions to load pre-generated content and generate a random world.

**Files created**:
- `src/lib/content/traits.ts`
- `src/lib/content/classNames.ts`
- `src/lib/content/worldGenerator.ts`

**Actions**:
1. `traits.ts`: Load and pick random trait, filter by category
2. `classNames.ts`: Generate class display names from prefix + trait's unique class name
   - Takes trait object and tier (upper/noble/middle/common/lower)
   - Returns formatted name: `${PREFIX} ${trait.classNames[tier]}`
   - Example: `getClassName(traitData, 'lower')` → "Lower Deaflings"
3. `worldGenerator.ts`: Generate full world config (galaxy, planet, nation, trait, 5 classes with initial metrics)
4. Use seed-based RNG (from PRD FR-2: deterministic given same seed)
5. Initial metrics from CALIBRATED-MODEL.md § 1 (population, education, employment, wealth, poverty, life expectancy)

**Class Name Generation**:
```typescript
const CLASS_PREFIXES = {
  upper: 'Upper',
  noble: 'Noble',
  middle: 'Middle',
  common: 'Common',
  lower: 'Lower'
} as const;

function getClassName(trait: Trait, tier: keyof typeof CLASS_PREFIXES): string {
  return `${CLASS_PREFIXES[tier]} ${trait.classNames[tier]}`;
}
// Example: getClassName(earlobeTrait, 'upper') → "Upper Harmonics"
```

**Tests** (Vitest):
- `worldGenerator.test.ts`: Same seed produces same world
- `worldGenerator.test.ts`: All 5 classes have valid initial metrics
- `traits.test.ts`: Random trait selection returns valid trait
- `classNames.test.ts`: Generated names have correct prefix + unique suffix
- `classNames.test.ts`: Each class within a trait has unique suffix (no duplicates)

**Rollback**: Delete content lib files + tests.

**Acceptance**:
- [ ] Deterministic world generation with seed
- [ ] 5 classes generated with correct initial conditions from calibrated model
- [ ] Class names follow "Prefix + UniqueName" format
- [ ] All 5 class names within a trait are unique
- [ ] All tests pass

---

### Task 5: Simulation Engine (Core Math)
**Goal**: Implement the mathematical simulation engine from CALIBRATED-MODEL.md.

**Files created**:
- `src/lib/simulation/engine.ts` — Core `stepSimulation` function
- `src/lib/simulation/models.ts` — Individual metric calculation functions
- `src/lib/simulation/constants.ts` — All calibrated coefficients

**Actions**:
1. `constants.ts`: All coefficients from CALIBRATED-MODEL.md § 2:
   - `RESERVATION_EDUCATION_BOOST = 0.003`
   - `EDUCATION_TO_EMPLOYMENT_FACTOR = 0.6`
   - `RESERVATION_EMPLOYMENT_BOOST = 0.002`
   - `WEALTH_GROWTH_FROM_EDUCATION = 0.001`
   - `WEALTH_GROWTH_FROM_EMPLOYMENT = 0.002`
   - `WEALTH_REDISTRIBUTION_FACTOR = 0.0005`
   - `POVERTY_REDUCTION_EDUCATION = 0.008`
   - `POVERTY_REDUCTION_EMPLOYMENT = 0.012`
   - `POVERTY_REDUCTION_WEALTH = 0.003`
   - `LE_GAIN_PER_EDUCATION_POINT = 0.02`
   - `LE_GAIN_PER_POVERTY_REDUCTION = 0.03`
   - `LE_MAXIMUM = 80`
   - `FERTILITY_REDUCTION_PER_EDUCATION = 0.005`
   - `BASE_INCOME_BY_CLASS = [40000, 25000, 12000, 6000, 500]` (initial ₢/month)
   - `INCOME_GROWTH_FROM_EDUCATION = 0.02`
   - `INCOME_GROWTH_FROM_EMPLOYMENT = 0.03`
2. `models.ts`: Pure functions from CALIBRATED-MODEL.md § 3:
   - `calculateEducation(current, reservationPercent, yearsSincePolicy) → number`
   - `calculateEmployment(currentEmp, currentEdu, prevEdu, reservationPercent) → number`
   - `calculateWealth(classes, policyTargetClasses) → Class[]`
   - `calculatePoverty(current, eduGain, empGain, wealthGain) → number`
   - `calculateLifeExpectancy(current, eduGain, povertyReduction) → number`
   - `calculateIncome(baseIncome, eduGain, empGain) → number` — Required for EWS and comparison screens
3. `engine.ts`:
   - `stepSimulation(state, years) → SimulationState` — Main loop (1-year internal steps)
   - `captureSnapshot(state) → YearSnapshot`
   - `findBiggestImprovement(prev, current) → NarrativeHighlight`
   - Add ±5% random variance (seed-based RNG)
   - Normalize wealth shares to sum to 100% each year

**Tests** (Vitest — CRITICAL, these validate educational accuracy):
- `models.test.ts`: Education for Class 5 (3% → 10-12%) after 20 years with 27% reservation
- `models.test.ts`: Employment follows education with lag
- `models.test.ts`: Wealth shares always sum to 100%
- `models.test.ts`: Poverty never drops below 2% floor
- `models.test.ts`: Life expectancy never exceeds 80
- `engine.test.ts`: 50-year simulation matches validation targets (CALIBRATED-MODEL.md § 4):
  - Class 5 education: 3% → 25-30% (with reservation)
  - Class 5 poverty: 65% → 30-35% (with reservation)
  - Class 5 life expectancy: 62 → 68-70 (with reservation)
- `engine.test.ts`: Without reservation, Class 5 education only reaches 8% at year 50
- `engine.test.ts`: Same seed produces identical simulation results
- `engine.test.ts`: `findBiggestImprovement` returns correct metric

**Rollback**: Delete simulation lib files + tests. No state changes.

**Acceptance**:
- [ ] All 5 metric formulas match CALIBRATED-MODEL.md
- [ ] Validation targets from § 4 are met within ±10% tolerance
- [ ] Deterministic with seed
- [ ] All tests pass

---

### Task 6: Zustand State Store
**Goal**: Implement centralized state management for the simulation with URL sync and persistence.

**Files created**:
- `src/lib/store/simulation.ts`
- `src/lib/store/urlSync.ts` — URL state encode/decode/hydration

**Actions**:
1. Create Zustand store with `SimulationState` shape
2. **Add `persist` middleware** for localStorage backup (zustand/middleware):
   - Persist: `seed`, `policy`, `targetClasses`, `currentYear`, `history`
   - Restore on page reload to prevent data loss
3. Actions:
   - `initializeWorld(seed?: string)` — Generate world, set initial state
   - `setClassPolicy(tier: ClassTier, policy: Partial<ClassPolicy>)` — Update policy for a specific class tier
   - `setCreamyLayer(tier: ClassTier, enabled: boolean, threshold: number)` — Set creamy layer for a class
   - `setEWSPolicy(tier: ClassTier, enabled: boolean, threshold: number, ewsPercent: number)` — Set EWS for upper classes
   - `advanceTime(years: number)` — Run simulation step, push to history
   - `goBack()` — Undo last time jump (pop from history)
   - `goForward()` — Redo time jump (if available in redo stack)
   - `setPhase(phase: SimulationPhase)` — Navigate narrative flow
   - `reset()` — Full reset
   - `setTimeJumpSize(years: number)` — Settings control
   - `clearAllReservations()` — Set all reservation percentages to 0 (for POLICY_REMOVAL "Remove All" action)
   - `openSettingsDrawer()` — Open settings for "Adjust Percentages" action
4. **URL state sync** (FR-5 requirement):
   - `encodeStateToURL()` — Generate shareable URL with full policy state
   - `hydrateFromURL()` — Parse URL params on mount, re-run simulation to target year
   - Deep-link support: URL with year param reconstructs simulation state deterministically
   - **URL schema** (supports multi-policy state for Creamy Layer + EWS):
     ```
     ?seed=abc&year=60&state=<base64-encoded-JSON>
     ```
     The `state` param is a base64-encoded JSON blob of the full `ReservationPolicy` object:
     ```json
     {
       "classes": {
         "upper": {"reservationPercent":0,"creamyLayerEnabled":false,...,"ewsEnabled":true,"ewsPercent":10},
         "noble": {...},
         "middle": {...},
         "common": {...},
         "lower": {...}
       }
     }
     ```
     This ensures all Creamy Layer thresholds, EWS settings, and per-class percentages are captured.
   - **Bootstrap precedence order**: URL params > localStorage persisted state > fresh seed
     - If URL has params, ignore localStorage and hydrate from URL
     - If no URL params but localStorage has state, restore from localStorage
     - If neither, generate fresh world with random seed
5. Derive computed values:
   - Current snapshot
   - Narrative highlight (biggest improvement)
   - Progress percentage (currentYear / 100)
   - `canRedo` — Boolean for redo availability

**Tests** (Vitest):
- Store initializes with valid world
- `advanceTime` produces new history entry
- `goBack` restores previous state
- `goForward` restores redo state
- `reset` clears everything
- `setClassPolicy` updates store correctly for each tier
- `setCreamyLayer` and `setEWSPolicy` update policy state correctly
- URL encode/decode roundtrips correctly
- `hydrateFromURL` reconstructs state at target year
- Persist middleware saves to localStorage
- **Bootstrap precedence test**: URL params override localStorage

**Rollback**: Delete store file + tests.

**Acceptance**:
- [ ] All PRD FR-5 state management requirements met
- [ ] Undo for time jumps works (`goBack`)
- [ ] Redo for time jumps works (`goForward`)
- [ ] State is fully driven by Zustand
- [ ] URL shareable with `?seed=...&year=...&state=<base64-policy-blob>`
- [ ] State persists to localStorage (survives page refresh)

---

### Task 7: Landing Page (US-1)
**Goal**: Create the entry point with hero text and "Start Simulation" CTA.

**Files modified**:
- `src/app/page.tsx` — Landing page

**Files created**:
- `src/components/ui/Button.tsx` — Reusable button component
- `src/components/ui/CosmicBackground.tsx` — Animated star background

**Actions**:
1. Dark cosmic full-screen hero layout
2. Title: "Reservation Simulator" with subtle glow effect
3. Subtitle explaining the concept (< 10 seconds to read)
4. "Start Simulation" CTA button (prominent, gold/amber color)
5. Animated star/particle background (CSS or Framer Motion, lightweight)
6. Mobile responsive (stack vertically on small screens)

**Tests**: Manual visual check. Button navigates to `/simulate`.

**Rollback**: Revert `page.tsx` to default Next.js page.

**Acceptance** (from US-1):
- [ ] Landing page clearly explains concept in < 10 seconds
- [ ] "Start Simulation" button is prominent
- [ ] No login/signup required
- [ ] Mobile responsive

---

### Task 8: Narrative Flow Components (US-2, US-3, US-4)
**Goal**: Build the animated narrative sequence from intro to pre-reservation state.

**Files created**:
- `src/components/narrative/GalaxyIntro.tsx` — "In a galaxy far away..." sequence
- `src/components/narrative/TraitReveal.tsx` — Dramatic trait + class hierarchy reveal
- `src/components/narrative/PreReservationState.tsx` — Show inequality metrics
- `src/components/narrative/NarrativeScreen.tsx` — Shared animated text component
- `src/components/simulation/ClassPyramid.tsx` — 5-tier visual hierarchy
- `src/components/ui/HowItWorksOverlay.tsx` — Calculation explanation modal (UI-SPEC.md § 6)

**Actions**:
1. `NarrativeScreen`: Reusable Framer Motion text animation (fade-in, type-out)
2. `GalaxyIntro`: Three-screen sequence (galaxy → planet → nation) with fades
3. `TraitReveal`: Dramatic reveal of absurd trait, then show ClassPyramid
4. `ClassPyramid`: Visual pyramid showing 5 classes, color-coded, with population %
5. `PreReservationState`: Show bottom class suffering (poverty 65%, education 3%)
6. All screens have skip button (FR-3)
7. Mobile: Touch-friendly, swipe to advance (FR-3)
8. `HowItWorksOverlay`: Modal explaining simulation math (see UI-SPEC.md § 6)
   - Accessible via `[?]` button on all policy screens
   - Explains each metric: Education, Employment, Wealth, Poverty, Life Expectancy
   - Shows simplified formulas (full details in whitepaper)
   - "View Whitepaper" button links to detailed methodology

**Tests**:
- Component renders without crash (RTL)
- Skip button works
- Phase transitions fire correctly

**Rollback**: Delete narrative component files.

**Acceptance** (from US-2, US-3, US-4):
- [ ] Animated text sequence with smooth transitions
- [ ] Skip option available
- [ ] 5 classes shown with generated names
- [ ] Bottom class metrics shown prominently
- [ ] Tone is clearly satirical

---

### Task 9: Policy Screen Components (US-5)
**Goal**: Build reusable policy screen component for the 5-phase guided journey (Years 0/20/40/60/80).

**Files created**:
- `src/components/simulation/PolicyScreen.tsx` — Reusable policy decision screen
- `src/components/simulation/PolicyHeader.tsx` — Year indicator + nav buttons
- `src/components/simulation/ReservationSlider.tsx` — Per-class reservation control (UI-SPEC: `ClassReservationControl`)
- `src/components/simulation/ProgressCard.tsx` — Shows class progress over time (UI-SPEC: `ProgressSummary`)
- `src/components/simulation/PolicyToggle.tsx` — Creamy layer / EWS toggles with threshold slider (UI-SPEC: `IncomeThresholdSlider`)
- `src/components/simulation/TimePassedAnimation.tsx` — "20 years have passed..." with blinking dots
- `src/components/simulation/ComparisonTable.tsx` — Year 0 vs Year N comparison table
- `src/components/ui/ExplanationBox.tsx` — Reusable info box with ⓘ icon for policy explanations

**Policy Screens (from UI-SPEC.md § 2.1)**:

| Phase | Year | Screen Content |
|-------|------|----------------|
| `POLICY_BOTTOM_2` | 0 | Initial choice: reserve for bottom 2 classes (Lower + Common) |
| `POLICY_MIDDLE` | 20 | Show progress, ask to extend to Middle class |
| `POLICY_CREAMY_LAYER` | 40 | Upper classes protest, introduce Creamy Layer exclusion |
| `POLICY_EWS` | 60 | Upper classes demand EWS reservation |
| `POLICY_REMOVAL` | 80 | Protests to remove reservation, show Year 0 vs Year 80 comparison |

**POLICY_REMOVAL Three-Branch Decision** (from UI-SPEC.md § 3.9):

The POLICY_REMOVAL screen has THREE action buttons with distinct behaviors:

| Button | Store Action | Phase Transition |
|--------|--------------|------------------|
| `[REMOVE ALL RESERVATIONS]` | `clearAllReservations()` — sets all reservation percentages to 0 | `advanceTime(20)` → `END_SUMMARY` |
| `[CONTINUE WITH CURRENT POLICY →]` | No policy change — keeps current percentages | `advanceTime(20)` → `END_SUMMARY` |
| `[ADJUST PERCENTAGES]` | `openSettingsDrawer()` — opens Settings overlay | Remains on `POLICY_REMOVAL` (user adjusts, then clicks Continue) |

Implementation notes:
- All three paths eventually advance to `END_SUMMARY` after the final 20-year step (Year 80 → 100)
- "Adjust Percentages" opens the Settings Drawer as an overlay; user can modify sliders, then must click one of the other two buttons to proceed
- The simulation engine's 20-year step (Year 80-100) uses whatever policy state exists at the time of advancement

**Actions**:
1. `PolicyScreen`: Reusable layout with header, body (two-column on desktop), footer
2. `PolicyHeader`: Shows current year, Settings/Charts/How It Works nav buttons
3. `ReservationSlider`: Per-class slider (0-50%) with benefit % calculation
4. `ProgressCard`: Shows class progress (Education 3% → 12% ↑, Poverty 65% → 52% ↓)
5. `PolicyToggle`: Toggle switch for Creamy Layer / EWS with threshold slider
6. `TimePassedAnimation`: "20 years have passed..." with blinking dots (see UI-SPEC.md § 1.7)
7. Each screen has unique content but shares layout via `PolicyScreen`
8. "Apply & Advance 20 Years" CTA advances to next policy phase
9. Global nav (Settings, Charts, How It Works) accessible from all policy screens

**Tests**:
- Slider updates store correctly
- Class selection updates store
- Both paths (yes/no) advance to time loop
- **0% slider shows warning message**
- **No classes selected disables CTA**
- **Only Classes 3/4/5 are selectable**

**Rollback**: Delete choice component files.

**Acceptance** (from US-5):
- [ ] Clear yes/no choice
- [ ] Percentage slider 0-50%
- [ ] Target class selection (Classes 3/4/5 only)
- [ ] Brief explanation shown
- [ ] 0% slider edge case handled with warning
- [ ] CTA disabled when no class selected

---

### Task 10: Main Simulation Page & Phase Router (US-6)
**Goal**: Build the main simulation page that orchestrates all 12 phases.

**Files created/modified**:
- `src/app/simulate/page.tsx` — Main simulation page (phase router)
- `src/components/simulation/MetricCard.tsx` — Highlight improvement card

**Actions**:
1. `simulate/page.tsx`: State machine routing through `SimulationPhase` enum (12 phases)
   - Routes to correct component for current phase:
     ```
     INTRO           → GalaxyIntro
     WORLD_GEN       → (non-visual, auto-advance)
     TRAIT_REVEAL    → TraitReveal
     PRE_RESERVATION → PreReservationState
     POLICY_BOTTOM_2 → PolicyScreen (year=0, variant="bottom2")
     POLICY_MIDDLE   → PolicyScreen (year=20, variant="middle")
     POLICY_CREAMY_LAYER → PolicyScreen (year=40, variant="creamyLayer")
     POLICY_EWS      → PolicyScreen (year=60, variant="ews")
     POLICY_REMOVAL  → PolicyScreen (year=80, variant="removal")
     END_SUMMARY     → EndSummary
     CHARTS          → ChartsPanel (overlay)
     SETTINGS        → SettingsDrawer (overlay, slide-out)
     ```
   - Manages transition animations between phases
   - CHARTS and SETTINGS are overlays that don't interrupt simulation state
2. `MetricCard`: Shows biggest improvement with animation
   - Uses `findBiggestImprovement` from engine
   - Displays **full class display name** (e.g., "Lower Deaflings improved most")
   - Narrative text template from CALIBRATED-MODEL.md § 5
3. Phase progression:
   - Each policy screen advances to the next when user clicks "Apply & Advance"
   - Simulation engine runs 20-year step between phases
   - Auto-transition to END_SUMMARY after POLICY_REMOVAL

**Tests**:
- All 12 phase transitions work correctly
- Policy screens render with correct year and variant
- Simulation engine called between policy phases
- CHARTS/SETTINGS overlays don't reset simulation state
- Year 100 reached after completing POLICY_REMOVAL

**Rollback**: Delete simulation page + component files.

**Acceptance** (from US-6):
- [ ] All 12 phases route correctly
- [ ] "20 years have passed..." animation between policy screens
- [ ] Biggest improvement highlighted with full class name
- [ ] Settings/Charts accessible as overlays
- [ ] Simulation completes at year 100

---

### Task 11: Charts Panel (US-7)
**Goal**: Full data visualization of all metrics over time.

**Files created** (7 chart types from UI-SPEC.md § 7.2):
- `src/components/charts/ChartsPanel.tsx` — Container with chart tabs
- `src/components/charts/EducationChart.tsx` — Multi-line chart per class
- `src/components/charts/EmploymentChart.tsx` — Multi-line chart per class
- `src/components/charts/PovertyChart.tsx` — Grouped bar chart per class
- `src/components/charts/WealthPieChart.tsx` — Pie chart (wealth shares sum to 100%)
- `src/components/charts/IncomeDistributionChart.tsx` — Box plot or violin showing spread within classes
- `src/components/charts/LifeExpectancyChart.tsx` — Multi-line chart per class
- `src/components/charts/PopulationChart.tsx` — Stacked area chart showing demographic shifts
- `src/components/charts/TimelineScrubber.tsx` — Playback control
- `src/components/charts/ChartLegend.tsx` — Dynamic class name legend

**Actions**:
1. Recharts implementation with consistent class color coding:
   - Upper (Class 1): Gold `#e2b714`
   - Noble (Class 2): Teal `#2dd4bf`
   - Middle (Class 3): Blue `#60a5fa`
   - Common (Class 4): Purple `#a78bfa`
   - Lower (Class 5): Red `#e94560`
2. **7 chart types** (matching UI-SPEC.md § 5.2 and § 7.2):
   - `EducationChart`: Multi-line chart tracking trends over time per class
   - `EmploymentChart`: Multi-line chart tracking trends over time per class
   - `PovertyChart`: Grouped bar chart comparing classes at each time point
   - `WealthPieChart`: Pie chart showing relative shares (sums to 100%)
   - `IncomeDistributionChart`: Box plot or distribution showing spread within classes
   - `LifeExpectancyChart`: Multi-line chart tracking trends over time per class
   - `PopulationChart`: Stacked area chart showing demographic shifts
3. `TimelineScrubber`: Horizontal slider to scrub through years
4. Mobile: Single-metric tabs (one chart at a time, swipe between)
5. Desktop: Grid of charts or tabbed view
6. Animated transitions when data updates (Recharts built-in)
7. **ChartLegend**: Display unique class names from world config
   - Legend shows full `displayName` from each `SocialClass`
   - Example: "Upper Harmonics", "Noble Vibrants", "Lower Deaflings"
   - Dynamically generated based on current world's trait

**Tests**:
- Charts render with mock history data (RTL + snapshot)
- Timeline scrubber updates displayed year
- Mobile view shows single chart with tabs
- **All 7 chart types render correctly** (Education, Employment, Poverty, WealthPie, IncomeDistribution, LifeExpectancy, Population)
- **ChartLegend shows unique class names, not generic "Class 1-5"**
- WealthPieChart percentages sum to 100%
- IncomeDistributionChart shows income spread using `ClassMetrics.incomePerCapita`

**Rollback**: Delete chart component files.

**Acceptance** (from US-7, FR-4):
- [ ] Timeline scrubber works
- [ ] **All 7 chart types implemented** (matching UI-SPEC.md § 7.2)
- [ ] Breakdown by class with unique display names
- [ ] Mobile-friendly (single metric view)
- [ ] Class colors consistent throughout
- [ ] Legend shows dynamically generated class names
- [ ] Income data available from `ClassMetrics.incomePerCapita`

---

### Task 12: Settings Drawer (US-8)
**Goal**: Allow power users to tweak simulation parameters.

**Files created**:
- `src/components/ui/Drawer.tsx` — Reusable slide-out drawer
- `src/components/simulation/SettingsDrawer.tsx` — Simulation settings

**Actions**:
1. Slide-out drawer from right side (Framer Motion)
2. Controls:
   - Reservation percentage slider (0-50%)
   - Target classes (checkboxes — **Classes 3/4/5 only**)
   - Time jump size (5/10/20 year options)
   - Reset to defaults button
3. **Settings changes apply to FUTURE time steps only**
   - Does NOT retroactively recalculate history
   - Engine's `stepSimulation` accepts current policy params dynamically
   - Clear UX messaging: "Changes will affect future years"
4. Accessible: focus trap, escape to close, keyboard navigable

**Tests**:
- Drawer opens/closes
- Slider updates store
- Reset restores defaults
- **Policy change mid-simulation only affects future steps**

**Rollback**: Delete drawer component files.

**Acceptance** (from US-8):
- [ ] Settings accessible from main view
- [ ] All adjustable parameters present
- [ ] Reset to defaults works
- [ ] Changes apply to future time steps only (not retroactive)

---

### Task 13: End Summary Screen (US-9)
**Goal**: Meaningful conclusion summarizing 100+ years of simulation.

**Files created**:
- `src/components/simulation/EndSummary.tsx`
- `src/components/ui/WhitepaperLink.tsx` — Reusable link to methodology whitepaper

**Actions**:
1. Summary of total change from year 0 to final year
2. Key insight highlighted using **full class display name**:
   - Example: "Education access for the **Lower Deaflings** went from 3% to 52%"
   - Uses `SocialClass.displayName` — NOT generic "Lower class" or legacy trait-compound names
3. Before/after comparison cards for each class (use full display names)
4. "Try Again" button (reset + new world or same world with different policy)
5. "View Full Charts" button to explore data
6. Visual celebration if bottom class metrics improved significantly
7. "Most Improved" featured card with full class name (e.g., "LOWER DEAFLINGS")
8. `WhitepaperLink`: Reusable component for "READ WHITEPAPER" button
   - Links to `/whitepaper` route (placeholder page for Phase 1)
   - Also used in HowItWorksOverlay ("VIEW WHITEPAPER" button)

**Tests**:
- Renders correct before/after data
- Key insight uses `SocialClass.displayName`
- Restart button resets state
- Charts button navigates to charts view

**Rollback**: Delete EndSummary component.

**Acceptance** (from US-9):
- [ ] Summary of total change
- [ ] Key insight highlighted with **full class display name**
- [ ] Restart option available
- [ ] All class references use unique display names

---

### Task 14: Mobile Responsiveness & Touch
**Goal**: Ensure the full app works on mobile (320px minimum).

**Files modified**: All component files (Tailwind responsive classes).

**Actions**:
1. Audit all components with Tailwind responsive breakpoints (`sm:`, `md:`, `lg:`)
2. Landing page: Stack vertically, full-width CTA
3. Narrative screens: Larger text on mobile, bottom-aligned skip button
4. TimeDial: Touch-friendly (44px minimum tap targets per PRD)
5. Charts: Single-metric tabs on mobile (per FR-4)
6. Settings: Full-screen drawer on mobile
7. Bottom navigation bar on mobile for primary actions
8. Swipe gestures for narrative advancement (FR-3)
9. Test on 320px, 375px, 768px, 1024px viewports

**Tests**:
- Visual regression at 4 viewport sizes (manual or Playwright)
- Touch targets >= 44px
- No horizontal overflow

**Rollback**: Revert responsive Tailwind classes.

**Acceptance** (from PRD NFR § Compatibility):
- [ ] Works at 320px minimum width
- [ ] Touch-friendly controls
- [ ] Charts readable on mobile
- [ ] No horizontal scroll

---

### Task 15: Accessibility (FR-6)
**Goal**: Meet baseline accessibility requirements.

**Files modified**: All component files.

**Actions**:
1. Keyboard navigation throughout (tab order, focus indicators)
2. `aria-label` on all interactive elements
3. Charts: Hidden data table alternative for screen readers
4. Reduced motion: Respect `prefers-reduced-motion` media query
   - Wrap Framer Motion in conditional
   - Skip animations when reduced motion is preferred
5. Color contrast: Ensure all text meets WCAG AA (4.5:1 minimum)
6. Focus trap in drawer/modal components

**Tests**:
- Tab through entire flow without mouse
- axe-core audit passes (zero critical violations)
- Reduced motion skips animations

**Rollback**: Revert accessibility additions.

**Acceptance** (from FR-6):
- [ ] Keyboard navigable
- [ ] Screen reader support for charts
- [ ] Reduced motion option
- [ ] WCAG AA color contrast

---

### Task 16: Performance Optimization
**Goal**: Meet NFR performance targets.

**Files modified**: Various (code splitting, lazy loading).

**Actions**:
1. Lazy load chart components (`next/dynamic` with `ssr: false`)
2. Lazy load Framer Motion animations
3. Verify bundle size < 200KB gzipped (NFR target)
4. Simulation engine: Ensure time jump < 100ms (profile with `performance.now`)
5. Chart render < 200ms
6. LCP < 2s on landing page
7. Add `will-change` CSS for animated elements
8. Image optimization: Use `next/image` for any static assets

**Tests**:
- `npm run build` shows bundle analysis
- Lighthouse performance score > 90
- No layout shift (CLS < 0.1)

**Rollback**: Revert optimization changes.

**Acceptance** (from PRD NFR § Performance):
- [ ] LCP < 2s
- [ ] Time jump calc < 100ms
- [ ] Chart render < 200ms
- [ ] Bundle < 200KB gzipped

---

### Task 17: Integration Testing & Polish
**Goal**: End-to-end validation of the complete user journey.

**Actions**:
1. Manual walkthrough of full flow: Landing → Intro → Reveal → Choice → Time Loop → Charts → End
2. Test both paths: with reservation and without
3. Verify narrative highlights make sense
4. Verify chart data matches simulation state
5. Test 3 different seeds for variety
6. Check all navigation (next, back, charts, settings, restart)
7. Fix any visual glitches, animation jank, or state bugs
8. Add error boundaries to catch React crashes gracefully

**Tests**:
- Full journey completes in < 5 minutes (success criteria)
- No console errors
- All navigation paths work
- 3 seeds produce distinct worlds

**Rollback**: Revert polish changes individually.

**Acceptance** (from RESEARCH-BRIEF § Success Criteria):
- [ ] Full simulation (0 → 100+ years) in under 5 minutes
- [ ] Charts clearly show reservation policy impact
- [ ] Absurd traits are memorable
- [ ] Works on mobile browsers
- [ ] No external API dependencies at runtime

---

### Task 18: Deployment Configuration
**Goal**: Configure for Vercel deployment.

**Files created/modified**:
- `vercel.json` (if needed)
- `next.config.ts` — Production settings

**Actions**:
1. Ensure `next.config.ts` has proper production settings
2. Set up CSP headers (PRD NFR § Security)
3. Configure metadata for social sharing (OG tags)
4. Verify `npm run build` succeeds with zero errors/warnings
5. Test production build locally: `npm run build && npm start`

**Tests**:
- Production build succeeds
- `npm start` serves correctly
- CSP headers present

**Rollback**: Revert config changes.

**Acceptance**:
- [ ] `npm run build` succeeds
- [ ] Production build serves correctly
- [ ] CSP headers configured

---

## Verification Plan

### Automated Tests
| Suite | Coverage Target | Tool |
|-------|----------------|------|
| Simulation engine | 95%+ | Vitest |
| Content generation | 90%+ | Vitest |
| State store | 90%+ | Vitest |
| Component render | 80%+ | RTL |

### Manual Checks
- [ ] Full user journey walkthrough (both paths)
- [ ] Mobile testing (320px, 375px, 768px)
- [ ] Reduced motion mode
- [ ] Keyboard-only navigation
- [ ] 3 different seeds produce varied worlds
- [ ] Chart readability on mobile
- [ ] Narrative tone review (satirical, not offensive)

### Security
- No user data collection — verified by code audit
- No external API calls — verified by network tab in devtools
- CSP headers — verified by response headers
- No secrets in codebase — verified by `ghost:scan-secrets`

### Performance Gates
- [ ] Lighthouse performance > 90
- [ ] Bundle size < 200KB gzipped
- [ ] LCP < 2s
- [ ] Time jump < 100ms
- [ ] CLS < 0.1

---

## Dependency Graph

```
Task 1 (Scaffold)
  ├── Task 2 (Types) ← no deps beyond scaffold
  │     ├── Task 3 (Data) ← needs types
  │     ├── Task 5 (Engine) ← needs types
  │     └── Task 6 (Store) ← needs types + engine
  ├── Task 4 (Content Loader) ← needs types + data
  │     └── Task 6 (Store) ← needs content loader
  └── Task 7 (Landing) ← needs scaffold only

Task 6 (Store)
  ├── Task 8 (Narrative) ← needs store + content
  ├── Task 9 (Choice) ← needs store
  ├── Task 10 (Sim Page) ← needs store + all components
  ├── Task 11 (Charts) ← needs store + engine
  ├── Task 12 (Settings) ← needs store
  └── Task 13 (End Summary) ← needs store

Task 10 (Sim Page) — integrates all above

Task 14 (Mobile) ← needs all UI tasks (7-13)
Task 15 (A11y) ← needs all UI tasks (7-13)
Task 16 (Perf) ← needs all tasks
Task 17 (Integration) ← needs everything
Task 18 (Deploy) ← needs everything
```

### Parallelization Opportunities
- Tasks 2, 3 can start in parallel after Task 1
- Task 7 (Landing) can start in parallel with Tasks 2-6
- Tasks 8, 9, 11, 12, 13 can be parallelized once Task 6 is done
- Tasks 14, 15 can run in parallel after UI tasks

---

## Execution Order (Recommended)

| Wave | Tasks | Rationale |
|------|-------|-----------|
| 1 | Task 1 | Foundation — everything depends on it |
| 2 | Tasks 2 + 3 (parallel) | Types + data are independent |
| 3 | Tasks 4 + 5 (parallel) | Content loader + engine need types |
| 4 | Task 6 | Store needs engine + content |
| 5 | Tasks 7 + 8 + 9 (parallel) | Landing + narrative + choice are independent UI |
| 6 | Tasks 10 + 11 + 12 + 13 (parallel) | Main page + charts + settings + end screen |
| 7 | Tasks 14 + 15 (parallel) | Mobile + accessibility pass |
| 8 | Task 16 | Performance optimization |
| 9 | Task 17 | Integration testing |
| 10 | Task 18 | Deployment |

**Total**: 18 atomic tasks across 10 execution waves.

---

## Rollback Strategy

Each task is atomic and independently reversible:
- **Code tasks**: `git revert` the task's commit
- **Data tasks**: Delete JSON files, no schema migrations
- **Config tasks**: Revert config file changes
- **No database**: Fully client-side, no persistent state to migrate

**Checkpoint commits**: After each task, commit with message format:
```
feat(reservation-sim): task-N — <description>
```

---

## Review Resolution

### From Codex Review (Round 9 — Final Verification)
| Finding | Severity | Resolution |
|---------|----------|------------|
| `setReservationPolicy` signature mismatches `ClassPolicy` type | LOW | Replaced with `setClassPolicy()`, `setCreamyLayer()`, `setEWSPolicy()` actions |
| Task 6 acceptance criteria contains stale URL schema | LOW | Updated to `?seed=...&year=...&state=<base64-policy-blob>` |

### From Codex Review (Round 8 — Type + URL + Component Fixes)
| Finding | Severity | Resolution |
|---------|----------|------------|
| PopulationChart tab missing from playground | LOW | Added "Population" tab to desktop and mobile chart navigation |
| `ReservationPolicy` type structure undefined | MEDIUM | Added `ReservationPolicy` and `ClassPolicy` interfaces to Task 2 with full Creamy Layer + EWS fields |
| URL encode schema doesn't handle multi-policy state | MEDIUM | Updated Task 6 URL schema to use base64-encoded JSON blob for full policy state |
| `WhitepaperLink` component unassigned | LOW | Added `WhitepaperLink.tsx` to Task 13 with implementation details |
| `ExplanationBox` component unassigned | LOW | Added `ExplanationBox.tsx` to Task 9 file list |
| Component name mismatches between UI-SPEC and PLAN | MEDIUM | Updated UI-SPEC.md § 7.1 to use PLAN.md canonical names with task references |

### From Gemini Review (Round 7 — Gap Fixes)
| Finding | Severity | Resolution |
|---------|----------|------------|
| POLICY_REMOVAL has 3 action buttons but store actions undefined | MEDIUM | Added `clearAllReservations()` and `openSettingsDrawer()` to Task 6; documented 3-branch semantics in Task 9 |
| HowItWorksOverlay not assigned to any task | MEDIUM | Added `HowItWorksOverlay.tsx` to Task 8 with implementation details |
| Income metric missing from ClassMetrics and engine | MEDIUM | Added `incomePerCapita` to Task 2 types; added `calculateIncome()` and income constants to Task 5 |
| Task 1 typography error (Inter vs Orbitron+Rajdhani) | LOW | Fixed Task 1 action 7 to use "Orbitron + Rajdhani fonts" |
| 3 chart types missing from Task 11 | MEDIUM | Added `WealthPieChart`, `IncomeDistributionChart`, `PopulationChart` to Task 11 (7 total) |
| END_SUMMARY playground uses generic "Lower class" | LOW | Fixed playground key insight to use "Lower Deaflings" and "Upper Harmonics" |

### From Codex Review (Round 6 — Class Naming + Phase Enum)
| Finding | Severity | Resolution |
|---------|----------|------------|
| SimulationPhase enum mismatch (8 vs 12 phases) | CRITICAL | Task 2 enum updated to match UI-SPEC.md § 2.2 (12 phases with 5 policy screens) |
| Task 9/10 built around old CHOICE/TIME_LOOP phases | CRITICAL | Task 9 rewritten as PolicyScreen components; Task 10 routes 12 phases |
| Chart legend shows prefix-only ("Upper") not full name | MEDIUM | UI-PLAYGROUND.html chart legend updated to "Upper Harmonics" etc. |
| Year 80 comparison table uses generic "UPPER Edu" | MEDIUM | UI-PLAYGROUND.html comparison table uses unique names ("HARMONICS Edu") |
| No max-length for class names | MEDIUM | UI-SPEC.md § 1.3 adds 12-char max; Task 3 validates |
| Task 13 uses stale "Frequency-Deaf" reference | LOW | Updated to use `SocialClass.displayName` |
| Pyramid legend prefix-only inconsistent with tier bars | LOW | UI-PLAYGROUND.html pyramid legend shows unique suffixes |
| Earlobe example uses "Harmonics" vs "Resonants" | LOW | Tracked as authoring guidance (illustrative alternatives) |

**From JD Feedback (Round 6 — Class Naming)**:
| Feedback | Severity | Resolution |
|----------|----------|------------|
| Class names should be unique per class, not same base name | HIGH | Updated UI-SPEC.md § 1.3, PLAN.md Tasks 2-4, 11 |
| Format: "Level + UniqueClassName" (not "Level + SameName") | HIGH | `AbsurdTrait.classNames` now holds 5 unique names per trait |
| Example: Upper Harmonics, Noble Vibrants, Lower Deaflings | — | Updated UI-PLAYGROUND.html with example names |

**Related Changes**:
- **Task 2**: Added `ClassTier` type, updated `SimulationPhase` enum to 12 phases
- **Task 3**: Updated JSON schema to use `classNames` with 5 unique values + max-length
- **Task 4**: Added `getClassName(trait, tier)` helper function
- **Task 9**: Rewritten as `PolicyScreen` components for 5-phase guided journey
- **Task 10**: Updated to route 12 phases instead of old CHOICE/TIME_LOOP
- **Task 11**: Added `ChartLegend` component for dynamic class names
- **Task 13**: Updated to use full display names in key insight
- **UI-SPEC.md**: § 1.3 updated with naming convention, examples table, and max-length
- **UI-PLAYGROUND.html**: Chart legend, pyramid legend, comparison table all use unique names

### From Reviews (Round 5 — Codex)
| Finding | Severity | Resolution |
|---------|----------|------------|
| Task 1 temp scaffold copies node_modules | MEDIUM | Added `--skip-install --no-git` and rsync with excludes |
| URL vs localStorage precedence | MEDIUM | Defined order: URL > localStorage > fresh seed in Task 6 |
| WORLD_GEN phase under-specified | LOW | Defined as non-visual transition (500ms max, auto-advance) in Task 2 |

### From Reviews (Round 4)
All CRITICAL and HIGH findings from the multi-model adversarial review have been addressed:

| Finding | Severity | Resolution |
|---------|----------|------------|
| Task 1 scaffolding conflict | CRITICAL | Rewritten to use temp-scaffold + merge approach |
| Tailwind v4 vs v3 config | HIGH | Changed to Tailwind 3.4.x (config-first, more stable) |
| FR-5 URL state missing | HIGH | Added `urlSync.ts` with encode/decode/hydrate in Task 6 |
| Undo without redo | HIGH | Added `goForward()` redo action in Task 6 |
| State persistence missing | MEDIUM | Added Zustand `persist` middleware to Task 6 |
| CALIBRATED-MODEL.md path | LOW | Fixed to `../research/CALIBRATED-MODEL.md` |
| 0% slider edge case | MEDIUM | Added warning + CTA disable in Task 9 |
| Target-class constraints | MEDIUM | Restricted to Classes 3/4/5 in Tasks 9/12 |
| TimeDial behavior | HIGH | Clarified click-to-advance (no free-scrubbing) |
| Mid-simulation policy | MEDIUM | Clarified changes affect future steps only in Task 12 |

### From Reviews (rounds 1-3)
Reviews contained placeholder templates only — no actionable findings to resolve.

### Open Decisions (from RESEARCH-BRIEF.md)
| Decision | Resolution | Owner |
|----------|------------|-------|
| Number of classes | 5 (confirmed by JD via RESEARCH-CHECK) | JD |
| Animation library | Framer Motion (confirmed in RESEARCH.md) | NalaN |
| Chart library | Recharts (confirmed in RESEARCH.md) | NalaN |
| Hosting | Vercel (assumed, pending JD confirmation) | JD |

---

## Status
- Draft owner: nalan-35505e2c (hq-planner)
- Ready for review: **yes**
