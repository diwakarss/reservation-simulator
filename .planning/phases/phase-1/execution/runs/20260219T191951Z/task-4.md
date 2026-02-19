# Task 4: Content Loader & World Generation — Implementation Notes

## Status: COMPLETE ✓

## Files Implemented

### `src/lib/content/traits.ts`
- Loads `src/data/traits.json` (100 traits) via typed import
- `getAllTraits()` — returns full trait array
- `getTraitCategories()` — returns unique category set
- `getTraitsByCategory(category)` — filters by TraitCategory enum
- `getTraitById(id)` — lookup by ID
- `pickRandomTrait(rng)` — seed-driven random selection
- `pickRandomTraitByCategory(category, rng)` — category-scoped random selection
- `getTraitCount()` — convenience count helper

### `src/lib/content/classNames.ts`
- `getClassName(trait, tier)` — returns `"${PREFIX} ${trait.classNames[tier]}"` (e.g. "Upper Harmonics")
- `getAllClassNames(trait)` — generates all 5 display names for a trait
- `validateTraitClassNames(trait)` — checks all 5 names present, non-empty, ≤12 chars
- `hasUniqueClassNames(trait)` — ensures no duplicate suffixes within a trait
- Uses `CLASS_TIER_PREFIXES` from `types.ts` for canonical prefix strings

### `src/lib/content/worldGenerator.ts`
- `createSeededRNG(seed)` — mulberry32 PRNG; deterministic for same seed string
- `generateRandomSeed()` — 8-char alphanumeric seed via `Math.random()`
- `generateWorld(seed?)` — full WorldConfig: galaxy/planet/nation names + trait + 5 classes
- `validateWorldConfig(world)` — validates class count, population sum (100), wealth sum (100), metric bounds
- Exports initial condition constants (`INITIAL_EDUCATION`, `INITIAL_EMPLOYMENT`, etc.) from CALIBRATED-MODEL.md §1
- Re-exports `createSeededRNG` as `createRNG` for convenience

## Key Design Decisions

1. **Mulberry32 PRNG** — simple, fast, and produces identical sequences for the same seed. Seed is hashed from string using djb2-style `Math.imul`.

2. **Initial conditions follow CALIBRATED-MODEL.md §1** exactly:
   - Lower (Class 5): education=3%, employment=5%, poverty=65%, lifeExpectancy=62, income=500₢
   - Upper (Class 1): education=45%, employment=80%, poverty=5%, lifeExpectancy=72, income=40000₢

3. **Wealth shares sum to 100** (45+25+18+9+3=100) — enforced at generation and validated.

4. **Population sums to 100** (10+20+30+25+15=100) — validated in `validateWorldConfig`.

## Tests

All tests pass (74/74 total across 3 test files):

- `worldGenerator.test.ts` — 37 tests covering:
  - Deterministic RNG (same seed → same sequence)
  - World generation determinism (same seed → same world)
  - Correct initial conditions for all 6 metrics per tier
  - Population and wealth sums to 100
  - Display name format validation
  - `validateWorldConfig` edge cases (out-of-bounds, missing classes, negative income)

- `dataIntegrity.test.ts` — 3 tests (Task 3 data verification):
  - 100 traits, 20 per category
  - All traits have 5 unique class names ≤12 chars
  - World name pools have 30+ entries each

- `engine.test.ts` — 34 tests (Task 5 simulation engine, not task 4 scope but passing)

## Acceptance Criteria

- [x] Deterministic world generation with seed
- [x] 5 classes generated with correct initial conditions from calibrated model
- [x] Class names follow "Prefix + UniqueName" format
- [x] All 5 class names within a trait are unique
- [x] All tests pass (74/74)
