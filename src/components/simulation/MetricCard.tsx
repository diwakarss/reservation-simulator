'use client';

/**
 * MetricCard - Highlights a metric improvement with animation
 *
 * Used to show the biggest improvement after a time jump,
 * e.g., "Lower Deaflings improved most in Education: 3% -> 12%"
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

  // Determine if this is an improvement
  const isImprovement = higherIsBetter ? change > 0 : change < 0;
  const arrow = isImprovement ? (change > 0 ? '+' : '') : '';
  const changeDisplay = higherIsBetter ? change : -change;

  // Format values
  const formatValue = (val: number) => {
    if (metric === 'incomePerCapita') {
      return `${val.toLocaleString()}`;
    }
    if (metric === 'lifeExpectancy') {
      return val.toFixed(1);
    }
    return val.toFixed(1);
  };

  const content = (
    <div
      className={`
        rounded-xl border-2 p-6
        bg-gradient-to-br from-cosmic-blue/80 to-deep-purple/80
        backdrop-blur-sm
        ${className}
      `}
      style={{ borderColor: color }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span
          className="font-orbitron text-lg font-bold uppercase tracking-wide"
          style={{ color }}
        >
          {classDisplayName}
        </span>
      </div>

      {/* Metric Label */}
      <p className="mb-2 font-rajdhani text-sm uppercase tracking-wider text-muted-text">
        {metricLabel}
      </p>

      {/* Value Change */}
      <div className="flex items-baseline gap-4">
        <span className="font-rajdhani text-xl text-white/60">
          {formatValue(fromValue)}{unit}
        </span>
        <span className="text-2xl text-muted-text">{'>'}</span>
        <span
          className="font-orbitron text-3xl font-bold"
          style={{ color }}
        >
          {formatValue(toValue)}{unit}
        </span>
      </div>

      {/* Change Badge */}
      <div className="mt-4 flex items-center gap-2">
        <span
          className={`
            inline-flex items-center gap-1 rounded-full px-3 py-1
            text-sm font-rajdhani font-semibold
            ${isImprovement ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
          `}
        >
          {arrow}{changeDisplay.toFixed(1)}{unit}
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
