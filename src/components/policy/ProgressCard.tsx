'use client';

/**
 * ProgressCard
 *
 * Shows metric progress for a class (e.g., Education 3% -> 12% up).
 * Used in policy screens to show before/after comparisons.
 */

import { motion } from 'framer-motion';
import type { ClassTier, ClassMetrics, MetricKey } from '@/lib/simulation/types';
import { CLASS_COLORS, METRIC_LABELS, METRIC_UNITS, METRIC_HIGHER_IS_BETTER } from '@/lib/simulation/types';

interface ProgressCardProps {
  /** Class tier for color coding */
  tier: ClassTier;
  /** Class display name */
  displayName: string;
  /** Previous year metrics */
  previousMetrics: ClassMetrics;
  /** Current year metrics */
  currentMetrics: ClassMetrics;
  /** Which metrics to display (defaults to key metrics) */
  metricsToShow?: MetricKey[];
  /** Current reservation percentage for this class (0-100) */
  reservationPercent?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format metric value for display.
 */
function formatValue(value: number, metric: MetricKey): string {
  if (metric === 'incomePerCapita') {
    return value.toLocaleString();
  }
  return value.toFixed(1);
}

/**
 * Get change indicator and color.
 */
function getChangeInfo(
  prev: number,
  curr: number,
  higherIsBetter: boolean
): { text: string; isPositive: boolean } {
  const diff = curr - prev;
  const isPositive = higherIsBetter ? diff > 0 : diff < 0;
  const arrow = diff > 0 ? '\u2191' : diff < 0 ? '\u2193' : '';
  const text = `${arrow} ${Math.abs(diff).toFixed(1)}`;
  return { text, isPositive };
}

const DEFAULT_METRICS: MetricKey[] = ['education', 'employment', 'poverty'];

export function ProgressCard({
  tier,
  displayName,
  previousMetrics,
  currentMetrics,
  metricsToShow = DEFAULT_METRICS,
  reservationPercent,
  className = '',
}: ProgressCardProps) {
  const color = CLASS_COLORS[tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-cosmic-blue/60 border border-white/10
        rounded-xl p-4
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h4
            className="font-rajdhani font-bold text-lg"
            style={{ color }}
          >
            {displayName}
          </h4>
        </div>
        {reservationPercent !== undefined && reservationPercent > 0 && (
          <span className="text-sm font-semibold px-2 py-1 rounded bg-accent-gold/20 text-accent-gold">
            {reservationPercent}% Reserved
          </span>
        )}
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        {metricsToShow.map((metric) => {
          const prev = previousMetrics[metric];
          const curr = currentMetrics[metric];
          const change = getChangeInfo(prev, curr, METRIC_HIGHER_IS_BETTER[metric]);
          const unit = METRIC_UNITS[metric];

          return (
            <div key={metric} className="flex items-center justify-between">
              <span className="text-base text-white/80">
                {METRIC_LABELS[metric]}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base text-white/50">
                  {formatValue(prev, metric)}{unit}
                </span>
                <span className="text-white/40">→</span>
                <span className="text-base font-semibold text-white">
                  {formatValue(curr, metric)}{unit}
                </span>
                <span
                  className={`
                    text-sm font-bold
                    ${change.isPositive ? 'text-class-noble' : 'text-highlight-red'}
                  `}
                >
                  {change.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default ProgressCard;
