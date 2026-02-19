'use client';

/**
 * PopulationChart - Stacked area chart showing population distribution
 *
 * Shows how the population is distributed across classes.
 * Note: Population percentages remain constant in this simulation model,
 * so this chart shows the stable distribution over time.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CLASS_COLORS, ClassTier, CLASS_TIER_ORDER } from '@/lib/simulation/types';
import type { ChartDataPoint } from '@/lib/simulation/types';
import { ChartLegend } from './ChartLegend';

interface PopulationChartProps {
  /** Data points with year and class population values */
  data: ChartDataPoint[];
  /** Class display names for legend */
  classNames: Record<ClassTier, string>;
  /** Optional height */
  height?: number;
}

export function PopulationChart({
  data,
  classNames,
  height = 300,
}: PopulationChartProps) {
  return (
    <div className="w-full">
      <h3 className="mb-4 font-orbitron text-sm uppercase tracking-wide text-white">
        Population Distribution
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          stackOffset="expand"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
          <XAxis
            dataKey="year"
            stroke="#a7a7c4"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#2a2a4a' }}
          />
          <YAxis
            stroke="#a7a7c4"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#2a2a4a' }}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a2e',
              border: '1px solid #2a2a4a',
              borderRadius: '8px',
              color: '#f0f0ff',
            }}
            labelStyle={{ color: '#a7a7c4' }}
            formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, '']}
            labelFormatter={(year) => `Year ${year}`}
          />
          {/* Render in reverse order so upper is on top visually */}
          {[...CLASS_TIER_ORDER].reverse().map((tier) => (
            <Area
              key={tier}
              type="monotone"
              dataKey={tier}
              name={classNames[tier]}
              stackId="1"
              stroke={CLASS_COLORS[tier]}
              fill={CLASS_COLORS[tier]}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <ChartLegend classNames={classNames} />
    </div>
  );
}

export default PopulationChart;
