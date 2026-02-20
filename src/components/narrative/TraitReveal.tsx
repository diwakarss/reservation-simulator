'use client';

/**
 * TraitReveal
 *
 * Dramatic trait reveal with class name generation.
 * Shows the absurd trait text, then reveals the ClassPyramid.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NarrativeScreen, NarrativeLine } from './NarrativeScreen';
import { ClassPyramid } from '@/components/simulation/ClassPyramid';
import { CosmicBackground } from '@/components/ui';
import { ContinueButton } from './narrativeConstants';
import type { AbsurdTrait, SocialClass } from '@/lib/simulation/types';

/**
 * Timing configuration for trait reveal sequence
 */
const TRAIT_REVEAL_TIMING = {
  intro: 2000,
  trait: 3000,
  pyramidExit: 1000,
  divider: { initial: 0, animated: 0.5 },
  blockquote: { delay: 0.3, duration: 0.5 },
  category: 0.8,
  pyramidEntry: 0.5,
  buttonDelay: 1.5,
} as const;

interface TraitRevealProps {
  /** The absurd trait to reveal */
  trait: AbsurdTrait;
  /** The 5 social classes with their display names */
  classes: SocialClass[];
  /** Called when reveal completes */
  onComplete: () => void;
  /** Auto-advance delay in ms (default: 3000) */
  autoAdvanceDelay?: number;
}

type RevealPhase = 'intro' | 'trait' | 'pyramid' | 'complete';

export function TraitReveal({
  trait,
  classes,
  onComplete,
  autoAdvanceDelay = 3000,
}: TraitRevealProps) {
  const [phase, setPhase] = useState<RevealPhase>('intro');

  // Auto-advance through phases
  useEffect(() => {
    if (phase === 'complete') return;

    function getPhaseDelay(currentPhase: RevealPhase): number {
      switch (currentPhase) {
        case 'intro':
          return TRAIT_REVEAL_TIMING.intro;
        case 'trait':
          return autoAdvanceDelay;
        case 'pyramid':
          return autoAdvanceDelay + TRAIT_REVEAL_TIMING.pyramidExit;
        case 'complete':
          return 0;
      }
    }

    const timer = setTimeout(() => {
      if (phase === 'intro') setPhase('trait');
      else if (phase === 'trait') setPhase('pyramid');
    }, getPhaseDelay(phase));

    return () => clearTimeout(timer);
  }, [phase, autoAdvanceDelay]);

  const handleSkip = useCallback(() => {
    setPhase('complete');
    onComplete();
  }, [onComplete]);

  const handleContinue = useCallback(() => {
    if (phase === 'pyramid') {
      setPhase('complete');
      onComplete();
    } else {
      setPhase('pyramid');
    }
  }, [phase, onComplete]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-deep-purple">
      <CosmicBackground />

      <NarrativeScreen onSkip={handleSkip} showSkip={phase !== 'complete'} showRestart={true}>
        <AnimatePresence mode="wait">
          {/* Phase 1: Intro text */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <NarrativeLine delay={0}>
                The people were divided by one sacred truth:
              </NarrativeLine>
            </motion.div>
          )}

          {/* Phase 2: Trait text */}
          {phase === 'trait' && (
            <motion.div
              key="trait"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 max-w-xl"
            >
              {/* Decorative divider */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 250 }}
                transition={{ duration: TRAIT_REVEAL_TIMING.divider.animated }}
                className="h-0.5 bg-gradient-to-r from-transparent via-accent-gold to-transparent"
              />

              {/* Trait text */}
              <motion.blockquote
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: TRAIT_REVEAL_TIMING.blockquote.delay,
                  duration: TRAIT_REVEAL_TIMING.blockquote.duration,
                }}
                className="
                  font-grotesk text-xl sm:text-2xl md:text-3xl
                  text-accent-gold text-glow-accent
                  text-center leading-relaxed
                  italic
                "
              >
                &ldquo;{trait.text}&rdquo;
              </motion.blockquote>

              {/* Divider */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 250 }}
                transition={{
                  delay: TRAIT_REVEAL_TIMING.blockquote.delay + TRAIT_REVEAL_TIMING.blockquote.duration,
                  duration: TRAIT_REVEAL_TIMING.divider.animated,
                }}
                className="h-0.5 bg-gradient-to-r from-transparent via-accent-gold to-transparent"
              />

              {/* Category badge */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: TRAIT_REVEAL_TIMING.category }}
                className="
                  text-xs font-rajdhani uppercase tracking-widest
                  text-muted-text/60
                  px-3 py-1 rounded-full
                  border border-white/10
                "
              >
                {trait.category} Hierarchy
              </motion.span>
            </motion.div>
          )}

          {/* Phase 3: Class Pyramid */}
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
                  duration: TRAIT_REVEAL_TIMING.blockquote.duration,
                }}
              >
                <ClassPyramid classes={classes} showLegend={true} animate={true} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue button */}
        {(phase === 'trait' || phase === 'pyramid') && (
          <ContinueButton onClick={handleContinue} delay={TRAIT_REVEAL_TIMING.buttonDelay} />
        )}
      </NarrativeScreen>
    </div>
  );
}

