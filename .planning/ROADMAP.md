# reservation-simulator — Roadmap

## Overview

A story-driven web simulator demonstrating multi-generational impact of reservation/affirmative action policies. Uses absurd fictional traits in a sci-fi setting to satirize caste-like hierarchies while showcasing validated socio-economic models.

**Tech Stack**: Next.js 15, TypeScript 5.x, Tailwind CSS 4.x, Recharts, Framer Motion, Zustand

## Phase Breakdown

### Phase 1: Foundation (Setup)

**Goal:** Scaffold Next.js app, set up tooling, implement core data models and simulation engine.

**Plans:** 1 plan (all waves consolidated)

Plans:
- [ ] 01-01-PLAN.md — Project scaffolding, core types, simulation engine, 200 traits, tests

**Success Criteria:**
- [ ] `npm run dev` starts without errors
- [ ] Simulation engine produces results matching CALIBRATED-MODEL.md validation targets
- [ ] 200 traits available in traits.json
- [ ] 90%+ test coverage on simulation engine

**Deliverable:** Working simulation engine with tests, ready for UI integration.

---

### Phase 2: Narrative UI

**Goal:** Build the story-driven user experience from intro to simulation controls.

**Waves:**
- [ ] Wave 2.1: Layout and routing structure (App Router pages)
- [ ] Wave 2.2: Intro sequence (galaxy intro, Framer Motion animations)
- [ ] Wave 2.3: Class reveal screen (pyramid visualization, trait display)
- [ ] Wave 2.4: Policy choice UI (reservation yes/no, percentage slider)
- [ ] Wave 2.5: Time dial component (dial UI, time jump controls)
- [ ] Wave 2.6: Narrative highlight cards (biggest improvement display)

**Success Criteria:**
- [ ] User can complete intro sequence in < 60 seconds
- [ ] Skip functionality works on all animated screens
- [ ] Policy choice correctly initializes simulation
- [ ] Time dial visually indicates current year

**Deliverable:** Complete narrative flow from landing to simulation controls.

---

### Phase 3: Charts & Visualization

**Goal:** Implement data visualization for simulation metrics.

**Waves:**
- [ ] Wave 3.1: Chart components (Recharts integration)
- [ ] Wave 3.2: Education/Employment line charts
- [ ] Wave 3.3: Wealth distribution stacked area chart
- [ ] Wave 3.4: Poverty rate bar chart
- [ ] Wave 3.5: Life expectancy comparison chart
- [ ] Wave 3.6: Timeline scrubber with playback
- [ ] Wave 3.7: Mobile-responsive chart views

**Success Criteria:**
- [ ] All 5 metrics visualized correctly
- [ ] Charts animate smoothly between time points
- [ ] Readable on 320px mobile screens
- [ ] Consistent color coding for classes

**Deliverable:** Full charts panel with all metrics and timeline control.

---

### Phase 4: Integration & State

**Goal:** Connect all components, implement state management, and URL persistence.

**Waves:**
- [ ] Wave 4.1: Zustand store setup (simulation state)
- [ ] Wave 4.2: Connect UI to simulation engine
- [ ] Wave 4.3: History management (snapshots, undo/redo)
- [ ] Wave 4.4: URL state persistence (shareable links)
- [ ] Wave 4.5: Settings drawer (parameter adjustments)
- [ ] Wave 4.6: End-state summary screen

**Success Criteria:**
- [ ] Full simulation playable from start to finish
- [ ] URL sharing works (copy URL → reload → same state)
- [ ] Settings changes apply immediately
- [ ] Completion rate trackable (100+ years reached)

**Deliverable:** Fully integrated, shareable simulator.

---

### Phase 5: Polish & Accessibility

**Goal:** Performance optimization, accessibility, and edge case handling.

**Waves:**
- [ ] Wave 5.1: Performance audit (LCP < 2s, bundle < 200KB)
- [ ] Wave 5.2: Keyboard navigation
- [ ] Wave 5.3: Screen reader support (chart data tables)
- [ ] Wave 5.4: Reduced motion option
- [ ] Wave 5.5: Error boundaries and edge cases
- [ ] Wave 5.6: Mobile gesture support (swipe navigation)

**Success Criteria:**
- [ ] Lighthouse score > 90 on all categories
- [ ] WCAG 2.1 AA compliance
- [ ] Works on Chrome, Safari, Firefox, Edge
- [ ] iOS 14+ and Android 10+ tested

**Deliverable:** Production-ready, accessible simulator.

---

### Phase 6: Launch

**Goal:** Deploy to production, generate final whitepaper with real results.

**Waves:**
- [ ] Wave 6.1: Vercel deployment setup
- [ ] Wave 6.2: Domain configuration
- [ ] Wave 6.3: Analytics integration (privacy-respecting)
- [ ] Wave 6.4: Regenerate whitepaper with actual simulation results
- [ ] Wave 6.5: Final review and go-live

**Success Criteria:**
- [ ] Site live at production URL
- [ ] Analytics tracking completion rate
- [ ] Whitepaper reflects actual calculated outputs
- [ ] No critical bugs in production

**Deliverable:** Live simulator + updated academic whitepaper.

---

## Dependencies

```
Phase 1 (Foundation) ─┬─> Phase 2 (Narrative UI)
                      │
                      └─> Phase 3 (Charts)
                                │
Phase 2 + Phase 3 ────────────> Phase 4 (Integration)
                                      │
                                      └─> Phase 5 (Polish)
                                                │
                                                └─> Phase 6 (Launch)
```

Phase 2 and 3 can run in parallel after Phase 1 completes.

---

## Key Files Reference

| Document | Location | Purpose |
|----------|----------|---------|
| Research Brief | `.planning/phases/01-research/RESEARCH-BRIEF.md` | Scope summary |
| Research | `.planning/phases/01-research/RESEARCH.md` | Full approach |
| PRD | `.planning/phases/01-research/PRD.md` | Product requirements |
| Architecture | `.planning/phases/01-research/ARCHITECTURE.svg` | System diagram |
| Calibrated Model | `.planning/phases/01-research/CALIBRATED-MODEL.md` | Math formulas |
| Model Validation | `.planning/phases/01-research/MODEL-VALIDATION.md` | Data sources |
| **Phase 1 Plan** | `.planning/phases/phase-1/PLAN.md` | Execution plan |

---

*Generated: 2026-02-19*
*Research phase: COMPLETE*
*Phase 1: PLANNED*
