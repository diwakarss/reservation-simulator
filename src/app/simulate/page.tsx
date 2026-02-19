'use client';

/**
 * Main Simulation Page - Phase Router
 *
 * Orchestrates all 12 simulation phases by routing to the correct component
 * based on the current SimulationPhase from the Zustand store.
 *
 * Performance optimizations:
 * - Charts panel lazy loaded (heavy recharts dependency)
 * - Animations use will-change for GPU acceleration
 */

import { useEffect, useState, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore, initializeFromBootstrap, getCurrentSnapshot } from '@/lib/store';
import { SimulationPhase } from '@/lib/simulation/types';

// Narrative components
import {
  GalaxyIntro,
  TraitReveal,
  PreReservationState,
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

// Loading spinner component
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

// Connected wrapper for PolicyBottom2
function PolicyBottom2Connected() {
  const world = useSimulationStore((state) => state.world);
  const policy = useSimulationStore((state) => state.policy);
  const setClassPolicy = useSimulationStore((state) => state.setClassPolicy);
  const advanceTime = useSimulationStore((state) => state.advanceTime);
  const setPhase = useSimulationStore((state) => state.setPhase);
  const openSettingsDrawer = useSimulationStore((state) => state.openSettingsDrawer);
  const openChartsPanel = useSimulationStore((state) => state.openChartsPanel);

  if (!world) return null;

  const handleAdvance = () => {
    advanceTime(20);
    setPhase(SimulationPhase.POLICY_MIDDLE);
  };

  const handleSkip = () => {
    setClassPolicy('lower', { reservationPercent: 0 });
    setClassPolicy('common', { reservationPercent: 0 });
    advanceTime(20);
    setPhase(SimulationPhase.POLICY_MIDDLE);
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
      onHowItWorks={() => {}}
      onSettings={openSettingsDrawer}
      onCharts={openChartsPanel}
    />
  );
}

// Connected wrapper for PolicyMiddle
function PolicyMiddleConnected() {
  const world = useSimulationStore((state) => state.world);
  const policy = useSimulationStore((state) => state.policy);
  const history = useSimulationStore((state) => state.history);
  const setClassPolicy = useSimulationStore((state) => state.setClassPolicy);
  const advanceTime = useSimulationStore((state) => state.advanceTime);
  const setPhase = useSimulationStore((state) => state.setPhase);
  const openSettingsDrawer = useSimulationStore((state) => state.openSettingsDrawer);
  const openChartsPanel = useSimulationStore((state) => state.openChartsPanel);

  if (!world || history.length < 2) return null;

  const previousSnapshot = history[0]; // Year 0 snapshot
  const currentSnapshot = history[history.length - 1];

  const handleAdvance = () => {
    advanceTime(20);
    setPhase(SimulationPhase.POLICY_CREAMY_LAYER);
  };

  return (
    <PolicyMiddleBase
      classes={currentSnapshot.classes}
      previousSnapshot={previousSnapshot}
      middlePolicy={policy.classes.middle}
      onMiddlePolicyChange={(value) => setClassPolicy('middle', { reservationPercent: value })}
      onAdvance={handleAdvance}
      onHowItWorks={() => {}}
      onSettings={openSettingsDrawer}
      onCharts={openChartsPanel}
    />
  );
}

// Connected wrapper for PolicyCreamyLayer
function PolicyCreamyLayerConnected() {
  const world = useSimulationStore((state) => state.world);
  const policy = useSimulationStore((state) => state.policy);
  const history = useSimulationStore((state) => state.history);
  const setCreamyLayer = useSimulationStore((state) => state.setCreamyLayer);
  const advanceTime = useSimulationStore((state) => state.advanceTime);
  const setPhase = useSimulationStore((state) => state.setPhase);
  const openSettingsDrawer = useSimulationStore((state) => state.openSettingsDrawer);
  const openChartsPanel = useSimulationStore((state) => state.openChartsPanel);

  if (!world || history.length < 2) return null;

  const currentSnapshot = history[history.length - 1];

  const handleAdvance = () => {
    advanceTime(20);
    setPhase(SimulationPhase.POLICY_EWS);
  };

  const handleReject = () => {
    // Disable creamy layer for all classes
    setCreamyLayer('lower', false, 0);
    setCreamyLayer('common', false, 0);
    setCreamyLayer('middle', false, 0);
    advanceTime(20);
    setPhase(SimulationPhase.POLICY_EWS);
  };

  return (
    <PolicyCreamyLayerBase
      classes={currentSnapshot.classes}
      policies={policy.classes}
      onCreamyLayerToggle={(tier, enabled) => setCreamyLayer(tier, enabled, policy.classes[tier].creamyLayerThreshold)}
      onCreamyLayerThresholdChange={(tier, threshold) => setCreamyLayer(tier, policy.classes[tier].creamyLayerEnabled, threshold)}
      onAdvance={handleAdvance}
      onReject={handleReject}
      onHowItWorks={() => {}}
      onSettings={openSettingsDrawer}
      onCharts={openChartsPanel}
    />
  );
}

// Connected wrapper for PolicyEWS
function PolicyEWSConnected() {
  const world = useSimulationStore((state) => state.world);
  const policy = useSimulationStore((state) => state.policy);
  const history = useSimulationStore((state) => state.history);
  const setEWSPolicy = useSimulationStore((state) => state.setEWSPolicy);
  const advanceTime = useSimulationStore((state) => state.advanceTime);
  const setPhase = useSimulationStore((state) => state.setPhase);
  const openSettingsDrawer = useSimulationStore((state) => state.openSettingsDrawer);
  const openChartsPanel = useSimulationStore((state) => state.openChartsPanel);

  if (!world || history.length < 2) return null;

  const currentSnapshot = history[history.length - 1];

  const handleAdvance = () => {
    advanceTime(20);
    setPhase(SimulationPhase.POLICY_REMOVAL);
  };

  const handleReject = () => {
    // Disable EWS for upper classes
    setEWSPolicy('upper', false, 0, 0);
    setEWSPolicy('noble', false, 0, 0);
    advanceTime(20);
    setPhase(SimulationPhase.POLICY_REMOVAL);
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
      onHowItWorks={() => {}}
      onSettings={openSettingsDrawer}
      onCharts={openChartsPanel}
    />
  );
}

// Connected wrapper for PolicyRemoval
function PolicyRemovalConnected() {
  const world = useSimulationStore((state) => state.world);
  const history = useSimulationStore((state) => state.history);
  const clearAllReservations = useSimulationStore((state) => state.clearAllReservations);
  const advanceTime = useSimulationStore((state) => state.advanceTime);
  const setPhase = useSimulationStore((state) => state.setPhase);
  const openSettingsDrawer = useSimulationStore((state) => state.openSettingsDrawer);
  const openChartsPanel = useSimulationStore((state) => state.openChartsPanel);

  if (!world || history.length < 2) return null;

  const year0Snapshot = history[0];
  const currentSnapshot = history[history.length - 1];

  const handleRemoveAll = () => {
    clearAllReservations();
    advanceTime(20);
    setPhase(SimulationPhase.END_SUMMARY);
  };

  const handleContinue = () => {
    advanceTime(20);
    setPhase(SimulationPhase.END_SUMMARY);
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
      onHowItWorks={() => {}}
      onSettings={openSettingsDrawer}
      onCharts={openChartsPanel}
    />
  );
}

export default function SimulatePage() {
  const phase = useSimulationStore((state) => state.phase);
  const world = useSimulationStore((state) => state.world);
  const settingsOpen = useSimulationStore((state) => state.settingsOpen);
  const chartsOpen = useSimulationStore((state) => state.chartsOpen);
  const initializeWorld = useSimulationStore((state) => state.initializeWorld);
  const setPhase = useSimulationStore((state) => state.setPhase);
  const closeChartsPanel = useSimulationStore((state) => state.closeChartsPanel);

  const [isInitialized, setIsInitialized] = useState(false);
  const [showWorldGenSpinner, setShowWorldGenSpinner] = useState(false);

  // Bootstrap from URL or localStorage on mount
  useEffect(() => {
    initializeFromBootstrap();
    setIsInitialized(true);
  }, []);

  // Handle WORLD_GEN phase - non-visual, auto-advances
  useEffect(() => {
    if (phase === SimulationPhase.WORLD_GEN) {
      const spinnerTimeout = setTimeout(() => {
        setShowWorldGenSpinner(true);
      }, 200);

      const generateAndAdvance = async () => {
        setTimeout(() => {
          clearTimeout(spinnerTimeout);
          setShowWorldGenSpinner(false);
          setPhase(SimulationPhase.TRAIT_REVEAL);
        }, 300);
      };

      generateAndAdvance();

      return () => {
        clearTimeout(spinnerTimeout);
      };
    }
  }, [phase, setPhase]);

  // Phase transition handlers
  const handleIntroComplete = useCallback(() => {
    setPhase(SimulationPhase.WORLD_GEN);
  }, [setPhase]);

  const handleTraitRevealComplete = useCallback(() => {
    setPhase(SimulationPhase.PRE_RESERVATION);
  }, [setPhase]);

  const handlePreReservationComplete = useCallback(() => {
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

  // If no world yet and we're at INTRO, trigger initialization and start
  if (!world && phase === SimulationPhase.INTRO) {
    initializeWorld();
  }

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
            onComplete={handleTraitRevealComplete}
          />
        );

      case SimulationPhase.PRE_RESERVATION:
        return (
          <PreReservationState
            key="pre-reservation"
            classes={world.classes}
            onComplete={handlePreReservationComplete}
          />
        );

      case SimulationPhase.POLICY_BOTTOM_2:
        return <PolicyBottom2Connected key="policy-bottom-2" />;

      case SimulationPhase.POLICY_MIDDLE:
        return <PolicyMiddleConnected key="policy-middle" />;

      case SimulationPhase.POLICY_CREAMY_LAYER:
        return <PolicyCreamyLayerConnected key="policy-creamy-layer" />;

      case SimulationPhase.POLICY_EWS:
        return <PolicyEWSConnected key="policy-ews" />;

      case SimulationPhase.POLICY_REMOVAL:
        return <PolicyRemovalConnected key="policy-removal" />;

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
    </div>
  );
}
