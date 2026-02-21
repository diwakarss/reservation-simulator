/**
 * Shared chart styling constants
 * Centralized theme and styling for all chart components
 */

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#1a1a2e',
  border: '1px solid #2a2a4a',
  borderRadius: '8px',
  color: '#f0f0ff',
} as const;

export const CHART_LABEL_STYLE = {
  color: '#a7a7c4',
} as const;

export const CHART_AXIS_STYLE = {
  stroke: '#a7a7c4',
  fontSize: 14,
  tickLine: false,
  axisLine: { stroke: '#2a2a4a' },
} as const;

export const CHART_GRID_STYLE = {
  strokeDasharray: '3 3',
  stroke: '#2a2a4a',
} as const;

export const CHART_MARGIN = {
  top: 5,
  right: 20,
  left: 10,
  bottom: 5,
} as const;
