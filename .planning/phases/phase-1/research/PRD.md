# Product Requirements Document: Reservation Simulator v2

## Executive Summary

### Product Overview
A story-driven web simulator that lets users experience how reservation (affirmative action) policies affect socio-economic outcomes across fictional social classes. Set in a satirical sci-fi universe, it uses absurd invented traits to differentiate social classes—mocking the arbitrary basis of real caste systems while demonstrating the measurable impact of affirmative action policies.

### Problem Statement
The debate around reservation/affirmative action in India is often emotional and based on misconceptions. There's no accessible, engaging way for people to understand the multi-generational impact of these policies on socio-economic indicators.

### Solution
An interactive narrative experience that:
1. Abstracts the real caste system into fictional absurd hierarchies (avoiding direct controversy)
2. Uses validated mathematical models to simulate policy effects
3. Makes data engaging through storytelling and dramatic reveals
4. Allows users to experiment with policy parameters and see outcomes

### Target Users
- Students and educators exploring policy impacts
- Policy enthusiasts and researchers
- General public curious about reservation debates
- Social media users (shareable experience)

### Success Metrics
| Metric | Target |
|--------|--------|
| Completion rate (0 → 100 years) | > 70% |
| Average session duration | 4-6 minutes |
| Mobile usage share | > 40% |
| Social shares (Phase 2) | Track baseline |

---

## User Stories

### Core User Journey

**US-1: First-time visitor discovers the simulator**
> As a curious visitor, I want to understand what this simulator does so I can decide if I want to try it.

Acceptance Criteria:
- Landing page clearly explains the concept in < 10 seconds
- "Start Simulation" button is prominent
- No login/signup required

**US-2: User experiences the narrative intro**
> As a user, I want an engaging sci-fi introduction so I feel immersed in the fictional world.

Acceptance Criteria:
- "In a galaxy far far away..." text animation
- Planet and nation names generated
- Smooth transitions between screens
- Skip option available

**US-3: User discovers the "sacred difference"**
> As a user, I want to see what trait divides society so I understand the satirical premise.

Acceptance Criteria:
- Dramatic reveal of absurd trait (e.g., "Those whose earlobes vibrate at 432Hz")
- Visual hierarchy showing 5 classes
- Each class has a generated name and description
- Tone is clearly satirical

**US-4: User sees pre-reservation suffering**
> As a user, I want to see the current state of inequality so I understand why reservation might be needed.

Acceptance Criteria:
- Bottom class metrics shown prominently (85% poverty, 2% education access)
- Visual contrast with top class
- Emotional impact without being preachy

**US-5: User makes the reservation choice**
> As a user, I want to decide whether to implement reservation and at what level.

Acceptance Criteria:
- Clear yes/no choice
- If yes, slider for percentage (0-50%)
- Brief explanation of what this means
- Option to target specific classes

**US-6: User experiences time progression**
> As a user, I want to see how society changes over time so I understand policy impact.

Acceptance Criteria:
- Time dial animation (default 20-year jumps)
- Narrative text: "20 years have passed..."
- Highlight biggest improvement metric
- Next/Back navigation
- Can jump to any year via dial

**US-7: User views detailed charts**
> As a user, I want to see all metrics over time so I get the complete picture.

Acceptance Criteria:
- Timeline scrubber at bottom
- Charts for: Education, Employment, Wealth, Poverty, Life Expectancy
- Breakdown by class
- Comparison with/without policy (if applicable)
- Mobile-friendly chart views

**US-8: User adjusts simulation parameters**
> As a power user, I want to tweak simulation settings so I can explore different scenarios.

Acceptance Criteria:
- Settings drawer accessible from main view
- Adjustable: reservation %, target classes, time jump size
- Reset to defaults option
- Changes apply immediately

**US-9: User reaches simulation end**
> As a user, I want a meaningful conclusion so I feel the experience was worthwhile.

Acceptance Criteria:
- Summary of total change over 100+ years
- Key insight highlighted
- Option to restart with different settings
- (Phase 2) Share result image

---

## Functional Requirements

### FR-1: World Generation
- Generate unique planet name from pre-defined pool
- Generate unique nation name
- Select random absurd trait from 200+ options
- Generate 5 class names based on trait
- All content pre-generated (no runtime LLM)

### FR-2: Simulation Engine
- Implement education access model from whitepaper
- Implement employment model with education linkage
- Implement wealth distribution model
- Implement poverty rate calculation
- Implement life expectancy model
- Support 1-50 year time jumps
- Maintain history of all snapshots
- Deterministic given same seed

### FR-3: Narrative UI
- Animated text sequences (Framer Motion)
- Fade transitions between screens
- Skip functionality for all animations
- Mobile touch gestures (swipe to advance)

### FR-4: Charts & Visualization
- Stacked area chart for wealth distribution
- Line charts for education/employment/life expectancy
- Bar chart for poverty rates
- Timeline scrubber with playback
- Responsive sizing for mobile
- Class color coding consistent throughout

### FR-5: State Management
- Persist state in URL (shareable simulation state)
- Reset functionality
- Undo/redo for time jumps
- (Phase 2) Local storage for draft simulations

### FR-6: Accessibility
- Keyboard navigation throughout
- Screen reader support for charts (data tables)
- Reduced motion option
- High contrast mode support

---

## Non-Functional Requirements

### Performance
| Requirement | Target |
|-------------|--------|
| Initial page load (LCP) | < 2s |
| Time jump calculation | < 100ms |
| Chart render | < 200ms |
| Animation frame rate | 60fps |
| Bundle size (gzipped) | < 200KB |

### Compatibility
- Browsers: Chrome 90+, Safari 15+, Firefox 90+, Edge 90+
- Devices: Desktop, tablet, mobile (320px minimum)
- OS: iOS 14+, Android 10+, Windows 10+, macOS 11+

### Security
- No user data collection
- No external API calls at runtime
- CSP headers configured
- No sensitive data in URL state

### Reliability
- Works offline after initial load (PWA candidate Phase 2)
- Graceful degradation without JavaScript (basic info)
- Error boundaries for React components

---

## Technical Specifications

### Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS 4.x |
| Charts | Recharts |
| Animation | Framer Motion |
| State | Zustand |
| Testing | Vitest + RTL |
| Deployment | Vercel |

### Data Models

```typescript
// Core simulation state
interface SimulationState {
  seed: string;                    // For reproducibility
  world: WorldConfig;
  trait: AbsurdTrait;
  classes: SocialClass[];
  currentYear: number;
  reservationPolicy: ReservationPolicy;
  history: YearSnapshot[];
}

interface WorldConfig {
  galaxyName: string;
  planetName: string;
  nationName: string;
}

interface AbsurdTrait {
  id: string;
  text: string;                    // "Those whose earlobes vibrate at 432Hz"
  category: TraitCategory;
  classNameTemplate: string;       // "{trait}-blessed", "{trait}-cursed"
}

interface SocialClass {
  id: string;
  tier: 1 | 2 | 3 | 4 | 5;        // 1 = top, 5 = bottom
  name: string;
  description: string;
  populationShare: number;         // 0-1
  metrics: ClassMetrics;
}

interface ClassMetrics {
  educationAccess: number;         // 0-100
  employment: number;              // 0-100
  wealthShare: number;             // 0-100
  povertyRate: number;             // 0-100
  lifeExpectancy: number;          // Years
}

interface ReservationPolicy {
  enabled: boolean;
  percentage: number;              // 0-50
  targetClasses: number[];         // Class tiers that benefit
  startYear: number;
}

interface YearSnapshot {
  year: number;
  classes: SocialClass[];
  aggregateMetrics: AggregateMetrics;
}
```

### API Endpoints
None required - fully client-side application.

### Pre-generated Content Structure

```json
// data/traits.json
[
  {
    "id": "earlobe-432hz",
    "text": "Those whose earlobes vibrate at exactly 432Hz",
    "category": "auditory",
    "classPatterns": {
      "1": "The Sacred 432 Resonants",
      "2": "Noble Frequency Keepers",
      "3": "Common Vibration Folk",
      "4": "The Dissonant Ones",
      "5": "The Frequency-Deaf"
    }
  }
]
```

---

## Design Requirements

### Visual Style
- **Theme**: Dark sci-fi with cosmic accents
- **Colors**: Deep purples, cosmic blues, gold highlights
- **Typography**: Modern sans-serif (Inter or similar)
- **Animations**: Smooth, cinematic, skippable

### Key Screens
1. **Landing**: Hero text, single CTA, cosmic background
2. **Intro Sequence**: Full-screen text animations
3. **Class Reveal**: Pyramid visualization with trait
4. **Simulation Main**: Time dial, metric highlight, navigation
5. **Charts Panel**: Slide-up panel or full screen on mobile
6. **Settings Drawer**: Side drawer with sliders

### Mobile Considerations
- Touch-friendly controls (44px minimum tap targets)
- Swipe gestures for navigation
- Simplified charts (single metric at a time)
- Bottom navigation for primary actions

---

## Phases & Milestones

### Phase 1: MVP (Current)
- Core narrative flow
- Simulation engine
- Basic charts
- Mobile responsive
- 100 pre-generated traits

**Deliverable**: Working simulator deployable to Vercel

### Phase 2: Polish
- Share functionality (generate image)
- PWA support (offline mode)
- Sound effects (optional)
- Additional 100 traits
- A/B test narrative variations

### Phase 3: Extensions
- Comparison mode (with vs without policy)
- Export data as CSV
- Embed widget for blogs
- Multiple policy types (education-only, jobs-only)

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Math model produces unrealistic results | Medium | High | Calibrate against whitepaper data, add bounds |
| Satire misunderstood | Low | High | Clear disclaimers, focus ridicule on hierarchy not people |
| Poor mobile performance | Medium | Medium | Performance budget, test on low-end devices |
| Pre-generated content feels repetitive | Low | Medium | 200+ traits with combination logic |
| Charts unreadable on mobile | Medium | Medium | Simplified mobile views, single-metric focus |

---

## Open Questions for Stakeholder

1. **Class count**: Stick with 5 classes (whitepaper accuracy) or simplify to 3-4?
2. **Simulation length**: Default 100 years, or let users choose end point?
3. **Disclaimer copy**: What disclaimer text should appear about the satire?
4. **Launch target**: Specific date or event to align with?

---

## Appendix

### Sample Absurd Traits
| Category | Example |
|----------|---------|
| Celestial | "Born when the third moon was in retrograde" |
| Auditory | "Can hum the sacred frequency of creation" |
| Culinary | "Ancestors first consumed the divine purple vegetable" |
| Temporal | "Born during the auspicious nanosecond" |
| Physical (absurd) | "Hair grows in sacred clockwise spirals" |
| Metaphysical | "Possess invisible auras of cosmic blessing" |
| Arbitrary | "Descended from those who first sneezed facing east" |

### Reference Documents
- [Whitepaper.pdf](../../whitepapers/Whitepaper.pdf) - Original mathematical models
- [main.pdf](../../whitepapers/main.pdf) - Agent-based simulation research
- [Old codebase](https://github.com/diwakarss/reservationsim.git) - Reference only, not reusing code
