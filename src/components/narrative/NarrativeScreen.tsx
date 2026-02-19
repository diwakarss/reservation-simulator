'use client';

/**
 * NarrativeScreen
 *
 * Shared animated text component for narrative sequences.
 * Displays text with line-by-line fade-in animation using Framer Motion.
 * Respects reduced motion preferences.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { type ReactNode } from 'react';

interface NarrativeScreenProps {
  /** Content to render inside the screen */
  children: ReactNode;
  /** Optional skip button handler */
  onSkip?: () => void;
  /** Whether to show the skip button */
  showSkip?: boolean;
  /** Custom skip button text */
  skipText?: string;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * A line of text with reveal animation.
 */
interface NarrativeLineProps {
  /** Text content of the line */
  children: ReactNode;
  /** Delay before this line appears (in seconds) */
  delay?: number;
  /** Whether this is a highlight (uses accent color) */
  highlight?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Line reveal animation variants.
 */
const lineVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * A single animated line of narrative text.
 */
export function NarrativeLine({
  children,
  delay = 0,
  highlight = false,
  className = '',
}: NarrativeLineProps) {
  return (
    <motion.p
      variants={lineVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ delay }}
      className={`
        font-orbitron text-xl sm:text-2xl md:text-3xl
        leading-relaxed
        ${highlight ? 'text-accent-gold text-glow-gold font-semibold' : 'text-white'}
        ${className}
      `}
    >
      {children}
    </motion.p>
  );
}

/**
 * Main narrative screen container with skip functionality.
 */
export function NarrativeScreen({
  children,
  onSkip,
  showSkip = true,
  skipText = 'Skip',
  className = '',
}: NarrativeScreenProps) {
  return (
    <div
      className={`
        relative flex flex-col items-center justify-center
        min-h-screen px-6 py-12
        text-center
        ${className}
      `}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          className="flex flex-col items-center gap-4 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Skip button */}
      {showSkip && onSkip && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          onClick={onSkip}
          className="
            absolute bottom-8 right-8
            font-rajdhani text-sm text-muted-text/60
            hover:text-accent-gold
            transition-colors duration-200
            flex items-center gap-2
            focus:outline-none focus:ring-2 focus:ring-accent-gold/50 rounded
            px-2 py-1
          "
          aria-label={`${skipText} this section`}
        >
          <span>{skipText}</span>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      )}
    </div>
  );
}

export default NarrativeScreen;
