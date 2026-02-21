'use client';

/**
 * GalaxyIntro
 *
 * Cinematic intro sequence with animated text reveals.
 * - "In a galaxy, far, far away..." with animated dots
 * - 5 second delays between each line
 * - Auto-transitions after final line (no continue button)
 * - Bigger fonts for dramatic effect
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NarrativeScreen } from './NarrativeScreen';
import { CosmicBackground, RestartButton } from '@/components/ui';
import { useReducedMotion } from '@/lib/hooks';

/**
 * Timing configuration for intro sequence (in milliseconds)
 */
const INTRO_TIMING = {
  dotDelay: 400,           // Delay between each dot animation
  lineDelay: 5000,         // 5 seconds between lines
  lineDelayReduced: 1500,  // Reduced motion: 1.5 seconds
  finalDelay: 5000,        // 5 seconds after last line before transition
  finalDelayReduced: 2000, // Reduced motion: 2 seconds
} as const;

interface GalaxyIntroProps {
  /** Galaxy name to display */
  galaxyName: string;
  /** Planet name to display */
  planetName: string;
  /** Nation name to display */
  nationName: string;
  /** Called when intro completes (auto or skip) */
  onComplete: () => void;
}

type IntroPhase = 0 | 1 | 2 | 3 | 4;

/**
 * Animated dots component - reveals dots one by one
 */
function AnimatedDots({ show }: { show: boolean }) {
  const [visibleDots, setVisibleDots] = useState(0);

  useEffect(() => {
    if (!show) {
      setVisibleDots(0);
      return;
    }

    const timers: NodeJS.Timeout[] = [];
    for (let i = 1; i <= 3; i++) {
      timers.push(
        setTimeout(() => setVisibleDots(i), INTRO_TIMING.dotDelay * i)
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [show]);

  return (
    <span className="inline-block min-w-[1.5em]">
      {[1, 2, 3].map((i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: visibleDots >= i ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          .
        </motion.span>
      ))}
    </span>
  );
}

/**
 * Single narrative line with fade-in animation
 */
function NarrativeLine({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.8, ease: 'easeOut' }}
      className={`font-grotesk text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center leading-relaxed ${className}`}
    >
      {children}
    </motion.p>
  );
}

export function GalaxyIntro({
  galaxyName,
  planetName,
  nationName,
  onComplete,
}: GalaxyIntroProps) {
  // Start at phase 1 so first line shows immediately
  const [phase, setPhase] = useState<IntroPhase>(1);
  const [isComplete, setIsComplete] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const lineDelay = prefersReducedMotion
    ? INTRO_TIMING.lineDelayReduced
    : INTRO_TIMING.lineDelay;

  const finalDelay = prefersReducedMotion
    ? INTRO_TIMING.finalDelayReduced
    : INTRO_TIMING.finalDelay;

  // Auto-advance through phases (1 -> 2 -> 3 -> 4 -> complete)
  useEffect(() => {
    if (isComplete) return;

    const timer = setTimeout(() => {
      if (phase < 4) {
        setPhase((p) => (p + 1) as IntroPhase);
      } else {
        setIsComplete(true);
        onComplete();
      }
    }, phase === 4 ? finalDelay : lineDelay);

    return () => clearTimeout(timer);
  }, [phase, isComplete, onComplete, lineDelay, finalDelay]);

  const handleSkip = useCallback(() => {
    setIsComplete(true);
    onComplete();
  }, [onComplete]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-deep-purple">
      <CosmicBackground />

      <NarrativeScreen onSkip={handleSkip} showSkip={!isComplete} skipText="Skip Intro" showHowItWorks={true}>
        <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 px-4">
          {/* Line 1: Galaxy with animated dots */}
          {phase >= 1 && (
            <NarrativeLine className="text-white/90">
              In a galaxy, far, far away
              <AnimatedDots show={phase >= 1} />
            </NarrativeLine>
          )}

          {/* Line 2: Planet */}
          {phase >= 2 && (
            <NarrativeLine delay={0}>
              On a planet called{' '}
              <span className="text-accent-gold text-glow-gold font-bold">
                {planetName}
              </span>
              <AnimatedDots show={phase >= 2} />
            </NarrativeLine>
          )}

          {/* Line 3: Nation */}
          {phase >= 3 && (
            <NarrativeLine delay={0}>
              In the nation of{' '}
              <span className="text-accent-gold text-glow-gold font-bold">
                {nationName}
              </span>
              <AnimatedDots show={phase >= 3} />
            </NarrativeLine>
          )}

          {/* Line 4: Divided people */}
          {phase >= 4 && (
            <NarrativeLine delay={0} className="mt-4">
              There lived a{' '}
              <span className="text-highlight-red text-glow-red font-bold">
                divided
              </span>{' '}
              people
              <AnimatedDots show={phase >= 4} />
            </NarrativeLine>
          )}
        </div>
      </NarrativeScreen>
    </div>
  );
}
