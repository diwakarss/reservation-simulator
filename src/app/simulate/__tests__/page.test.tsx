import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import SimulatePage from '../page';
import { useSimulationStore } from '@/lib/store';
import { SimulationPhase, createDefaultReservationPolicy } from '@/lib/simulation/types';
import { generateWorld } from '@/lib/content/worldGenerator';
import { captureSnapshot } from '@/lib/simulation/engine';

// Mock the store module to prevent initializeFromBootstrap from running
vi.mock('@/lib/store', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    initializeFromBootstrap: vi.fn(), // No-op to prevent state reset
  };
});

// Mock next/dynamic to render synchronously
vi.mock('next/dynamic', () => ({
  default: (importFn: () => Promise<{ ChartsPanel: React.ComponentType<{ onClose: () => void }> }>) => {
    // Return a simple component that renders the ChartsPanel mock
    const MockedChartsPanel = ({ onClose }: { onClose: () => void }) => (
      <div data-testid="charts-panel">
        Charts Panel
        <button onClick={onClose}>Close</button>
      </div>
    );
    MockedChartsPanel.displayName = 'DynamicChartsPanel';
    return MockedChartsPanel;
  },
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the components to simplify testing
vi.mock('@/components/narrative', () => ({
  GalaxyIntro: () => <div data-testid="galaxy-intro">Galaxy Intro</div>,
  TraitReveal: () => <div data-testid="trait-reveal">Trait Reveal</div>,
}));

vi.mock('@/components/policy', () => ({
  PolicyBottom2: () => <div data-testid="policy-bottom-2">Policy Bottom 2</div>,
  PolicyMiddle: () => <div data-testid="policy-middle">Policy Middle</div>,
  PolicyCreamyLayer: () => <div data-testid="policy-creamy-layer">Policy Creamy Layer</div>,
  PolicyEWS: () => <div data-testid="policy-ews">Policy EWS</div>,
  PolicyRemoval: () => <div data-testid="policy-removal">Policy Removal</div>,
}));

vi.mock('@/components/simulation', () => ({
  SettingsDrawer: () => <div data-testid="settings-drawer">Settings Drawer</div>,
}));

vi.mock('@/components/simulation/EndSummary', () => ({
  EndSummary: () => <div data-testid="end-summary">End Summary</div>,
}));

vi.mock('@/components/charts', () => ({
  ChartsPanel: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="charts-panel">
      Charts Panel
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// Store original location
const originalLocation = window.location;
const originalURLSearchParams = URLSearchParams;

function mockURLParams(params: string) {
  // Mock window.location.search
  Object.defineProperty(window, 'location', {
    writable: true,
    configurable: true,
    value: {
      ...originalLocation,
      search: params,
    },
  });
}

function resetStore(phase: SimulationPhase = SimulationPhase.INTRO) {
  const world = generateWorld('simulate-page-test-seed');
  const policy = createDefaultReservationPolicy();

  // Create base state
  const baseState = {
    phase,
    world,
    currentYear: 0,
    policy,
    history: [] as ReturnType<typeof captureSnapshot>[],
    redoStack: [] as ReturnType<typeof captureSnapshot>[],
    highlight: null,
    timeJumpSize: 20,
    settingsOpen: false,
    chartsOpen: false,
  };

  // Create initial snapshot at year 0
  const year0Snapshot = captureSnapshot(baseState);

  // For phases that need history (POLICY_MIDDLE and beyond), add a second snapshot
  const phasesNeedingMultipleSnapshots = [
    SimulationPhase.POLICY_MIDDLE,
    SimulationPhase.POLICY_CREAMY_LAYER,
    SimulationPhase.POLICY_EWS,
    SimulationPhase.POLICY_REMOVAL,
    SimulationPhase.END_SUMMARY,
  ];
  const needsMultipleSnapshots = phasesNeedingMultipleSnapshots.includes(phase);

  let history;
  let currentYear = 0;
  if (needsMultipleSnapshots) {
    // Create a second snapshot at year 20+
    const year20Snapshot = captureSnapshot({
      ...baseState,
      currentYear: 20,
    });
    history = [year0Snapshot, year20Snapshot];
    currentYear = 20;
  } else {
    history = [year0Snapshot];
  }

  useSimulationStore.setState({
    phase,
    world,
    currentYear,
    policy,
    history,
    redoStack: [],
    highlight: null,
    timeJumpSize: 20,
    settingsOpen: false,
    chartsOpen: false,
  });
}

describe('SimulatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL to have seed param so the page doesn't reset on mount
    mockURLParams('?seed=test');
  });

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  it('renders INTRO phase component', async () => {
    resetStore(SimulationPhase.INTRO);
    render(<SimulatePage />);

    await waitFor(() => {
      expect(screen.getByTestId('galaxy-intro')).toBeInTheDocument();
    });
  });

  it('renders TRAIT_REVEAL phase component', async () => {
    resetStore(SimulationPhase.TRAIT_REVEAL);
    render(<SimulatePage />);

    await waitFor(() => {
      expect(screen.getByTestId('trait-reveal')).toBeInTheDocument();
    });
  });

  it('skips PRE_RESERVATION and goes to POLICY_BOTTOM_2', async () => {
    resetStore(SimulationPhase.PRE_RESERVATION);
    render(<SimulatePage />);

    // PRE_RESERVATION should skip to POLICY_BOTTOM_2
    await waitFor(() => {
      expect(screen.getByTestId('policy-bottom-2')).toBeInTheDocument();
    });
  });

  it('renders POLICY_BOTTOM_2 phase component', async () => {
    resetStore(SimulationPhase.POLICY_BOTTOM_2);
    render(<SimulatePage />);

    await waitFor(() => {
      expect(screen.getByTestId('policy-bottom-2')).toBeInTheDocument();
    });
  });

  it('renders POLICY_MIDDLE phase component', async () => {
    resetStore(SimulationPhase.POLICY_MIDDLE);
    render(<SimulatePage />);

    await waitFor(() => {
      expect(screen.getByTestId('policy-middle')).toBeInTheDocument();
    });
  });

  it('renders POLICY_CREAMY_LAYER phase component', async () => {
    resetStore(SimulationPhase.POLICY_CREAMY_LAYER);
    render(<SimulatePage />);

    await waitFor(() => {
      expect(screen.getByTestId('policy-creamy-layer')).toBeInTheDocument();
    });
  });

  it('renders POLICY_EWS phase component', async () => {
    resetStore(SimulationPhase.POLICY_EWS);
    render(<SimulatePage />);

    await waitFor(() => {
      expect(screen.getByTestId('policy-ews')).toBeInTheDocument();
    });
  });

  it('renders POLICY_REMOVAL phase component', async () => {
    resetStore(SimulationPhase.POLICY_REMOVAL);
    render(<SimulatePage />);

    await waitFor(() => {
      expect(screen.getByTestId('policy-removal')).toBeInTheDocument();
    });
  });

  it('renders END_SUMMARY phase component', async () => {
    resetStore(SimulationPhase.END_SUMMARY);
    render(<SimulatePage />);

    await waitFor(() => {
      expect(screen.getByTestId('end-summary')).toBeInTheDocument();
    });
  });

  it('shows settings drawer when settingsOpen is true', async () => {
    resetStore(SimulationPhase.POLICY_BOTTOM_2);

    act(() => {
      useSimulationStore.setState({ settingsOpen: true });
    });

    render(<SimulatePage />);

    await waitFor(() => {
      expect(screen.getByTestId('settings-drawer')).toBeInTheDocument();
    });
  });

  it('shows charts panel when chartsOpen is true', async () => {
    resetStore(SimulationPhase.END_SUMMARY);

    act(() => {
      useSimulationStore.setState({ chartsOpen: true });
    });

    render(<SimulatePage />);

    await waitFor(() => {
      expect(screen.getByTestId('charts-panel')).toBeInTheDocument();
    });
  });

  it('auto-advances from WORLD_GEN to TRAIT_REVEAL', async () => {
    resetStore(SimulationPhase.WORLD_GEN);
    render(<SimulatePage />);

    // WORLD_GEN should auto-advance to TRAIT_REVEAL within 500ms
    // Use real timers since fake timers don't play well with React async
    await waitFor(
      () => {
        expect(useSimulationStore.getState().phase).toBe(SimulationPhase.TRAIT_REVEAL);
      },
      { timeout: 2000 }
    );
  });
});
