import { describe, it, expect, beforeEach } from 'vitest';
import {
  stepSimulation,
  captureSnapshot,
  findBiggestImprovement,
} from '../engine';
import {
  SimulationState,
  SimulationPhase,
  WorldConfig,
  SocialClass,
  ClassTier,
  createDefaultReservationPolicy,
  ClassPolicy,
} from '../types';
import {
  INITIAL_POPULATION_DISTRIBUTION,
  INITIAL_EDUCATION_ACCESS,
  INITIAL_EMPLOYMENT_ACCESS,
  INITIAL_WEALTH_SHARE,
  INITIAL_POVERTY_RATE,
  INITIAL_LIFE_EXPECTANCY,
  BASE_INCOME_BY_CLASS,
} from '../constants';

// Helper to create initial classes
function createInitialClasses(): SocialClass[] {
  const tiers: ClassTier[] = ['upper', 'noble', 'middle', 'common', 'lower'];
  return tiers.map((tier) => ({
    tier,
    displayName: tier.charAt(0).toUpperCase() + tier.slice(1),
    population: INITIAL_POPULATION_DISTRIBUTION[tier],
    metrics: {
      education: INITIAL_EDUCATION_ACCESS[tier],
      employment: INITIAL_EMPLOYMENT_ACCESS[tier],
      wealth: INITIAL_WEALTH_SHARE[tier],
      poverty: INITIAL_POVERTY_RATE[tier],
      lifeExpectancy: INITIAL_LIFE_EXPECTANCY[tier],
      incomePerCapita: BASE_INCOME_BY_CLASS[tier],
    },
  }));
}

describe('Simulation Engine', () => {
  let initialState: SimulationState;

  beforeEach(() => {
    const classes = createInitialClasses();
    const world: WorldConfig = {
      seed: 'test-seed-123',
      galaxyName: 'Test Galaxy',
      planetName: 'Test Planet',
      nationName: 'Test Nation',
      trait: {
        id: 'test-trait',
        text: 'Test Trait',
        category: 'Arbitrary',
        classNames: {
          upper: 'TestUpper',
          noble: 'TestNoble',
          middle: 'TestMiddle',
          common: 'TestCommon',
          lower: 'TestLower',
        },
      },
      classes: classes,
    };

    initialState = {
      phase: SimulationPhase.POLICY_BOTTOM_2,
      world: world,
      currentYear: 0,
      policy: createDefaultReservationPolicy(),
      history: [],
      redoStack: [],
      highlight: null,
      timeJumpSize: 20,
      settingsOpen: false,
      chartsOpen: false,
    };
  });

  describe('stepSimulation', () => {
    it('should advance simulation by given years', () => {
      const nextState = stepSimulation(initialState, 20);
      expect(nextState.currentYear).toBe(20);
      expect(nextState.history.length).toBe(20); // 1 snapshot per year
    });

    it('should calculate metrics deterministically', () => {
      const state1 = stepSimulation(initialState, 5);
      const state2 = stepSimulation(initialState, 5);
      
      // Check last snapshot
      const snap1 = state1.history[4];
      const snap2 = state2.history[4];
      
      expect(snap1.classes).toEqual(snap2.classes);
    });

    it('should improve education for reserved classes', () => {
      // Set reservation for lower class (Class 5)
      const policyWithReservation = createDefaultReservationPolicy();
      policyWithReservation.classes.lower.reservationPercent = 27;
      
      const stateWithRes = {
        ...initialState,
        policy: policyWithReservation,
      };
      
      const nextState = stepSimulation(stateWithRes, 20);
      const endClasses = nextState.history[19].classes;
      const lowerClass = endClasses.find((c) => c.tier === 'lower');
      
      // Expect meaningful improvement (target: ~10-12% from 3%)
      // With random variance, it might dip slightly below 10
      expect(lowerClass?.metrics.education).toBeGreaterThan(9);
      expect(lowerClass?.metrics.education).toBeLessThan(16); // Allow buffer
    });
    
    it('should generate valid aggregates', () => {
      const nextState = stepSimulation(initialState, 1);
      const snap = nextState.history[0];
      
      expect(snap.aggregates.totalPopulation).toBeCloseTo(100, 1);
      expect(snap.aggregates.wealthGini).toBeGreaterThan(0);
      expect(snap.aggregates.wealthGini).toBeLessThan(1);
    });
  });

  describe('findBiggestImprovement', () => {
    it('should identify largest improvement', () => {
      const prevClasses = createInitialClasses();
      const currentClasses = JSON.parse(JSON.stringify(prevClasses));
      
      // Simulate huge education jump for lower class
      const lowerIdx = currentClasses.findIndex((c: SocialClass) => c.tier === 'lower');
      currentClasses[lowerIdx].metrics.education = 50; // Was 3
      
      const prevSnapshot = {
        year: 0,
        classes: prevClasses,
        policy: createDefaultReservationPolicy(),
        aggregates: {
          avgEducation: 0,
          avgEmployment: 0,
          wealthGini: 0,
          overallPoverty: 0,
          avgLifeExpectancy: 0,
          totalPopulation: 100,
        },
      };
      
      const currentSnapshot = {
        year: 1,
        classes: currentClasses,
        policy: createDefaultReservationPolicy(),
        aggregates: { ...prevSnapshot.aggregates },
      };
      
      const highlight = findBiggestImprovement(prevSnapshot, currentSnapshot);
      
      expect(highlight.classTier).toBe('lower');
      expect(highlight.metric).toBe('education');
      expect(highlight.percentChange).toBeGreaterThan(1000); // 3 -> 50 is huge
    });
  });
});
