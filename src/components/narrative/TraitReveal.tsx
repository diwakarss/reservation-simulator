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
import type { AbsurdTrait, SocialClass } from '@/lib/simulation/types';

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

    const delays: Record<RevealPhase, number> = {
      intro: 2000,
      trait: autoAdvanceDelay,
      pyramid: autoAdvanceDelay + 1000,
      complete: 0,
    };

    const timer = setTimeout(() => {
      if (phase === 'intro') setPhase('trait');
      else if (phase === 'trait') setPhase('pyramid');
    }, delays[phase]);

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
      <CosmicBackground starCount={100} showNebula={true} />

      <NarrativeScreen onSkip={handleSkip} showSkip={phase !== 'complete'}>
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
                transition={{ duration: 0.5 }}
                className="h-0.5 bg-gradient-to-r from-transparent via-accent-gold to-transparent"
              />

              {/* Trait text */}
              <motion.blockquote
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="
                  font-orbitron text-lg sm:text-xl md:text-2xl
                  text-accent-gold text-glow-gold
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
                transition={{ delay: 0.5, duration: 0.5 }}
                className="h-0.5 bg-gradient-to-r from-transparent via-accent-gold to-transparent"
              />

              {/* Category badge */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
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
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <ClassPyramid classes={classes} showLegend={true} animate={true} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue button */}
        {(phase === 'trait' || phase === 'pyramid') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-8"
          >
            <button
              onClick={handleContinue}
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

export default TraitReveal;
