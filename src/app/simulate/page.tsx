'use client';

/**
 * Main Simulation Page - Phase Router
 *
 * Orchestrates all 12 simulation phases by routing to the correct component
 * based on the current SimulationPhase from the Zustand store.
 *
 * Architecture: Container/Presentational pattern
 * - Main component (SimulatePage) manages phase state and overlays
 * - Connected wrapper components handle store subscriptions
 * - Policy components are presentational, driven by props
 *
 * Performance optimizations:
 * - Charts panel lazy loaded (heavy recharts dependency)
 * - Animations use will-change for GPU acceleration
 */

import { useEffect, useState, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore, initializeFromBootstrap } from '@/lib/store';
import { SimulationPhase, YearSnapshot, ClassTier } from '@/lib/simulation/types';

// Constants
const POLICY_PHASE_ADVANCE_YEARS = 20; // Years advanced per policy decision

// Narrative components
import {
  GalaxyIntro,
  TraitReveal,
  TimeMachineDial,
} from '@/components/narrative';

// Policy components
import {
  PolicyBottom2 as PolicyBottom2Base,
  PolicyMiddle as PolicyMiddleBase,
  PolicyCreamyLayer as PolicyCreamyLayerBase,
  PolicyEWS as PolicyEWSBase,
  PolicyRemoval as PolicyRemovalBase,
} from '@/components/policy';

// Simulation components
import { SettingsDrawer } from '@/components/simulation';

// End summary component
import { EndSummary } from '@/components/simulation/EndSummary';

// Error boundary and overlays
import { ErrorBoundary, HowItWorksOverlay } from '@/components/ui';

// Lazy load ChartsPanel (heavy recharts dependency)
const ChartsPanel = dynamic(
  () => import('@/components/charts/ChartsPanel').then((mod) => mod.ChartsPanel),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-deep-purple">
        <div className="text-center">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-3 border-accent-gold border-t-transparent mx-auto" />
          <p className="font-rajdhani text-muted-text text-sm">Loading charts...</p>
        </div>
      </div>
    ),
  }
);

/**
 * Loading spinner for world generation phase
 * Shows when WORLD_GEN takes > 200ms
 */
function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-deep-purple">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-accent-gold border-t-transparent mx-auto" />
        <p className="font-rajdhani text-muted-text">Generating world...</p>
      </div>
    </div>
  );
}

/**
 * Snapshot access helper - returns the latest snapshot from history
 */
function getLatestSnapshot(history: YearSnapshot[]): YearSnapshot {
  return history[history.length - 1];
}

/**
 * Centralized store action subscriptions
 * Reduces duplication across connected wrappers
 */
function useStoreActions() {
  return {
    world: useSimulationStore((state) => state.world),
    policy: useSimulationStore((state) => state.policy),
    history: useSimulationStore((state) => state.history),
    setClassPolicy: useSimulationStore((state) => state.setClassPolicy),
    setCreamyLayer: useSimulationStore((state) => state.setCreamyLayer),
    setEWSPolicy: useSimulationStore((state) => state.setEWSPolicy),
    clearAllReservations: useSimulationStore((state) => state.clearAllReservations),
    advanceTime: useSimulationStore((state) => state.advanceTime),
    setPhase: useSimulationStore((state) => state.setPhase),
    openSettingsDrawer: useSimulationStore((state) => state.openSettingsDrawer),
    openChartsPanel: useSimulationStore((state) => state.openChartsPanel),
    openHowItWorks: useSimulationStore((state) => state.openHowItWorks),
  };
}

/**
 * PolicyBottom2Connected - Container component
 * Manages store subscriptions and transitions to PolicyMiddle phase
 */
function PolicyBottom2Connected({ onTriggerTimeMachine }: { onTriggerTimeMachine: (startYear: number, endYear: number, onComplete: () => void) => void }) {
  const { world, policy, setClassPolicy, advanceTime, setPhase, openSettingsDrawer, openChartsPanel, openHowItWorks } =
    useStoreActions();
  const currentYear = useSimulationStore((state) => state.currentYear);

  if (!world) return null;

  const handleAdvance = () => {
    const startYear = currentYear;
    const endYear = currentYear + POLICY_PHASE_ADVANCE_YEARS;
    onTriggerTimeMachine(startYear, endYear, () => {
      advanceTime(POLICY_PHASE_ADVANCE_YEARS);
      setPhase(SimulationPhase.POLICY_MIDDLE);
    });
  };

  const handleSkip = () => {
    setClassPolicy('lower', { reservationPercent: 0 });
    setClassPolicy('common', { reservationPercent: 0 });
    const startYear = currentYear;
    const endYear = currentYear + POLICY_PHASE_ADVANCE_YEARS;
    onTriggerTimeMachine(startYear, endYear, () => {
      advanceTime(POLICY_PHASE_ADVANCE_YEARS);
      setPhase(SimulationPhase.POLICY_MIDDLE);
    });
  };

  return (
    <PolicyBottom2Base
      classes={world.classes}
      lowerPolicy={policy.classes.lower}
      commonPolicy={policy.classes.common}
      onLowerPolicyChange={(value) => setClassPolicy('lower', { reservationPercent: value })}
      onCommonPolicyChange={(value) => setClassPolicy('common', { reservationPercent: value })}
      onAdvance={handleAdvance}
      onSkip={handleSkip}
      onHowItWorks={openHowItWorks}
      onSettings={openSettingsDrawer}
      onCharts={openChartsPanel}
    />
  );
}

/**
 * PolicyMiddleConnected - Container component
 * Manages store subscriptions, provides year 0 and current snapshots for comparison
 * Transitions to PolicyCreamyLayer phase
 */
function PolicyMiddleConnected({ onTriggerTimeMachine }: { onTriggerTimeMachine: (startYear: number, endYear: number, onComplete: () => void) => void }) {
  const { world, policy, history, setClassPolicy, advanceTime, setPhase, openSettingsDrawer, openChartsPanel, openHowItWorks } =
    useStoreActions();
  const currentYear = useSimulationStore((state) => state.currentYear);

  // Require history to have at least 2 entries (year 0 and year 20)
  if (!world || history.length < 2) return null;

  const previousSnapshot = history[0];
  const currentSnapshot = getLatestSnapshot(history);

  const handleAdvance = () => {
    const startYear = currentYear;
    const endYear = currentYear + POLICY_PHASE_ADVANCE_YEARS;
    onTriggerTimeMachine(startYear, endYear, () => {
      advanceTime(POLICY_PHASE_ADVANCE_YEARS);
      setPhase(SimulationPhase.POLICY_CREAMY_LAYER);
    });
  };

  return (
    <PolicyMiddleBase
      classes={currentSnapshot.classes}
      previousSnapshot={previousSnapshot}
      middlePolicy={policy.classes.middle}
      lowerReservation={policy.classes.lower.reservationPercent}
      commonReservation={policy.classes.common.reservationPercent}
      onMiddlePolicyChange={(value) => setClassPolicy('middle', { reservationPercent: value })}
      onAdvance={handleAdvance}
      onHowItWorks={openHowItWorks}
      onSettings={openSettingsDrawer}
      onCharts={openChartsPanel}
    />
  );
}

/**
 * PolicyCreamyLayerConnected - Container component
 * Manages creamy layer policy state, allows enabling/disabling creamy layer
 * Transitions to PolicyEWS phase
 */
function PolicyCreamyLayerConnected({ onTriggerTimeMachine }: { onTriggerTimeMachine: (startYear: number, endYear: number, onComplete: () => void) => void }) {
  const { world, policy, history, setCreamyLayer, advanceTime, setPhase, openSettingsDrawer, openChartsPanel, openHowItWorks } =
    useStoreActions();
  const currentYear = useSimulationStore((state) => state.currentYear);

  // Need at least 3 snapshots: year 0, year 20, year 40
  if (!world || history.length < 3) return null;

  const previousSnapshot = history[history.length - 2]; // Year 20 snapshot
  const currentSnapshot = getLatestSnapshot(history);

  const handleAdvance = () => {
    const startYear = currentYear;
    const endYear = currentYear + POLICY_PHASE_ADVANCE_YEARS;
    onTriggerTimeMachine(startYear, endYear, () => {
      advanceTime(POLICY_PHASE_ADVANCE_YEARS);
      setPhase(SimulationPhase.POLICY_EWS);
    });
  };

  const handleReject = () => {
    // Disable creamy layer for all classes
    setCreamyLayer('lower', false, 0);
    setCreamyLayer('common', false, 0);
    setCreamyLayer('middle', false, 0);
    const startYear = currentYear;
    const endYear = currentYear + POLICY_PHASE_ADVANCE_YEARS;
    onTriggerTimeMachine(startYear, endYear, () => {
      advanceTime(POLICY_PHASE_ADVANCE_YEARS);
      setPhase(SimulationPhase.POLICY_EWS);
    });
  };

  return (
    <PolicyCreamyLayerBase
      classes={currentSnapshot.classes}
      previousSnapshot={previousSnapshot}
      policies={policy.classes}
      onCreamyLayerToggle={(tier, enabled) => setCreamyLayer(tier, enabled, policy.classes[tier].creamyLayerThreshold)}
      onCreamyLayerThresholdChange={(tier, threshold) => setCreamyLayer(tier, policy.classes[tier].creamyLayerEnabled, threshold)}
      onAdvance={handleAdvance}
      onReject={handleReject}
      onHowItWorks={openHowItWorks}
      onSettings={openSettingsDrawer}
      onCharts={openChartsPanel}
    />
  );
}

/**
 * PolicyEWSConnected - Container component
 * Manages EWS (Economically Weaker Section) policy for upper classes
 * Transitions to PolicyRemoval phase
 */
function PolicyEWSConnected({ onTriggerTimeMachine }: { onTriggerTimeMachine: (startYear: number, endYear: number, onComplete: () => void) => void }) {
  const { world, policy, history, setEWSPolicy, advanceTime, setPhase, openSettingsDrawer, openChartsPanel, openHowItWorks } =
    useStoreActions();
  const currentYear = useSimulationStore((state) => state.currentYear);

  if (!world || history.length < 2) return null;

  const currentSnapshot = getLatestSnapshot(history);

  const handleAdvance = () => {
    const startYear = currentYear;
    const endYear = currentYear + POLICY_PHASE_ADVANCE_YEARS;
    onTriggerTimeMachine(startYear, endYear, () => {
      advanceTime(POLICY_PHASE_ADVANCE_YEARS);
      setPhase(SimulationPhase.POLICY_REMOVAL);
    });
  };

  const handleReject = () => {
    // Disable EWS for upper classes
    setEWSPolicy('upper', false, 0, 0);
    setEWSPolicy('noble', false, 0, 0);
    const startYear = currentYear;
    const endYear = currentYear + POLICY_PHASE_ADVANCE_YEARS;
    onTriggerTimeMachine(startYear, endYear, () => {
      advanceTime(POLICY_PHASE_ADVANCE_YEARS);
      setPhase(SimulationPhase.POLICY_REMOVAL);
    });
  };

  return (
    <PolicyEWSBase
      classes={currentSnapshot.classes}
      policies={policy.classes}
      onEWSToggle={(tier, enabled) => setEWSPolicy(tier, enabled, policy.classes[tier].ewsThreshold, policy.classes[tier].ewsPercent)}
      onEWSThresholdChange={(tier, threshold) => setEWSPolicy(tier, policy.classes[tier].ewsEnabled, threshold, policy.classes[tier].ewsPercent)}
      onEWSPercentChange={(tier, percent) => setEWSPolicy(tier, policy.classes[tier].ewsEnabled, policy.classes[tier].ewsThreshold, percent)}
      onAdvance={handleAdvance}
      onReject={handleReject}
      onHowItWorks={openHowItWorks}
      onSettings={openSettingsDrawer}
      onCharts={openChartsPanel}
    />
  );
}

/**
 * PolicyRemovalConnected - Container component
 * Final policy decision: remove all, continue with current, or adjust percentages
 * Provides year 0 snapshot for comparison with final state
 * Transitions to END_SUMMARY phase
 */
function PolicyRemovalConnected({ onTriggerTimeMachine }: { onTriggerTimeMachine: (startYear: number, endYear: number, onComplete: () => void) => void }) {
  const { world, history, clearAllReservations, advanceTime, setPhase, openSettingsDrawer, openChartsPanel, openHowItWorks } =
    useStoreActions();
  const currentYear = useSimulationStore((state) => state.currentYear);

  if (!world || history.length < 2) return null;

  const year0Snapshot = history[0];
  const currentSnapshot = getLatestSnapshot(history);

  const handleRemoveAll = () => {
    clearAllReservations();
    const startYear = currentYear;
    const endYear = currentYear + POLICY_PHASE_ADVANCE_YEARS;
    onTriggerTimeMachine(startYear, endYear, () => {
      advanceTime(POLICY_PHASE_ADVANCE_YEARS);
      setPhase(SimulationPhase.END_SUMMARY);
    });
  };

  const handleContinue = () => {
    const startYear = currentYear;
    const endYear = currentYear + POLICY_PHASE_ADVANCE_YEARS;
    onTriggerTimeMachine(startYear, endYear, () => {
      advanceTime(POLICY_PHASE_ADVANCE_YEARS);
      setPhase(SimulationPhase.END_SUMMARY);
    });
  };

  const handleAdjust = () => {
    openSettingsDrawer();
  };

  return (
    <PolicyRemovalBase
      classes={currentSnapshot.classes}
      year0Snapshot={year0Snapshot}
      onRemoveAll={handleRemoveAll}
      onContinue={handleContinue}
      onAdjust={handleAdjust}
      onHowItWorks={openHowItWorks}
      onSettings={openSettingsDrawer}
      onCharts={openChartsPanel}
    />
  );
}

// Time machine animation state
interface TimeMachineState {
  isActive: boolean;
  startYear: number;
  endYear: number;
  onComplete: () => void;
}

export default function SimulatePage() {
  const phase = useSimulationStore((state) => state.phase);
  const world = useSimulationStore((state) => state.world);
  const currentYear = useSimulationStore((state) => state.currentYear);
  const settingsOpen = useSimulationStore((state) => state.settingsOpen);
  const chartsOpen = useSimulationStore((state) => state.chartsOpen);
  const howItWorksOpen = useSimulationStore((state) => state.howItWorksOpen);
  const setPhase = useSimulationStore((state) => state.setPhase);
  const closeChartsPanel = useSimulationStore((state) => state.closeChartsPanel);
  const closeHowItWorks = useSimulationStore((state) => state.closeHowItWorks);

  const [isInitialized, setIsInitialized] = useState(false);
  const [showWorldGenSpinner, setShowWorldGenSpinner] = useState(false);
  const [timeMachine, setTimeMachine] = useState<TimeMachineState | null>(null);

  // Helper to trigger time machine animation
  const triggerTimeMachine = useCallback((startYear: number, endYear: number, onComplete: () => void) => {
    setTimeMachine({ isActive: true, startYear, endYear, onComplete });
  }, []);

  const handleTimeMachineComplete = useCallback(() => {
    if (timeMachine?.onComplete) {
      timeMachine.onComplete();
    }
    setTimeMachine(null);
  }, [timeMachine]);

  // Bootstrap from URL or localStorage on mount
  // If no URL state, reset to INTRO phase to show the full intro sequence
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasURLParams = params.has('seed') || params.has('year') || params.has('policy');

    if (hasURLParams) {
      // URL state takes precedence - hydrate from URL
      initializeFromBootstrap();
    } else {
      // Fresh navigation - reset to INTRO phase and initialize world
      const store = useSimulationStore.getState();
      store.reset();
      store.initializeWorld();
    }
    setIsInitialized(true);
  }, []);

  /**
   * Handle WORLD_GEN phase - non-visual, auto-advances
   * Shows loading spinner if generation takes > 200ms
   * Auto-advances to TRAIT_REVEAL after 300ms delay
   */
  useEffect(() => {
    if (phase === SimulationPhase.WORLD_GEN) {
      const spinnerTimeout = setTimeout(() => {
        setShowWorldGenSpinner(true);
      }, 200); // Show spinner if generation takes longer than 200ms

      const advanceTimeout = setTimeout(() => {
        clearTimeout(spinnerTimeout);
        setShowWorldGenSpinner(false);
        setPhase(SimulationPhase.TRAIT_REVEAL);
      }, 300); // Minimum 300ms in WORLD_GEN phase for perception

      return () => {
        clearTimeout(spinnerTimeout);
        clearTimeout(advanceTimeout);
      };
    }
  }, [phase, setPhase]);

  // Phase transition handlers
  const handleIntroComplete = useCallback(() => {
    setPhase(SimulationPhase.WORLD_GEN);
  }, [setPhase]);

  const handleTraitRevealComplete = useCallback(() => {
    setPhase(SimulationPhase.POLICY_BOTTOM_2);
  }, [setPhase]);

  // If not initialized yet, show nothing to avoid flash
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-deep-purple">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
      </div>
    );
  }

  // World initialization is now handled in the useEffect above

  // Render loading spinner during WORLD_GEN if it takes > 200ms
  if (phase === SimulationPhase.WORLD_GEN && showWorldGenSpinner) {
    return <LoadingSpinner />;
  }

  // If world not ready yet, show loading
  if (!world) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-deep-purple">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
      </div>
    );
  }

  // Main phase router with animations
  const renderPhase = () => {
    switch (phase) {
      case SimulationPhase.INTRO:
        return (
          <GalaxyIntro
            key="intro"
            galaxyName={world.galaxyName}
            planetName={world.planetName}
            nationName={world.nationName}
            onComplete={handleIntroComplete}
          />
        );

      case SimulationPhase.WORLD_GEN:
        return null;

      case SimulationPhase.TRAIT_REVEAL:
        return (
          <TraitReveal
            key="trait-reveal"
            trait={world.trait}
            classes={world.classes}
            planetName={world.planetName}
            nationName={world.nationName}
            onComplete={handleTraitRevealComplete}
          />
        );

      case SimulationPhase.PRE_RESERVATION:
        // Skip PreReservationState - go directly to POLICY_BOTTOM_2
        setPhase(SimulationPhase.POLICY_BOTTOM_2);
        return null;

      case SimulationPhase.POLICY_BOTTOM_2:
        return <PolicyBottom2Connected key="policy-bottom-2" onTriggerTimeMachine={triggerTimeMachine} />;

      case SimulationPhase.POLICY_MIDDLE:
        return <PolicyMiddleConnected key="policy-middle" onTriggerTimeMachine={triggerTimeMachine} />;

      case SimulationPhase.POLICY_CREAMY_LAYER:
        return <PolicyCreamyLayerConnected key="policy-creamy-layer" onTriggerTimeMachine={triggerTimeMachine} />;

      case SimulationPhase.POLICY_EWS:
        return <PolicyEWSConnected key="policy-ews" onTriggerTimeMachine={triggerTimeMachine} />;

      case SimulationPhase.POLICY_REMOVAL:
        return <PolicyRemovalConnected key="policy-removal" onTriggerTimeMachine={triggerTimeMachine} />;

      case SimulationPhase.END_SUMMARY:
        return <EndSummary key="end-summary" />;

      case SimulationPhase.CHARTS:
        return <EndSummary key="end-summary-charts" />;

      case SimulationPhase.SETTINGS:
        return <EndSummary key="end-summary-settings" />;

      default:
        return (
          <GalaxyIntro
            key="intro-default"
            galaxyName={world.galaxyName}
            planetName={world.planetName}
            nationName={world.nationName}
            onComplete={handleIntroComplete}
          />
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-deep-purple">
        {/* Main phase content with transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
            style={{ willChange: 'opacity' }}
          >
            {renderPhase()}
          </motion.div>
        </AnimatePresence>

        {/* Settings Drawer Overlay */}
        {settingsOpen && <SettingsDrawer />}

        {/* How It Works Overlay */}
        <HowItWorksOverlay isOpen={howItWorksOpen} onClose={closeHowItWorks} />

        {/* Charts Panel Overlay - Lazy loaded */}
        <AnimatePresence>
          {chartsOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-deep-purple"
              style={{ willChange: 'opacity' }}
            >
              <Suspense fallback={
                <div className="flex min-h-screen items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-3 border-accent-gold border-t-transparent" />
                </div>
              }>
                <ChartsPanel onClose={closeChartsPanel} />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Time Machine Dial Animation */}
        <AnimatePresence>
          {timeMachine?.isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ willChange: 'opacity' }}
            >
              <TimeMachineDial
                startYear={timeMachine.startYear}
                endYear={timeMachine.endYear}
                onComplete={handleTimeMachineComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
