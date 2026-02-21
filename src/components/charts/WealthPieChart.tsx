'use client';

/**
 * WealthPieChart - Pie chart showing wealth distribution
 *
 * Shows the relative wealth share of each class tier (sums to 100%).
 */

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CLASS_COLORS, ClassTier, CLASS_TIER_ORDER } from '@/lib/simulation/types';
import { CHART_TOOLTIP_STYLE } from './chartStyles';

interface WealthPieChartProps {
  /** Data with tier and wealth value */
  data: Array<{ tier: ClassTier; displayName: string; value: number }>;
  /** Optional height */
  height?: number;
  /** Current year for display */
  year?: number;
}

export function WealthPieChart({
  data,
  height = 300,
  year,
}: WealthPieChartProps) {
  // Ensure data sums to 100
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const normalizedData = data.map((d) => ({
    ...d,
    value: (d.value / total) * 100,
  }));

  const chartTitle = `Wealth Distribution${year !== undefined ? ` (Year ${year})` : ''}`;

  return (
    <div className="w-full" role="figure" aria-label={chartTitle}>
      <h3 className="mb-2 font-orbitron text-sm sm:text-base uppercase tracking-wide text-white truncate">
        {chartTitle}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={normalizedData}
            dataKey="value"
            nameKey="displayName"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            paddingAngle={3}
          >
            {normalizedData.map((entry) => (
              <Cell
                key={entry.tier}
                fill={CLASS_COLORS[entry.tier]}
                stroke="#1a1a2e"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            itemStyle={{ color: '#ffffff' }}
            labelStyle={{ color: '#ffffff' }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Wealth Share']}
          />
          <Legend
            verticalAlign="bottom"
            height={50}
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => (
              <span className="text-sm text-white/70">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 text-center">
        <span className="text-sm text-white/60 italic">
          Total wealth distribution across all classes
        </span>
      </div>
    </div>
  );
}

export default WealthPieChart;
