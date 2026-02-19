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

  return (
    <div className="w-full">
      <h3 className="mb-4 font-orbitron text-sm uppercase tracking-wide text-white">
        Wealth Distribution {year !== undefined && `(Year ${year})`}
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
            paddingAngle={2}
            label={({ displayName, value }) =>
              `${displayName.split(' ')[0]}: ${value.toFixed(1)}%`
            }
            labelLine={{ stroke: '#a7a7c4', strokeWidth: 1 }}
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
            contentStyle={{
              backgroundColor: '#1a1a2e',
              border: '1px solid #2a2a4a',
              borderRadius: '8px',
              color: '#f0f0ff',
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Wealth Share']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-sm text-muted-text">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 text-center">
        <span className="text-xs text-muted-text italic">
          Total wealth distribution across all classes
        </span>
      </div>
    </div>
  );
}

export default WealthPieChart;
