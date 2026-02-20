import React from 'react';
import { motion } from 'framer-motion';
import { SocialClass, ClassTier, CLASS_COLORS, METRIC_LABELS } from '@/lib/simulation/types';

interface ComparisonTableProps {
  /** Year 0 (baseline) classes */
  baselineClasses: SocialClass[];
  /** Current year classes */
  currentClasses: SocialClass[];
  /** Current year for display */
  currentYear: number;
}

/**
 * ComparisonTable - Year 0 vs Year N comparison (PLAN.md Task 9)
 *
 * Shows before/after metrics for all 5 classes in a table format.
 * Used primarily in POLICY_REMOVAL screen (Year 80 comparison).
 *
 * Features:
 * - Side-by-side comparison (Year 0 | Year N)
 * - Color-coded class names
 * - Delta indicators (↑/↓) with color
 * - All 6 metrics displayed
 */
export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  baselineClasses,
  currentClasses,
  currentYear,
}) => {
  const metrics: Array<keyof typeof METRIC_LABELS> = [
    'education',
    'employment',
    'wealth',
    'poverty',
    'lifeExpectancy',
    'incomePerCapita',
  ];

  const formatValue = (metric: string, value: number): string => {
    if (metric === 'incomePerCapita') {
      return `₢${Math.round(value).toLocaleString()}`;
    }
    if (metric === 'lifeExpectancy') {
      return `${Math.round(value)} yrs`;
    }
    return `${Math.round(value)}%`;
  };

  const getDelta = (
    metric: string,
    baseline: number,
    current: number
  ): { value: number; isPositive: boolean; isImprovement: boolean } => {
    const delta = current - baseline;
    const isPositive = delta > 0;

    // Lower poverty is better
    const isImprovement = metric === 'poverty' ? delta < 0 : delta > 0;

    return { value: Math.abs(delta), isPositive, isImprovement };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-black/30 px-4 py-3 border-b border-white/10">
        <h3 className="font-orbitron font-bold text-white text-lg">
          Impact Analysis: Year 0 → Year {currentYear}
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          How each class's metrics changed over {currentYear} years
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left font-rajdhani font-bold text-gray-300 uppercase text-xs">
                Class
              </th>
              <th className="px-4 py-3 text-left font-rajdhani font-bold text-gray-300 uppercase text-xs">
                Metric
              </th>
              <th className="px-4 py-3 text-center font-rajdhani font-bold text-gray-300 uppercase text-xs">
                Year 0
              </th>
              <th className="px-4 py-3 text-center font-rajdhani font-bold text-gray-300 uppercase text-xs">
                Year {currentYear}
              </th>
              <th className="px-4 py-3 text-center font-rajdhani font-bold text-gray-300 uppercase text-xs">
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {currentClasses.map((currentClass, classIndex) => {
              const baselineClass = baselineClasses[classIndex];
              const classColor = CLASS_COLORS[currentClass.tier];

              return metrics.map((metric, metricIndex) => {
                const isFirstMetric = metricIndex === 0;
                const baselineValue = baselineClass.metrics[metric];
                const currentValue = currentClass.metrics[metric];
                const delta = getDelta(metric, baselineValue, currentValue);

                return (
                  <tr
                    key={`${currentClass.tier}-${metric}`}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                      isFirstMetric ? 'border-t-2 border-white/20' : ''
                    }`}
                  >
                    {/* Class Name (merged cell for first metric) */}
                    {isFirstMetric && (
                      <td
                        rowSpan={metrics.length}
                        className="px-4 py-3 font-rajdhani font-bold align-top"
                        style={{ color: classColor }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: classColor }}
                            aria-hidden="true"
                          />
                          <span className="whitespace-nowrap">{currentClass.displayName}</span>
                        </div>
                      </td>
                    )}

                    {/* Metric Name */}
                    <td className="px-4 py-2 text-gray-300 text-xs">
                      {METRIC_LABELS[metric]}
                    </td>

                    {/* Year 0 Value */}
                    <td className="px-4 py-2 text-center font-mono text-white">
                      {formatValue(metric, baselineValue)}
                    </td>

                    {/* Current Year Value */}
                    <td className="px-4 py-2 text-center font-mono text-white font-semibold">
                      {formatValue(metric, currentValue)}
                    </td>

                    {/* Delta */}
                    <td className="px-4 py-2 text-center">
                      {delta.value > 0 ? (
                        <span
                          className={`font-rajdhani font-bold text-sm ${
                            delta.isImprovement ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {delta.isPositive ? '↑' : '↓'} {formatValue(metric, delta.value)}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
