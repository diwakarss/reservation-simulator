'use client';

/**
 * IncomeGapChart - Line chart showing income gap ratio over time
 *
 * Shows the ratio of upper class income to lower class income,
 * which is a key indicator of economic inequality.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { ChartDataPoint } from '@/lib/simulation/types';
import {
  CHART_TOOLTIP_STYLE,
  CHART_LABEL_STYLE,
  CHART_AXIS_STYLE,
  CHART_GRID_STYLE,
  CHART_MARGIN,
} from './chartStyles';

interface IncomeGapChartProps {
  /** Data points with year and income gap ratio */
  data: Array<{ year: number; gap: number }>;
  /** Optional height */
  height?: number;
}

export function IncomeGapChart({
  data,
  height = 300,
}: IncomeGapChartProps) {
  const chartTitle = 'Income Gap Over Time';

  // Calculate if gap is improving or worsening
  const firstGap = data.length > 0 ? data[0].gap : 0;
  const lastGap = data.length > 0 ? data[data.length - 1].gap : 0;
  const gapChange = lastGap - firstGap;
  const isImproving = gapChange < 0;

  return (
    <div className="w-full" role="figure" aria-label={chartTitle}>
      <h3 className="mb-2 font-orbitron text-base uppercase tracking-wide text-white">
        {chartTitle}
      </h3>
      <p className="mb-4 text-sm text-white/70">
        Upper class earns <span className={isImproving ? 'text-green-400' : 'text-highlight-red'}>{lastGap.toFixed(0)}x</span> more than lower class
        {gapChange !== 0 && (
          <span className={isImproving ? 'text-green-400' : 'text-highlight-red'}>
            {' '}({isImproving ? '' : '+'}{gapChange.toFixed(1)}x since Year 0)
          </span>
        )}
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid {...CHART_GRID_STYLE} />
          <XAxis dataKey="year" {...CHART_AXIS_STYLE} />
          <YAxis
            {...CHART_AXIS_STYLE}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `${value}x`}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            labelStyle={CHART_LABEL_STYLE}
            formatter={(value: number) => [`${value.toFixed(1)}x`, 'Income Gap']}
            labelFormatter={(year) => `Year ${year}`}
          />
          <ReferenceLine
            y={firstGap}
            stroke="#a7a7c4"
            strokeDasharray="3 3"
            label={{ value: 'Year 0', fill: '#a7a7c4', fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="gap"
            name="Income Gap Ratio"
            stroke="#e94560"
            strokeWidth={3}
            dot={{ fill: '#e94560', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#e94560' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default IncomeGapChart;
