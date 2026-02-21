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
 * Timing configuration
 */
const TIMING = {
  pyramidEntry: 0.5,       // Pyramid fade-in delay
} as const;

interface TraitRevealProps {
  trait: AbsurdTrait;
  classes: SocialClass[];
  planetName: string;
  nationName: string;
  onComplete: () => void;
}

type RevealPhase = 'trait' | 'pyramid' | 'complete';

export function TraitReveal({
  trait,
  classes,
  planetName,
  nationName,
  onComplete,
}: TraitRevealProps) {
  const [phase, setPhase] = useState<RevealPhase>('trait');

const handlePyramidContinue = useCallback(() => {
    setPhase('complete');
    onComplete();
  }, [onComplete]);

  const handleContinue = useCallback(() => {
    setPhase('pyramid');
  }, []);

  const handleSkip = useCallback(() => {
    setPhase('complete');
    onComplete();
  }, [onComplete]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-deep-purple">
      <CosmicBackground />

      <NarrativeScreen onSkip={handleSkip} showSkip={phase !== 'complete'} showRestart={true}>
        <AnimatePresence mode="wait">
          {/* Screen 1: Trait reveal — all text shown at once, manual continue */}
          {phase === 'trait' && (
            <motion.div
              key="trait"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-3xl lg:max-w-5xl xl:max-w-6xl px-4 pt-12 sm:pt-8"
            >
              <p className="font-grotesk text-2xl sm:text-3xl md:text-4xl text-white/90 text-center leading-relaxed">
                On {planetName}, your worth was decided at birth.
              </p>

              <p className="font-grotesk text-2xl sm:text-3xl md:text-4xl text-white/90 text-center leading-relaxed">
                The people of {nationName} held a firm belief:
              </p>

              <p className="font-grotesk text-2xl sm:text-3xl md:text-4xl text-accent-gold text-center leading-relaxed italic">
                &ldquo;{trait.text}&rdquo;
              </p>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={handleContinue}
                className="
                  mt-8 px-8 py-3
                  font-grotesk text-lg
                  text-cosmic-white/90 hover:text-cosmic-white
                  border border-cosmic-white/30 hover:border-cosmic-white/60
                  rounded-full
                  transition-all duration-300
                  hover:bg-cosmic-white/10
                "
              >
                Continue
              </motion.button>
            </motion.div>
          )}

          {/* Screen 2: Class Pyramid */}
          {phase === 'pyramid' && (
            <motion.div
              key="pyramid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8 w-full pt-12 sm:pt-8"
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
                className="w-full px-4 sm:px-8 lg:px-12"
              >
                <ClassPyramid classes={classes} animate={true} />
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={handlePyramidContinue}
                className="
                  mt-4 px-8 py-3
                  font-grotesk text-lg
                  text-cosmic-white/90 hover:text-cosmic-white
                  border border-cosmic-white/30 hover:border-cosmic-white/60
                  rounded-full
                  transition-all duration-300
                  hover:bg-cosmic-white/10
                "
              >
                Continue
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </NarrativeScreen>
    </div>
  );
}
