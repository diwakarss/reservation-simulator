'use client';

/**
 * MetricCard - Highlights a metric improvement with animation
 *
 * Displays the biggest improvement after a time jump with visual styling
 * showing before/after values, percent change, and improvement badge.
 *
 * Example output: "Lower Deaflings improved most in Education: 3% -> 12%"
 */

import { motion } from 'framer-motion';
import {
  NarrativeHighlight,
  CLASS_COLORS,
  METRIC_LABELS,
  METRIC_UNITS,
  METRIC_HIGHER_IS_BETTER,
} from '@/lib/simulation/types';

interface MetricCardProps {
  /** The highlight data to display */
  highlight: NarrativeHighlight;
  /** Optional additional CSS classes */
  className?: string;
  /** Whether to show animated entrance */
  animate?: boolean;
}

export function MetricCard({
  highlight,
  className = '',
  animate = true,
}: MetricCardProps) {
  const {
    classDisplayName,
    classTier,
    metric,
    fromValue,
    toValue,
    change,
    percentChange,
  } = highlight;

  const color = CLASS_COLORS[classTier];
  const metricLabel = METRIC_LABELS[metric];
  const unit = METRIC_UNITS[metric];
  const higherIsBetter = METRIC_HIGHER_IS_BETTER[metric];

  // Determine if change represents an improvement based on metric direction
  const isImprovement = higherIsBetter ? change > 0 : change < 0;

  // Format change sign: '+' for positive improvements, empty for decreases
  const changePrefix = isImprovement && change > 0 ? '+' : '';

  // Display magnitude of change (always positive for display)
  const changeDisplay = higherIsBetter ? change : -change;

  // Format numeric values: income uses thousands separator, others use 1 decimal place
  const formatValue = (val: number): string => {
    if (metric === 'incomePerCapita') {
      return val.toLocaleString();
    }
    return val.toFixed(1);
  };

  const content = (
    <div
      className={`
        glass-card p-6 border-glow-accent
        ${className}
      `}
      style={{
        borderColor: `${color}40`,
        boxShadow: `0 0 30px ${color}20`
      }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
        />
        <span
          className="font-grotesk text-lg font-semibold tracking-wide"
          style={{ color }}
        >
          {classDisplayName}
        </span>
      </div>

      {/* Metric Label */}
      <p className="mb-2 font-grotesk text-xs uppercase tracking-widest text-muted-text">
        {metricLabel}
      </p>

      {/* Value Change */}
      <div className="flex items-baseline gap-4">
        <span className="font-data text-xl text-white/50">
          {formatValue(fromValue)}{unit}
        </span>
        <span className="text-2xl text-muted-text">→</span>
        <span
          className="font-data text-3xl font-bold text-glow-accent"
          style={{ color, textShadow: `0 0 20px ${color}60` }}
        >
          {formatValue(toValue)}{unit}
        </span>
      </div>

      {/* Change Badge */}
      <div className="mt-4 flex items-center gap-2">
        <span
          className={`
            inline-flex items-center gap-1 rounded-full px-3 py-1.5
            text-sm font-grotesk font-semibold
            ${isImprovement ? 'bg-emerald-500/20 text-emerald-400' : 'bg-pink-500/20 text-pink-400'}
          `}
        >
          {changePrefix}{changeDisplay.toFixed(1)}{unit}
          <span className="text-xs opacity-70">
            ({Math.abs(percentChange).toFixed(0)}%)
          </span>
        </span>
        <span className="text-sm text-muted-text">
          {isImprovement ? 'improvement' : 'change'}
        </span>
      </div>
    </div>
  );

  if (!animate) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: 'easeOut',
      }}
    >
      {content}
    </motion.div>
  );
}

export default MetricCard;
