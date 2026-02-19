'use client';

/**
 * GalaxyIntro
 *
 * Procedurally generated galaxy/planet/nation intro sequence.
 * Three-screen sequence with fades:
 * 1. "In a galaxy far away..."
 * 2. "On a planet called [PLANET]..."
 * 3. "In the nation of [NATION]..."
 * 4. "There lived a divided people..."
 *
 * Uses world config from the store or props.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NarrativeScreen, NarrativeLine } from './NarrativeScreen';
import { CosmicBackground } from '@/components/ui';
import { useReducedMotion } from '@/lib/hooks';

interface GalaxyIntroProps {
  /** Galaxy name to display */
  galaxyName: string;
  /** Planet name to display */
  planetName: string;
  /** Nation name to display */
  nationName: string;
  /** Called when intro completes (auto or skip) */
  onComplete: () => void;
  /** Optional: auto-advance delay in ms (default: 2000) */
  autoAdvanceDelay?: number;
}

type IntroPhase = 0 | 1 | 2 | 3 | 4; // 0=galaxy, 1=planet, 2=nation, 3=divided, 4=complete

export function GalaxyIntro({
  galaxyName,
  planetName,
  nationName,
  onComplete,
  autoAdvanceDelay = 2000,
}: GalaxyIntroProps) {
  const [phase, setPhase] = useState<IntroPhase>(0);
  const [isComplete, setIsComplete] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Shorter delays for reduced motion preference
  const effectiveDelay = prefersReducedMotion ? Math.min(autoAdvanceDelay, 800) : autoAdvanceDelay;

  // Auto-advance through phases
  useEffect(() => {
    if (isComplete) return;

    const timer = setTimeout(() => {
      if (phase < 3) {
        setPhase((p) => (p + 1) as IntroPhase);
      } else {
        setIsComplete(true);
        onComplete();
      }
    }, phase === 0 ? (prefersReducedMotion ? 500 : 1500) : effectiveDelay);

    return () => clearTimeout(timer);
  }, [phase, isComplete, effectiveDelay, onComplete, prefersReducedMotion]);

  const handleSkip = useCallback(() => {
    setIsComplete(true);
    onComplete();
  }, [onComplete]);

  // Animation stagger timing
  const lineDelays = [0, 0.4, 0.8, 1.2];

  return (
    <div className="relative min-h-screen overflow-hidden bg-deep-purple">
      <CosmicBackground />

      <NarrativeScreen onSkip={handleSkip} showSkip={!isComplete} skipText="Skip">
        <AnimatePresence mode="wait">
          {/* Line 1: Galaxy */}
          {phase >= 0 && (
            <NarrativeLine key="line-galaxy" delay={lineDelays[0]}>
              In a galaxy far away...
            </NarrativeLine>
          )}

          {/* Line 2: Planet */}
          {phase >= 1 && (
            <NarrativeLine key="line-planet" delay={phase === 1 ? 0.3 : 0}>
              On a planet called{' '}
              <span className="text-accent-gold text-glow-gold font-semibold">
                {planetName}
              </span>
              ...
            </NarrativeLine>
          )}

          {/* Line 3: Nation */}
          {phase >= 2 && (
            <NarrativeLine key="line-nation" delay={phase === 2 ? 0.3 : 0}>
              In the nation of{' '}
              <span className="text-accent-gold text-glow-gold font-semibold">
                {nationName}
              </span>
              ...
            </NarrativeLine>
          )}

          {/* Line 4: Divided */}
          {phase >= 3 && (
            <NarrativeLine key="line-divided" delay={phase === 3 ? 0.3 : 0}>
              There lived a{' '}
              <span className="text-highlight-red">divided</span> people...
            </NarrativeLine>
          )}
        </AnimatePresence>

        {/* Continue indicator */}
        {phase >= 3 && !isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8"
          >
            <button
              onClick={handleSkip}
              className="
                font-rajdhani text-base text-accent-gold
                hover:text-white
                transition-colors duration-200
                flex items-center gap-2
                px-4 py-2 rounded-lg
                border border-accent-gold/30
                hover:border-accent-gold
                hover:bg-accent-gold/10
              "
            >
              Continue
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </motion.div>
        )}
      </NarrativeScreen>
    </div>
  );
}

export default GalaxyIntro;
