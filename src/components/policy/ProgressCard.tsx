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
  return value.toFixed(0);
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
  const text = `${arrow} ${Math.abs(diff).toFixed(0)}`;
  return { text, isPositive };
}

const DEFAULT_METRICS: MetricKey[] = ['education', 'employment', 'poverty'];

export function ProgressCard({
  tier,
  displayName,
  previousMetrics,
  currentMetrics,
  metricsToShow = DEFAULT_METRICS,
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
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h4
          className="font-rajdhani font-bold text-base"
          style={{ color }}
        >
          {displayName}
        </h4>
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
              <span className="text-sm text-muted-text">
                {METRIC_LABELS[metric]}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-text/60">
                  {formatValue(prev, metric)}{unit}
                </span>
                <span className="text-muted-text/40">→</span>
                <span className="text-sm font-semibold text-white">
                  {formatValue(curr, metric)}{unit}
                </span>
                <span
                  className={`
                    text-xs font-bold
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
