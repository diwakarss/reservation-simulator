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
  autoAdvanceDelay = 2500,
}: WorldRevealProps) {
  // Auto-advance after delay
  useEffect(() => {
    const timer = setTimeout(onComplete, autoAdvanceDelay);
    return () => clearTimeout(timer);
  }, [onComplete, autoAdvanceDelay]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const worldData = [
    { label: 'Galaxy', value: galaxyName, color: '#60a5fa' },
    { label: 'Planet', value: planetName, color: '#2dd4bf' },
    { label: 'Nation', value: nationName, color: '#e2b714' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-deep-purple">
      <CosmicBackground starCount={80} showNebula={true} />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
              transition={{ delay: 0.3 + index * 0.2, duration: 0.4 }}
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
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
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
        </motion.button>
      </div>
    </div>
  );
}

export default WorldReveal;
