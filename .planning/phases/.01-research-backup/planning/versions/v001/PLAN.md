# Phase 1 Implementation Plan: Reservation Simulator MVP

## Phase Goal
Deliver a working, deployable story-driven reservation simulator that lets users experience how reservation policies affect socio-economic outcomes across 5 fictional social classes in a satirical sci-fi setting.

## Inputs Consumed
- `inputs/RESEARCH-BRIEF.md` — Scope, constraints, success criteria
- `inputs/RESEARCH.md` — Tech stack, data model, UX flow, math model
- `inputs/ARCHITECTURE.md` — System diagram, component breakdown, file structure
- `inputs/PRD.md` — User stories (US-1 through US-9), functional/non-functional requirements
- `inputs/RESEARCH-CHECK.md` — Verdict: PASS
- `../../CALIBRATED-MODEL.md` — Corrected mathematical model with validation targets

## Tech Stack (Confirmed)
| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Charts | Recharts | latest |
| Animation | Framer Motion | latest |
| State | Zustand | latest |
| Testing | Vitest + React Testing Library | latest |
| Deployment | Vercel | — |

---

## Task Plan

### Task 1: Project Scaffolding
**Goal**: Initialize Next.js project with all dependencies and base configuration.

**Files created**:
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `tailwind.config.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/styles/globals.css`
- `vitest.config.ts`
- `.gitignore`

**Actions**:
1. Run `npx create-next-app@latest reservation-simulator --typescript --tailwind --app --src-dir --no-import-alias`
2. Install dependencies: `npm install zustand framer-motion recharts`
3. Install dev dependencies: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react`
4. Configure Vitest in `vitest.config.ts` with jsdom environment
5. Configure Tailwind with dark sci-fi theme colors:
   - Deep purple: `#1a1a2e`
   - Cosmic blue: `#16213e`
   - Accent gold: `#e2b714`
   - Highlight red: `#e94560`
   - Muted text: `#a7a7c4`
6. Set up global CSS with dark cosmic background, Inter font
7. Create base layout with metadata (title, description, OG tags)

**Tests**: `npm run build` succeeds, `npm run dev` starts without errors.

**Rollback**: `rm -rf` project directory and re-scaffold.

**Acceptance**:
- [ ] Next.js 15 app boots in dev mode
- [ ] Tailwind dark theme renders
- [ ] All dependencies install cleanly

---

### Task 2: Type Definitions & Data Model
**Goal**: Define all TypeScript interfaces and types matching the PRD data model.

**Files created**:
- `src/lib/simulation/types.ts`

**Types to define** (from PRD § Technical Specifications):
```
SimulationState, WorldConfig, AbsurdTrait, TraitCategory,
SocialClass, ClassMetrics, ReservationPolicy, YearSnapshot,
AggregateMetrics, SimulationPhase, NarrativeHighlight
```

**Actions**:
1. Create `src/lib/simulation/types.ts` with all interfaces from PRD
2. Add `SimulationPhase` enum: `INTRO | WORLD_GEN | TRAIT_REVEAL | PRE_RESERVATION | CHOICE | TIME_LOOP | CHARTS | END_SUMMARY`
3. Add `NarrativeHighlight` type for biggest-improvement logic
4. Export all types

**Tests**: TypeScript compilation (`npx tsc --noEmit`) passes with no errors.

**Rollback**: Delete `types.ts`.

**Acceptance**:
- [ ] All PRD data model types are defined
- [ ] Types compile without errors
- [ ] Simulation phases cover the full user journey

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
3. Each trait has: `id`, `text`, `category`, `classPatterns` (names for all 5 tiers)
4. Create class name templates with tier-appropriate language
5. Create world name pools (galaxy names, planet names, nation names)

**Content guidelines** (from RESEARCH-BRIEF § Constraints):
- Satirical but not offensive to marginalized communities
- Focus ridicule on arbitrary basis of hierarchy, not victims
- Absurd enough to be clearly fictional

**Tests**: JSON schema validation (manual or script), no duplicates, all traits have 5 class patterns.

**Rollback**: Delete data files.

**Acceptance**:
- [ ] 100 traits across 5 categories
- [ ] Each trait has class names for all 5 tiers
- [ ] 30+ names in each world name pool
- [ ] Tone is satirical without being offensive

---

### Task 4: Content Loader & World Generation
**Goal**: Implement functions to load pre-generated content and generate a random world.

**Files created**:
- `src/lib/content/traits.ts`
- `src/lib/content/classNames.ts`
- `src/lib/content/worldGenerator.ts`

**Actions**:
1. `traits.ts`: Load and pick random trait, filter by category
2. `classNames.ts`: Generate class names from trait + template
3. `worldGenerator.ts`: Generate full world config (galaxy, planet, nation, trait, 5 classes with initial metrics)
4. Use seed-based RNG (from PRD FR-2: deterministic given same seed)
5. Initial metrics from CALIBRATED-MODEL.md § 1 (population, education, employment, wealth, poverty, life expectancy)

**Tests** (Vitest):
- `worldGenerator.test.ts`: Same seed produces same world
- `worldGenerator.test.ts`: All 5 classes have valid initial metrics
- `traits.test.ts`: Random trait selection returns valid trait
- `classNames.test.ts`: Generated names match tier patterns

**Rollback**: Delete content lib files + tests.

**Acceptance**:
- [ ] Deterministic world generation with seed
- [ ] 5 classes generated with correct initial conditions from calibrated model
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
2. `models.ts`: Pure functions from CALIBRATED-MODEL.md § 3:
   - `calculateEducation(current, reservationPercent, yearsSincePolicy) → number`
   - `calculateEmployment(currentEmp, currentEdu, prevEdu, reservationPercent) → number`
   - `calculateWealth(classes, policyTargetClasses) → Class[]`
   - `calculatePoverty(current, eduGain, empGain, wealthGain) → number`
   - `calculateLifeExpectancy(current, eduGain, povertyReduction) → number`
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
**Goal**: Implement centralized state management for the simulation.

**Files created**:
- `src/lib/store/simulation.ts`

**Actions**:
1. Create Zustand store with `SimulationState` shape
2. Actions:
   - `initializeWorld(seed?: string)` — Generate world, set initial state
   - `setReservationPolicy(enabled, percentage, targetClasses)` — User choice
   - `advanceTime(years: number)` — Run simulation step, push to history
   - `goBack()` — Undo last time jump (pop from history)
   - `setPhase(phase: SimulationPhase)` — Navigate narrative flow
   - `reset()` — Full reset
   - `setTimeJumpSize(years: number)` — Settings control
3. Derive computed values:
   - Current snapshot
   - Narrative highlight (biggest improvement)
   - Progress percentage (currentYear / 100)

**Tests** (Vitest):
- Store initializes with valid world
- `advanceTime` produces new history entry
- `goBack` restores previous state
- `reset` clears everything
- `setReservationPolicy` updates correctly

**Rollback**: Delete store file + tests.

**Acceptance**:
- [ ] All PRD FR-5 state management requirements met
- [ ] Undo/redo for time jumps works
- [ ] State is fully driven by Zustand

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

**Actions**:
1. `NarrativeScreen`: Reusable Framer Motion text animation (fade-in, type-out)
2. `GalaxyIntro`: Three-screen sequence (galaxy → planet → nation) with fades
3. `TraitReveal`: Dramatic reveal of absurd trait, then show ClassPyramid
4. `ClassPyramid`: Visual pyramid showing 5 classes, color-coded, with population %
5. `PreReservationState`: Show bottom class suffering (poverty 65%, education 3%)
6. All screens have skip button (FR-3)
7. Mobile: Touch-friendly, swipe to advance (FR-3)

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

### Task 9: Reservation Choice Screen (US-5)
**Goal**: User decides whether to enable reservation and at what level.

**Files created**:
- `src/components/simulation/ReservationChoice.tsx`
- `src/components/simulation/ReservationSlider.tsx`

**Actions**:
1. Clear yes/no choice: "Do you wish to provide reservation for the [class name]?"
2. If yes: slider for percentage (0-50%, default 27% matching India's policy)
3. Checkboxes for which classes benefit (default: bottom 2 classes)
4. Brief explanation of what reservation means in this context
5. "Begin Simulation" button to start time progression
6. "Continue Without Policy" option for control group comparison

**Tests**:
- Slider updates store correctly
- Class selection updates store
- Both paths (yes/no) advance to time loop

**Rollback**: Delete choice component files.

**Acceptance** (from US-5):
- [ ] Clear yes/no choice
- [ ] Percentage slider 0-50%
- [ ] Target class selection
- [ ] Brief explanation shown

---

### Task 10: Main Simulation Page & Time Loop (US-6)
**Goal**: Build the main simulation page with time dial and narrative progression.

**Files created/modified**:
- `src/app/simulate/page.tsx` — Main simulation page (orchestrates phases)
- `src/components/simulation/TimeDial.tsx` — Interactive time control
- `src/components/simulation/MetricCard.tsx` — Highlight improvement card
- `src/components/simulation/TimeJumpNarrative.tsx` — "20 years have passed..."

**Actions**:
1. `simulate/page.tsx`: State machine routing through `SimulationPhase` enum
   - Renders correct component for current phase
   - Manages transition animations between phases
2. `TimeDial`: Circular dial showing current year, animates on time jump
   - Click to advance (default 20 years)
   - Visual: retro-futuristic clock/dial design
3. `MetricCard`: Shows biggest improvement with animation
   - Uses `findBiggestImprovement` from engine
   - Narrative text template from CALIBRATED-MODEL.md § 5
4. `TimeJumpNarrative`: "20 years have passed..." with dramatic animation
5. Navigation: NEXT | BACK | VIEW CHARTS | SETTINGS buttons
6. Auto-transition to END_SUMMARY when year >= 100

**Tests**:
- Phase transitions work correctly
- Time advance updates store and renders new data
- Back button restores previous state
- Year >= 100 triggers end summary

**Rollback**: Delete simulation page + component files.

**Acceptance** (from US-6):
- [ ] Time dial animation on jump
- [ ] "20 years have passed..." narrative
- [ ] Biggest improvement highlighted
- [ ] Next/Back navigation
- [ ] Dial allows jumping to any year

---

### Task 11: Charts Panel (US-7)
**Goal**: Full data visualization of all metrics over time.

**Files created**:
- `src/components/charts/ChartsPanel.tsx` — Container with chart tabs
- `src/components/charts/EducationChart.tsx` — Line chart per class
- `src/components/charts/EmploymentChart.tsx` — Line chart per class
- `src/components/charts/WealthChart.tsx` — Stacked area chart
- `src/components/charts/PovertyChart.tsx` — Bar chart per class
- `src/components/charts/LifeExpectancyChart.tsx` — Line chart per class
- `src/components/charts/TimelineScrubber.tsx` — Playback control

**Actions**:
1. Recharts implementation with consistent class color coding:
   - Class 1 (top): Gold `#e2b714`
   - Class 2: Teal `#2dd4bf`
   - Class 3: Blue `#60a5fa`
   - Class 4: Purple `#a78bfa`
   - Class 5 (bottom): Red `#e94560`
2. `WealthChart`: Stacked area chart (wealth shares sum to 100%)
3. `EducationChart`, `EmploymentChart`, `LifeExpectancyChart`: Line charts with all 5 classes
4. `PovertyChart`: Bar chart grouped by class
5. `TimelineScrubber`: Horizontal slider to scrub through years
6. Mobile: Single-metric tabs (one chart at a time, swipe between)
7. Desktop: Grid of charts or tabbed view
8. Animated transitions when data updates (Recharts built-in)

**Tests**:
- Charts render with mock history data (RTL + snapshot)
- Timeline scrubber updates displayed year
- Mobile view shows single chart with tabs
- All 5 metrics have corresponding charts

**Rollback**: Delete chart component files.

**Acceptance** (from US-7, FR-4):
- [ ] Timeline scrubber works
- [ ] All 5 metrics charted
- [ ] Breakdown by class
- [ ] Mobile-friendly (single metric view)
- [ ] Class colors consistent throughout

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
   - Target classes (checkboxes)
   - Time jump size (5/10/20 year options)
   - Reset to defaults button
3. Changes apply immediately (Zustand store updates)
4. Accessible: focus trap, escape to close, keyboard navigable

**Tests**:
- Drawer opens/closes
- Slider updates store
- Reset restores defaults

**Rollback**: Delete drawer component files.

**Acceptance** (from US-8):
- [ ] Settings accessible from main view
- [ ] All adjustable parameters present
- [ ] Reset to defaults works
- [ ] Changes apply immediately

---

### Task 13: End Summary Screen (US-9)
**Goal**: Meaningful conclusion summarizing 100+ years of simulation.

**Files created**:
- `src/components/simulation/EndSummary.tsx`

**Actions**:
1. Summary of total change from year 0 to final year
2. Key insight highlighted (e.g., "Education access for the Frequency-Deaf went from 3% to 28%")
3. Before/after comparison cards for each class
4. "Try Again" button (reset + new world or same world with different policy)
5. "View Full Charts" button to explore data
6. Visual celebration if bottom class metrics improved significantly

**Tests**:
- Renders correct before/after data
- Restart button resets state
- Charts button navigates to charts view

**Rollback**: Delete EndSummary component.

**Acceptance** (from US-9):
- [ ] Summary of total change
- [ ] Key insight highlighted
- [ ] Restart option available

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
