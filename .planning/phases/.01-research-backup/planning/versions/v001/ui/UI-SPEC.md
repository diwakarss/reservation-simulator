# UI Specification: Reservation Simulator MVP

## 1. Design System

### 1.1 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#0a0a14` | Page background (deepest dark) |
| `bg-surface` | `#1a1a2e` | Card/panel backgrounds |
| `bg-elevated` | `#16213e` | Elevated surfaces (drawers, modals) |
| `accent-gold` | `#e2b714` | Primary CTA, highlights, positive change |
| `accent-red` | `#e94560` | Negative metrics, alerts, Class 5 color |
| `accent-teal` | `#2dd4bf` | Class 2, secondary positive indicators |
| `accent-blue` | `#60a5fa` | Class 3, links, interactive elements |
| `accent-purple` | `#a78bfa` | Class 4, tertiary accent |
| `text-primary` | `#f0f0ff` | Headings, primary text |
| `text-secondary` | `#a7a7c4` | Body text, descriptions |
| `text-muted` | `#6b6b8d` | Captions, disabled states |
| `border-default` | `#2a2a4a` | Subtle borders, dividers |
| `border-focus` | `#e2b714` | Focus rings (accessibility) |

### 1.2 Class Color System (Consistent Across All Views)

| Class | Tier | Color | Hex |
|-------|------|-------|-----|
| Class 1 (Top) | Elite | Gold | `#e2b714` |
| Class 2 | Upper-Mid | Teal | `#2dd4bf` |
| Class 3 | Middle | Blue | `#60a5fa` |
| Class 4 | Lower-Mid | Purple | `#a78bfa` |
| Class 5 (Bottom) | Disadvantaged | Red | `#e94560` |

These colors appear in the class pyramid, all charts, metric cards, and the end summary. They must never be swapped or changed contextually.

### 1.3 Typography

| Element | Font | Weight | Size (Desktop) | Size (Mobile) | Line Height |
|---------|------|--------|----------------|---------------|-------------|
| Page title | Inter | 700 | 48px / 3rem | 32px / 2rem | 1.1 |
| Section heading | Inter | 600 | 32px / 2rem | 24px / 1.5rem | 1.2 |
| Card heading | Inter | 600 | 20px / 1.25rem | 18px / 1.125rem | 1.3 |
| Body | Inter | 400 | 16px / 1rem | 16px / 1rem | 1.6 |
| Caption/label | Inter | 500 | 14px / 0.875rem | 13px / 0.8125rem | 1.4 |
| Narrative text | Inter | 300 | 28px / 1.75rem | 20px / 1.25rem | 1.5 |
| Metric value | Inter Mono* | 700 | 36px / 2.25rem | 28px / 1.75rem | 1.1 |

*Use `font-variant-numeric: tabular-nums` on Inter for metric values if Inter Mono is unavailable.

### 1.4 Spacing Scale

Base unit: 4px. Use Tailwind's default spacing scale.

| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | 4px | Inline icon gaps |
| `space-sm` | 8px | Compact padding |
| `space-md` | 16px | Default component padding |
| `space-lg` | 24px | Section padding |
| `space-xl` | 32px | Page margins (desktop) |
| `space-2xl` | 48px | Section separation |
| `space-3xl` | 64px | Major screen boundaries |

Mobile page margins: 16px. Desktop page margins: 32px. Max content width: 1200px, centered.

### 1.5 Elevation & Depth

| Level | Shadow | Usage |
|-------|--------|-------|
| 0 | None | Flat backgrounds |
| 1 | `0 2px 8px rgba(0,0,0,0.3)` | Cards, metric tiles |
| 2 | `0 4px 16px rgba(0,0,0,0.4)` | Floating panels, drawers |
| 3 | `0 8px 32px rgba(0,0,0,0.5)` | Modals, overlay content |

### 1.6 Border Radius

| Element | Radius |
|---------|--------|
| Buttons | 8px |
| Cards | 12px |
| Input fields | 8px |
| Drawer/Modal | 16px (top corners on mobile) |
| Pill badges | 9999px (full round) |

### 1.7 Motion Principles

- **Duration**: Fast interactions (buttons, hover) = 150ms. Page transitions = 400ms. Narrative reveals = 800-1200ms.
- **Easing**: Use `ease-out` for enters, `ease-in` for exits, `ease-in-out` for transforms.
- **Reduced motion**: When `prefers-reduced-motion: reduce` is active, replace all Framer Motion animations with instant state changes. Fade transitions reduce to 100ms cross-fade.
- **Narrative pacing**: Minimum 1.5s between auto-advancing narrative screens. User can skip at any time.

---

## 2. Component Inventory

### 2.1 Primitive UI Components

#### Button
- **Variants**: `primary` (gold bg, dark text), `secondary` (transparent, gold border), `ghost` (text only), `danger` (red bg)
- **Sizes**: `sm` (32px height, 14px text), `md` (40px height, 16px text), `lg` (48px height, 18px text)
- **States**: default, hover (+8% brightness), active (-4% brightness), disabled (40% opacity, no pointer events), focus (2px gold outline, 2px offset)
- **Min tap target**: 44x44px on mobile (add invisible padding if button is smaller)
- **Loading state**: Replace text with spinner, maintain button width

#### Slider (ReservationSlider)
- **Track**: 4px height, `bg-surface` background, `accent-gold` fill
- **Thumb**: 20px circle, `accent-gold`, 2px white border
- **Label**: Above slider, shows current value (e.g., "27%")
- **Range**: 0-50, step 1
- **Touch**: Thumb expands to 32px on touch devices
- **Keyboard**: Arrow keys adjust by 1, Shift+Arrow by 5
- **ARIA**: `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext="27 percent"`

#### Drawer
- **Width**: 360px on desktop, 100% on mobile
- **Entry**: Slides from right, 300ms ease-out
- **Exit**: Slides to right, 200ms ease-in
- **Overlay**: `rgba(0,0,0,0.6)` backdrop, click to close
- **Focus trap**: Tab cycles within drawer when open
- **Close**: X button (top-right), Escape key, overlay click

#### MetricCard
- **Layout**: Vertical stack — label (caption), value (metric font), delta badge
- **Delta badge**: Green pill for improvement, red pill for decline, with arrow icon
- **Animation**: Value counts up/down on change (300ms, ease-out)
- **Size**: Min 120px wide, flex to fill grid

#### CosmicBackground
- **Implementation**: CSS-only star field using radial gradients and keyframe animations
- **Layers**: 3 star layers at different speeds (parallax depth)
- **Performance**: `will-change: transform` on animated layers, `pointer-events: none`
- **Reduced motion**: Static positions, no animation

### 2.2 Composite Components

#### ClassPyramid
- **Shape**: Inverted trapezoid stack (widest at top = Class 1, narrowest at bottom = Class 5)
- **Each tier**: Color-coded bar with class name and population percentage
- **Hover/tap**: Expand to show metrics preview (education, poverty, life expectancy)
- **Animation**: Builds from bottom to top on enter (staggered 150ms per tier)
- **Width**: 100% of container, max 500px
- **Mobile**: Full width, slightly taller bars for tap targets

#### ChartsPanel
- **Desktop layout**: 2x2 grid of charts with tab to switch 5th metric, or 5-tab single chart view
- **Mobile layout**: Single chart with horizontal swipe tabs
- **Chart types**:
  - Education: Multi-line chart (5 classes over time)
  - Employment: Multi-line chart (5 classes over time)
  - Wealth: Stacked area chart (shares sum to 100%)
  - Poverty: Grouped bar chart (5 classes per time point)
  - Life Expectancy: Multi-line chart (5 classes over time)
- **Colors**: Use class color system consistently
- **Axes**: Y-axis labeled with units (%, years), X-axis shows year
- **Tooltip**: On hover/tap, show exact values for all classes at that year
- **Legend**: Horizontal below chart, color dot + class name
- **Responsive**: Charts resize fluidly. Min chart height: 200px mobile, 300px desktop
- **A11y**: Hidden `<table>` with chart data for screen readers

#### TimeDial
- **Visual**: Circular dial face with year display in center
- **Design**: Retro-futuristic clock aesthetic — tick marks around perimeter, inner ring shows current year in large metric font
- **Interaction**: Click/tap the dial to advance time (default 20 years)
- **Animation**: Dial hand rotates clockwise on time jump (600ms spring easing)
- **Progress ring**: Outer ring fills proportionally (currentYear / 100)
- **Size**: 200px diameter desktop, 160px diameter mobile
- **Accessible**: `role="button"`, `aria-label="Advance time by 20 years. Current year: {year}"`

#### TimelineScrubber
- **Layout**: Full-width horizontal bar at bottom of charts panel
- **Track**: Shows small tick marks at each snapshot year
- **Thumb**: Draggable, shows year label above on hover/drag
- **Playback**: Optional play button to auto-advance through years
- **Keyboard**: Arrow keys move 1 year, Page Up/Down move 10 years

#### SettingsDrawer
- **Sections**:
  1. **Reservation %**: Slider 0-50%
  2. **Target Classes**: Checkbox group (Class 3, 4, 5 — Class 1 and 2 not selectable as targets)
  3. **Time Jump Size**: Radio group (5 / 10 / 20 years)
  4. **Reset**: Ghost button "Reset to Defaults"
- **Behavior**: Changes apply immediately to store. No save/cancel paradigm.

#### EndSummary
- **Layout**: Vertical scroll of before/after comparison cards
- **Header**: Large "After {N} Years..." with narrative insight
- **Cards**: One per class, showing Year 0 → Year N for each metric
- **Highlight**: Class with biggest improvement gets a gold border and "Most Improved" badge
- **Actions**: "Try Again" (primary), "View Charts" (secondary), "New World" (ghost)

---

## 3. Screen Specifications

### 3.1 Screen: Landing Page (`/`)

**Layout**: Full viewport height. Vertically centered content. CosmicBackground behind everything.

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              [CosmicBackground]                 │
│                                                 │
│         ╔═══════════════════════════╗            │
│         ║  RESERVATION SIMULATOR   ║  ← title   │
│         ║  (subtle glow animation) ║            │
│         ╠═══════════════════════════╣            │
│         ║  Experience how policy    ║  ← body   │
│         ║  shapes society across    ║            │
│         ║  generations in a galaxy  ║            │
│         ║  far, far away...         ║            │
│         ╠═══════════════════════════╣            │
│         ║  [  START SIMULATION  ]   ║  ← CTA    │
│         ╚═══════════════════════════╝            │
│                                                 │
│             v scroll indicator v                │
└─────────────────────────────────────────────────┘
```

**States**:
- **Default**: Title + subtitle + CTA rendered. Background animating.
- **CTA hover**: Button brightness increases, subtle scale(1.02).
- **Navigating**: Button shows brief spinner, page fades out (200ms).

**Mobile**: Stack identical, CTA button stretches to full width minus margins. Title font scales down per typography table.

**Interaction**: Click "Start Simulation" → navigates to `/simulate`, store initializes world via `initializeWorld()`.

### 3.2 Screen: Simulation (`/simulate`)

This is the main state-machine screen. It renders different sub-views based on `SimulationPhase`:

```
INTRO → WORLD_GEN → TRAIT_REVEAL → PRE_RESERVATION → CHOICE → TIME_LOOP → CHARTS → END_SUMMARY
```

All transitions between phases use a cross-fade (400ms) with the outgoing view fading to opacity 0 and the incoming view fading from opacity 0.

#### 3.2.1 Phase: INTRO (GalaxyIntro)

**Layout**: Full-screen, centered text.

```
┌─────────────────────────────────┐
│                                 │
│    "In a galaxy far away..."    │   ← fade in (800ms)
│                                 │   ← hold (1.5s)
│                                 │   ← fade out (400ms)
│                                 │
│    "On a planet called          │   ← fade in sequence
│     [ZEPHYRIA-7]..."            │
│                                 │
│    "In the nation of            │
│     [VARNASHRAMA PRIME]..."     │
│                                 │
│              [Skip →]           │   ← bottom-right, ghost button
└─────────────────────────────────┘
```

**Sequence**: 3 screens, each auto-advances after 3s. Text uses `narrative` font styling (28px light weight). Galaxy/planet/nation names use `accent-gold` color.

**States**:
- **Auto-playing**: Text fades in, holds, fades out, next screen fades in
- **Skipped**: Instant jump to TRAIT_REVEAL phase
- **Reduced motion**: No fade, instant text swap every 2s

**Mobile**: Skip button moves to bottom-center. Text size reduces to 20px.

#### 3.2.2 Phase: TRAIT_REVEAL (TraitReveal)

**Layout**: Two-beat sequence.

Beat 1 — Trait text:
```
┌─────────────────────────────────┐
│                                 │
│   "The people were divided by   │
│    one sacred truth..."         │   ← fade in
│                                 │
│   ════════════════════════      │   ← divider
│                                 │
│   "Those whose earlobes         │   ← dramatic reveal
│    vibrate at exactly 432Hz     │     (typing animation, 60ms/char)
│    were chosen by the cosmos"   │
│                                 │
│         [Continue →]            │
└─────────────────────────────────┘
```

Beat 2 — Class pyramid:
```
┌─────────────────────────────────┐
│   And so, society was ordered:  │
│                                 │
│   ┌─────────────────────────┐   │   Class 1: "The Sacred 432 Resonants" (10%)
│   │█████████████████████████│   │
│   ├───────────────────────┤     │   Class 2: "Noble Frequency Keepers" (20%)
│   │███████████████████████│     │
│   ├─────────────────────┤       │   Class 3: "Common Vibration Folk" (30%)
│   │█████████████████████│       │
│   ├───────────────────┤         │   Class 4: "The Dissonant Ones" (25%)
│   │███████████████████│         │
│   ├─────────────────┤           │   Class 5: "The Frequency-Deaf" (15%)
│   │█████████████████│           │
│   └─────────────────┘           │
│                                 │
│         [Continue →]            │
└─────────────────────────────────┘
```

**States**:
- **Beat 1 default**: Trait text types out character by character
- **Beat 1 skipped**: Full text appears instantly
- **Beat 2 enter**: Pyramid builds from bottom, staggered 150ms per tier
- **Beat 2 hover**: Hovered tier expands with metric preview tooltip

**Mobile**: Pyramid fills full width. Tier labels stack below bars instead of beside.

#### 3.2.3 Phase: PRE_RESERVATION (PreReservationState)

**Layout**: Focus on bottom class suffering metrics.

```
┌─────────────────────────────────────────────┐
│                                             │
│   Meanwhile, at the bottom...               │
│                                             │
│   "The Frequency-Deaf"                      │
│   ┌────────────┐ ┌────────────┐             │
│   │ POVERTY    │ │ EDUCATION  │             │
│   │   65%      │ │    3%      │             │
│   │   ▲▲▲      │ │    ▼▼▼     │             │
│   └────────────┘ └────────────┘             │
│   ┌────────────┐ ┌────────────┐             │
│   │ EMPLOYMENT │ │ LIFE EXP.  │             │
│   │    5%      │ │  62 years  │             │
│   └────────────┘ └────────────┘             │
│                                             │
│   vs. "The Sacred 432 Resonants"            │
│   Education: 45%  |  Poverty: 5%            │
│                                             │
│              [Continue →]                   │
└─────────────────────────────────────────────┘
```

**States**:
- **Enter**: Metric cards animate in with count-up effect (0 → actual value, 500ms)
- **Contrast row**: Top class metrics shown in muted text for comparison

**Mobile**: 2-column metric grid fills width. Comparison row stacks below.

#### 3.2.4 Phase: CHOICE (ReservationChoice)

**Layout**: Binary choice with conditional expansion.

```
┌─────────────────────────────────────────────┐
│                                             │
│   "Do you wish to provide reservation       │
│    for the Frequency-Deaf?"                 │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │  ℹ Reservation guarantees a % of   │   │  ← info box
│   │  education and job opportunities    │   │
│   │  for disadvantaged classes.         │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   [  YES, PROVIDE RESERVATION  ]            │  ← primary
│   [  NO, CONTINUE WITHOUT  ]               │  ← secondary
│                                             │
│   ─── If YES: ──────────────────────────    │
│                                             │
│   Reservation percentage:                   │
│   ○─────────●─────────○  27%               │  ← slider (default 27%)
│   0%                  50%                   │
│                                             │
│   Benefiting classes:                       │
│   ☑ Class 4: The Dissonant Ones            │
│   ☑ Class 5: The Frequency-Deaf            │
│   ☐ Class 3: Common Vibration Folk         │
│                                             │
│   [  BEGIN SIMULATION  →  ]                 │  ← primary CTA
└─────────────────────────────────────────────┘
```

**States**:
- **Default**: Only Yes/No buttons visible
- **"Yes" selected**: Slider + class checkboxes expand below (300ms slide-down)
- **"No" selected**: Jump directly to TIME_LOOP phase (no reservation)
- **Slider adjusting**: Label updates in real-time
- **Ready**: "Begin Simulation" CTA appears when at least 1 class is checked

**Edge states**:
- **0% selected on slider**: Warn "0% reservation has no effect. Continue anyway?" — treat as no-reservation path
- **No classes checked**: "Begin Simulation" button disabled with tooltip "Select at least one class"

**Mobile**: Full-width layout. Slider thumb enlarged. Checkbox rows taller (48px).

#### 3.2.5 Phase: TIME_LOOP (Main Simulation View)

**Layout**: Three-zone layout.

```
┌─────────────────────────────────────────────────────┐
│  ≡ Settings                              Year: 20   │  ← top bar
├─────────────────────────────────────────────────────┤
│                                                     │
│                                                     │
│               ╭──────────────╮                      │
│              │    Year 20    │                      │  ← TimeDial (center)
│              │  ◷──────────  │                      │
│              │   [Advance]   │                      │
│               ╰──────────────╯                      │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  "20 years have passed..."                  │    │  ← TimeJumpNarrative
│  │                                             │    │
│  │  ★ Education access for the Frequency-Deaf  │    │  ← biggest improvement
│  │    increased from 3% to 10%!                │    │
│  │                                             │    │
│  │  [Education: 3%→10%] [Poverty: 65%→52%]    │    │  ← MetricCard row
│  │  [Employment: 5%→12%] [Life: 62→64 yr]     │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [← BACK]    [VIEW CHARTS]    [ADVANCE 20yr →]     │  ← action bar
└─────────────────────────────────────────────────────┘
```

**States**:
- **Time advancing**: TimeDial animates rotation. Metric cards show loading shimmer briefly. Narrative text fades in after dial settles.
- **First time jump (Year 0 → 20)**: Extra dramatic — dial spins longer, "20 years have passed..." gets type-out animation.
- **Subsequent jumps**: Faster animations (dial 400ms instead of 600ms).
- **Year >= 100**: "Advance" button text changes to "View Final Summary →". Next advance triggers END_SUMMARY.
- **Back**: Restores previous state from history. Dial counter-rotates.
- **No policy**: Narrative text adjusts — "Without reservation, progress is slow. Education only grew from 3% to 5%."

**Mobile layout**:
```
┌─────────────────────────┐
│  ≡                 ⚙    │  ← hamburger + settings
├─────────────────────────┤
│        Year 20          │
│     ╭──────────╮        │
│    │    ◷      │        │  ← smaller dial
│     ╰──────────╯        │
│                         │
│  "20 years passed..."   │
│  ★ Education: 3%→10%    │
│                         │
│ ┌────┐┌────┐┌────┐┌────┐│  ← compact 2x2 metrics
│ │Edu ││Pov ││Emp ││Life││
│ │10% ││52% ││12% ││64yr││
│ └────┘└────┘└────┘└────┘│
├─────────────────────────┤
│ [←] [Charts] [Next →]  │  ← bottom bar, fixed
└─────────────────────────┘
```

**Edge states**:
- **Year 0 (first visit)**: Show "Tap the dial to begin..." prompt
- **Back at Year 0**: Back button disabled (greyed out)
- **Very long run (Year 200+)**: Metrics plateau — narrative says "Changes have largely stabilized..."

#### 3.2.6 Phase: CHARTS (ChartsPanel)

**Desktop layout**:
```
┌────────────────────────────────────────────────────┐
│  [← Back to Simulation]           Year: 0-60       │
├────────────────────────────────────────────────────┤
│                                                    │
│  [Education] [Employment] [Wealth] [Poverty] [LE]  │  ← tab bar
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │                                              │  │
│  │    ^                                         │  │
│  │    │  ──── Class 1                           │  │
│  │    │  ──── Class 2                           │  │
│  │    │  ──── Class 3        ●──────────        │  │
│  │    │  ──── Class 4   ●────                   │  │
│  │    │  ──── Class 5 ●                         │  │
│  │    │                                         │  │
│  │    └────────────────────────────────→         │  │
│  │     Year 0    20     40     60               │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ ○────────────●────────────○  Timeline: Yr 40 │  │  ← TimelineScrubber
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ● Class 1  ● Class 2  ● Class 3  ● Class 4  ● 5 │  ← legend
└────────────────────────────────────────────────────┘
```

**Mobile layout**: Identical but tabs become a horizontal scroll strip. Chart fills screen width. Legend wraps to 2 rows.

**States**:
- **Loading**: Skeleton chart area (shimmer lines)
- **Empty (Year 0 only)**: "Run the simulation first to see chart data" message
- **Active**: Charts render with Recharts animated transitions
- **Tab switch**: Smooth cross-fade between chart types (200ms)
- **Scrubber drag**: Chart updates live as scrubber moves (throttled to 16ms / 60fps)
- **Hover on chart**: Crosshair + tooltip showing exact values per class at that year

**Wealth chart specifics**: Stacked area. Each area labeled. Total always = 100%. Y-axis shows 0-100%.

#### 3.2.7 Phase: END_SUMMARY (EndSummary)

**Layout**:
```
┌─────────────────────────────────────────────────┐
│                                                 │
│          After 100 Years...                     │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │  ★ KEY INSIGHT                          │   │
│   │  Education access for the Frequency-    │   │
│   │  Deaf went from 3% to 28%, while        │   │
│   │  poverty dropped from 65% to 32%.       │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   ── Class-by-Class Results ──                  │
│                                                 │
│   ┌────────────────────────────┐                │
│   │ 🏆 MOST IMPROVED           │  ← gold border │
│   │ The Frequency-Deaf         │                │
│   │ Education:  3% → 28%  ↑   │                │
│   │ Poverty:   65% → 32%  ↓   │                │
│   │ Employment: 5% → 26%  ↑   │                │
│   │ Life Exp:  62 → 69 yr ↑   │                │
│   │ Wealth:     3% → 7%   ↑   │                │
│   └────────────────────────────┘                │
│                                                 │
│   ┌────────────────┐ ┌────────────────┐         │
│   │ The Dissonant  │ │ Common Vib.    │         │
│   │ Edu: 10%→22%   │ │ Edu: 20%→35%  │         │
│   │ ...            │ │ ...            │         │
│   └────────────────┘ └────────────────┘         │
│   (... remaining classes)                       │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │  [  TRY AGAIN (same world)  ]           │   │  ← primary
│   │  [  NEW WORLD  ]                        │   │  ← secondary
│   │  [  VIEW FULL CHARTS  ]                 │   │  ← ghost
│   └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**States**:
- **Enter**: Key insight card fades in first (400ms), then class cards stagger in (200ms each)
- **No reservation path**: Insight changes to "Without intervention, progress was slow. The Frequency-Deaf gained only 5 percentage points in education over 100 years."
- **Significant improvement (education > 3x)**: Subtle gold shimmer/celebration animation on "Most Improved" card

**Mobile**: Cards stack vertically, full width. Action buttons become full-width stacked.

---

## 4. Interaction Model

### 4.1 Navigation Flow

```
Landing (/)
  │
  └─→ /simulate
        │
        ├─→ INTRO ──→ WORLD_GEN ──→ TRAIT_REVEAL ──→ PRE_RESERVATION ──→ CHOICE
        │                                                                    │
        │                                                          ┌────────┘
        │                                                          ▼
        │                                                     TIME_LOOP ←──┐
        │                                                       │ │ │      │
        │                                                       │ │ └──────┘ (advance)
        │                                                       │ │
        │                                                       │ └──→ CHARTS ──→ (back to TIME_LOOP)
        │                                                       │
        │                                                       └──→ END_SUMMARY
        │                                                              │
        │                                                              ├──→ TIME_LOOP (try again)
        │                                                              ├──→ CHARTS
        │                                                              └──→ Landing (new world)
        │
        └─→ Settings Drawer (overlay, any phase after CHOICE)
```

### 4.2 Keyboard Shortcuts

| Key | Context | Action |
|-----|---------|--------|
| `Enter` / `Space` | Narrative screens | Advance to next screen |
| `Escape` | Drawer open | Close drawer |
| `Escape` | Charts view | Return to TIME_LOOP |
| `→` / `Space` | TIME_LOOP | Advance time |
| `←` | TIME_LOOP | Go back one time step |
| `C` | TIME_LOOP | Open charts |
| `S` | TIME_LOOP | Toggle settings drawer |
| `Tab` | Everywhere | Standard focus navigation |

### 4.3 Touch Gestures

| Gesture | Context | Action |
|---------|---------|--------|
| Tap | TimeDial | Advance time |
| Swipe left | Narrative screens | Advance |
| Swipe right | TIME_LOOP | Go back |
| Swipe left | Chart tabs | Next metric |
| Swipe right | Chart tabs | Previous metric |
| Swipe down | Charts panel (mobile) | Dismiss charts |
| Pinch | Charts | Zoom time axis (stretch) |

### 4.4 URL State

Encode minimal state in URL search params for shareability:
```
/simulate?seed=abc123&policy=27&targets=4,5&year=60
```

This allows sharing a specific simulation state. On load with params, skip narrative and jump to TIME_LOOP at the specified year.

---

## 5. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| `xs` | 0-374px | Single column. Compact metrics. Reduced font sizes. |
| `sm` | 375-639px | Single column. Standard mobile layout. |
| `md` | 640-767px | Tablet. 2-column metrics where applicable. |
| `lg` | 768-1023px | Tablet landscape. Charts can show 2-up. |
| `xl` | 1024-1279px | Desktop. Full layout. Side-by-side content. |
| `2xl` | 1280px+ | Wide desktop. Max-width container centered. |

### Critical Mobile Constraints (320px minimum)

- No horizontal overflow at any viewport width >= 320px
- All interactive elements >= 44x44px tap targets
- Text remains readable without zoom (min 13px)
- Charts legible at 320px (simplified axis labels, fewer grid lines)
- Bottom action bar fixed to viewport bottom (not scroll-dependent)
- Drawer becomes full-screen overlay on mobile

---

## 6. Loading, Error & Edge States

### 6.1 Loading States

| Scenario | Treatment |
|----------|-----------|
| Initial page load | CosmicBackground renders immediately. Content fades in after hydration (< 100ms perceived). |
| World generation | Instant (< 10ms). No loading indicator needed. |
| Time jump calculation | If > 50ms, show brief pulse on TimeDial. Target: < 100ms, so usually instant. |
| Chart rendering | Skeleton chart with shimmer lines until Recharts hydrates. Lazy loaded via `next/dynamic`. |
| Tab switch (charts) | Cross-fade with 100ms skeleton if data needs processing. |

### 6.2 Error States

| Scenario | Treatment |
|----------|-----------|
| React component crash | Error boundary catches. Show "Something went wrong" card with "Restart Simulation" button. Log error to console. |
| Invalid URL state params | Ignore invalid params, initialize fresh world. Show brief toast: "Invalid simulation link. Starting fresh." |
| Browser doesn't support required APIs | Graceful degradation: skip animations, use static charts. No error shown. |

### 6.3 Empty States

| Scenario | Treatment |
|----------|-----------|
| Charts at Year 0 | "Run the simulation to see data here" with illustration of empty chart + arrow pointing to TimeDial. |
| No history (back pressed at start) | Back button disabled + tooltip "No previous state". |
| Settings with no policy active | Settings drawer still shows controls. Slider at 0. Message: "Enable reservation to see these settings take effect." |

### 6.4 Edge Cases

| Scenario | Treatment |
|----------|-----------|
| Very rapid time advances | Debounce dial clicks (300ms). Queue advances if clicked during animation. |
| Year exceeds 200 | Allow but show "Metrics have largely stabilized" narrative. Charts continue to extend. |
| Browser back button | Treat as phase-back navigation within `/simulate`. If at INTRO, navigate to landing. |
| Screen resize mid-interaction | Charts and layout reflow responsively. Drawer closes if viewport exceeds mobile breakpoint while mobile drawer is open. |
| Slow device (animation jank) | Framer Motion's `useReducedMotion` hook detects. Falls back to CSS transitions. |
| User switches tab during narrative | Pause auto-advance timers. Resume on tab return. Use `document.visibilityState`. |

---

## 7. Accessibility Specification

### 7.1 WCAG AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| Color contrast 4.5:1 (text) | All text/bg combinations verified. `text-primary` on `bg-primary` = 14.5:1. `text-secondary` on `bg-primary` = 7.2:1. `text-muted` on `bg-primary` = 4.6:1. |
| Color contrast 3:1 (UI elements) | All borders, icons, and interactive element outlines meet 3:1 against backgrounds. |
| Focus indicators | 2px solid `border-focus` (#e2b714) with 2px offset on all focusable elements. Never suppressed. |
| Focus order | Logical tab order matches visual layout. No focus traps except in drawer (intentional trap). |
| Non-color indicators | Chart data also available as hidden table. Metric changes use arrows (↑/↓) in addition to green/red. |

### 7.2 ARIA Implementation

| Component | ARIA Pattern |
|-----------|--------------|
| TimeDial | `role="button"`, `aria-label="Advance time by {N} years. Current year: {year}"` |
| ClassPyramid tiers | `role="listitem"` within `role="list"`, `aria-label="{className}, {population}% of population"` |
| Slider | Native `<input type="range">` with `aria-valuetext` |
| Charts | `role="img"` + `aria-label` summary + hidden `<table>` with full data |
| Drawer | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Narrative screens | `role="status"`, `aria-live="polite"` for auto-advancing text |
| Tab bar (charts) | `role="tablist"` + `role="tab"` + `role="tabpanel"` |
| Metric cards | `aria-label="{metric}: {value}, changed by {delta}"` |
| Skip button | Visible always, `aria-label="Skip animation"` |

### 7.3 Reduced Motion

When `prefers-reduced-motion: reduce`:
- **Framer Motion**: Wrap in `<LazyMotion>` with `useReducedMotion()`. Replace spring/tween with instant or 100ms fade.
- **TimeDial**: No rotation animation. Year counter updates instantly.
- **Narrative text**: No type-out effect. Full text appears at once.
- **ClassPyramid**: No staggered build. All tiers appear at once.
- **CosmicBackground**: Stars are static (no animation).
- **Charts**: No animated transitions between data points.
- **Page transitions**: 100ms opacity cross-fade only.

### 7.4 Screen Reader Journey

A screen reader user should experience:
1. **Landing**: "Reservation Simulator. Experience how policy shapes society across generations. Button: Start Simulation."
2. **Intro**: "In a galaxy far away. On a planet called Zephyria-7. In the nation of Varnashrama Prime." (announced via `aria-live`)
3. **Trait reveal**: "Society is divided by: Those whose earlobes vibrate at 432Hz."
4. **Pyramid**: List of 5 classes with names and population percentages.
5. **Pre-reservation**: "The Frequency-Deaf: Poverty 65%, Education 3%, Employment 5%, Life expectancy 62 years."
6. **Choice**: Form with radio buttons, slider, checkboxes.
7. **Time loop**: "Year 20. 20 years have passed. Biggest improvement: Education for the Frequency-Deaf increased from 3% to 10%."
8. **Charts**: Data table with year-by-year values per class per metric.
9. **End summary**: "After 100 years. Key insight: Education access went from 3% to 28%."

---

## 8. Performance Budget

| Metric | Target | Enforcement |
|--------|--------|-------------|
| LCP (Landing) | < 2s | Lighthouse CI gate |
| FCP | < 1s | Lighthouse CI gate |
| CLS | < 0.1 | Reserve space for dynamic content |
| Bundle (gzipped) | < 200KB total | `next build` output check |
| Chart lazy chunk | < 60KB | `next/dynamic` code split |
| Framer Motion chunk | < 30KB | Tree-shake unused features |
| Time jump calc | < 100ms | `performance.now()` assertion in tests |
| Chart render | < 200ms | Measured via React Profiler |
| Animation FPS | 60fps | `will-change` on animated elements |

### Optimization Strategies
- Lazy-load `ChartsPanel` and `SettingsDrawer` via `next/dynamic({ ssr: false })`
- CosmicBackground: CSS-only (no JS animation library overhead)
- Recharts: Import only used chart types (no barrel import)
- Framer Motion: Use `LazyMotion` + `domAnimation` feature bundle
- Images: None required (all SVG/CSS)
- Fonts: Self-host Inter via `next/font/google`, preload subset

---

## 9. Component-to-File Mapping

| Component | File Path | PLAN.md Task |
|-----------|-----------|--------------|
| Button | `src/components/ui/Button.tsx` | Task 7 |
| CosmicBackground | `src/components/ui/CosmicBackground.tsx` | Task 7 |
| Drawer | `src/components/ui/Drawer.tsx` | Task 12 |
| GalaxyIntro | `src/components/narrative/GalaxyIntro.tsx` | Task 8 |
| TraitReveal | `src/components/narrative/TraitReveal.tsx` | Task 8 |
| PreReservationState | `src/components/narrative/PreReservationState.tsx` | Task 8 |
| NarrativeScreen | `src/components/narrative/NarrativeScreen.tsx` | Task 8 |
| ClassPyramid | `src/components/simulation/ClassPyramid.tsx` | Task 8 |
| ReservationChoice | `src/components/simulation/ReservationChoice.tsx` | Task 9 |
| ReservationSlider | `src/components/simulation/ReservationSlider.tsx` | Task 9 |
| TimeDial | `src/components/simulation/TimeDial.tsx` | Task 10 |
| MetricCard | `src/components/simulation/MetricCard.tsx` | Task 10 |
| TimeJumpNarrative | `src/components/simulation/TimeJumpNarrative.tsx` | Task 10 |
| ChartsPanel | `src/components/charts/ChartsPanel.tsx` | Task 11 |
| EducationChart | `src/components/charts/EducationChart.tsx` | Task 11 |
| EmploymentChart | `src/components/charts/EmploymentChart.tsx` | Task 11 |
| WealthChart | `src/components/charts/WealthChart.tsx` | Task 11 |
| PovertyChart | `src/components/charts/PovertyChart.tsx` | Task 11 |
| LifeExpectancyChart | `src/components/charts/LifeExpectancyChart.tsx` | Task 11 |
| TimelineScrubber | `src/components/charts/TimelineScrubber.tsx` | Task 11 |
| SettingsDrawer | `src/components/simulation/SettingsDrawer.tsx` | Task 12 |
| EndSummary | `src/components/simulation/EndSummary.tsx` | Task 13 |
| simulate/page.tsx | `src/app/simulate/page.tsx` | Task 10 |

---

## 10. Open Design Decisions

| Decision | Options | Recommendation | Owner |
|----------|---------|----------------|-------|
| Chart layout (desktop) | A) 2x2 grid + tab for 5th, B) 5-tab single | B) 5-tab single — cleaner, consistent with mobile | NalaN |
| TimeDial interaction | A) Click to advance, B) Drag to scrub | A) Click only for MVP — simpler, scrubbing in charts | NalaN |
| Celebration animation (EndSummary) | A) Confetti, B) Gold shimmer, C) None | B) Subtle gold shimmer on "Most Improved" card | NalaN |
| Sound effects | A) Ambient sci-fi, B) Dial click sounds, C) Silent | C) Silent for MVP. Phase 2 consideration. | JD |

---

*Generated for Phase 1 MVP. References: PLAN.md (18 tasks), PRD.md (US-1 through US-9), ARCHITECTURE.md, CALIBRATED-MODEL.md, RESEARCH.md, RESEARCH-BRIEF.md.*
