'use client';

/**
 * ChartDataTable
 *
 * Visually hidden data table for screen reader accessibility.
 * Provides tabular data representation of chart data.
 */

import type { ChartDataPoint, ClassTier } from '@/lib/simulation/types';
import { CLASS_TIER_ORDER } from '@/lib/simulation/types';

interface ChartDataTableProps {
  /** Chart title for screen reader context */
  title: string;
  /** Data points to display */
  data: ChartDataPoint[];
  /** Class display names */
  classNames: Record<ClassTier, string>;
  /** Value formatter (e.g., adding % symbol) */
  formatValue?: (value: number) => string;
  /** Unit label for the metric */
  unit?: string;
}

/**
 * Hidden table providing chart data for screen readers.
 * Visually hidden but accessible to assistive technologies.
 */
export function ChartDataTable({
  title,
  data,
  classNames,
  formatValue = (v) => v.toFixed(1),
  unit = '%',
}: ChartDataTableProps) {
  return (
    <div className="sr-only" role="region" aria-label={`${title} data table`}>
      <table>
        <caption>{title} - Tabular Data</caption>
        <thead>
          <tr>
            <th scope="col">Year</th>
            {CLASS_TIER_ORDER.map((tier) => (
              <th key={tier} scope="col">
                {classNames[tier]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.year}>
              <th scope="row">Year {point.year}</th>
              {CLASS_TIER_ORDER.map((tier) => (
                <td key={tier}>
                  {formatValue(point[tier] as number)}{unit}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ChartDataTable;
