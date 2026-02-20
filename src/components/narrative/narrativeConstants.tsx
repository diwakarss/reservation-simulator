/**
 * Shared constants for narrative flow components.
 *
 * Centralizes button styling, animation timing, and world display colors
 * so that GalaxyIntro, TraitReveal, PreReservationState, and WorldReveal
 * stay visually consistent without duplicating values.
 */

import { motion } from 'framer-motion';

// =============================================================================
// Continue Button
// =============================================================================

/**
 * Tailwind classes shared by every "Continue" button in the narrative flow.
 * Each component wraps the button in its own motion container to control
 * when the button fades in, so only the static styling lives here.
 */
export const CONTINUE_BUTTON_CLASS = [
  'font-grotesk text-base text-accent-gold',
  'hover:text-white',
  'transition-colors duration-200',
  'flex items-center gap-2',
  'px-4 py-2 rounded-lg',
  'border border-accent-gold/30',
  'hover:border-accent-gold',
  'hover:bg-accent-gold/10',
].join(' ');

/**
 * SVG path data for the forward-arrow icon used in Continue buttons.
 */
export const CONTINUE_ARROW_PATH = 'M13 7l5 5m0 0l-5 5m5-5H6';

// =============================================================================
// Animation Timing
// =============================================================================

/**
 * Standard delays (in seconds) for narrative line reveals.
 * Used by GalaxyIntro and TraitReveal when staggering text lines.
 */
export const NARRATIVE_LINE_DELAY = 0.3;

/**
 * Standard delay (in seconds) before the Continue button fades in
 * after all content in a phase has been revealed.
 */
export const CONTINUE_BUTTON_FADE_DELAY = 1.5;

// =============================================================================
// World Reveal Colors
// =============================================================================

/**
 * Display colors for the three world-detail cards in WorldReveal.
 * Intentionally independent from CLASS_COLORS -- these map to
 * cosmological concepts (galaxy/planet/nation), not social tiers.
 */
export const WORLD_CARD_COLORS = {
  galaxy: '#60a5fa',
  planet: '#34d399',
  nation: '#38bdf8',
} as const;

// =============================================================================
// Continue Button Component
// =============================================================================

/**
 * Reusable Continue button with standardized styling and arrow icon.
 * Wrapped in a motion.div so parent components can control fade-in timing.
 */
interface ContinueButtonProps {
  onClick: () => void;
  delay?: number;
}

export function ContinueButton({ onClick, delay = CONTINUE_BUTTON_FADE_DELAY }: ContinueButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="mt-8"
    >
      <button onClick={onClick} className={CONTINUE_BUTTON_CLASS}>
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
            d={CONTINUE_ARROW_PATH}
          />
        </svg>
      </button>
    </motion.div>
  );
}
