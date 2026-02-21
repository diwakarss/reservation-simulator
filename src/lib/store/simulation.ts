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
  ClassTier,
  ClassPolicy,
  ReservationPolicy,
  YearSnapshot,
  NarrativeHighlight,
} from '../simulation/types';
import {
  SimulationPhase,
  createDefaultReservationPolicy,
} from '../simulation/types';
import { generateWorld } from '../content/worldGenerator';
import {
  stepSimulation,
  captureSnapshot,
  findBiggestImprovement,
} from '../simulation/engine';
import {
  encodeStateToURL,
  parseURLParams,
  hasURLState,
} from './urlSync';

// =============================================================================
// Initial State
// =============================================================================

const DEFAULT_TIME_JUMP_SIZE = 20;
const STORAGE_KEY = 'reservation-simulator-state';
const VALID_TIME_JUMP_SIZES = [5, 10, 20] as const;
const EWS_ELIGIBLE_TIERS = new Set<ClassTier>(['upper', 'noble']);

const UI_CLOSED_STATE = {
  settingsOpen: false,
  chartsOpen: false,
  howItWorksOpen: false,
} as const;

/**
 * Returns the simulation phase mapped from year boundaries.
 */
function getPhaseForYear(year: number): SimulationPhase {
  if (year >= 100) return SimulationPhase.END_SUMMARY;
  if (year >= 80) return SimulationPhase.POLICY_REMOVAL;
  if (year >= 60) return SimulationPhase.POLICY_EWS;
  if (year >= 40) return SimulationPhase.POLICY_CREAMY_LAYER;
  if (year >= 20) return SimulationPhase.POLICY_MIDDLE;
  if (year > 0) return SimulationPhase.POLICY_BOTTOM_2;
  return SimulationPhase.INTRO;
}

/**
 * Build a baseline simulation state for a generated world.
 */
function createWorldState(world: NonNullable<SimulationState['world']>, policy: ReservationPolicy): SimulationState {
  return {
    phase: SimulationPhase.INTRO,
    world,
    currentYear: 0,
    policy,
    history: [],
    redoStack: [],
    highlight: null,
    timeJumpSize: DEFAULT_TIME_JUMP_SIZE,
    ...UI_CLOSED_STATE,
  };
}

/**
 * Returns an updated reservation policy by merging a partial class policy.
 */
function mergeClassPolicy(
  basePolicy: ReservationPolicy,
  tier: ClassTier,
  policyUpdate: Partial<ClassPolicy>
): ReservationPolicy {
  return {
    classes: {
      ...basePolicy.classes,
      [tier]: {
        ...basePolicy.classes[tier],
        ...policyUpdate,
      },
    },
  };
}

/**
 * Type guard for valid UI-supported time jump size.
 */
function isValidTimeJumpSize(years: number): years is (typeof VALID_TIME_JUMP_SIZES)[number] {
  return VALID_TIME_JUMP_SIZES.includes(years as (typeof VALID_TIME_JUMP_SIZES)[number]);
}

/**
 * Get the initial empty state before any world is generated.
 */
function getInitialState(): SimulationState {
  return {
    phase: SimulationPhase.INTRO,
    world: null,
    currentYear: 0,
    policy: createDefaultReservationPolicy(),
    history: [],
    redoStack: [],
    highlight: null,
    timeJumpSize: DEFAULT_TIME_JUMP_SIZE,
    ...UI_CLOSED_STATE,
  };
}

// =============================================================================
// Persist Configuration
// =============================================================================

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
      initializeWorld: (seed?: string, startAtIntro = true) => {
        const world = generateWorld(seed);
        const policy = createDefaultReservationPolicy();
        const baseState = createWorldState(world, policy);

        // Capture initial snapshot at year 0
        const initialSnapshot = captureSnapshot({
          ...baseState,
          phase: SimulationPhase.INTRO,
        });

        set({
          ...baseState,
          history: [initialSnapshot],
          // Start at INTRO phase so GalaxyIntro shows, unless explicitly skipped
          phase: startAtIntro ? SimulationPhase.INTRO : SimulationPhase.WORLD_GEN,
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
        set({ policy: mergeClassPolicy(state.policy, tier, policyUpdate) });
      },

      /**
       * Set creamy layer exclusion for a class.
       */
      setCreamyLayer: (tier: ClassTier, enabled: boolean, threshold: number) => {
        const state = get();
        set({
          policy: mergeClassPolicy(state.policy, tier, {
            creamyLayerEnabled: enabled,
            creamyLayerThreshold: threshold,
          }),
        });
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
        if (!EWS_ELIGIBLE_TIERS.has(tier)) {
          console.warn(`EWS is only applicable for 'upper' and 'noble' tiers, not '${tier}'`);
          return;
        }

        const state = get();
        set({
          policy: mergeClassPolicy(state.policy, tier, {
            ewsEnabled: enabled,
            ewsThreshold: threshold,
            ewsPercent,
          }),
        });
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

        // Run simulation using the engine's stepSimulation which returns full new state
        // We pass the current state and it returns the updated state (with history, year, etc)
        const newState = stepSimulation(state, years);

        set(newState);
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
        if (!isValidTimeJumpSize(years)) {
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

      /**
       * Open How It Works overlay.
       */
      openHowItWorks: () => {
        set({ howItWorksOpen: true, settingsOpen: false, chartsOpen: false });
      },

      /**
       * Close How It Works overlay.
       */
      closeHowItWorks: () => {
        set({ howItWorksOpen: false });
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

        // Create initial state object to pass to captureSnapshot
        let currentState = createWorldState(world, policy);

        // Capture initial snapshot
        const initialSnapshot = captureSnapshot(currentState);
        currentState.history = [initialSnapshot];

        // If we have a target year, run simulation to reach it
        if (urlState.year && urlState.year > 0) {
          currentState = stepSimulation(currentState, urlState.year);
        }

        currentState.phase = getPhaseForYear(currentState.currentYear);

        set(currentState);
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
