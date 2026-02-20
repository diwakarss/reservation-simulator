'use client';

/**
 * TraitReveal
 *
 * Shows the absurd trait that divides society.
 * Screen 1: Intro + connector + trait (staggered reveal)
 * Screen 2: Class pyramid
 * All text uses consistent NarrativeLine styling.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NarrativeScreen, NarrativeLine } from './NarrativeScreen';
import { ClassPyramid } from '@/components/simulation/ClassPyramid';
import { CosmicBackground } from '@/components/ui';
import type { AbsurdTrait, SocialClass } from '@/lib/simulation/types';

/**
 * Timing configuration — consistent 2 second stagger between lines
 */
const TIMING = {
  lineStagger: 2,          // 2 seconds between each line (in seconds for delay prop)
  traitScreenDuration: 10000,  // 10 seconds total on trait screen
  pyramidScreenDuration: 8000, // 8 seconds on pyramid screen
  pyramidEntry: 0.5,       // Pyramid fade-in delay
} as const;

interface TraitRevealProps {
  trait: AbsurdTrait;
  classes: SocialClass[];
  onComplete: () => void;
}

type RevealPhase = 'trait' | 'pyramid' | 'complete';

export function TraitReveal({
  trait,
  classes,
  onComplete,
}: TraitRevealProps) {
  const [phase, setPhase] = useState<RevealPhase>('trait');

  useEffect(() => {
    if (phase === 'complete') return;

    const duration = phase === 'trait'
      ? TIMING.traitScreenDuration
      : TIMING.pyramidScreenDuration;

    const timer = setTimeout(() => {
      if (phase === 'trait') {
        setPhase('pyramid');
      } else if (phase === 'pyramid') {
        setPhase('complete');
        onComplete();
      }
    }, duration);

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
          {/* Screen 1: Trait reveal */}
          {phase === 'trait' && (
            <motion.div
              key="trait"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 max-w-2xl px-4"
            >
              {/* Line 1: Your worth */}
              <NarrativeLine delay={0}>
                Your worth was decided at birth.
              </NarrativeLine>

              {/* Line 2: Connector — explains the trait */}
              <NarrativeLine delay={TIMING.lineStagger}>
                Not by what you did. By what you were born as.
              </NarrativeLine>

              {/* Line 3: The trait itself */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: TIMING.lineStagger * 2,
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
              </motion.p>
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
              <NarrativeLine delay={0}>
                And so, society was ordered:
              </NarrativeLine>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: TIMING.pyramidEntry,
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
