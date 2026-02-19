# JD Feedback on UI/UX Design

**Date:** 2026-02-19
**Status:** To be incorporated into UI-SPEC.md and UI-PLAYGROUND.html

---

## Visual Design

### Typography
- Current fonts look too ordinary, don't match cosmic sci-fi theme
- Need distinctive fonts that feel alien/futuristic

### Animations
- Add text reveal animations (line-by-line reveals)
- Intro screen: reveal one line at a time with dramatic effect

---

## Class Naming Convention

### Prefix System (REQUIRED)
Class names MUST use these prefixes for clarity:
- **Class 1**: "Upper [Name]" (e.g., "Upper Chromatics")
- **Class 2**: "Noble [Name]" (e.g., "Noble Chromatics")
- **Class 3**: "Middle [Name]" (e.g., "Middle Chromatics")
- **Class 4**: "Common [Name]" (e.g., "Common Chromatics")
- **Class 5**: "Lower [Name]" (e.g., "Lower Chromatics")

### Name Length
- Maximum 2 words: Prefix + Name
- No long compound names

---

## Reservation Flow (MAJOR REDESIGN)

### Current Problem
- Single screen is too simplistic
- Users don't understand what they're doing
- No progressive narrative

### New Multi-Screen Flow

#### Screen 1: Initial Choice (Year 0)
- "Do you want to provide reservation to the bottom 2 classes?"
- Select percentage for Class 4 and Class 5
- Show % of population that will benefit

#### Screen 2: Progress Check (Year 20)
- Show: "Due to reservations, bottom 2 have seen X progress in Y sectors"
- Show: "But Middle class is still languishing with X factors"
- Ask: "Do you want to provide reservations for Middle class?"
- If yes, set percentage for Class 3

#### Screen 3: Creamy Layer Demand (Year 40)
- Show progress of lower 3 classes
- "The Upper classes are seeing lower 3 developing"
- "They demand Creamy Layer exclusion"
- Explain what Creamy Layer is (excludes wealthy beneficiaries)
- Ask: "Do you want to apply Creamy Layer?"

#### Screen 4: EWS Demand (Year 60)
- "Upper 2 classes demand their own reservation (EWS)"
- **HIGHLIGHT**: Average GDP per capita of Upper is STILL higher than Lower 3 even after 60 years
- Explain EWS: "Economically Weaker Section - a side door for upper castes" (reference India's EWS controversy)
- User can set:
  - Income threshold for EWS eligibility
  - EWS reservation percentage

#### Screen 5: Removal Protests (Year 80)
- "Protests to remove reservations - they've fulfilled their purpose"
- Show comparison: Year 0 vs Year 80 for each class
- Key metrics comparison
- Ask: "Remove reservations or continue/adjust percentages?"

#### Screen 6: Final Summary (Year 100)
- Show complete progress due to all policy decisions
- Per-class breakdown with all metrics
- Link to whitepaper

---

## Per-Class Reservation Settings

### Each class can have:
- Individual reservation percentage (0-50%)
- Creamy layer exclusion toggle
- EWS eligibility (for upper classes)
- Income threshold setting

### Always Show
- % of population that will benefit from policy

---

## Currency

- Use a **standard made-up currency symbol** across all worlds
- Consistent across all simulations

---

## Settings Drawer

### Behavior
- Can be pulled up at ANY time
- Does NOT disturb simulation flow
- Shows current status at that point in time
- Manual edits are saved and affect future simulation steps

### Features
- All reservation percentages (per-class)
- Creamy layer toggle
- EWS settings
- Time dial (manual jump)
- "View Charts" button

---

## Charts Panel

### Chart Types (use appropriate type per metric)
- Pie charts
- Line graphs
- Distribution charts
- Bar charts

### Layout
- Responsive columns (more columns on bigger screens)
- Single column on mobile

### Behavior
- Shows charts at current simulation time
- Does not disturb simulation flow

---

## Educational Requirements

### "How It Works" Link
- Available on every simulation screen
- Simple explanation of calculation methodology
- Accessible to non-technical audience

### Per-Field Explanations
- Every field should explain what it is
- Every result should show how it changed
- Every metric should explain WHY it changed

### Target Audience
- "Cater to the dumbest audience who have no idea how and why reservations work"
- Satirical presentation
- Maximum information density with clarity

---

## End Screen

### Requirements
- Final summary of all decisions
- Per-class outcomes
- Link to whitepaper

---

## Technical Notes

- Settings and Charts are overlay screens (don't interrupt simulation state)
- Simulation pauses at whatever step user left it
- When simulation resumes, it uses saved settings

---

## Action Items

1. [ ] Update UI-SPEC.md with new flow
2. [ ] Update UI-PLAYGROUND.html with new designs
3. [ ] Review with JD
4. [ ] Incorporate final feedback into PLAN.md
