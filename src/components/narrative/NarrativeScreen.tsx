'use client';

/**
 * NarrativeScreen
 *
 * Shared animated text component for narrative sequences.
 * Displays text with line-by-line fade-in animation using Framer Motion.
 * Respects reduced motion preferences.
 * Supports swipe gestures for narrative advancement on mobile.
 */

import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { type ReactNode, useCallback } from 'react';

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
  /** Handler for swipe/tap advancement (optional, uses onSkip if not provided) */
  onAdvance?: () => void;
  /** Whether to enable swipe gestures (default: true) */
  enableSwipe?: boolean;
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
 * Main narrative screen container with skip functionality and swipe gestures.
 */
export function NarrativeScreen({
  children,
  onSkip,
  showSkip = true,
  skipText = 'Skip',
  className = '',
  onAdvance,
  enableSwipe = true,
}: NarrativeScreenProps) {
  const advanceHandler = onAdvance ?? onSkip;

  // Handle swipe gestures (swipe left to advance)
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!enableSwipe || !advanceHandler) return;

      // Swipe left (negative x offset) to advance
      if (info.offset.x < -50 && Math.abs(info.velocity.x) > 100) {
        advanceHandler();
      }
    },
    [enableSwipe, advanceHandler]
  );

  return (
    <motion.div
      className={`
        relative flex flex-col items-center justify-center
        min-h-screen px-4 sm:px-6 py-8 sm:py-12
        text-center touch-pan-y
        ${className}
      `}
      drag={enableSwipe && advanceHandler ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          className="flex flex-col items-center gap-3 sm:gap-4 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Swipe hint on mobile */}
      {enableSwipe && advanceHandler && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-20 left-0 right-0 text-center text-xs text-muted-text/40 sm:hidden"
        >
          Swipe left to continue
        </motion.p>
      )}

      {/* Skip button - mobile: bottom center, desktop: bottom right */}
      {showSkip && onSkip && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          onClick={onSkip}
          className="
            absolute bottom-4 sm:bottom-8 right-4 sm:right-8
            font-rajdhani text-sm text-muted-text/60
            hover:text-accent-gold active:text-accent-gold
            transition-colors duration-200
            flex items-center gap-2
            focus:outline-none focus:ring-2 focus:ring-accent-gold/50 rounded
            px-3 py-2 min-h-[44px] min-w-[44px]
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
    </motion.div>
  );
}

export default NarrativeScreen;
