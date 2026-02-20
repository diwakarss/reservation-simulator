'use client';

/**
 * TraitReveal
 *
 * Dramatic trait reveal with class name generation.
 * Screen 1: Shows intro text + trait together
 * Screen 2: Shows the ClassPyramid
 * Auto-advances with 5 second delays, no continue buttons.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NarrativeScreen, NarrativeLine } from './NarrativeScreen';
import { ClassPyramid } from '@/components/simulation/ClassPyramid';
import { CosmicBackground } from '@/components/ui';
import type { AbsurdTrait, SocialClass } from '@/lib/simulation/types';

/**
 * Timing configuration for trait reveal sequence
 */
const TRAIT_REVEAL_TIMING = {
  phaseDelay: 5000,        // 5 seconds between screens
  traitFadeIn: 1.5,        // Delay before trait appears after intro text (seconds)
  pyramidEntry: 0.5,       // Pyramid fade-in delay (seconds)
} as const;

interface TraitRevealProps {
  /** The absurd trait to reveal */
  trait: AbsurdTrait;
  /** The 5 social classes with their display names */
  classes: SocialClass[];
  /** Called when reveal completes */
  onComplete: () => void;
}

type RevealPhase = 'trait' | 'pyramid' | 'complete';

export function TraitReveal({
  trait,
  classes,
  onComplete,
}: TraitRevealProps) {
  const [phase, setPhase] = useState<RevealPhase>('trait');

  // Auto-advance through phases with 5 second delays
  useEffect(() => {
    if (phase === 'complete') return;

    const timer = setTimeout(() => {
      if (phase === 'trait') {
        setPhase('pyramid');
      } else if (phase === 'pyramid') {
        setPhase('complete');
        onComplete();
      }
    }, TRAIT_REVEAL_TIMING.phaseDelay);

    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  const handleSkip = useCallback(() => {
    setPhase('complete');
    onComplete();
  }, [onComplete]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-deep-purple">
      <CosmicBackground />

      <NarrativeScreen onSkip={handleSkip} showSkip={phase !== 'complete'} showRestart={true}>
        <AnimatePresence mode="wait">
          {/* Screen 1: Intro text + Trait combined */}
          {phase === 'trait' && (
            <motion.div
              key="trait"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8 max-w-2xl"
            >
              {/* Intro text */}
              <NarrativeLine delay={0}>
                Your worth was decided at birth.
              </NarrativeLine>

              {/* Trait text - appears after intro */}
              <motion.blockquote
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: TRAIT_REVEAL_TIMING.traitFadeIn,
                  duration: 0.6,
                }}
                className="
                  font-grotesk text-xl sm:text-2xl md:text-3xl
                  text-accent-gold text-glow-gold
                  text-center leading-relaxed
                  italic
                "
              >
                &ldquo;{trait.text}&rdquo;
              </motion.blockquote>
            </motion.div>
          )}

          {/* Screen 2: Class Pyramid */}
          {phase === 'pyramid' && (
            <motion.div
              key="pyramid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <NarrativeLine delay={0}>And so, society was ordered:</NarrativeLine>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: TRAIT_REVEAL_TIMING.pyramidEntry,
                  duration: 0.5,
                }}
              >
                <ClassPyramid classes={classes} showLegend={true} animate={true} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </NarrativeScreen>
    </div>
  );
}
