'use client';

/**
 * ClassMobilityChart - Composite metric showing overall class mobility progress
 *
 * Class Mobility Index is calculated from:
 * - Education access improvement for lower classes
 * - Poverty reduction for lower classes
 * - Income growth relative to upper classes
 *
 * Higher values indicate better upward mobility for disadvantaged classes.
 */

import { useState, useCallback } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CLASS_COLORS } from '@/lib/simulation/types';
import {
  CHART_TOOLTIP_STYLE,
  CHART_LABEL_STYLE,
  CHART_AXIS_STYLE,
  CHART_GRID_STYLE,
  CHART_MARGIN,
} from './chartStyles';

interface ClassMobilityChartProps {
  /** Data points with year and mobility metrics */
  data: Array<{
    year: number;
    lowerEdu: number;
    commonEdu: number;
    middleEdu: number;
    mobilityIndex: number;
  }>;
  /** Optional height */
  height?: number;
}

export function ClassMobilityChart({
  data,
  height = 300,
}: ClassMobilityChartProps) {
  const chartTitle = 'Class Mobility Index';
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [chartWidth, setChartWidth] = useState(0);

  // Track mouse position to determine tooltip side
  const handleMouseMove = useCallback((state: { chartX?: number; chartY?: number }) => {
    if (state.chartX !== undefined && chartWidth > 0) {
      // If mouse is on left half, show tooltip on right; otherwise on left
      const isLeftSide = state.chartX < chartWidth / 2;
      setTooltipPosition({
        x: isLeftSide ? chartWidth - 180 : 10,
        y: 10,
      });
    }
  }, [chartWidth]);

  // Calculate overall progress
  const firstIndex = data.length > 0 ? data[0].mobilityIndex : 0;
  const lastIndex = data.length > 0 ? data[data.length - 1].mobilityIndex : 0;
  const indexChange = lastIndex - firstIndex;

  return (
    <div className="w-full" role="figure" aria-label={chartTitle}>
      <h3 className="mb-2 font-orbitron text-base uppercase tracking-wide text-white">
        {chartTitle}
      </h3>
      <p className="mb-4 text-sm text-white/70">
        Education access for lower classes (bars) + composite mobility score (line)
        {indexChange !== 0 && (
          <span className={indexChange > 0 ? 'text-green-400' : 'text-highlight-red'}>
            {' '}• Index {indexChange > 0 ? '+' : ''}{indexChange.toFixed(0)} since Year 0
          </span>
        )}
      </p>
      <ResponsiveContainer width="100%" height={height} onResize={(width) => setChartWidth(width)}>
        <ComposedChart data={data} margin={CHART_MARGIN} onMouseMove={handleMouseMove}>
          <CartesianGrid {...CHART_GRID_STYLE} />
          <XAxis dataKey="year" {...CHART_AXIS_STYLE} />
          <YAxis
            yAxisId="left"
            {...CHART_AXIS_STYLE}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            {...CHART_AXIS_STYLE}
            domain={[0, 100]}
            tickFormatter={(value) => value}
          />
          <Tooltip
            contentStyle={{ ...CHART_TOOLTIP_STYLE, minWidth: '140px', maxWidth: '200px' }}
            labelStyle={CHART_LABEL_STYLE}
            formatter={(value: number, name: string) => {
              if (name === 'Mobility Index') return [value.toFixed(0), name];
              return [`${value.toFixed(1)}%`, name];
            }}
            labelFormatter={(year) => `Year ${year}`}
            position={tooltipPosition}
            wrapperStyle={{ zIndex: 100, pointerEvents: 'none', overflow: 'visible' }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-xs text-muted-text">{value}</span>
            )}
          />
          <Bar
            yAxisId="left"
            dataKey="lowerEdu"
            name="Lower Education"
            fill={CLASS_COLORS.lower}
            fillOpacity={0.7}
            barSize={12}
          />
          <Bar
            yAxisId="left"
            dataKey="commonEdu"
            name="Common Education"
            fill={CLASS_COLORS.common}
            fillOpacity={0.7}
            barSize={12}
          />
          <Bar
            yAxisId="left"
            dataKey="middleEdu"
            name="Middle Education"
            fill={CLASS_COLORS.middle}
            fillOpacity={0.7}
            barSize={12}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="mobilityIndex"
            name="Mobility Index"
            stroke="#22d3ee"
            strokeWidth={3}
            dot={{ fill: '#22d3ee', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#22d3ee' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ClassMobilityChart;
