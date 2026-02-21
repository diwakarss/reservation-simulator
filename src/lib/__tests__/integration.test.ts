/**
 * Integration Tests
 *
 * End-to-end validation of the complete simulation journey.
 * Tests full state transitions and data consistency.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSimulationStore } from '@/lib/store';
import { SimulationPhase, createDefaultReservationPolicy } from '@/lib/simulation/types';
import { generateWorld } from '@/lib/content/worldGenerator';

describe('Simulation Integration', () => {
  beforeEach(() => {
    // Reset store to clean state
    useSimulationStore.setState({
      phase: SimulationPhase.INTRO,
      world: null,
      currentYear: 0,
      policy: createDefaultReservationPolicy(),
      history: [],
      redoStack: [],
      highlight: null,
      timeJumpSize: 20,
      settingsOpen: false,
      chartsOpen: false,
    });
  });

  describe('Full Journey - With Reservation', () => {
    it('completes full 200-year simulation with reservation policy', () => {
      const store = useSimulationStore.getState();

      // Step 1: Initialize world
      store.initializeWorld('integration-test-seed-1');
      const state1 = useSimulationStore.getState();
      expect(state1.world).toBeTruthy();
      expect(state1.currentYear).toBe(0);
      expect(state1.history.length).toBeGreaterThanOrEqual(1);

      // Step 2: Set reservation for bottom 2 classes (Year 0)
      store.setClassPolicy('lower', { reservationPercent: 27 });
      store.setClassPolicy('common', { reservationPercent: 22 });

      // Step 3: Advance 40 years
      store.advanceTime(40);
      const state2 = useSimulationStore.getState();
      expect(state2.currentYear).toBe(40);
      expect(state2.history.length).toBeGreaterThanOrEqual(2);

      // Verify metrics improved for lower classes
      const year0 = state2.history[0];
      const year40 = state2.history[state2.history.length - 1];
      const lowerClass0 = year0.classes.find((c) => c.tier === 'lower');
      const lowerClass40 = year40.classes.find((c) => c.tier === 'lower');

      expect(lowerClass40!.metrics.education).toBeGreaterThan(lowerClass0!.metrics.education);

      // Step 4: Extend to middle class (Year 40)
      store.setClassPolicy('middle', { reservationPercent: 15 });
      store.advanceTime(40);
      expect(useSimulationStore.getState().currentYear).toBe(80);

      // Step 5: Add creamy layer (Year 80)
      store.setCreamyLayer('lower', true, 5000);
      store.setCreamyLayer('common', true, 5000);
      store.advanceTime(40);
      expect(useSimulationStore.getState().currentYear).toBe(120);

      // Step 6: Add EWS (Year 120)
      store.setEWSPolicy('upper', true, 8000, 10);
      store.advanceTime(40);
      expect(useSimulationStore.getState().currentYear).toBe(160);

      // Step 7: Continue to Year 200
      store.advanceTime(40);
      const finalState = useSimulationStore.getState();
      expect(finalState.currentYear).toBe(200);
      expect(finalState.history.length).toBeGreaterThanOrEqual(6); // Year 0, 40, 80, 120, 160, 200 (may include intermediate years)

      // Verify significant improvement over 200 years
      const finalLower = finalState.history[finalState.history.length - 1].classes.find((c) => c.tier === 'lower');
      expect(finalLower!.metrics.education).toBeGreaterThan(lowerClass0!.metrics.education + 10);
      expect(finalLower!.metrics.poverty).toBeLessThan(lowerClass0!.metrics.poverty);
    });

    it('completes simulation without reservation policy', () => {
      const store = useSimulationStore.getState();

      // Initialize without setting any reservation
      store.initializeWorld('no-reservation-seed');

      // Advance through all policy phases without adding reservation
      for (let i = 0; i < 5; i++) {
        store.advanceTime(40);
      }

      const finalState = useSimulationStore.getState();
      expect(finalState.currentYear).toBe(200);

      // Lower class should have minimal improvement without reservation
      const year0Lower = finalState.history[0].classes.find((c) => c.tier === 'lower');
      const finalLower = finalState.history[5].classes.find((c) => c.tier === 'lower');

      // Without reservation, education gain should be much smaller
      const educationGain = finalLower!.metrics.education - year0Lower!.metrics.education;
      expect(educationGain).toBeLessThan(20); // Much less than with reservation
    });
  });

  describe('State Consistency', () => {
    it('maintains wealth sum at 100% throughout simulation', () => {
      const store = useSimulationStore.getState();
      store.initializeWorld('wealth-consistency-seed');
      store.setClassPolicy('lower', { reservationPercent: 30 });

      // Run 5 time jumps
      for (let i = 0; i < 5; i++) {
        store.advanceTime(20);
      }

      const history = useSimulationStore.getState().history;

      // Check wealth sums to ~100% for each year
      for (const snapshot of history) {
        const totalWealth = snapshot.classes.reduce(
          (sum, cls) => sum + cls.metrics.wealth,
          0
        );
        // Allow small floating point variance
        expect(totalWealth).toBeGreaterThan(99);
        expect(totalWealth).toBeLessThan(101);
      }
    });

    it('never has negative metrics', () => {
      const store = useSimulationStore.getState();
      store.initializeWorld('negative-check-seed');
      store.setClassPolicy('lower', { reservationPercent: 50 });
      store.setClassPolicy('common', { reservationPercent: 50 });

      for (let i = 0; i < 5; i++) {
        store.advanceTime(20);
      }

      const history = useSimulationStore.getState().history;

      for (const snapshot of history) {
        for (const cls of snapshot.classes) {
          expect(cls.metrics.education).toBeGreaterThanOrEqual(0);
          expect(cls.metrics.employment).toBeGreaterThanOrEqual(0);
          expect(cls.metrics.wealth).toBeGreaterThanOrEqual(0);
          expect(cls.metrics.poverty).toBeGreaterThanOrEqual(0);
          expect(cls.metrics.lifeExpectancy).toBeGreaterThanOrEqual(0);
          expect(cls.metrics.incomePerCapita).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('respects metric ceilings (education, employment <= 100%, life expectancy <= 80)', () => {
      const store = useSimulationStore.getState();
      store.initializeWorld('ceiling-check-seed');

      // Max out reservations
      store.setClassPolicy('lower', { reservationPercent: 50 });
      store.setClassPolicy('common', { reservationPercent: 50 });
      store.setClassPolicy('middle', { reservationPercent: 50 });

      // Run many years
      for (let i = 0; i < 10; i++) {
        store.advanceTime(20);
      }

      const history = useSimulationStore.getState().history;
      const finalSnapshot = history[history.length - 1];

      for (const cls of finalSnapshot.classes) {
        expect(cls.metrics.education).toBeLessThanOrEqual(100);
        expect(cls.metrics.employment).toBeLessThanOrEqual(100);
        expect(cls.metrics.lifeExpectancy).toBeLessThanOrEqual(80);
        expect(cls.metrics.poverty).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Undo/Redo', () => {
    it('goBack reduces history length when possible', () => {
      const store = useSimulationStore.getState();
      store.initializeWorld('undo-test-seed');

      store.setClassPolicy('lower', { reservationPercent: 20 });
      store.advanceTime(20);
      store.advanceTime(20);

      const beforeGoBack = useSimulationStore.getState();
      const historyLengthBefore = beforeGoBack.history.length;

      store.goBack();

      const afterGoBack = useSimulationStore.getState();
      // History should be shorter after goBack
      expect(afterGoBack.history.length).toBeLessThan(historyLengthBefore);
      // Redo stack should have something
      expect(afterGoBack.redoStack.length).toBeGreaterThan(0);
    });

    it('goForward restores from redo stack when available', () => {
      const store = useSimulationStore.getState();
      store.initializeWorld('redo-test-seed');

      store.advanceTime(20);
      store.advanceTime(20);

      store.goBack();
      const afterGoBack = useSimulationStore.getState();
      const historyAfterBack = afterGoBack.history.length;
      const redoAfterBack = afterGoBack.redoStack.length;

      store.goForward();

      const afterGoForward = useSimulationStore.getState();
      // History should increase after goForward
      expect(afterGoForward.history.length).toBeGreaterThan(historyAfterBack);
      // Redo stack should decrease
      expect(afterGoForward.redoStack.length).toBeLessThan(redoAfterBack);
    });
  });

  describe('Different Seeds', () => {
    it('produces different worlds for different seeds', () => {
      const store = useSimulationStore.getState();

      store.initializeWorld('seed-a');
      const worldA = useSimulationStore.getState().world;

      store.initializeWorld('seed-b');
      const worldB = useSimulationStore.getState().world;

      store.initializeWorld('seed-c');
      const worldC = useSimulationStore.getState().world;

      // At least trait or names should differ
      const traitsMatch =
        worldA!.trait.id === worldB!.trait.id &&
        worldB!.trait.id === worldC!.trait.id;

      const planetsMatch =
        worldA!.planetName === worldB!.planetName &&
        worldB!.planetName === worldC!.planetName;

      // Very unlikely all 3 random seeds produce identical results
      expect(traitsMatch && planetsMatch).toBe(false);
    });

    it('produces same world for same seed', () => {
      const store = useSimulationStore.getState();

      store.initializeWorld('determinism-seed');
      const world1 = useSimulationStore.getState().world;

      store.initializeWorld('determinism-seed');
      const world2 = useSimulationStore.getState().world;

      expect(world1!.trait.id).toBe(world2!.trait.id);
      expect(world1!.planetName).toBe(world2!.planetName);
      expect(world1!.nationName).toBe(world2!.nationName);
    });
  });
});
