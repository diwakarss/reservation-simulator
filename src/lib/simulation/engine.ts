/**
 * Simulation Engine
 *
 * Core simulation logic that steps through time and calculates
 * metric changes based on reservation policies.
 */

import type {
  SocialClass,
  ClassMetrics,
  ClassTier,
  ReservationPolicy,
  YearSnapshot,
  NarrativeHighlight,
  AggregateMetrics,
} from './types';
import { CLASS_TIER_ORDER, METRIC_HIGHER_IS_BETTER } from './types';
import {
  calculateEducation,
  calculateEmployment,
  calculateWealth,
  calculatePoverty,
  calculateLifeExpectancy,
  calculateIncome,
  applyVariance,
} from './models';
import {
  BASE_INCOME_BY_CLASS,
  RANDOM_VARIANCE_PERCENT,
  POVERTY_FLOOR,
  LE_MAXIMUM,
} from './constants';
import { createSeededRNG } from '../content/worldGenerator';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * State required for simulation stepping.
 */
export interface SimulationInput {
  /** Current classes with their metrics */
  classes: SocialClass[];
  /** Current year */
  year: number;
  /** Active reservation policy */
  policy: ReservationPolicy;
  /** Seed for deterministic RNG */
  seed: string;
  /** Year when policy was first applied (for generational effects) */
  policyStartYear: number;
}

/**
 * Result of a simulation step.
 */
export interface SimulationResult {
  /** Updated classes after the step */
  classes: SocialClass[];
  /** New year */
  year: number;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the tier index for base income lookup.
 */
function getTierIndex(tier: ClassTier): number {
  return CLASS_TIER_ORDER.indexOf(tier);
}

/**
 * Get the effective reservation percentage for a class.
 * Accounts for creamy layer exclusion if enabled.
 */
function getEffectiveReservation(
  policy: ReservationPolicy,
  tier: ClassTier,
  income: number
): number {
  const classPolicy = policy.classes[tier];

  // Check EWS (only for upper tiers)
  if (
    classPolicy.ewsEnabled &&
    (tier === 'upper' || tier === 'noble') &&
    income <= classPolicy.ewsThreshold
  ) {
    return classPolicy.ewsPercent;
  }

  // Check if creamy layer exclusion applies
  if (classPolicy.creamyLayerEnabled && income > classPolicy.creamyLayerThreshold) {
    return 0; // Excluded from reservation benefits
  }

  return classPolicy.reservationPercent;
}

/**
 * Get tiers that have active reservation policies.
 */
function getPolicyTargetTiers(policy: ReservationPolicy): ClassTier[] {
  return CLASS_TIER_ORDER.filter((tier) => {
    const p = policy.classes[tier];
    return p.reservationPercent > 0 || p.ewsPercent > 0;
  });
}

/**
 * Deep clone classes to avoid mutation.
 */
function cloneClasses(classes: SocialClass[]): SocialClass[] {
  return classes.map((c) => ({
    ...c,
    metrics: { ...c.metrics },
  }));
}

// =============================================================================
// Core Simulation Step
// =============================================================================

/**
 * Execute a single year step of the simulation.
 *
 * @param input - Current simulation state
 * @returns Updated simulation state after one year
 */
export function stepOneYear(input: SimulationInput): SimulationResult {
  const { classes, year, policy, seed, policyStartYear } = input;

  // Create RNG seeded with year for deterministic variance
  const rng = createSeededRNG(`${seed}-${year}`);

  // Clone classes for immutable update
  const prevClasses = cloneClasses(classes);
  const newClasses = cloneClasses(classes);

  // Store previous metrics for calculations that need them
  const prevMetrics: Record<ClassTier, { education: number; employment: number }> = {} as Record<
    ClassTier,
    { education: number; employment: number }
  >;

  for (const c of prevClasses) {
    prevMetrics[c.tier] = {
      education: c.metrics.education,
      employment: c.metrics.employment,
    };
  }

  // Get years since policy started (for generational effects)
  const yearsSincePolicy = Math.max(0, year - policyStartYear);

  // Get target tiers for wealth calculation
  const policyTargetTiers = getPolicyTargetTiers(policy);

  // =========================================================================
  // Step 1: Calculate Education
  // =========================================================================
  for (const cls of newClasses) {
    const reservationPct = getEffectiveReservation(
      policy,
      cls.tier,
      cls.metrics.incomePerCapita
    );

    let newEducation = calculateEducation(
      cls.metrics.education,
      reservationPct,
      yearsSincePolicy
    );

    // Apply variance
    newEducation = applyVariance(newEducation, RANDOM_VARIANCE_PERCENT, rng);
    cls.metrics.education = Math.max(0, Math.min(100, newEducation));
  }

  // =========================================================================
  // Step 2: Calculate Employment (depends on education)
  // =========================================================================
  for (const cls of newClasses) {
    const prev = prevMetrics[cls.tier];
    const reservationPct = getEffectiveReservation(
      policy,
      cls.tier,
      cls.metrics.incomePerCapita
    );

    let newEmployment = calculateEmployment(
      cls.metrics.employment,
      cls.metrics.education,
      prev.education,
      reservationPct
    );

    newEmployment = applyVariance(newEmployment, RANDOM_VARIANCE_PERCENT, rng);
    cls.metrics.employment = Math.max(0, Math.min(100, newEmployment));
  }

  // =========================================================================
  // Step 3: Calculate Wealth (depends on education and employment)
  // =========================================================================
  const newWealthShares = calculateWealth(newClasses, prevMetrics, policyTargetTiers);

  // Apply variance to each wealth share, then re-normalize
  const variedWealth = newWealthShares.map((w) =>
    applyVariance(w, RANDOM_VARIANCE_PERCENT / 2, rng)
  );

  // Normalize to sum to 100
  const wealthTotal = variedWealth.reduce((a, b) => a + b, 0);
  for (let i = 0; i < newClasses.length; i++) {
    newClasses[i].metrics.wealth = (variedWealth[i] / wealthTotal) * 100;
  }

  // =========================================================================
  // Step 4: Calculate Poverty (depends on all previous metrics)
  // =========================================================================
  for (const cls of newClasses) {
    const prev = prevClasses.find((c) => c.tier === cls.tier)!;

    const educationGain = cls.metrics.education - prev.metrics.education;
    const employmentGain = cls.metrics.employment - prev.metrics.employment;
    const wealthGain = cls.metrics.wealth - prev.metrics.wealth;

    let newPoverty = calculatePoverty(
      cls.metrics.poverty,
      educationGain,
      employmentGain,
      wealthGain
    );

    newPoverty = applyVariance(newPoverty, RANDOM_VARIANCE_PERCENT, rng);
    cls.metrics.poverty = Math.max(POVERTY_FLOOR, Math.min(100, newPoverty));
  }

  // =========================================================================
  // Step 5: Calculate Life Expectancy
  // =========================================================================
  for (const cls of newClasses) {
    const prev = prevClasses.find((c) => c.tier === cls.tier)!;

    const educationGain = cls.metrics.education - prev.metrics.education;
    const povertyReduction = prev.metrics.poverty - cls.metrics.poverty;

    let newLE = calculateLifeExpectancy(
      cls.metrics.lifeExpectancy,
      educationGain,
      povertyReduction
    );

    newLE = applyVariance(newLE, RANDOM_VARIANCE_PERCENT / 2, rng);
    cls.metrics.lifeExpectancy = Math.max(0, Math.min(LE_MAXIMUM, newLE));
  }

  // =========================================================================
  // Step 6: Calculate Income
  // =========================================================================
  for (const cls of newClasses) {
    const prev = prevClasses.find((c) => c.tier === cls.tier)!;
    const tierIndex = getTierIndex(cls.tier);
    const baseIncome = BASE_INCOME_BY_CLASS[tierIndex];

    const educationGain = cls.metrics.education - prev.metrics.education;
    const employmentGain = cls.metrics.employment - prev.metrics.employment;

    let newIncome = calculateIncome(
      baseIncome,
      cls.metrics.incomePerCapita,
      educationGain,
      employmentGain
    );

    newIncome = applyVariance(newIncome, RANDOM_VARIANCE_PERCENT, rng);
    cls.metrics.incomePerCapita = Math.max(baseIncome, newIncome);
  }

  return {
    classes: newClasses,
    year: year + 1,
  };
}

// =============================================================================
// Multi-Year Simulation
// =============================================================================

/**
 * Run simulation for multiple years.
 *
 * @param input - Initial simulation state
 * @param years - Number of years to simulate
 * @returns Final simulation state after all years
 */
export function stepSimulation(
  input: SimulationInput,
  years: number
): SimulationResult {
  let currentState: SimulationInput = { ...input };
  let result: SimulationResult = {
    classes: input.classes,
    year: input.year,
  };

  for (let i = 0; i < years; i++) {
    result = stepOneYear(currentState);
    currentState = {
      ...input,
      classes: result.classes,
      year: result.year,
    };
  }

  return result;
}

// =============================================================================
// Snapshot Capture
// =============================================================================

/**
 * Calculate aggregate metrics across all classes.
 */
function calculateAggregates(classes: SocialClass[]): AggregateMetrics {
  const totalPopulation = classes.reduce((sum, c) => sum + c.population, 0);

  // Population-weighted averages
  const avgEducation =
    classes.reduce((sum, c) => sum + c.metrics.education * c.population, 0) /
    totalPopulation;

  const avgEmployment =
    classes.reduce((sum, c) => sum + c.metrics.employment * c.population, 0) /
    totalPopulation;

  const overallPoverty =
    classes.reduce((sum, c) => sum + c.metrics.poverty * c.population, 0) /
    totalPopulation;

  const avgLifeExpectancy =
    classes.reduce((sum, c) => sum + c.metrics.lifeExpectancy * c.population, 0) /
    totalPopulation;

  // Gini coefficient for wealth inequality
  // Simplified calculation: measures how far from equal distribution
  const equalShare = 100 / classes.length;
  const totalDeviation = classes.reduce(
    (sum, c) => sum + Math.abs(c.metrics.wealth - equalShare),
    0
  );
  const wealthGini = totalDeviation / (2 * 100); // Normalize to 0-1

  return {
    avgEducation,
    avgEmployment,
    wealthGini,
    overallPoverty,
    avgLifeExpectancy,
    totalPopulation,
  };
}

/**
 * Capture a snapshot of current simulation state.
 *
 * @param year - Current simulation year
 * @param classes - Current class states
 * @param policy - Current policy state
 * @returns Complete year snapshot
 */
export function captureSnapshot(
  year: number,
  classes: SocialClass[],
  policy: ReservationPolicy
): YearSnapshot {
  return {
    year,
    classes: cloneClasses(classes),
    policy: JSON.parse(JSON.stringify(policy)), // Deep clone
    aggregates: calculateAggregates(classes),
  };
}

// =============================================================================
// Narrative Highlight Detection
// =============================================================================

type MetricKey = keyof ClassMetrics;

/**
 * Find the biggest improvement between two snapshots.
 * Used for narrative highlighting ("Lower Deaflings improved most!").
 *
 * @param prev - Previous snapshot
 * @param current - Current snapshot
 * @returns Narrative highlight describing the biggest improvement
 */
export function findBiggestImprovement(
  prev: YearSnapshot,
  current: YearSnapshot
): NarrativeHighlight | null {
  const metrics: MetricKey[] = [
    'education',
    'employment',
    'wealth',
    'poverty',
    'lifeExpectancy',
  ];

  let biggest: NarrativeHighlight | null = null;
  let biggestScore = 0;

  for (const cls of current.classes) {
    const prevCls = prev.classes.find((c) => c.tier === cls.tier);
    if (!prevCls) continue;

    for (const metric of metrics) {
      const prevValue = prevCls.metrics[metric];
      const currValue = cls.metrics[metric];
      const change = currValue - prevValue;

      // Skip if no significant change
      if (Math.abs(change) < 0.01) continue;

      // Calculate percent change (avoid division by zero)
      const percentChange =
        prevValue !== 0 ? (change / prevValue) * 100 : change > 0 ? 100 : 0;

      // For poverty, improvement is NEGATIVE change
      // For other metrics, improvement is POSITIVE change
      const higherIsBetter = METRIC_HIGHER_IS_BETTER[metric];
      const adjustedScore = higherIsBetter ? percentChange : -percentChange;

      if (adjustedScore > biggestScore) {
        biggestScore = adjustedScore;
        biggest = {
          classDisplayName: cls.displayName,
          classTier: cls.tier,
          metric,
          fromValue: prevValue,
          toValue: currValue,
          change,
          percentChange: Math.abs(percentChange),
        };
      }
    }
  }

  return biggest;
}

// =============================================================================
// Exports
// =============================================================================

export { cloneClasses };
