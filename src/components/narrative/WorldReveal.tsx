'use client';

/**
 * WorldReveal
 *
 * Shows the generated world with its unique traits.
 * Displays world names and prepares for trait reveal.
 * This is a brief transitional component between GalaxyIntro and TraitReveal.
 */

import { motion } from 'framer-motion';
import { useEffect, useCallback } from 'react';
import { CosmicBackground } from '@/components/ui';
import { ContinueButton, WORLD_CARD_COLORS } from './narrativeConstants';

/**
 * Timing configuration for world reveal sequence
 */
const WORLD_REVEAL_TIMING = {
  autoAdvanceDefault: 2500,
  titleEntry: 0.5,
  cardEntryBase: 0.3,
  cardStagger: 0.2,
  buttonDelay: 1.2,
} as const;

interface WorldRevealProps {
  /** Galaxy name */
  galaxyName: string;
  /** Planet name */
  planetName: string;
  /** Nation name */
  nationName: string;
  /** Called when reveal completes */
  onComplete: () => void;
  /** Auto-advance delay in ms (default: 2500) */
  autoAdvanceDelay?: number;
}

export function WorldReveal({
  galaxyName,
  planetName,
  nationName,
  onComplete,
  autoAdvanceDelay = WORLD_REVEAL_TIMING.autoAdvanceDefault,
}: WorldRevealProps) {
  // Auto-advance after delay
  useEffect(() => {
    const timer = setTimeout(onComplete, autoAdvanceDelay);
    return () => clearTimeout(timer);
  }, [onComplete, autoAdvanceDelay]);

  const worldData = [
    { label: 'Galaxy', value: galaxyName, color: WORLD_CARD_COLORS.galaxy },
    { label: 'Planet', value: planetName, color: WORLD_CARD_COLORS.planet },
    { label: 'Nation', value: nationName, color: WORLD_CARD_COLORS.nation },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-deep-purple">
      <CosmicBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: WORLD_REVEAL_TIMING.titleEntry }}
          className="font-orbitron text-2xl sm:text-3xl text-white mb-12 text-center"
        >
          Your World Awaits
        </motion.h2>

        {/* World details cards */}
        <div className="flex flex-col sm:flex-row gap-6 mb-12">
          {worldData.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: WORLD_REVEAL_TIMING.cardEntryBase + index * WORLD_REVEAL_TIMING.cardStagger,
                duration: 0.4,
              }}
              className="
                bg-cosmic-blue/60 border border-white/10
                rounded-xl p-6 min-w-[180px]
                text-center
                hover:border-accent-gold/30
                transition-colors duration-200
              "
            >
              <p className="text-xs font-rajdhani uppercase tracking-widest text-muted-text mb-2">
                {item.label}
              </p>
              <p
                className="font-orbitron text-xl font-semibold"
                style={{ color: item.color }}
              >
                {item.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Continue button */}
        <ContinueButton onClick={onComplete} delay={WORLD_REVEAL_TIMING.buttonDelay} />
      </div>
    </div>
  );
}

