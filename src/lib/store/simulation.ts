/**
 * Zustand State Store for Reservation Simulator
 *
 * Centralized state management with:
 * - Persist middleware for localStorage backup
 * - URL state sync for shareable links
 * - Undo/redo for time jumps
 * - All actions from PRD FR-5
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  SimulationState,
  SimulationActions,
  SimulationStore,
  SimulationPhase,
  ClassTier,
  ClassPolicy,
  ReservationPolicy,
  YearSnapshot,
  NarrativeHighlight,
} from '../simulation/types';
import {
  createDefaultReservationPolicy,
  createDefaultClassPolicy,
} from '../simulation/types';
import { generateWorld } from '../content/worldGenerator';
import {
  stepSimulation,
  captureSnapshot,
  findBiggestImprovement,
  cloneClasses,
} from '../simulation/engine';
import type { SimulationInput } from '../simulation/engine';
import {
  encodeStateToURL,
  parseURLParams,
  hasURLState,
  decodePolicy,
} from './urlSync';

// =============================================================================
// Initial State
// =============================================================================

/**
 * Get the initial empty state before any world is generated.
 */
function getInitialState(): SimulationState {
  return {
    phase: 'INTRO' as SimulationPhase,
    world: null,
    currentYear: 0,
    policy: createDefaultReservationPolicy(),
    history: [],
    redoStack: [],
    highlight: null,
    timeJumpSize: 20,
    settingsOpen: false,
    chartsOpen: false,
  };
}

// =============================================================================
// Persist Configuration
// =============================================================================

const STORAGE_KEY = 'reservation-simulator-state';

/**
 * Properties to persist to localStorage.
 * We persist enough to restore the simulation state on page reload.
 */
type PersistedState = Pick<
  SimulationState,
  'world' | 'currentYear' | 'policy' | 'history' | 'timeJumpSize' | 'phase'
>;

// =============================================================================
// Store Implementation
// =============================================================================

/**
 * Main Zustand store with persist middleware.
 *
 * Features:
 * - Automatic localStorage persistence
 * - URL state hydration (overrides localStorage)
 * - Full undo/redo for time jumps
 * - Deterministic simulation stepping
 */
export const useSimulationStore = create<SimulationStore>()(
  persist(
    (set, get) => ({
      // =========================================================================
      // Initial State
      // =========================================================================
      ...getInitialState(),

      // =========================================================================
      // Initialization Actions
      // =========================================================================

      /**
       * Initialize a new world with optional seed.
       * If no seed provided, generates a random one.
       */
      initializeWorld: (seed?: string) => {
        const world = generateWorld(seed);
        const policy = createDefaultReservationPolicy();

        // Capture initial snapshot at year 0
        const initialSnapshot = captureSnapshot(0, world.classes, policy);

        set({
          world,
          currentYear: 0,
          policy,
          history: [initialSnapshot],
          redoStack: [],
          highlight: null,
          phase: 'WORLD_GEN' as SimulationPhase,
        });
      },

      /**
       * Full reset to initial state.
       * Clears world, history, and all settings.
       */
      reset: () => {
        set(getInitialState());
      },

      // =========================================================================
      // Phase Navigation
      // =========================================================================

      /**
       * Navigate to a specific simulation phase.
       */
      setPhase: (phase: SimulationPhase) => {
        set({ phase });
      },

      // =========================================================================
      // Policy Modification Actions
      // =========================================================================

      /**
       * Update policy for a specific class tier.
       * Merges partial policy with existing policy for that tier.
       */
      setClassPolicy: (tier: ClassTier, policyUpdate: Partial<ClassPolicy>) => {
        const state = get();
        const newPolicy: ReservationPolicy = {
          classes: {
            ...state.policy.classes,
            [tier]: {
              ...state.policy.classes[tier],
              ...policyUpdate,
            },
          },
        };
        set({ policy: newPolicy });
      },

      /**
       * Set creamy layer exclusion for a class.
       */
      setCreamyLayer: (tier: ClassTier, enabled: boolean, threshold: number) => {
        const state = get();
        const newPolicy: ReservationPolicy = {
          classes: {
            ...state.policy.classes,
            [tier]: {
              ...state.policy.classes[tier],
              creamyLayerEnabled: enabled,
              creamyLayerThreshold: threshold,
            },
          },
        };
        set({ policy: newPolicy });
      },

      /**
       * Set EWS policy for upper classes.
       * EWS is only applicable for 'upper' and 'noble' tiers.
       */
      setEWSPolicy: (
        tier: ClassTier,
        enabled: boolean,
        threshold: number,
        ewsPercent: number
      ) => {
        // Only allow EWS for upper tiers
        if (tier !== 'upper' && tier !== 'noble') {
          console.warn(`EWS is only applicable for 'upper' and 'noble' tiers, not '${tier}'`);
          return;
        }

        const state = get();
        const newPolicy: ReservationPolicy = {
          classes: {
            ...state.policy.classes,
            [tier]: {
              ...state.policy.classes[tier],
              ewsEnabled: enabled,
              ewsThreshold: threshold,
              ewsPercent: ewsPercent,
            },
          },
        };
        set({ policy: newPolicy });
      },

      /**
       * Clear all reservations across all classes.
       * Used for POLICY_REMOVAL "Remove All" action.
       */
      clearAllReservations: () => {
        set({ policy: createDefaultReservationPolicy() });
      },

      // =========================================================================
      // Time Manipulation Actions
      // =========================================================================

      /**
       * Advance simulation by specified number of years.
       * Runs the simulation engine and captures snapshot.
       */
      advanceTime: (years: number) => {
        const state = get();
        if (!state.world) {
          console.error('Cannot advance time: no world initialized');
          return;
        }

        const currentSnapshot = state.history[state.history.length - 1];
        if (!currentSnapshot) {
          console.error('Cannot advance time: no history available');
          return;
        }

        // Prepare simulation input
        const input: SimulationInput = {
          classes: cloneClasses(currentSnapshot.classes),
          year: state.currentYear,
          policy: state.policy,
          seed: state.world.seed,
          policyStartYear: 0, // TODO: Track actual policy start year
        };

        // Run simulation
        const result = stepSimulation(input, years);

        // Capture new snapshot
        const newSnapshot = captureSnapshot(result.year, result.classes, state.policy);

        // Find highlight for narrative
        const highlight = findBiggestImprovement(currentSnapshot, newSnapshot);

        // Update state (clear redo stack on new action)
        set({
          currentYear: result.year,
          history: [...state.history, newSnapshot],
          redoStack: [], // Clear redo stack when taking new action
          highlight,
        });
      },

      /**
       * Undo last time jump.
       * Pops from history and pushes to redo stack.
       */
      goBack: () => {
        const state = get();

        // Need at least 2 snapshots to go back (keep initial)
        if (state.history.length <= 1) {
          return;
        }

        const poppedSnapshot = state.history[state.history.length - 1];
        const newHistory = state.history.slice(0, -1);
        const previousSnapshot = newHistory[newHistory.length - 1];

        // Compute highlight between new current and previous
        let highlight: NarrativeHighlight | null = null;
        if (newHistory.length >= 2) {
          const before = newHistory[newHistory.length - 2];
          highlight = findBiggestImprovement(before, previousSnapshot);
        }

        set({
          currentYear: previousSnapshot.year,
          policy: previousSnapshot.policy,
          history: newHistory,
          redoStack: [...state.redoStack, poppedSnapshot],
          highlight,
        });
      },

      /**
       * Redo last undone time jump.
       * Pops from redo stack and pushes to history.
       */
      goForward: () => {
        const state = get();

        if (state.redoStack.length === 0) {
          return;
        }

        const redoSnapshot = state.redoStack[state.redoStack.length - 1];
        const newRedoStack = state.redoStack.slice(0, -1);

        // Compute highlight
        const currentSnapshot = state.history[state.history.length - 1];
        const highlight = currentSnapshot
          ? findBiggestImprovement(currentSnapshot, redoSnapshot)
          : null;

        set({
          currentYear: redoSnapshot.year,
          policy: redoSnapshot.policy,
          history: [...state.history, redoSnapshot],
          redoStack: newRedoStack,
          highlight,
        });
      },

      /**
       * Set the time jump size (5, 10, or 20 years).
       */
      setTimeJumpSize: (years: number) => {
        if (years !== 5 && years !== 10 && years !== 20) {
          console.warn(`Invalid time jump size: ${years}. Must be 5, 10, or 20.`);
          return;
        }
        set({ timeJumpSize: years });
      },

      // =========================================================================
      // Overlay Actions
      // =========================================================================

      /**
       * Open settings drawer.
       */
      openSettingsDrawer: () => {
        set({ settingsOpen: true, chartsOpen: false });
      },

      /**
       * Close settings drawer.
       */
      closeSettingsDrawer: () => {
        set({ settingsOpen: false });
      },

      /**
       * Open charts panel.
       */
      openChartsPanel: () => {
        set({ chartsOpen: true, settingsOpen: false });
      },

      /**
       * Close charts panel.
       */
      closeChartsPanel: () => {
        set({ chartsOpen: false });
      },

      // =========================================================================
      // URL Sync Actions
      // =========================================================================

      /**
       * Hydrate state from URL parameters.
       * Re-runs simulation to reach the target year.
       *
       * This is called on app mount to restore state from shared URL.
       */
      hydrateFromURL: (params: URLSearchParams) => {
        const urlState = parseURLParams(params);

        // If no URL state, don't hydrate
        if (!urlState.seed) {
          return;
        }

        // Generate world with the seed
        const world = generateWorld(urlState.seed);

        // Use policy from URL or default
        const policy = urlState.policy || createDefaultReservationPolicy();

        // Capture initial snapshot
        const initialSnapshot = captureSnapshot(0, world.classes, policy);
        const history: YearSnapshot[] = [initialSnapshot];

        let currentYear = 0;
        let currentClasses = world.classes;
        let highlight: NarrativeHighlight | null = null;

        // If we have a target year, run simulation to reach it
        if (urlState.year && urlState.year > 0) {
          const input: SimulationInput = {
            classes: cloneClasses(world.classes),
            year: 0,
            policy,
            seed: world.seed,
            policyStartYear: 0,
          };

          const result = stepSimulation(input, urlState.year);
          currentYear = result.year;
          currentClasses = result.classes;

          // Capture final snapshot
          const finalSnapshot = captureSnapshot(currentYear, currentClasses, policy);
          history.push(finalSnapshot);

          // Compute highlight
          highlight = findBiggestImprovement(initialSnapshot, finalSnapshot);
        }

        // Determine phase based on year
        let phase: SimulationPhase = 'INTRO' as SimulationPhase;
        if (currentYear >= 100) {
          phase = 'END_SUMMARY' as SimulationPhase;
        } else if (currentYear >= 80) {
          phase = 'POLICY_REMOVAL' as SimulationPhase;
        } else if (currentYear >= 60) {
          phase = 'POLICY_EWS' as SimulationPhase;
        } else if (currentYear >= 40) {
          phase = 'POLICY_CREAMY_LAYER' as SimulationPhase;
        } else if (currentYear >= 20) {
          phase = 'POLICY_MIDDLE' as SimulationPhase;
        } else if (currentYear > 0) {
          phase = 'POLICY_BOTTOM_2' as SimulationPhase;
        }

        set({
          world,
          currentYear,
          policy,
          history,
          redoStack: [],
          highlight,
          phase,
        });
      },

      /**
       * Encode current state to URL query string.
       * Returns the query string without the leading '?'.
       */
      encodeStateToURL: () => {
        const state = get();
        if (!state.world) {
          return '';
        }

        return encodeStateToURL({
          seed: state.world.seed,
          year: state.currentYear,
          policy: state.policy,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedState => ({
        world: state.world,
        currentYear: state.currentYear,
        policy: state.policy,
        history: state.history,
        timeJumpSize: state.timeJumpSize,
        phase: state.phase,
      }),
    }
  )
);

// =============================================================================
// Selectors (Derived State)
// =============================================================================

/**
 * Get the current snapshot from history.
 */
export function getCurrentSnapshot(state: SimulationState): YearSnapshot | null {
  return state.history[state.history.length - 1] || null;
}

/**
 * Get the current classes from the latest snapshot.
 */
export function getCurrentClasses(state: SimulationState) {
  const snapshot = getCurrentSnapshot(state);
  return snapshot?.classes || state.world?.classes || [];
}

/**
 * Check if redo is available.
 */
export function canRedo(state: SimulationState): boolean {
  return state.redoStack.length > 0;
}

/**
 * Check if undo is available.
 */
export function canUndo(state: SimulationState): boolean {
  return state.history.length > 1;
}

/**
 * Get simulation progress as percentage (0-100).
 */
export function getProgress(state: SimulationState): number {
  return Math.min(100, state.currentYear);
}

/**
 * Check if simulation is complete (year >= 100).
 */
export function isComplete(state: SimulationState): boolean {
  return state.currentYear >= 100;
}

// =============================================================================
// Hydration Helper
// =============================================================================

/**
 * Initialize store from URL or localStorage.
 *
 * Bootstrap precedence order:
 * 1. URL params (if present)
 * 2. localStorage persisted state (automatic via persist middleware)
 * 3. Fresh state (user initiates via initializeWorld)
 *
 * Call this on app mount.
 */
export function initializeFromBootstrap(): void {
  // Check if we have URL params
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);

    if (hasURLState(params)) {
      // URL takes precedence over localStorage
      useSimulationStore.getState().hydrateFromURL(params);
    }
    // Otherwise, persist middleware will have already restored from localStorage
  }
}

// =============================================================================
// Store Hooks (for convenience)
// =============================================================================

/**
 * Hook to get current snapshot.
 */
export function useCurrentSnapshot() {
  return useSimulationStore((state) => getCurrentSnapshot(state));
}

/**
 * Hook to get current classes.
 */
export function useCurrentClasses() {
  return useSimulationStore((state) => getCurrentClasses(state));
}

/**
 * Hook to check if redo is available.
 */
export function useCanRedo() {
  return useSimulationStore((state) => canRedo(state));
}

/**
 * Hook to check if undo is available.
 */
export function useCanUndo() {
  return useSimulationStore((state) => canUndo(state));
}

/**
 * Hook to get simulation progress.
 */
export function useProgress() {
  return useSimulationStore((state) => getProgress(state));
}
