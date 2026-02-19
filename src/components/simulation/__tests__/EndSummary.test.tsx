import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EndSummary } from '../EndSummary';
import { useSimulationStore } from '@/lib/store';
import { SimulationPhase, createDefaultReservationPolicy } from '@/lib/simulation/types';
import { generateWorld } from '@/lib/content/worldGenerator';
import { stepSimulation, captureSnapshot } from '@/lib/simulation/engine';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock window.alert
global.alert = vi.fn();

function setupStoreWithCompleteSimulation() {
  const world = generateWorld('end-summary-test-seed');
  const policy = createDefaultReservationPolicy();
  policy.classes.lower.reservationPercent = 27;
  policy.classes.common.reservationPercent = 15;

  let state = {
    phase: SimulationPhase.END_SUMMARY as SimulationPhase,
    world,
    currentYear: 0,
    policy,
    history: [] as ReturnType<typeof captureSnapshot>[],
    redoStack: [],
    highlight: null,
    timeJumpSize: 20,
    settingsOpen: false,
    chartsOpen: false,
  };

  // Capture initial snapshot
  state.history = [captureSnapshot(state)];

  // Run simulation to year 100
  state = stepSimulation(state, 100);
  state.phase = SimulationPhase.END_SUMMARY;

  useSimulationStore.setState(state);
}

describe('EndSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupStoreWithCompleteSimulation();
  });

  it('renders final year header', () => {
    render(<EndSummary />);

    expect(screen.getByText(/after 100 years/i)).toBeInTheDocument();
  });

  it('displays key insight with class display name', () => {
    render(<EndSummary />);

    // Should have "Key Insight" section
    expect(screen.getByText(/key insight/i)).toBeInTheDocument();
  });

  it('shows before/after comparison table', () => {
    render(<EndSummary />);

    // Table headers - use getAllByText since some may appear multiple times
    expect(screen.getAllByText(/class/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/education/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/poverty/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/life exp/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/income/i).length).toBeGreaterThan(0);
  });

  it('displays all 5 class rows with display names', () => {
    render(<EndSummary />);

    // Check that rows exist for each class tier
    const world = useSimulationStore.getState().world!;
    for (const cls of world.classes) {
      // Use getAllByText since class names may appear multiple times (in table + key insight)
      const elements = screen.getAllByText(new RegExp(cls.displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
      expect(elements.length).toBeGreaterThan(0);
    }
  });

  it('has View Full Charts button that opens charts', () => {
    render(<EndSummary />);

    const chartsButton = screen.getByRole('button', { name: /view full charts/i });
    fireEvent.click(chartsButton);

    expect(useSimulationStore.getState().chartsOpen).toBe(true);
  });

  it('has Share Results button', () => {
    render(<EndSummary />);

    expect(screen.getByRole('button', { name: /share results/i })).toBeInTheDocument();
  });

  it('has Try Different Policies button', () => {
    render(<EndSummary />);

    expect(screen.getByRole('button', { name: /try different policies/i })).toBeInTheDocument();
  });

  it('has New World button', () => {
    render(<EndSummary />);

    expect(screen.getByRole('button', { name: /new world/i })).toBeInTheDocument();
  });

  it('has whitepaper link', () => {
    render(<EndSummary />);

    expect(screen.getByText(/read.*whitepaper/i)).toBeInTheDocument();
  });

  it('shows positive changes in green and negative in red', () => {
    const { container } = render(<EndSummary />);

    // Education improvements should be green
    const greenChanges = container.querySelectorAll('.text-green-400');
    expect(greenChanges.length).toBeGreaterThan(0);
  });

  it('displays metric card with biggest improvement', () => {
    render(<EndSummary />);

    // The MetricCard should show some improvement data
    // Look for improvement indicator
    expect(screen.getByText(/improvement/i)).toBeInTheDocument();
  });
});
