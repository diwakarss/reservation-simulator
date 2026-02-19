# Phase 1 Research: Reservation Simulator v2

## Context
- **Project Mode**: greenfield (fresh build, scrapping old codebase)
- **Work Mode**: feature (new product)
- **Phase Scope**: Full MVP of story-driven reservation policy simulator

## Baseline Assumptions (Greenfield)

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **Charts**: Recharts (React-native, lightweight, good animations)
- **Animations**: Framer Motion (narrative transitions, time dial)
- **State**: Zustand (simple, no boilerplate)
- **Testing**: Vitest + React Testing Library

### Why These Choices
| Choice | Rationale |
|--------|-----------|
| Next.js App Router | Modern React patterns, good DX, Vercel deployment |
| Recharts over D3 | Simpler API, built for React, sufficient for our needs |
| Framer Motion | Best-in-class React animations, needed for storytelling UX |
| Zustand over Redux | Minimal boilerplate, perfect for medium complexity state |
| Pre-generated traits | Zero runtime costs, instant load, offline-capable |

## Proposed Approach

### 1. Narrative Flow Architecture
```
[Intro] → [World Gen] → [Classes Reveal] → [Pre-Reservation State]
    → [User Choice: Provide Reservation?]
    → [Time Jump Loop] → [End State Summary]
```

### 2. Core Data Model
```typescript
interface SimulationState {
  world: {
    galaxyName: string;
    planetName: string;
    nationName: string;
  };
  trait: AbsurdTrait;           // The differentiating characteristic
  classes: SocialClass[];        // 5 classes, bottom-to-top
  currentYear: number;           // Simulation year
  reservationPolicy: {
    enabled: boolean;
    percentage: number;          // 0-50%
    targetClasses: string[];     // Which classes benefit
  };
  history: YearSnapshot[];       // All historical data points
}

interface SocialClass {
  id: string;
  name: string;                  // Generated funny name
  description: string;
  population: number;            // Percentage of total
  metrics: ClassMetrics;
}

interface ClassMetrics {
  educationAccess: number;       // 0-100%
  employment: number;            // 0-100%
  wealthShare: number;           // 0-100% (of total)
  povertyRate: number;           // 0-100%
  lifeExpectancy: number;        // Years
}
```

### 3. Mathematical Model (Simplified from Whitepaper)

Keep the core equations but simplify for storytelling:

**Education Access** (per time step):
```
E(t+1) = E(t) + (reservation_boost * gap_multiplier) - dropout_rate
where:
  reservation_boost = policy_percentage * 0.15
  gap_multiplier = (100 - E(t)) / 100
```

**Employment** (follows education with lag):
```
J(t+1) = J(t) + (education_effect + reservation_boost) * economic_growth
where:
  education_effect = E(t) * 0.4
```

**Wealth** (slowest to change):
```
W(t+1) = W(t) + (employment_effect * savings_rate) - consumption
```

**Life Expectancy** (derived from wealth + education):
```
L(t+1) = base_life + (wealth_factor * 15) + (education_factor * 10)
```

### 4. Pre-Generated Content Strategy

**Absurd Traits Pool (100-200)**
Categories of ridiculous differentiators:
- Celestial: "Born when the third moon was full", "Conceived during meteor showers"
- Auditory: "Can hum exactly 432Hz", "Earlobes that vibrate at sacred frequencies"
- Culinary: "Ancestors first ate the divine vegetable", "Can taste the color purple"
- Temporal: "Born on auspicious nanoseconds", "Shadow falls at blessed angles"
- Arbitrary: "Possess invisible auras of superiority", "Hair grows in clockwise spirals"

**Class Name Templates**
- Top: "The Blessed [Trait-havers]", "Sacred Order of [Trait]"
- Upper-Mid: "Noble [Trait] Keepers"
- Middle: "Common [Trait] Practitioners"
- Lower-Mid: "Lesser [Trait] Touched"
- Bottom: "The [Trait]-less Unfortunates"

### 5. UX Flow Detail

**Screen 1: Galaxy Intro**
```
"In a galaxy far, far away..."
[fade]
"On a planet called [ZEPHYRIA]..."
[fade]
"In the nation of [VARNASHRAMA PRIME]..."
```

**Screen 2: The Sacred Difference**
```
"The people were divided by one sacred truth..."
[dramatic reveal]
"Those whose earlobes vibrate at 432Hz were chosen by the cosmos."
[show hierarchy pyramid]
```

**Screen 3: Pre-Reservation State**
```
[Show current misery metrics for bottom classes]
"The [Trait-less] suffer. 85% in poverty. 2% reach higher education."

[USER CHOICE]
"Do you wish to provide reservation for the [Trait-less]?"
[YES] → Enter percentage (slider 0-50%)
[NO] → Continue without policy
```

**Screen 4+: Time Jumps**
```
[Time machine dial spins]
"20 years have passed..."

[MAJOR IMPROVEMENT HIGHLIGHT]
"Education access for the [Trait-less] increased from 2% to 18%!"
[sparkle animation]

[Buttons: NEXT | BACK | VIEW CHARTS | SETTINGS]
```

**Charts View**
- Timeline scrubber at bottom
- Stacked area chart for wealth distribution
- Line charts for education/employment by class
- Animated transitions between time points

## Risks/Pitfalls

| Risk | Mitigation |
|------|------------|
| Simulation results feel unrealistic | Calibrate against real-world reservation data from whitepapers |
| Satire misunderstood as mocking marginalized | Focus ridicule on arbitrary basis of hierarchy, not victims |
| Pre-generated content feels repetitive | Large pool (200+) with combination logic |
| Mobile performance with animations | Use `will-change`, reduce particles on mobile |
| Chart readability on mobile | Simplified mobile chart views, focus on key metrics |

## Open Questions

1. **Number of classes**: 5 (from whitepaper) or 3-4 (simpler storytelling)?
2. **Time dial granularity**: 5/10/20 year jumps or continuous slider?
3. **Share feature**: Generate shareable summary image?
4. **Sound effects**: Ambient sci-fi audio or silent?

## Confidence Assessment

| Aspect | Confidence | Notes |
|--------|------------|-------|
| Tech stack | HIGH | Standard modern stack, well-documented |
| Math model | HIGH | Validated in whitepapers, just simplifying |
| UX flow | MEDIUM | Needs user testing, may iterate |
| Absurd traits tone | MEDIUM | Need JD review of trait examples |
| Performance | HIGH | Simple calculations, pre-generated content |

## Constraint Classification

| Constraint | Type (Hard/Soft) | Evidence | Impact if Violated |
|-----------|------------------|----------|--------------------|
| No runtime LLM costs | Hard | JD requirement | Budget overrun, slow UX |
| Mobile responsive | Hard | JD requirement | Excludes mobile users |
| Satirical not offensive | Hard | Ethical requirement | Harm to marginalized communities |
| 5-minute completion | Soft | UX goal | Users may abandon |
| Next.js/TypeScript | Soft | JD preference | Could use alternatives if needed |

## Grounding Ledger

| Claim | Source | Date Checked | Confidence |
|-------|--------|--------------|------------|
| Reservation improves outcomes 20-25% over 50 years | Whitepaper main.pdf, Table 2 | 2026-02-19 | HIGH |
| Education gaps narrow 70-75% with policy | Whitepaper main.pdf, Section 5.3 | 2026-02-19 | HIGH |
| 5 class system models real stratification | Whitepaper.pdf, Page 1 | 2026-02-19 | HIGH |
| Next.js 15 App Router stable | Official docs | 2026-02-19 | HIGH |
| Recharts supports animations | Recharts docs | 2026-02-19 | HIGH |
| Framer Motion good for narrative UX | Industry practice | 2026-02-19 | MEDIUM |
