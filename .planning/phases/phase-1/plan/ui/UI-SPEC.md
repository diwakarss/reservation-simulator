# UI Specification: Reservation Simulator MVP (v2)

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

### 1.2 Class Color System

| Class | Tier Prefix | Color | Hex |
|-------|-------------|-------|-----|
| Class 1 (Top) | **Upper** | Gold | `#e2b714` |
| Class 2 | **Noble** | Teal | `#2dd4bf` |
| Class 3 | **Middle** | Blue | `#60a5fa` |
| Class 4 | **Common** | Purple | `#a78bfa` |
| Class 5 (Bottom) | **Lower** | Red | `#e94560` |

### 1.3 Class Naming Convention (REQUIRED)

All generated class names MUST follow this format:
- **Format**: `[Prefix] [UniqueClassName]` (exactly 2 words)
- **Each class has a UNIQUE fictional name** (not the same base name for all tiers)
- **Examples** (for a "Frequency" trait):
  - Upper **Harmonics** (elite, resonating at perfect cosmic frequency)
  - Noble **Melodics** (high-born, attuned to celestial tones)
  - Middle **Acoustics** (ordinary, hearing the common sounds)
  - Common **Statics** (masses, picking up background noise)
  - Lower **Discordants** (outcasts, frequency-deaf)

**Implementation**:
- Each trait in `traits.json` defines 5 unique class names
- The names should satirically reflect the tier hierarchy
- Upper classes get grandiose names; lower classes get diminutive names
- **Max length**: 12 characters for the unique class name suffix (not including prefix)
  - Full display name max: 18 characters (e.g., "Common Scroungers" = 17 chars)
  - Enforced in traits.json validation and content authoring
  - Prevents layout overflow on 390px mobile width

**More Examples**:

| Trait Theme | Upper | Noble | Middle | Common | Lower |
|-------------|-------|-------|--------|--------|-------|
| Earlobes | Upper **Resonants** | Noble **Vibrants** | Middle **Oscillants** | Common **Buzzers** | Lower **Deaflings** |
| Food | Upper **Gourmands** | Noble **Cuisiniers** | Middle **Diners** | Common **Eaters** | Lower **Scroungers** |
| Time | Upper **Eternals** | Noble **Chronarchs** | Middle **Temporals** | Common **Moments** | Lower **Fleetics** |
| Color | Upper **Prismatix** | Noble **Spectrals** | Middle **Huelords** | Common **Tinters** | Lower **Colorblind** |

The prefix (Upper/Noble/Middle/Common/Lower) provides immediate clarity about class hierarchy, while the unique fictional name adds character and memorability.

### 1.4 Typography

| Element | Font | Weight | Size (Desktop) | Size (Mobile) |
|---------|------|--------|----------------|---------------|
| Page title | Orbitron | 700 | 56px | 36px |
| Section heading | Orbitron | 600 | 32px | 24px |
| Card heading | Rajdhani | 600 | 22px | 18px |
| Body | Rajdhani | 400 | 18px | 16px |
| Narrative text | Orbitron | 300 | 32px | 22px |
| Metric value | Orbitron | 700 | 42px | 32px |
| Caption/label | Rajdhani | 500 | 14px | 13px |
| Explanation text | Rajdhani | 400 | 16px | 14px |

**Font Stack**:
- **Orbitron**: Sci-fi display font for titles, metrics, narrative reveals
- **Rajdhani**: Clean, futuristic sans-serif for body text and UI

Load via `next/font/google`.

### 1.5 Currency Symbol

Use a **universal made-up currency symbol** across all simulations:
- **Symbol**: `₢` (Unicode U+20A2, Cruzeiro sign) or custom SVG
- **Display**: `₢1,000` for income thresholds
- **Name**: "Credits" (for narrative text)

### 1.6 Spacing Scale

Base unit: 4px (Tailwind defaults).

| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | 4px | Icon gaps |
| `space-sm` | 8px | Compact padding |
| `space-md` | 16px | Default padding |
| `space-lg` | 24px | Section padding |
| `space-xl` | 32px | Page margins (desktop) |
| `space-2xl` | 48px | Section separation |

### 1.7 Motion & Animation

#### Text Reveal Animation
- **Line-by-line reveal**: Each line fades in sequentially
- **Timing**: 400ms fade-in per line, 200ms delay between lines
- **Easing**: `ease-out`

#### Narrative Screens
- Lines reveal one at a time with dramatic pacing
- Minimum 1s between auto-advances
- Skip button always available

#### Reduced Motion
- Replace animations with instant opacity changes
- Keep 100ms cross-fades for basic transitions

---

## 2. Simulation Flow (6-Screen Guided Journey)

The simulation is NOT a single choice screen. It's a **guided narrative journey** through policy decisions over 100 years.

### 2.1 Flow Overview

```
INTRO → WORLD_GEN → TRAIT_REVEAL → PRE_RESERVATION
                                          ↓
                              POLICY_SCREEN_1 (Year 0-20)
                                          ↓
                              POLICY_SCREEN_2 (Year 20-40)
                                          ↓
                              POLICY_SCREEN_3 (Year 40-60)
                                          ↓
                              POLICY_SCREEN_4 (Year 60-80)
                                          ↓
                              POLICY_SCREEN_5 (Year 80-100)
                                          ↓
                              END_SUMMARY (Year 100)
```

At any point after POLICY_SCREEN_1, users can:
- Open **Settings Drawer** (bypass simulation, manual control)
- Open **Charts Panel** (view current state)
- Access **"How It Works"** overlay

### 2.2 Phase Enum

```typescript
enum SimulationPhase {
  INTRO,
  WORLD_GEN,           // Non-visual, <500ms
  TRAIT_REVEAL,
  PRE_RESERVATION,
  POLICY_BOTTOM_2,     // Year 0: Bottom 2 classes
  POLICY_MIDDLE,       // Year 20: Middle class
  POLICY_CREAMY_LAYER, // Year 40: Creamy layer exclusion
  POLICY_EWS,          // Year 60: EWS reservation
  POLICY_REMOVAL,      // Year 80: Removal protests
  END_SUMMARY,         // Year 100: Final results
  CHARTS,              // Overlay (doesn't interrupt flow)
  SETTINGS             // Overlay (doesn't interrupt flow)
}
```

---

## 3. Screen Specifications

### 3.1 Landing Page (`/`)

**Layout**: Full viewport, centered content, CosmicBackground.

**Typography**: Orbitron for title (sci-fi feel).

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              [CosmicBackground]                 │
│                                                 │
│         ╔═══════════════════════════╗           │
│         ║  RESERVATION SIMULATOR    ║ ← Orbitron│
│         ║  (glow animation)         ║           │
│         ╠═══════════════════════════╣           │
│         ║  Experience how policy    ║ ← Rajdhani│
│         ║  shapes society across    ║           │
│         ║  generations...           ║           │
│         ╠═══════════════════════════╣           │
│         ║  [  START SIMULATION  ]   ║ ← CTA     │
│         ╚═══════════════════════════╝           │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 3.2 INTRO Phase (GalaxyIntro)

**Line-by-line reveal animation**:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                                                 │
│         In a galaxy far away...                 │ ← Line 1 fades in
│                                                 │   (400ms)
│         On a planet called ZEPHYRIA-7...        │ ← Line 2 fades in
│                                                 │   (400ms delay)
│         In the nation of VARNASHRAMA PRIME...   │ ← Line 3 fades in
│                                                 │
│         There lived a divided people...         │ ← Line 4 fades in
│                                                 │
│                              [Skip →]           │
└─────────────────────────────────────────────────┘
```

- Each line fades in with 400ms animation
- 200ms delay between lines
- Planet/Nation names in `accent-gold`
- Auto-advance after all lines shown + 2s hold

### 3.3 TRAIT_REVEAL Phase

**Line-by-line dramatic reveal**:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│    The people were divided by one sacred truth: │ ← Line 1
│                                                 │
│    ════════════════════════════════════════     │
│                                                 │
│    "Those whose earlobes vibrate at             │ ← Line 2 (typing)
│     exactly 432Hz were chosen by the cosmos"    │
│                                                 │
│                              [Continue →]       │
└─────────────────────────────────────────────────┘
```

Then: ClassPyramid reveal

```
┌─────────────────────────────────────────────────┐
│   And so, society was ordered:                  │
│                                                 │
│   ┌───────────────────────────────────────┐     │
│   │ Upper Resonants              │  10%   │     │ ← Gold
│   ├─────────────────────────────────┤           │
│   │ Noble Resonants            │  20%     │     │ ← Teal
│   ├───────────────────────────┤                 │
│   │ Middle Resonants        │  30%        │     │ ← Blue
│   ├─────────────────────┤                       │
│   │ Common Resonants   │  25%             │     │ ← Purple
│   ├───────────────┤                             │
│   │ Lower Resonants │  15%                │     │ ← Red
│   └───────────────┘                             │
│                                                 │
│                              [Continue →]       │
└─────────────────────────────────────────────────┘
```

### 3.4 PRE_RESERVATION Phase

Show metrics with **explanations** for each:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   Meanwhile, at the bottom of society...        │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │  THE LOWER RESONANTS (15% of population) │  │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   ┌────────────┐ ┌────────────┐                 │
│   │ POVERTY    │ │ EDUCATION  │                 │
│   │   65%      │ │    3%      │                 │
│   │ ⓘ % living │ │ ⓘ % with   │                 │
│   │ below      │ │ access to  │                 │
│   │ ₢500/month │ │ schools    │                 │
│   └────────────┘ └────────────┘                 │
│                                                 │
│   ┌────────────┐ ┌────────────┐                 │
│   │ EMPLOYMENT │ │ LIFE EXP.  │                 │
│   │    5%      │ │  62 years  │                 │
│   │ ⓘ % with   │ │ ⓘ Average  │                 │
│   │ formal     │ │ lifespan   │                 │
│   │ jobs       │ │            │                 │
│   └────────────┘ └────────────┘                 │
│                                                 │
│   ── Meanwhile, the Upper Resonants: ──         │
│   Education: 45%  |  Poverty: 5%  |  Life: 78yr │
│                                                 │
│                              [Continue →]       │
└─────────────────────────────────────────────────┘
```

### 3.5 POLICY_BOTTOM_2 (Year 0 → Year 20)

**First policy decision: Bottom 2 classes**

```
┌─────────────────────────────────────────────────┐
│                        Year 0                   │
│                                                 │
│   The Lower and Common classes are struggling.  │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ ⓘ WHAT IS RESERVATION?                  │   │
│   │                                         │   │
│   │ Reservation guarantees a percentage of  │   │
│   │ education seats and jobs for            │   │
│   │ disadvantaged groups, helping them      │   │
│   │ access opportunities historically       │   │
│   │ denied to them.                         │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   Do you want to provide reservation for the    │
│   bottom 2 classes?                             │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ LOWER RESONANTS (15% of population)     │   │
│   │ Reservation %: [●────────────] 27%      │   │
│   │ ⓘ 4% of population will benefit         │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ COMMON RESONANTS (25% of population)    │   │
│   │ Reservation %: [●────────────] 15%      │   │
│   │ ⓘ 4% of population will benefit         │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   [  APPLY & ADVANCE 20 YEARS  →  ]             │
│   [  Skip reservation, continue without  ]      │
│                                                 │
│   [?] How it works     [⚙] Settings             │
└─────────────────────────────────────────────────┘
```

**Key elements**:
- Per-class sliders (0-50%)
- Show % of total population that will benefit
- Explanation of what reservation means

### 3.6 POLICY_MIDDLE (Year 20 → Year 40)

**After 20 years: Show progress, ask about Middle class**

```
┌─────────────────────────────────────────────────┐
│                       Year 20                   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ 📊 20 YEARS OF PROGRESS                 │   │
│   │                                         │   │
│   │ Due to reservation policies:            │   │
│   │                                         │   │
│   │ LOWER RESONANTS:                        │   │
│   │ • Education: 3% → 12% ↑                 │   │
│   │ • Poverty: 65% → 52% ↓                  │   │
│   │ • Employment: 5% → 14% ↑                │   │
│   │                                         │   │
│   │ COMMON RESONANTS:                       │   │
│   │ • Education: 10% → 18% ↑                │   │
│   │ • Poverty: 45% → 38% ↓                  │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ ⚠️ BUT THE MIDDLE CLASS IS STRUGGLING   │   │
│   │                                         │   │
│   │ MIDDLE RESONANTS:                       │   │
│   │ • Education: 20% → 22% (minimal gain)   │   │
│   │ • Poverty: 25% → 24% (stagnant)         │   │
│   │ • They receive no reservation benefits  │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   Do you want to extend reservation to the      │
│   Middle class?                                 │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ MIDDLE RESONANTS (30% of population)    │   │
│   │ Reservation %: [──────────────] 0%      │   │
│   │ ⓘ 0% of population will benefit         │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   [  APPLY & ADVANCE 20 YEARS  →  ]             │
│                                                 │
│   [?] How it works   [📊] Charts   [⚙] Settings │
└─────────────────────────────────────────────────┘
```

### 3.7 POLICY_CREAMY_LAYER (Year 40 → Year 60)

**Upper classes demand Creamy Layer exclusion**

```
┌─────────────────────────────────────────────────┐
│                       Year 40                   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ 📊 40 YEARS OF PROGRESS                 │   │
│   │                                         │   │
│   │ The lower 3 classes have improved:      │   │
│   │                                         │   │
│   │ LOWER: Education 3% → 22%               │   │
│   │ COMMON: Education 10% → 28%             │   │
│   │ MIDDLE: Education 20% → 32%             │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ 🗣️ THE UPPER CLASSES ARE PROTESTING     │   │
│   │                                         │   │
│   │ "The wealthy among the lower classes    │   │
│   │  are taking all the benefits while the  │   │
│   │  truly poor remain neglected!"          │   │
│   │                                         │   │
│   │ They demand CREAMY LAYER exclusion.     │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ ⓘ WHAT IS CREAMY LAYER?                 │   │
│   │                                         │   │
│   │ Creamy Layer excludes beneficiaries     │   │
│   │ whose family income exceeds a threshold │   │
│   │ from reservation benefits.              │   │
│   │                                         │   │
│   │ The idea: Let the poorest benefit first │   │
│   │ Reality: Often used to dilute policy    │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   Apply Creamy Layer exclusion?                 │
│                                                 │
│   Income threshold: ₢ [──●────────] 5,000/month │
│                                                 │
│   ☑ Apply to LOWER class                        │
│   ☑ Apply to COMMON class                       │
│   ☑ Apply to MIDDLE class                       │
│                                                 │
│   [  APPLY & ADVANCE 20 YEARS  →  ]             │
│   [  Reject creamy layer demand  ]              │
│                                                 │
│   [?] How it works   [📊] Charts   [⚙] Settings │
└─────────────────────────────────────────────────┘
```

### 3.8 POLICY_EWS (Year 60 → Year 80)

**Upper castes demand their own reservation (EWS)**

```
┌─────────────────────────────────────────────────┐
│                       Year 60                   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ 📊 60 YEARS OF PROGRESS                 │   │
│   │                                         │   │
│   │ LOWER: Edu 3%→35%, Poverty 65%→28%      │   │
│   │ COMMON: Edu 10%→38%, Poverty 45%→22%    │   │
│   │ MIDDLE: Edu 20%→42%, Poverty 25%→15%    │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ ⚠️ IMPORTANT COMPARISON                 │   │
│   │                                         │   │
│   │ Average income per capita:              │   │
│   │                                         │   │
│   │ UPPER class:  ₢ 45,000/month            │   │
│   │ NOBLE class:  ₢ 28,000/month            │   │
│   │ ─────────────────────────────           │   │
│   │ MIDDLE class: ₢ 12,000/month            │   │
│   │ COMMON class: ₢  6,500/month            │   │
│   │ LOWER class:  ₢  3,200/month            │   │
│   │                                         │   │
│   │ Even after 60 years, the Upper class    │   │
│   │ earns 14x more than the Lower class.    │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ 🗣️ THE UPPER CLASSES DEMAND EWS         │   │
│   │                                         │   │
│   │ "We also have poor people! Give us      │   │
│   │  reservation for our Economically       │   │
│   │  Weaker Sections!"                      │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ ⓘ WHAT IS EWS RESERVATION?              │   │
│   │                                         │   │
│   │ EWS (Economically Weaker Section) is    │   │
│   │ reservation for upper castes who are    │   │
│   │ below a certain income threshold.       │   │
│   │                                         │   │
│   │ Critics call it a "side door" for       │   │
│   │ upper castes to enjoy reservation       │   │
│   │ benefits without acknowledging caste    │   │
│   │ discrimination.                         │   │
│   │                                         │   │
│   │ See: India's EWS controversy (2019)     │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   Provide EWS reservation for Upper classes?    │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ UPPER RESONANTS                         │   │
│   │ EWS threshold: ₢ [────●─────] 8,000/mo  │   │
│   │ EWS %: [────●─────] 10%                 │   │
│   │ ⓘ 1% of population will benefit         │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ NOBLE RESONANTS                         │   │
│   │ EWS threshold: ₢ [────●─────] 8,000/mo  │   │
│   │ EWS %: [────●─────] 10%                 │   │
│   │ ⓘ 2% of population will benefit         │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   [  APPLY & ADVANCE 20 YEARS  →  ]             │
│   [  Reject EWS demand  ]                       │
│                                                 │
│   [?] How it works   [📊] Charts   [⚙] Settings │
└─────────────────────────────────────────────────┘
```

### 3.9 POLICY_REMOVAL (Year 80 → Year 100)

**Protests to remove reservation**

```
┌─────────────────────────────────────────────────┐
│                       Year 80                   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ 🗣️ PROTESTS ACROSS THE NATION           │   │
│   │                                         │   │
│   │ "Reservation has fulfilled its purpose! │   │
│   │  The lower classes are educated now.    │   │
│   │  End this discrimination against merit!"│   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   ┌─────────────────────────────────────────────┐
│   │ 📊 YEAR 0 vs YEAR 80 COMPARISON             │
│   ├───────────────┬───────────┬─────────────────┤
│   │ Class         │ Year 0    │ Year 80         │
│   ├───────────────┼───────────┼─────────────────┤
│   │ UPPER         │           │                 │
│   │ Education     │ 45%       │ 48%             │
│   │ Poverty       │ 5%        │ 4%              │
│   │ Income/month  │ ₢40,000   │ ₢52,000         │
│   ├───────────────┼───────────┼─────────────────┤
│   │ LOWER         │           │                 │
│   │ Education     │ 3%        │ 42%      ↑↑↑    │
│   │ Poverty       │ 65%       │ 22%      ↓↓↓    │
│   │ Income/month  │ ₢500      │ ₢4,200   ↑↑     │
│   └───────────────┴───────────┴─────────────────┘
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ ⓘ THE GAP REMAINS                       │   │
│   │                                         │   │
│   │ While Lower class improved dramatically │   │
│   │ their income is still only 8% of Upper. │   │
│   │                                         │   │
│   │ Full economic parity would take another │   │
│   │ 100+ years at current rates.            │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   What do you want to do?                       │
│                                                 │
│   [  REMOVE ALL RESERVATIONS  ]                 │
│   [  CONTINUE WITH CURRENT POLICY  →  ]         │
│   [  ADJUST PERCENTAGES  ]                      │
│                                                 │
│   [?] How it works   [📊] Charts   [⚙] Settings │
└─────────────────────────────────────────────────┘
```

### 3.10 END_SUMMARY (Year 100)

**Final results with all policy decisions**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│            AFTER 100 YEARS...                   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ YOUR POLICY DECISIONS                   │   │
│   │                                         │   │
│   │ Year 0:  Reservation for Lower (27%)    │   │
│   │          Reservation for Common (15%)   │   │
│   │ Year 20: Extended to Middle (10%)       │   │
│   │ Year 40: Creamy layer applied           │   │
│   │ Year 60: EWS rejected                   │   │
│   │ Year 80: Continued reservation          │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ ★ KEY INSIGHT                           │   │
│   │                                         │   │
│   │ Education access for Lower Deaflings    │   │
│   │ went from 3% to 52%, while poverty      │   │
│   │ dropped from 65% to 18%.                │   │
│   │                                         │   │
│   │ However, the Upper Harmonics income is  │   │
│   │ still 6x higher than Lower Deaflings.   │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   ── FINAL CLASS-BY-CLASS RESULTS ──            │
│                                                 │
│   ┌──────────────────────────────────────────┐  │
│   │ 🏆 MOST IMPROVED: LOWER RESONANTS        │  │
│   ├──────────────────────────────────────────┤  │
│   │ Metric      │ Year 0  │ Year 100 │ Change│  │
│   ├─────────────┼─────────┼──────────┼───────┤  │
│   │ Education   │   3%    │   52%    │ +49%  │  │
│   │ Employment  │   5%    │   48%    │ +43%  │  │
│   │ Poverty     │  65%    │   18%    │ -47%  │  │
│   │ Life Exp.   │  62yr   │   72yr   │ +10yr │  │
│   │ Income      │ ₢500    │ ₢6,800   │ +13x  │  │
│   └──────────────────────────────────────────┘  │
│                                                 │
│   [Show all classes ▼]                          │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │  [  TRY DIFFERENT POLICIES  ]           │   │
│   │  [  NEW WORLD  ]                        │   │
│   │  [  VIEW FULL CHARTS  ]                 │   │
│   │  [  READ WHITEPAPER  ]                  │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 4. Settings Drawer (Overlay)

The Settings Drawer can be pulled up **at any time** after the first policy screen.

### 4.1 Behavior
- Does NOT interrupt simulation flow
- Shows current settings at that point in time
- Manual edits are saved and affect future simulation steps
- Simulation stays paused at current step when drawer is open

### 4.2 Layout

```
┌─────────────────────────────────────────────────┐
│  ╳  SETTINGS                      Year: 40      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ── RESERVATION PERCENTAGES ──                  │
│                                                 │
│  LOWER RESONANTS                                │
│  [────────────●────] 27%                        │
│  Creamy layer: ☑ Threshold: ₢5,000              │
│                                                 │
│  COMMON RESONANTS                               │
│  [────────────●────] 15%                        │
│  Creamy layer: ☑ Threshold: ₢5,000              │
│                                                 │
│  MIDDLE RESONANTS                               │
│  [──────●──────────] 10%                        │
│  Creamy layer: ☑ Threshold: ₢5,000              │
│                                                 │
│  NOBLE RESONANTS (EWS only)                     │
│  [──────────────────] 0%                        │
│  EWS threshold: ₢8,000                          │
│                                                 │
│  UPPER RESONANTS (EWS only)                     │
│  [──────────────────] 0%                        │
│  EWS threshold: ₢8,000                          │
│                                                 │
│  ── TIME CONTROLS ──                            │
│                                                 │
│  Current Year: 40                               │
│  Jump to: [──●────────────────] Year 40         │
│                                                 │
│  Jump Size: ○ 5yr  ● 10yr  ○ 20yr               │
│                                                 │
│  ── ACTIONS ──                                  │
│                                                 │
│  [  VIEW CHARTS  ]                              │
│  [  RESET TO DEFAULTS  ]                        │
│                                                 │
│  ⓘ Changes will affect future years only.      │
│    Past history remains unchanged.              │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 5. Charts Panel (Overlay)

### 5.1 Behavior
- Does NOT interrupt simulation flow
- Shows charts at current simulation time
- Can be opened from any policy screen

### 5.2 Chart Types

| Metric | Chart Type | Rationale |
|--------|------------|-----------|
| Education | Multi-line chart | Track trends over time per class |
| Employment | Multi-line chart | Track trends over time per class |
| Poverty | Grouped bar chart | Compare classes at each time point |
| Wealth Distribution | Pie chart | Show relative shares (sums to 100%) |
| Income Distribution | Box plot / Distribution | Show spread within classes |
| Life Expectancy | Multi-line chart | Track trends over time per class |
| Population | Stacked area chart | Show demographic shifts |

### 5.3 Responsive Layout

| Viewport | Columns | Layout |
|----------|---------|--------|
| Mobile (<640px) | 1 | Single chart with tab navigation |
| Tablet (640-1024px) | 2 | 2x3 grid |
| Desktop (>1024px) | 3 | 3x2 grid or 2x3 grid |

### 5.4 Chart Panel Layout

```
┌─────────────────────────────────────────────────┐
│  ← Back to Simulation               Year: 0-60  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │ EDUCATION   │ │ EMPLOYMENT  │ │ POVERTY     ││
│  │ [Line chart]│ │ [Line chart]│ │ [Bar chart] ││
│  │             │ │             │ │             ││
│  └─────────────┘ └─────────────┘ └─────────────┘│
│                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │ WEALTH      │ │ INCOME DIST │ │ LIFE EXP.   ││
│  │ [Pie chart] │ │ [Box plot]  │ │ [Line chart]││
│  │             │ │             │ │             ││
│  └─────────────┘ └─────────────┘ └─────────────┘│
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │ ○────────────●────────────○  Year: 40    │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ● Upper  ● Noble  ● Middle  ● Common  ● Lower │
└─────────────────────────────────────────────────┘
```

### 5.5 Explanations on Charts

Every chart must include:
- **Title**: What this metric measures
- **Hover tooltip**: Exact values at that point
- **Legend**: Class names with colors
- **Y-axis label**: Units (%, years, ₢)
- **Info icon (ⓘ)**: Click for detailed explanation

---

## 6. "How It Works" Overlay

Available on every simulation screen via `[?]` button.

```
┌─────────────────────────────────────────────────┐
│  ╳  HOW THE SIMULATION WORKS                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  This simulation models how reservation         │
│  policies affect different social classes       │
│  over time.                                     │
│                                                 │
│  ── THE METRICS ──                              │
│                                                 │
│  📚 EDUCATION: % of class with access to        │
│     education. Reservation increases access     │
│     by guaranteeing seats.                      │
│                                                 │
│  💼 EMPLOYMENT: % with formal jobs. Follows     │
│     education with a ~5 year lag.               │
│                                                 │
│  💰 WEALTH: Share of total economy. Changes     │
│     slowly as education/employment improve.     │
│                                                 │
│  📉 POVERTY: % living below ₢500/month.         │
│     Decreases as employment increases.          │
│                                                 │
│  ❤️ LIFE EXPECTANCY: Average lifespan.          │
│     Improves with education and wealth.         │
│                                                 │
│  ── THE MATH ──                                 │
│                                                 │
│  Each year, we calculate:                       │
│                                                 │
│  New Education = Old + (Reservation% × 0.003)   │
│  New Employment = f(Education, Reservation)     │
│  New Poverty = Old - (Education + Employment)   │
│                                                 │
│  Full formulas in the whitepaper.               │
│                                                 │
│  [  VIEW WHITEPAPER  ]                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 7. Component Inventory

### 7.1 New/Updated Components

| Component | Description | PLAN.md Task |
|-----------|-------------|--------------|
| `PolicyScreen` | Reusable screen for each policy decision point | Task 9 |
| `ReservationSlider` | Per-class slider + options | Task 9 |
| `ProgressCard` | Before/after comparison card | Task 9 |
| `ExplanationBox` | Info box with ⓘ icon | Task 9 |
| `PolicyToggle` | For creamy layer/EWS toggles with threshold slider | Task 9 |
| `ComparisonTable` | Year 0 vs Year N table | Task 9 |
| `HowItWorksOverlay` | Calculation explanation modal | Task 8 |
| `WhitepaperLink` | Link to detailed methodology | Task 13 |

### 7.2 Chart Components

| Component | Chart Type |
|-----------|------------|
| `EducationChart` | Multi-line (Recharts) |
| `EmploymentChart` | Multi-line (Recharts) |
| `PovertyChart` | Grouped bar (Recharts) |
| `WealthPieChart` | Pie chart (Recharts) |
| `IncomeDistributionChart` | Box plot or violin |
| `LifeExpectancyChart` | Multi-line (Recharts) |
| `PopulationChart` | Stacked area (Recharts) |

---

## 8. Accessibility

### 8.1 WCAG AA Compliance
- All text meets 4.5:1 contrast ratio
- Focus indicators on all interactive elements
- Reduced motion support

### 8.2 Screen Reader Support
- Every explanation box is `aria-describedby` linked
- Charts have hidden data tables
- Progress announcements via `aria-live`

### 8.3 Keyboard Navigation
- Tab through all controls
- Arrow keys for sliders
- Escape to close overlays
- Enter/Space to advance

---

## 9. Performance Budget

| Metric | Target |
|--------|--------|
| LCP | < 2s |
| Bundle (gzipped) | < 200KB |
| Chart render | < 200ms |
| Time calculation | < 100ms |

---

## 10. Open Design Decisions

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Font choice | Orbitron + Rajdhani vs. custom | Orbitron + Rajdhani (free, sci-fi aesthetic) |
| Currency symbol | ₢ vs custom SVG | ₢ (Cruzeiro, readily available) |
| EWS explanation | Neutral vs. critical | Critical (matches satirical tone) |
| Whitepaper format | PDF vs. web page | Web page (SEO, accessibility) |

---

*v2 — Redesigned based on JD feedback (2026-02-19)*
*References: JD-FEEDBACK.md, PLAN.md, PRD.md, CALIBRATED-MODEL.md*
