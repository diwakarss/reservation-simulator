/**
 * Simulation Models
 *
 * Pure functions implementing the mathematical model from CALIBRATED-MODEL.md.
 * Each function calculates a single metric's progression per year.
 */

import type { SocialClass, ClassTier } from './types';
import {
  BASE_EDUCATION_IMPROVEMENT,
  RESERVATION_EDUCATION_BOOST,
  EDUCATION_CEILING,
  EDUCATION_TO_EMPLOYMENT_FACTOR,
  RESERVATION_EMPLOYMENT_BOOST,
  EMPLOYMENT_CEILING,
  WEALTH_GROWTH_FROM_EDUCATION,
  WEALTH_GROWTH_FROM_EMPLOYMENT,
  WEALTH_REDISTRIBUTION_FACTOR,
  WEALTH_FLOOR,
  POVERTY_REDUCTION_EDUCATION,
  POVERTY_REDUCTION_EMPLOYMENT,
  POVERTY_REDUCTION_WEALTH,
  POVERTY_FLOOR,
  LE_GAIN_PER_EDUCATION_POINT,
  LE_GAIN_PER_POVERTY_REDUCTION,
  LE_MAXIMUM,
  INCOME_GROWTH_FROM_EDUCATION,
  INCOME_GROWTH_FROM_EMPLOYMENT,
  GENERATIONAL_BOOST_MAX,
  GENERATIONAL_EFFECT_YEARS,
} from './constants';

// =============================================================================
// Gap Multiplier
// =============================================================================

/**
 * Calculate the gap-closing multiplier.
 * Classes with lower access improve faster (larger gap = faster catch-up).
 *
 * @param currentAccess - Current value (0-100)
 * @returns Multiplier between 0 and 1
 */
export function educationGapMultiplier(currentAccess: number): number {
  return Math.pow((100 - currentAccess) / 100, 0.8);
}

// =============================================================================
// Education Model
// =============================================================================

/**
 * Calculate new education access after one year.
 * Implements formula from CALIBRATED-MODEL.md Section 3.
 *
 * @param current - Current education access (0-100)
 * @param reservationPercent - Reservation percentage for this class (0-50)
 * @param yearsSincePolicy - Years since policy started (for generational effect)
 * @returns New education access value
 */
export function calculateEducation(
  current: number,
  reservationPercent: number,
  yearsSincePolicy: number
): number {
  // Base improvement (all classes get some natural improvement)
  const baseImprovement = BASE_EDUCATION_IMPROVEMENT;

  // Reservation boost: (percent/100) * coefficient * 100
  const reservationBoost =
    (reservationPercent / 100) * RESERVATION_EDUCATION_BOOST * 100;

  // Gap multiplier (faster catch-up when far behind)
  const gapMultiplier = educationGapMultiplier(current);

  // Generational effect (children of educated parents do better)
  // Kicks in after 20 years, maxes out at GENERATIONAL_BOOST_MAX
  const generationalBoost = Math.min(
    yearsSincePolicy / GENERATIONAL_EFFECT_YEARS,
    GENERATIONAL_BOOST_MAX
  );

  // Total improvement
  const improvement =
    (baseImprovement + reservationBoost * gapMultiplier) *
    (1 + generationalBoost);

  // Apply with ceiling
  return Math.min(EDUCATION_CEILING, current + improvement);
}

// =============================================================================
// Employment Model
// =============================================================================

/**
 * Calculate new employment rate after one year.
 * Employment follows education with a lag, plus direct reservation effect.
 *
 * @param currentEmployment - Current employment rate (0-100)
 * @param currentEducation - Current education access (0-100)
 * @param prevEducation - Previous year's education access (0-100)
 * @param reservationPercent - Reservation percentage for this class (0-50)
 * @returns New employment rate
 */
export function calculateEmployment(
  currentEmployment: number,
  currentEducation: number,
  prevEducation: number,
  reservationPercent: number
): number {
  // Education-driven improvement (lagged)
  const educationGain = currentEducation - prevEducation;
  const educationEffect = educationGain * EDUCATION_TO_EMPLOYMENT_FACTOR;

  // Direct reservation effect (job quotas)
  const reservationBoost =
    (reservationPercent / 100) * RESERVATION_EMPLOYMENT_BOOST * 100;

  // Gap multiplier
  const gapMultiplier = Math.pow((100 - currentEmployment) / 100, 0.8);

  // Total improvement
  const improvement = (educationEffect + reservationBoost) * gapMultiplier;

  return Math.min(EMPLOYMENT_CEILING, currentEmployment + improvement);
}

// =============================================================================
// Wealth Model
// =============================================================================

/**
 * Previous metrics type for wealth calculation.
 */
interface PrevMetrics {
  education: number;
  employment: number;
}

/**
 * Calculate wealth shares for all classes.
 * Wealth is zero-sum normalized (always sums to 100%).
 *
 * @param classes - Array of current social classes
 * @param prevMetrics - Previous year's metrics by tier
 * @param policyTargetTiers - Tiers receiving reservation benefits
 * @returns New wealth shares for each class
 */
export function calculateWealth(
  classes: SocialClass[],
  prevMetrics: Record<ClassTier, PrevMetrics>,
  policyTargetTiers: ClassTier[]
): number[] {
  // Calculate gains for each class
  const gains = classes.map((c) => {
    const prev = prevMetrics[c.tier];
    const isTarget = policyTargetTiers.includes(c.tier);

    const educationGain = c.metrics.education - prev.education;
    const employmentGain = c.metrics.employment - prev.employment;

    let gain =
      educationGain * WEALTH_GROWTH_FROM_EDUCATION +
      employmentGain * WEALTH_GROWTH_FROM_EMPLOYMENT;

    // Policy targets get additional boost
    if (isTarget) {
      gain += WEALTH_REDISTRIBUTION_FACTOR;
    }

    return gain;
  });

  // Calculate average gain for normalization
  const totalGain = gains.reduce((a, b) => a + b, 0);
  const avgGain = totalGain / classes.length;

  // Calculate new wealth shares (zero-sum adjustment)
  const newWealth = classes.map((c, i) => {
    const adjusted = c.metrics.wealth + gains[i] - avgGain;
    return Math.max(WEALTH_FLOOR, adjusted);
  });

  // Normalize to ensure sum is exactly 100
  const totalWealth = newWealth.reduce((a, b) => a + b, 0);
  return newWealth.map((w) => (w / totalWealth) * 100);
}

// =============================================================================
// Poverty Model
// =============================================================================

/**
 * Calculate new poverty rate after one year.
 * Poverty decreases with education, employment, and wealth gains.
 *
 * @param current - Current poverty rate (0-100)
 * @param educationGain - Education improvement this year
 * @param employmentGain - Employment improvement this year
 * @param wealthGain - Wealth share improvement this year
 * @returns New poverty rate
 */
export function calculatePoverty(
  current: number,
  educationGain: number,
  employmentGain: number,
  wealthGain: number
): number {
  const reduction =
    educationGain * POVERTY_REDUCTION_EDUCATION +
    employmentGain * POVERTY_REDUCTION_EMPLOYMENT +
    wealthGain * POVERTY_REDUCTION_WEALTH;

  // Poverty reduction slows as you approach the floor
  const resistanceFactor = Math.pow(current / 100, 0.5);
  const effectiveReduction = reduction * resistanceFactor;

  return Math.max(POVERTY_FLOOR, current - effectiveReduction);
}

// =============================================================================
// Life Expectancy Model
// =============================================================================

/**
 * Calculate new life expectancy after one year.
 * Life expectancy improves with education and poverty reduction.
 *
 * @param current - Current life expectancy (years)
 * @param educationGain - Education improvement this year
 * @param povertyReduction - Poverty reduction this year (positive value)
 * @returns New life expectancy
 */
export function calculateLifeExpectancy(
  current: number,
  educationGain: number,
  povertyReduction: number
): number {
  const gain =
    educationGain * LE_GAIN_PER_EDUCATION_POINT +
    povertyReduction * LE_GAIN_PER_POVERTY_REDUCTION;

  // Slower gains as you approach ceiling
  const headroom = LE_MAXIMUM - current;
  const effectiveGain = gain * (headroom / 20);

  return Math.min(LE_MAXIMUM, current + effectiveGain);
}

// =============================================================================
// Income Model
// =============================================================================

/**
 * Calculate new income per capita after one year.
 * Income grows with education and employment gains.
 *
 * @param baseIncome - Base income for this class tier
 * @param currentIncome - Current income per capita
 * @param educationGain - Education improvement this year
 * @param employmentGain - Employment improvement this year
 * @returns New income per capita
 */
export function calculateIncome(
  baseIncome: number,
  currentIncome: number,
  educationGain: number,
  employmentGain: number
): number {
  // Income growth as a percentage of current income
  const growthRate =
    educationGain * INCOME_GROWTH_FROM_EDUCATION +
    employmentGain * INCOME_GROWTH_FROM_EMPLOYMENT;

  // Apply growth (minimum is base income, no floor otherwise)
  const newIncome = currentIncome * (1 + growthRate);

  // Income should never drop below base
  return Math.max(baseIncome, newIncome);
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Apply random variance to a value.
 * Adds realism by introducing small fluctuations.
 *
 * @param value - The value to vary
 * @param variancePercent - Maximum variance as decimal (e.g., 0.05 for 5%)
 * @param rng - Random number generator function
 * @returns Value with random variance applied
 */
export function applyVariance(
  value: number,
  variancePercent: number,
  rng: () => number
): number {
  // Generate random factor between (1 - variance) and (1 + variance)
  const factor = 1 + (rng() * 2 - 1) * variancePercent;
  return value * factor;
}
