/**
 * Store module exports
 *
 * Re-exports the Zustand store and URL sync utilities.
 */

// Main store
export {
  useSimulationStore,
  initializeFromBootstrap,
  // Selectors
  getCurrentSnapshot,
  getCurrentClasses,
  canRedo,
  canUndo,
  getProgress,
  isComplete,
  // Convenience hooks
  useCurrentSnapshot,
  useCurrentClasses,
  useCanRedo,
  useCanUndo,
  useProgress,
} from './simulation';

// URL sync
export {
  encodeStateToURL,
  parseURLParams,
  encodePolicy,
  decodePolicy,
  hasURLState,
  getShareableURL,
  getURLSearchParams,
  updateBrowserURL,
  clearBrowserURL,
} from './urlSync';

// Re-export types
export type { URLState, EncodeParams } from './urlSync';
