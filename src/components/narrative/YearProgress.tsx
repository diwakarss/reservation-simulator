'use client';

/**
 * YearProgress
 *
 * Displays current simulation year with progress indicator.
 * Used in policy screens and navigation.
 */

import { motion } from 'framer-motion';

interface YearProgressProps {
  /** Current simulation year */
  year: number;
  /** Maximum year (default: 200) */
  maxYear?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the progress bar */
  showBar?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const sizeStyles = {
  sm: {
    year: 'text-xl',
    label: 'text-sm',
    bar: 'h-1',
  },
  md: {
    year: 'text-3xl',
    label: 'text-base',
    bar: 'h-1.5',
  },
  lg: {
    year: 'text-5xl',
    label: 'text-lg',
    bar: 'h-2',
  },
};

export function YearProgress({
  year,
  maxYear = 200,
  size = 'md',
  showBar = true,
  className = '',
}: YearProgressProps) {
  const progress = Math.min(100, (year / maxYear) * 100);
  const styles = sizeStyles[size];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Year display */}
      <div className="flex items-baseline gap-2">
        <span className={`font-orbitron ${styles.year} font-bold text-accent-gold`}>
          Year {year}
        </span>
        <span className={`font-rajdhani ${styles.label} text-muted-text`}>
          of {maxYear}
        </span>
      </div>

      {/* Progress bar */}
      {showBar && (
        <div className={`w-full max-w-xs mt-2 bg-white/10 rounded-full ${styles.bar}`}>
          <motion.div
            className={`${styles.bar} bg-accent-gold rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}
    </div>
  );
}

export default YearProgress;
