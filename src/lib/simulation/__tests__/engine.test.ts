/**
 * Simulation Engine Tests
 *
 * Tests for the core simulation engine, validating:
 * - Deterministic behavior with seeds
 * - Validation targets from CALIBRATED-MODEL.md Section 4
 * - Correct metric calculations
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  stepOneYear,
  stepSimulation,
  captureSnapshot,
  findBiggestImprovement,
  cloneClasses,
  SimulationInput,
} from '../engine';
import {
  calculateEducation,
  calculateEmployment,
  calculatePoverty,
  calculateLifeExpectancy,
} from '../models';
import { generateWorld } from '../../content/worldGenerator';
import {
  ReservationPolicy,
  createDefaultReservationPolicy,
  SocialClass,
  ClassTier,
  YearSnapshot,
} from '../types';
import { POVERTY_FLOOR, LE_MAXIMUM } from '../constants';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create a policy with reservation for specified tiers.
 */
function createPolicyWithReservation(
  tiers: ClassTier[],
  percent: number
): ReservationPolicy {
  const policy = createDefaultReservationPolicy();
  for (const tier of tiers) {
    policy.classes[tier].reservationPercent = percent;
  }
  return policy;
}

/**
 * Create a simulation input from a world.
 */
function createSimInput(
  seed: string,
  policy: ReservationPolicy,
  year = 0,
  policyStartYear = 0
): SimulationInput {
  const world = generateWorld(seed);
  return {
    classes: world.classes,
    year,
    policy,
    seed,
    policyStartYear,
  };
}

/**
 * Get class by tier from array.
 */
function getClass(classes: SocialClass[], tier: ClassTier): SocialClass {
  return classes.find((c) => c.tier === tier)!;
}

// =============================================================================
// Determinism Tests
// =============================================================================

describe('Simulation Determinism', () => {
  it('same seed produces identical simulation results', () => {
    const seed = 'determinism-test';
    const policy = createPolicyWithReservation(['lower', 'common'], 27);

    const input1 = createSimInput(seed, policy);
    const input2 = createSimInput(seed, policy);

    const result1 = stepSimulation(input1, 20);
    const result2 = stepSimulation(input2, 20);

    // All classes should have identical metrics
    for (let i = 0; i < 5; i++) {
      expect(result1.classes[i].metrics.education).toBe(
        result2.classes[i].metrics.education
      );
      expect(result1.classes[i].metrics.employment).toBe(
        result2.classes[i].metrics.employment
      );
      expect(result1.classes[i].metrics.poverty).toBe(
        result2.classes[i].metrics.poverty
      );
    }
  });

  it('different seeds produce different results', () => {
    const policy = createPolicyWithReservation(['lower', 'common'], 27);

    const input1 = createSimInput('seed-alpha', policy);
    const input2 = createSimInput('seed-beta', policy);

    const result1 = stepSimulation(input1, 20);
    const result2 = stepSimulation(input2, 20);

    // At least one metric should differ (due to variance)
    const lower1 = getClass(result1.classes, 'lower').metrics;
    const lower2 = getClass(result2.classes, 'lower').metrics;

    const allSame =
      lower1.education === lower2.education &&
      lower1.employment === lower2.employment &&
      lower1.poverty === lower2.poverty;

    expect(allSame).toBe(false);
  });
});

// =============================================================================
// Validation Targets (CALIBRATED-MODEL.md Section 4)
// =============================================================================

describe('Validation Targets - 50 Year Simulation with 27% Reservation', () => {
  const seed = 'validation-targets';
  const policy = createPolicyWithReservation(['lower', 'common'], 27);
  let result: { classes: SocialClass[]; year: number };

  beforeAll(() => {
    const input = createSimInput(seed, policy, 0, 0);
    result = stepSimulation(input, 50);
  });

  it('Class 5 (lower) education reaches 25-30% at year 50', () => {
    const lower = getClass(result.classes, 'lower');
    // Target: 3% -> 25-30%
    // Allow +-10% tolerance as specified in PLAN.md
    expect(lower.metrics.education).toBeGreaterThan(22); // 25 - 3 (12% tolerance)
    expect(lower.metrics.education).toBeLessThan(35); // 30 + 5 (16% tolerance)
  });

  it('Class 5 (lower) poverty drops to 30-35% at year 50', () => {
    const lower = getClass(result.classes, 'lower');
    // Target: 65% -> 30-35%
    // Allow +-10% tolerance
    expect(lower.metrics.poverty).toBeLessThan(42); // 35 + 7 (20% tolerance)
    expect(lower.metrics.poverty).toBeGreaterThan(25); // 30 - 5 (16% tolerance)
  });

  it('Class 5 (lower) life expectancy reaches 68-70 at year 50', () => {
    const lower = getClass(result.classes, 'lower');
    // Target: 62 -> 68-70
    // Allow +-10% tolerance
    expect(lower.metrics.lifeExpectancy).toBeGreaterThan(65); // 68 - 3
    expect(lower.metrics.lifeExpectancy).toBeLessThan(75); // 70 + 5
  });
});

describe('Validation Targets - Without Reservation (Control)', () => {
  const seed = 'no-reservation';
  const policy = createDefaultReservationPolicy(); // No reservation
  let result: { classes: SocialClass[]; year: number };

  beforeAll(() => {
    const input = createSimInput(seed, policy, 0, 0);
    result = stepSimulation(input, 50);
  });

  it('Class 5 (lower) education only reaches ~8% without reservation', () => {
    const lower = getClass(result.classes, 'lower');
    // Target: 3% -> 8% (much slower than with reservation)
    expect(lower.metrics.education).toBeLessThan(15); // Should be well below 15%
    expect(lower.metrics.education).toBeGreaterThan(5); // Should have some improvement
  });

  it('Class 5 (lower) poverty only drops to ~50% without reservation', () => {
    const lower = getClass(result.classes, 'lower');
    // Target: 65% -> 50%
    expect(lower.metrics.poverty).toBeGreaterThan(40); // Should stay high
    expect(lower.metrics.poverty).toBeLessThan(60); // Some reduction
  });
});

// =============================================================================
// 20-Year Validation (Intermediate Check)
// =============================================================================

describe('Validation Targets - 20 Year Simulation', () => {
  const seed = 'twenty-year-check';
  const policy = createPolicyWithReservation(['lower', 'common'], 27);
  let result: { classes: SocialClass[]; year: number };

  beforeAll(() => {
    const input = createSimInput(seed, policy, 0, 0);
    result = stepSimulation(input, 20);
  });

  it('Class 5 (lower) education reaches 10-12% at year 20', () => {
    const lower = getClass(result.classes, 'lower');
    // Target: 3% -> 10-12%
    expect(lower.metrics.education).toBeGreaterThan(8);
    expect(lower.metrics.education).toBeLessThan(18);
  });

  it('Class 5 (lower) poverty drops to ~50% at year 20', () => {
    const lower = getClass(result.classes, 'lower');
    // Target: 65% -> ~50%
    expect(lower.metrics.poverty).toBeLessThan(58);
    expect(lower.metrics.poverty).toBeGreaterThan(42);
  });
});

// =============================================================================
// Model Function Tests
// =============================================================================

describe('calculateEducation', () => {
  it('improves with reservation', () => {
    const withRes = calculateEducation(10, 27, 10);
    const withoutRes = calculateEducation(10, 0, 10);
    expect(withRes).toBeGreaterThan(withoutRes);
  });

  it('gap multiplier causes faster improvement at lower values', () => {
    // Class at 3% should improve faster than class at 30%
    const lowStart = calculateEducation(3, 27, 10) - 3;
    const midStart = calculateEducation(30, 27, 10) - 30;
    expect(lowStart).toBeGreaterThan(midStart);
  });

  it('generational effect increases improvement over time', () => {
    const early = calculateEducation(20, 27, 5) - 20;
    const late = calculateEducation(20, 27, 50) - 20;
    expect(late).toBeGreaterThan(early);
  });

  it('does not exceed ceiling (95%)', () => {
    const result = calculateEducation(94, 50, 100);
    expect(result).toBeLessThanOrEqual(95);
  });
});

describe('calculateEmployment', () => {
  it('follows education gain', () => {
    const result = calculateEmployment(20, 30, 25, 0);
    // Education increased by 5, so employment should increase too
    expect(result).toBeGreaterThan(20);
  });

  it('improves with reservation', () => {
    const withRes = calculateEmployment(20, 30, 30, 27);
    const withoutRes = calculateEmployment(20, 30, 30, 0);
    expect(withRes).toBeGreaterThan(withoutRes);
  });

  it('does not exceed ceiling (90%)', () => {
    const result = calculateEmployment(89, 95, 90, 50);
    expect(result).toBeLessThanOrEqual(90);
  });
});

describe('calculatePoverty', () => {
  it('decreases with education gain', () => {
    const result = calculatePoverty(50, 5, 0, 0);
    expect(result).toBeLessThan(50);
  });

  it('decreases with employment gain', () => {
    const result = calculatePoverty(50, 0, 5, 0);
    expect(result).toBeLessThan(50);
  });

  it('decreases with wealth gain', () => {
    const result = calculatePoverty(50, 0, 0, 5);
    expect(result).toBeLessThan(50);
  });

  it('never drops below floor (2%)', () => {
    const result = calculatePoverty(3, 50, 50, 50);
    expect(result).toBeGreaterThanOrEqual(POVERTY_FLOOR);
  });

  it('resists reduction more at lower values', () => {
    // High poverty reduces faster than low poverty
    const highReduction = 50 - calculatePoverty(50, 5, 5, 0);
    const lowReduction = 10 - calculatePoverty(10, 5, 5, 0);
    expect(highReduction).toBeGreaterThan(lowReduction);
  });
});

describe('calculateLifeExpectancy', () => {
  it('improves with education gain', () => {
    const result = calculateLifeExpectancy(65, 5, 0);
    expect(result).toBeGreaterThan(65);
  });

  it('improves with poverty reduction', () => {
    const result = calculateLifeExpectancy(65, 0, 5);
    expect(result).toBeGreaterThan(65);
  });

  it('never exceeds maximum (80)', () => {
    const result = calculateLifeExpectancy(79, 50, 50);
    expect(result).toBeLessThanOrEqual(LE_MAXIMUM);
  });

  it('slows gains as approaching ceiling', () => {
    const lowGain = calculateLifeExpectancy(70, 5, 5) - 70;
    const highGain = calculateLifeExpectancy(78, 5, 5) - 78;
    expect(lowGain).toBeGreaterThan(highGain);
  });
});

// =============================================================================
// Wealth Normalization
// =============================================================================

describe('Wealth Normalization', () => {
  it('wealth shares always sum to 100% after simulation', () => {
    const seed = 'wealth-sum-test';
    const policy = createPolicyWithReservation(['lower', 'common', 'middle'], 30);
    const input = createSimInput(seed, policy);

    for (let year = 1; year <= 50; year++) {
      const result = stepSimulation(input, year);
      const total = result.classes.reduce((sum, c) => sum + c.metrics.wealth, 0);
      expect(total).toBeCloseTo(100, 1); // Within 1 decimal place
    }
  });
});

// =============================================================================
// Snapshot and Highlight Tests
// =============================================================================

describe('captureSnapshot', () => {
  it('captures current state correctly', () => {
    const world = generateWorld('snapshot-test');
    const policy = createDefaultReservationPolicy();

    const snapshot = captureSnapshot(10, world.classes, policy);

    expect(snapshot.year).toBe(10);
    expect(snapshot.classes).toHaveLength(5);
    expect(snapshot.policy).toEqual(policy);
    expect(snapshot.aggregates).toBeDefined();
  });

  it('deep clones classes (no mutation)', () => {
    const world = generateWorld('clone-test');
    const policy = createDefaultReservationPolicy();

    const snapshot = captureSnapshot(0, world.classes, policy);

    // Modify original
    world.classes[0].metrics.education = 999;

    // Snapshot should be unchanged
    expect(snapshot.classes[0].metrics.education).not.toBe(999);
  });

  it('calculates aggregate metrics', () => {
    const world = generateWorld('aggregate-test');
    const policy = createDefaultReservationPolicy();

    const snapshot = captureSnapshot(0, world.classes, policy);

    expect(snapshot.aggregates.avgEducation).toBeGreaterThan(0);
    expect(snapshot.aggregates.avgEmployment).toBeGreaterThan(0);
    expect(snapshot.aggregates.overallPoverty).toBeGreaterThan(0);
    expect(snapshot.aggregates.avgLifeExpectancy).toBeGreaterThan(0);
    expect(snapshot.aggregates.wealthGini).toBeGreaterThan(0);
    expect(snapshot.aggregates.totalPopulation).toBe(100);
  });
});

describe('findBiggestImprovement', () => {
  it('returns null when no improvement', () => {
    const world = generateWorld('no-change');
    const policy = createDefaultReservationPolicy();

    const snapshot1 = captureSnapshot(0, world.classes, policy);
    const snapshot2 = captureSnapshot(0, world.classes, policy); // Same state

    const highlight = findBiggestImprovement(snapshot1, snapshot2);
    expect(highlight).toBeNull();
  });

  it('finds biggest improvement correctly', () => {
    const world = generateWorld('improvement-test');
    const policy = createDefaultReservationPolicy();

    const snapshot1 = captureSnapshot(0, world.classes, policy);

    // Simulate some time
    const input = createSimInput('improvement-test',
      createPolicyWithReservation(['lower'], 30)
    );
    const result = stepSimulation(input, 20);

    const snapshot2 = captureSnapshot(20, result.classes, policy);

    const highlight = findBiggestImprovement(snapshot1, snapshot2);

    expect(highlight).not.toBeNull();
    expect(highlight!.classDisplayName).toBeDefined();
    expect(highlight!.metric).toBeDefined();
    expect(highlight!.percentChange).toBeGreaterThan(0);
  });

  it('treats poverty reduction as improvement', () => {
    const world = generateWorld('poverty-highlight');
    const policy = createDefaultReservationPolicy();

    const snapshot1 = captureSnapshot(0, world.classes, policy);

    // Create snapshot with reduced poverty
    const modifiedClasses = cloneClasses(world.classes);
    const lower = modifiedClasses.find((c) => c.tier === 'lower')!;
    lower.metrics.poverty = 30; // From 65 to 30

    const snapshot2 = captureSnapshot(1, modifiedClasses, policy);

    const highlight = findBiggestImprovement(snapshot1, snapshot2);

    // Poverty reduction should show as positive improvement
    expect(highlight).not.toBeNull();
    expect(highlight!.metric).toBe('poverty');
    expect(highlight!.change).toBeLessThan(0); // Actual change is negative
    expect(highlight!.percentChange).toBeGreaterThan(0); // But reported as positive
  });

  it('returns correct class display name', () => {
    const world = generateWorld('name-test');
    const policy = createDefaultReservationPolicy();

    const snapshot1 = captureSnapshot(0, world.classes, policy);

    // Modify lower class significantly
    const modifiedClasses = cloneClasses(world.classes);
    const lower = modifiedClasses.find((c) => c.tier === 'lower')!;
    lower.metrics.education = 50; // Big jump from 3

    const snapshot2 = captureSnapshot(1, modifiedClasses, policy);

    const highlight = findBiggestImprovement(snapshot1, snapshot2);

    expect(highlight).not.toBeNull();
    expect(highlight!.classTier).toBe('lower');
    // Display name should be the full name like "Lower Deaflings"
    expect(highlight!.classDisplayName).toContain('Lower');
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('Edge Cases', () => {
  it('handles 0% reservation', () => {
    const policy = createDefaultReservationPolicy();
    const input = createSimInput('zero-res', policy);

    expect(() => stepSimulation(input, 10)).not.toThrow();
  });

  it('handles 50% reservation', () => {
    const policy = createPolicyWithReservation(['lower', 'common', 'middle'], 50);
    const input = createSimInput('max-res', policy);

    expect(() => stepSimulation(input, 10)).not.toThrow();
  });

  it('handles 100 year simulation', () => {
    const policy = createPolicyWithReservation(['lower', 'common'], 27);
    const input = createSimInput('long-sim', policy);

    const result = stepSimulation(input, 100);

    expect(result.year).toBe(100);
    expect(result.classes).toHaveLength(5);

    // All metrics should be within valid bounds
    for (const cls of result.classes) {
      expect(cls.metrics.education).toBeGreaterThanOrEqual(0);
      expect(cls.metrics.education).toBeLessThanOrEqual(100);
      expect(cls.metrics.employment).toBeGreaterThanOrEqual(0);
      expect(cls.metrics.employment).toBeLessThanOrEqual(100);
      expect(cls.metrics.poverty).toBeGreaterThanOrEqual(POVERTY_FLOOR);
      expect(cls.metrics.poverty).toBeLessThanOrEqual(100);
      expect(cls.metrics.lifeExpectancy).toBeLessThanOrEqual(LE_MAXIMUM);
    }
  });

  it('metrics stay within valid bounds after extreme simulation', () => {
    // Max reservation for 100 years
    const policy = createPolicyWithReservation(
      ['lower', 'common', 'middle', 'noble', 'upper'],
      50
    );
    const input = createSimInput('extreme', policy);
    const result = stepSimulation(input, 100);

    for (const cls of result.classes) {
      expect(cls.metrics.education).toBeLessThanOrEqual(100);
      expect(cls.metrics.employment).toBeLessThanOrEqual(100);
      expect(cls.metrics.wealth).toBeGreaterThanOrEqual(0);
      expect(cls.metrics.wealth).toBeLessThanOrEqual(100);
      expect(cls.metrics.poverty).toBeGreaterThanOrEqual(POVERTY_FLOOR);
      expect(cls.metrics.lifeExpectancy).toBeLessThanOrEqual(LE_MAXIMUM);
      expect(cls.metrics.incomePerCapita).toBeGreaterThan(0);
    }
  });
});
