# Adversarial Review (Round 4)

**Reviewer:** Gemini (nalan-e0c941d7)
**Date:** 2026-02-19
**Verdict:** **NEEDS_WORK**

## Executive Summary
The plan is comprehensive and well-structured, covering all key aspects of the MVP. However, a **CRITICAL** issue in Task 1 will likely block execution immediately: `create-next-app` requires an empty directory, but the target directory already contains `.planning`. Additionally, there is a configuration mismatch regarding Tailwind v4.

## Prioritized Findings

### 🔴 CRITICAL (Blocks Execution)

#### 1. Task 1: `create-next-app` Directory Conflict
- **Location:** Task 1, Action 1
- **Issue:** The command `npx create-next-app@latest reservation-simulator ...` will fail or behave unexpectedly because the `projects/reservation-simulator` directory already exists and contains the `.planning` folder. `create-next-app` enforces an empty directory. If run inside the existing directory, it will create a nested `reservation-simulator/reservation-simulator` folder.
- **Risk:** Immediate failure of the first task or incorrect project structure.
- **Recommendation:**
  - **Option A (Preferred):** Update Task 1 to run `create-next-app` in a temporary directory (e.g., `projects/reservation-simulator-temp`) and then move the contents (hidden files included) to `projects/reservation-simulator`, overwriting as needed but preserving `.planning`.
  - **Option B:** Switch to manual setup: `npm init -y`, `npm install next react react-dom ...`, and manually creating `src/app/layout.tsx`, etc.

### 🟠 HIGH (Likely to Cause Issues)

#### 2. Tailwind v4 vs. v3 Configuration Mismatch
- **Location:** Task 1, Files Created
- **Issue:** The plan specifies **Tailwind CSS 4.x** (Tech Stack table) but lists `tailwind.config.ts` as a created file. Tailwind v4 moves configuration to CSS (using `@theme` blocks in `globals.css`) and does not strictly require a JS/TS config file unless legacy compatibility is needed.
- **Risk:** Confusion during implementation. If the agent installs v4 but tries to configure it like v3, it may encounter deprecation warnings or silent failures.
- **Recommendation:**
  - Explicitly choose: **Tailwind v4 (CSS-first)** or **Tailwind v3.4 (Config-first)**.
  - If v4: Remove `tailwind.config.ts` from the file list and update Action 5 to "Configure Tailwind variables in `src/styles/globals.css`".
  - If v3.4: Change the version in the Tech Stack table to `3.4.x`. (v3 is more stable for an MVP).

### 🟡 MEDIUM (Should Fix)

#### 3. State Persistence (UX Issue)
- **Location:** Task 6 (Zustand Store)
- **Issue:** There is no mention of `persist` middleware.
- **Risk:** If the user refreshes the page (or if the browser unloads the tab), the simulation progress is lost. For a 100-year simulation, this is a poor user experience.
- **Recommendation:** Add `zustand/middleware` `persist` to Task 6 actions to save the `SimulationState` to `localStorage`.

#### 4. Ambiguity of Mid-Simulation Policy Changes
- **Location:** Task 12 (Settings Drawer)
- **Issue:** The plan allows changing the reservation policy via the drawer. It says "Changes apply immediately".
- **Risk:** It is unclear if this retroactively changes history (impossible without re-simulating) or only affects *future* time steps.
- **Recommendation:** Clarify in Task 12 that settings changes apply to **future** time steps only. This is a feature, not a bug, but the logic in `engine.ts` must support dynamic policy parameters passed to `stepSimulation`.

### 🔵 LOW (Nice to Have)

#### 5. Type Definition Completeness
- **Location:** Task 2
- **Issue:** `SimulationState` is listed but its relationship to `history` is implicit.
- **Recommendation:** Explicitly state that `SimulationState` includes `history: YearSnapshot[]` to avoid ambiguity in Task 6.

## Verification of UI Artifacts
- **UI-SPEC.md:** Solid. Covers all necessary states and visual language.
- **UI-PLAYGROUND.html:** Excellent artifact. Correctly implements the spec's design tokens and layout logic. The "Desktop vs Mobile" split view is very helpful for verification.

## Next Actions
1.  **Update Task 1** to handle the non-empty directory issue.
2.  **Clarify Tailwind version** and configuration method.
3.  **Add persistence** to Task 6.
