# Task 12 - Settings Drawer (US-8)

## What was implemented
- Added reusable right-side `Drawer` component in `src/components/ui/Drawer.tsx`.
- Added `SettingsDrawer` in `src/components/simulation/SettingsDrawer.tsx` with:
  - reservation slider (`0-50%`),
  - target class checkboxes for Classes 3/4/5 only (`middle`, `common`, `lower`),
  - time jump options (`5/10/20`),
  - reset-to-defaults action.
- Added explicit UX message: changes affect future years only.
- Integrated drawer into policy flow by wiring `PolicyLayout` settings button to store `openSettingsDrawer` fallback and rendering `SettingsDrawer` in `PolicyLayout`.
- Exported new components through barrel files:
  - `src/components/ui/index.ts`
  - `src/components/simulation/index.ts`

## Accessibility behavior
- Drawer is dismissible via:
  - Escape key,
  - close button,
  - backdrop click.
- Added keyboard focus trap while drawer is open.
- Body scroll is locked while open.

## Tests
- Added `src/components/simulation/__tests__/SettingsDrawer.test.tsx` covering:
  - open/close behavior,
  - slider updates policy state,
  - reset restores defaults,
  - mid-simulation policy changes affecting future snapshots only.
- Ran:
  - `npm run test:run -- src/components/simulation/__tests__/SettingsDrawer.test.tsx` (pass)

## Notes
- Existing repository-wide `type-check` and some legacy store tests have unrelated pre-existing failures; task-12-specific tests pass.
