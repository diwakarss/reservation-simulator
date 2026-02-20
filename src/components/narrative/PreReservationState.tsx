'use client';

/**
 * PreReservationState
 *
 * Shows bottom class suffering (poverty 65%, education 3%) before policy.
 * Compares with upper class to highlight inequality.
 */

import { motion } from 'framer-motion';
import { NarrativeScreen, NarrativeLine } from './NarrativeScreen';
import { CosmicBackground } from '@/components/ui';
import { ContinueButton } from './narrativeConstants';
import type { SocialClass } from '@/lib/simulation/types';
import { CLASS_COLORS } from '@/lib/simulation/types';

/**
 * Timing configuration for pre-reservation state sequence
 */
const PRE_RESERVATION_TIMING = {
  titleDelay: 0.3,
  classNameDelay: 0.5,
  metricBaseDelay: 0.7,
  metricStagger: 0.2,
  comparisonDelay: 1.5,
  buttonDelay: 2,
  cardDuration: 0.4,
} as const;

interface PreReservationStateProps {
  /** All social classes */
  classes: SocialClass[];
  /** Called when user proceeds */
  onComplete: () => void;
}

interface MetricCardProps {
  /** Metric label (e.g., "Poverty") */
  label: string;
  /** Numeric value */
  value: number;
  /** Unit suffix (e.g., "%", " yrs") */
  unit: string;
  /** Description text */
  description: string;
  /** Animation delay in seconds */
  delay: number;
  /** Whether to style as negative metric */
  negative?: boolean;
}

/**
 * Metric card for displaying a single statistic.
 */
function MetricCard({
  label,
  value,
  unit,
  description,
  delay,
  negative = false,
}: MetricCardProps) {
  const valueColor = negative ? 'text-highlight-red' : 'text-white';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: PRE_RESERVATION_TIMING.cardDuration }}
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
      <p className={`font-orbitron text-3xl sm:text-4xl font-bold mb-2 ${valueColor}`}>
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
      <CosmicBackground />

      <NarrativeScreen onSkip={onComplete} showSkip={true} showRestart={true}>
        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <NarrativeLine delay={PRE_RESERVATION_TIMING.titleDelay}>
            Meanwhile, at the bottom of society...
          </NarrativeLine>
        </motion.div>

        {/* Class name highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: PRE_RESERVATION_TIMING.classNameDelay,
            duration: PRE_RESERVATION_TIMING.cardDuration,
          }}
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
          {[
            {
              label: 'Poverty',
              value: lowerMetrics.poverty,
              unit: '%',
              description: '% living below 500 credits/month',
              negative: true,
            },
            {
              label: 'Education',
              value: lowerMetrics.education,
              unit: '%',
              description: '% with access to schools',
            },
            {
              label: 'Employment',
              value: lowerMetrics.employment,
              unit: '%',
              description: '% with formal jobs',
            },
            {
              label: 'Life Exp.',
              value: lowerMetrics.lifeExpectancy,
              unit: ' yrs',
              description: 'Average lifespan',
            },
          ].map((metric, index) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              unit={metric.unit}
              description={metric.description}
              negative={metric.negative}
              delay={PRE_RESERVATION_TIMING.metricBaseDelay + index * PRE_RESERVATION_TIMING.metricStagger}
            />
          ))}
        </div>

        {/* Comparison with upper class */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: PRE_RESERVATION_TIMING.comparisonDelay,
            duration: PRE_RESERVATION_TIMING.cardDuration,
          }}
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
        <ContinueButton onClick={onComplete} delay={PRE_RESERVATION_TIMING.buttonDelay} />
      </NarrativeScreen>
    </div>
  );
}

