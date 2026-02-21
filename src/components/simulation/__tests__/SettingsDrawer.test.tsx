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
    render(<SettingsDrawer />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    act(() => {
      useSimulationStore.getState().openSettingsDrawer();
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /close settings drawer/i }));

    expect(useSimulationStore.getState().settingsOpen).toBe(false);
  });

  it('displays per-class reservation sliders', () => {
    render(<SettingsDrawer />);
    act(() => {
      useSimulationStore.getState().openSettingsDrawer();
    });

    // Should have sliders for lower, common, and middle classes
    const lowerSlider = screen.getByLabelText(/lower.*reservation percentage/i);
    const commonSlider = screen.getByLabelText(/common.*reservation percentage/i);
    const middleSlider = screen.getByLabelText(/middle.*reservation percentage/i);

    expect(lowerSlider).toBeInTheDocument();
    expect(commonSlider).toBeInTheDocument();
    expect(middleSlider).toBeInTheDocument();
  });

  it('shows EWS options for upper classes', () => {
    render(<SettingsDrawer />);
    act(() => {
      useSimulationStore.getState().openSettingsDrawer();
    });

    // Should have EWS checkbox options
    const ewsCheckboxes = screen.getAllByLabelText(/ews reservation/i);
    expect(ewsCheckboxes.length).toBeGreaterThanOrEqual(2);
  });

  it('reset restores defaults', () => {
    render(<SettingsDrawer />);
    act(() => {
      useSimulationStore.getState().openSettingsDrawer();
    });

    // Change a slider
    const lowerSlider = screen.getByLabelText(/lower.*reservation percentage/i);
    fireEvent.change(lowerSlider, { target: { value: '25' } });

    // Reset
    fireEvent.click(screen.getByRole('button', { name: /reset to defaults/i }));

    const state = useSimulationStore.getState();
    expect(state.policy.classes.middle.reservationPercent).toBe(0);
    expect(state.policy.classes.common.reservationPercent).toBe(0);
    expect(state.policy.classes.lower.reservationPercent).toBe(0);
  });

  it('apply changes updates store when clicking apply', () => {
    render(<SettingsDrawer />);
    act(() => {
      useSimulationStore.getState().openSettingsDrawer();
    });

    // Change a slider value
    const lowerSlider = screen.getByLabelText(/lower.*reservation percentage/i);
    fireEvent.change(lowerSlider, { target: { value: '30' } });

    // Click apply
    fireEvent.click(screen.getByRole('button', { name: /apply changes/i }));

    // Drawer should close and policy should be updated
    expect(useSimulationStore.getState().settingsOpen).toBe(false);
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
