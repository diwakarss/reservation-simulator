import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { ChartsPanel } from '../ChartsPanel';
import { useSimulationStore } from '@/lib/store';
import { SimulationPhase, createDefaultReservationPolicy } from '@/lib/simulation/types';
import { generateWorld } from '@/lib/content/worldGenerator';
import { captureSnapshot, stepSimulation } from '@/lib/simulation/engine';

// Mock Recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  Legend: () => <div data-testid="legend" />,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
}));

function resetStoreWithHistory() {
  const world = generateWorld('charts-test-seed');
  const policy = createDefaultReservationPolicy();
  policy.classes.lower.reservationPercent = 27;
  policy.classes.common.reservationPercent = 15;

  let state = {
    phase: SimulationPhase.POLICY_BOTTOM_2 as SimulationPhase,
    world,
    currentYear: 0,
    policy,
    history: [] as ReturnType<typeof captureSnapshot>[],
    redoStack: [],
    highlight: null,
    timeJumpSize: 20,
    settingsOpen: false,
    chartsOpen: true,
  };

  // Capture initial snapshot
  state.history = [captureSnapshot(state)];

  // Advance to year 40 to have multiple snapshots
  state = stepSimulation(state, 40);

  useSimulationStore.setState(state);
}

describe('ChartsPanel', () => {
  beforeEach(() => {
    resetStoreWithHistory();
  });

  it('renders with chart containers', () => {
    const onClose = vi.fn();
    render(<ChartsPanel onClose={onClose} />);

    // Should have chart containers
    expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThan(0);
  });

  it('displays back button that calls onClose', () => {
    const onClose = vi.fn();
    render(<ChartsPanel onClose={onClose} />);

    const backButton = screen.getByText(/back to simulation/i);
    fireEvent.click(backButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows year range in header', () => {
    const onClose = vi.fn();
    render(<ChartsPanel onClose={onClose} />);

    // Should show year range
    expect(screen.getByText(/year 0 - 40/i)).toBeInTheDocument();
  });

  it('renders mobile tab navigation', () => {
    const onClose = vi.fn();
    render(<ChartsPanel onClose={onClose} />);

    // Mobile tabs should be present - use getAllByText since text appears multiple times
    expect(screen.getAllByText(/education/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/employment/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/poverty/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/wealth/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/income/i).length).toBeGreaterThan(0);
  });

  it('renders timeline scrubber', () => {
    const onClose = vi.fn();
    render(<ChartsPanel onClose={onClose} />);

    // Timeline scrubber should be present
    const scrubber = screen.getByLabelText(/timeline year/i);
    expect(scrubber).toBeInTheDocument();
  });

  it('displays close button in footer', () => {
    const onClose = vi.fn();
    render(<ChartsPanel onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close charts/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
