import { describe, it, expect, beforeEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { SettingsDrawer } from '../SettingsDrawer';
import { useSimulationStore } from '@/lib/store';
import { SimulationPhase, createDefaultReservationPolicy } from '@/lib/simulation/types';
import { generateWorld } from '@/lib/content/worldGenerator';
import { captureSnapshot } from '@/lib/simulation/engine';

function resetStore() {
  const world = generateWorld('settings-test-seed');
  const policy = createDefaultReservationPolicy();
  const history = [
    captureSnapshot({
      phase: SimulationPhase.POLICY_BOTTOM_2,
      world,
      currentYear: 0,
      policy,
      history: [],
      redoStack: [],
      highlight: null,
      timeJumpSize: 20,
      settingsOpen: false,
      chartsOpen: false,
    }),
  ];

  useSimulationStore.setState({
    phase: SimulationPhase.POLICY_BOTTOM_2,
    world,
    currentYear: 0,
    policy,
    history,
    redoStack: [],
    highlight: null,
    timeJumpSize: 20,
    settingsOpen: false,
    chartsOpen: false,
  });
}

describe('SettingsDrawer', () => {
  beforeEach(() => {
    resetStore();
  });

  it('opens and closes from store state', () => {
    const onCloseSpy = useSimulationStore.getState().closeSettingsDrawer;
    render(<SettingsDrawer />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    act(() => {
      useSimulationStore.getState().openSettingsDrawer();
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /close settings drawer/i }));

    expect(useSimulationStore.getState().settingsOpen).toBe(false);
    expect(onCloseSpy).toBeTypeOf('function');
  });

  it('slider updates reservation policy in store', () => {
    render(<SettingsDrawer />);
    act(() => {
      useSimulationStore.getState().openSettingsDrawer();
    });

    const slider = screen.getByLabelText(/reservation percentage/i);
    fireEvent.change(slider, { target: { value: '30' } });

    const state = useSimulationStore.getState();
    expect(state.policy.classes.common.reservationPercent).toBe(30);
    expect(state.policy.classes.lower.reservationPercent).toBe(30);
  });

  it('reset restores defaults', () => {
    render(<SettingsDrawer />);
    act(() => {
      useSimulationStore.getState().openSettingsDrawer();
    });

    fireEvent.change(screen.getByLabelText(/reservation percentage/i), {
      target: { value: '25' },
    });
    fireEvent.click(screen.getByRole('button', { name: /10 years/i }));

    fireEvent.click(screen.getByRole('button', { name: /reset to defaults/i }));

    const state = useSimulationStore.getState();
    expect(state.policy.classes.middle.reservationPercent).toBe(0);
    expect(state.policy.classes.common.reservationPercent).toBe(0);
    expect(state.policy.classes.lower.reservationPercent).toBe(0);
    expect(state.timeJumpSize).toBe(20);
  });

  it('policy changes mid-simulation affect future years only', () => {
    const store = useSimulationStore.getState();
    store.setClassPolicy('lower', { reservationPercent: 20 });
    store.advanceTime(20);

    const snapshotAt20 = useSimulationStore.getState().history[1];
    const lowerEducationAt20 = snapshotAt20.classes.find((c) => c.tier === 'lower')?.metrics.education;

    store.setClassPolicy('lower', { reservationPercent: 40 });
    store.advanceTime(20);

    const state = useSimulationStore.getState();
    const unchangedPastSnapshot = state.history[1];
    const lowerEducationPast = unchangedPastSnapshot.classes.find((c) => c.tier === 'lower')?.metrics.education;

    expect(lowerEducationPast).toBe(lowerEducationAt20);
    expect(state.history[state.history.length - 1].year).toBe(40);
  });
});
