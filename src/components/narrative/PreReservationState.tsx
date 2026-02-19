'use client';

/**
 * PreReservationState
 *
 * Shows bottom class suffering (poverty 65%, education 3%) before policy.
 * Compares with upper class to highlight inequality.
 */

import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { NarrativeScreen, NarrativeLine } from './NarrativeScreen';
import { CosmicBackground } from '@/components/ui';
import type { SocialClass } from '@/lib/simulation/types';
import { CLASS_COLORS } from '@/lib/simulation/types';

interface PreReservationStateProps {
  /** All social classes */
  classes: SocialClass[];
  /** Called when user proceeds */
  onComplete: () => void;
}

/**
 * Metric card for displaying a single metric.
 */
function MetricCard({
  label,
  value,
  unit,
  description,
  delay,
  negative = false,
}: {
  label: string;
  value: number;
  unit: string;
  description: string;
  delay: number;
  negative?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="
        bg-cosmic-blue/80 border border-white/10
        rounded-xl p-4 text-center
        hover:border-accent-gold/30
        transition-colors duration-200
      "
    >
      <p className="text-xs font-rajdhani uppercase tracking-widest text-muted-text mb-2">
        {label}
      </p>
      <p
        className={`
          font-orbitron text-3xl sm:text-4xl font-bold mb-2
          ${negative ? 'text-highlight-red' : 'text-white'}
        `}
      >
        {value}
        <span className="text-lg">{unit}</span>
      </p>
      <p className="text-xs text-muted-text/70 flex items-start gap-1">
        <span className="text-accent-blue">i</span>
        {description}
      </p>
    </motion.div>
  );
}

export function PreReservationState({
  classes,
  onComplete,
}: PreReservationStateProps) {
  const handleContinue = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // Get lower and upper class data
  const lowerClass = classes.find((c) => c.tier === 'lower');
  const upperClass = classes.find((c) => c.tier === 'upper');

  if (!lowerClass || !upperClass) {
    return null;
  }

  const lowerMetrics = lowerClass.metrics;
  const upperMetrics = upperClass.metrics;

  return (
    <div className="relative min-h-screen overflow-hidden bg-deep-purple">
      <CosmicBackground starCount={80} showNebula={true} />

      <NarrativeScreen onSkip={handleContinue} showSkip={true}>
        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <NarrativeLine delay={0}>
            Meanwhile, at the bottom of society...
          </NarrativeLine>
        </motion.div>

        {/* Class name highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="
            bg-highlight-red/10 border border-highlight-red/30
            rounded-xl px-6 py-3 mb-8
          "
        >
          <span
            className="font-orbitron text-xl sm:text-2xl font-bold"
            style={{ color: CLASS_COLORS.lower }}
          >
            {lowerClass.displayName}
          </span>
          <span className="text-muted-text text-sm ml-2">
            ({lowerClass.population}% of population)
          </span>
        </motion.div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mb-8">
          <MetricCard
            label="Poverty"
            value={lowerMetrics.poverty}
            unit="%"
            description="% living below 500 credits/month"
            delay={0.7}
            negative={true}
          />
          <MetricCard
            label="Education"
            value={lowerMetrics.education}
            unit="%"
            description="% with access to schools"
            delay={0.9}
          />
          <MetricCard
            label="Employment"
            value={lowerMetrics.employment}
            unit="%"
            description="% with formal jobs"
            delay={1.1}
          />
          <MetricCard
            label="Life Exp."
            value={lowerMetrics.lifeExpectancy}
            unit=" yrs"
            description="Average lifespan"
            delay={1.3}
          />
        </div>

        {/* Comparison with upper class */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          className="
            bg-accent-gold/5 border border-accent-gold/20
            rounded-xl px-6 py-4 max-w-2xl
            mb-8
          "
        >
          <p className="text-xs font-rajdhani uppercase tracking-widest text-muted-text mb-3 text-center">
            Meanwhile, the {upperClass.displayName}:
          </p>
          <div className="flex justify-center gap-6 sm:gap-10 flex-wrap">
            <span className="text-sm text-muted-text">
              Education:{' '}
              <strong className="text-accent-gold">{upperMetrics.education}%</strong>
            </span>
            <span className="text-sm text-muted-text">
              Poverty:{' '}
              <strong className="text-accent-gold">{upperMetrics.poverty}%</strong>
            </span>
            <span className="text-sm text-muted-text">
              Life Exp:{' '}
              <strong className="text-accent-gold">
                {upperMetrics.lifeExpectancy} yrs
              </strong>
            </span>
          </div>
        </motion.div>

        {/* Continue button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
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
        </motion.button>
      </NarrativeScreen>
    </div>
  );
}

export default PreReservationState;
