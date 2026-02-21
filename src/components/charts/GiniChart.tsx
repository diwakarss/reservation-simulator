'use client';

/**
 * GiniChart - Line chart showing Gini coefficient over time
 *
 * The Gini coefficient measures wealth inequality (0 = perfect equality, 1 = perfect inequality).
 * Lower values indicate more equal distribution of wealth.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  CHART_TOOLTIP_STYLE,
  CHART_LABEL_STYLE,
  CHART_AXIS_STYLE,
  CHART_GRID_STYLE,
  CHART_MARGIN,
} from './chartStyles';

interface GiniChartProps {
  /** Data points with year and gini coefficient */
  data: Array<{ year: number; gini: number }>;
  /** Optional height */
  height?: number;
}

export function GiniChart({
  data,
  height = 300,
}: GiniChartProps) {
  const chartTitle = 'Wealth Inequality (Gini)';

  // Normalize data to ensure gini is between 0 and 1
  const normalizedData = data.map(d => ({
    ...d,
    gini: Math.max(0, Math.min(1, d.gini)),
  }));

  // Calculate if inequality is improving
  const firstGini = normalizedData.length > 0 ? normalizedData[0].gini : 0;
  const lastGini = normalizedData.length > 0 ? normalizedData[normalizedData.length - 1].gini : 0;
  const giniChange = lastGini - firstGini;
  const isImproving = giniChange < 0;

  // Interpret the Gini coefficient
  const getGiniLabel = (gini: number) => {
    if (gini < 0.3) return 'Low inequality';
    if (gini < 0.4) return 'Moderate inequality';
    if (gini < 0.5) return 'High inequality';
    return 'Extreme inequality';
  };

  return (
    <div className="w-full" role="figure" aria-label={chartTitle}>
      <h3 className="mb-2 font-orbitron text-base uppercase tracking-wide text-white">
        {chartTitle}
      </h3>
      <p className="mb-4 text-sm text-white/70">
        Current: <span className={lastGini < 0.4 ? 'text-green-400' : 'text-accent-gold'}>{(lastGini * 100).toFixed(0)}%</span>
        {' '}({getGiniLabel(lastGini)})
        {giniChange !== 0 && (
          <span className={isImproving ? 'text-green-400' : 'text-highlight-red'}>
            {' '}• {isImproving ? 'Improved' : 'Worsened'} by {Math.abs(giniChange * 100).toFixed(1)}%
          </span>
        )}
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={normalizedData} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id="giniGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e2b714" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#e2b714" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid {...CHART_GRID_STYLE} />
          <XAxis dataKey="year" {...CHART_AXIS_STYLE} />
          <YAxis
            {...CHART_AXIS_STYLE}
            domain={[0, 1]}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            labelStyle={CHART_LABEL_STYLE}
            formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Gini Index']}
            labelFormatter={(year) => `Year ${year}`}
          />
          {/* Reference lines for interpretation */}
          <ReferenceLine y={0.3} stroke="#4ade80" strokeDasharray="3 3" />
          <ReferenceLine y={0.5} stroke="#e94560" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="gini"
            name="Gini Coefficient"
            stroke="#e2b714"
            strokeWidth={2}
            fill="url(#giniGradient)"
            dot={{ fill: '#e2b714', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, fill: '#e2b714' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-center gap-4 text-sm text-white/70">
        <span className="flex items-center gap-1">
          <span className="w-4 h-0.5 bg-green-400"></span> Low (&lt;30%)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-0.5 bg-highlight-red"></span> High (&gt;50%)
        </span>
      </div>
    </div>
  );
}

export default GiniChart;
