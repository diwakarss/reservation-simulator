'use client';

/**
 * ChartLegend - Dynamic legend showing class names with colors
 *
 * Displays the unique class display names from the current world,
 * not generic "Class 1-5" labels.
 */

import { CLASS_COLORS, ClassTier, CLASS_TIER_ORDER } from '@/lib/simulation/types';

interface ChartLegendProps {
  /** Mapping of tier to display name */
  classNames: Record<ClassTier, string>;
  /** Whether to show horizontally (default) or vertically */
  vertical?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

export function ChartLegend({
  classNames,
  vertical = false,
  className = '',
}: ChartLegendProps) {
  return (
    <div
      className={`
        mt-4 flex gap-4 text-xs
        ${vertical ? 'flex-col items-start' : 'flex-wrap justify-center'}
        ${className}
      `}
    >
      {CLASS_TIER_ORDER.map((tier) => (
        <div key={tier} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: CLASS_COLORS[tier] }}
          />
          <span className="font-rajdhani text-muted-text">
            {classNames[tier]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default ChartLegend;
