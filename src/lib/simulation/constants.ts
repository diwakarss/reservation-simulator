import { ClassTier } from './types';

// =============================================================================
// Initial Conditions (Year 0, CALIBRATED-MODEL.md)
// =============================================================================
/**
 * These constants define the starting state before any policy interventions.
 * Year 0 snapshot represents baseline inequality across the 5-tier system.
 */

/**
 * Population share by class tier (proportions, must sum to 1.0).
 *
 * Distribution: 10% upper, 20% noble, 30% middle, 25% common, 15% lower.
 * Middle class is largest; upper class is smallest.
 */
export const INITIAL_POPULATION_DISTRIBUTION: Record<ClassTier, number> = {
  upper: 0.10,   // 10% (elite)
  noble: 0.20,   // 20% (aspirational)
  middle: 0.30,  // 30% (largest)
  common: 0.25,  // 25%
  lower: 0.15,   // 15% (most disadvantaged)
} as const;

/**
 * Fertility rate by class tier (children per woman).
 *
 * Higher poverty classes have higher fertility; declines with education/wealth.
 * Fertility reduces with education improvements via FERTILITY_REDUCTION_PER_EDUCATION.
 */
export const INITIAL_FERTILITY_RATES: Record<ClassTier, number> = {
  upper: 1.8,   // Lowest fertility (wealthy, educated)
  noble: 2.0,
  middle: 2.1,
  common: 2.2,
  lower: 2.3,   // Highest fertility (poor, less educated)
} as const;

/**
 * Education access percentage (0–100) by class tier at Year 0.
 *
 * Represents access to formal schooling/tertiary education.
 * Creates dramatic inequality: 45% (upper) vs 3% (lower).
 */
export const INITIAL_EDUCATION_ACCESS: Record<ClassTier, number> = {
  upper: 45,   // Tertiary education access
  noble: 30,
  middle: 20,
  common: 10,
  lower: 3,    // Very limited access
} as const;

/**
 * Employment percentage (0–100) by class tier at Year 0.
 *
 * Formal employment access (salaried/stable jobs).
 * Range: 80% (upper) to 5% (lower), reflecting class-based job market access.
 */
export const INITIAL_EMPLOYMENT_ACCESS: Record<ClassTier, number> = {
  upper: 80,   // Strong employment access
  noble: 60,
  middle: 40,
  common: 20,
  lower: 5,    // Mostly informal/casual work
} as const;

/**
 * Wealth share by class tier at Year 0 (percentage, must sum to 100).
 *
 * Represents economic inequality: upper 45%, noble 25%, middle 18%, common 9%, lower 3%.
 * Cumulative: top 2 classes control 70% of wealth; bottom 2 classes control ~12%.
 */
export const INITIAL_WEALTH_SHARE: Record<ClassTier, number> = {
  upper: 45,   // Dominant wealth share
  noble: 25,
  middle: 18,
  common: 9,
  lower: 3,    // Minimal wealth
} as const;

/**
 * Poverty rate percentage (0–100) by class tier at Year 0.
 *
 * Percentage of each class living below the poverty line.
 * Ranges from 5% (upper) to 65% (lower), showing poverty's class concentration.
 */
export const INITIAL_POVERTY_RATE: Record<ClassTier, number> = {
  upper: 5,    // Minimal poverty
  noble: 15,
  middle: 25,
  common: 40,
  lower: 65,   // Majority in poverty
} as const;

/**
 * Life expectancy in years by class tier at Year 0 (max 80 years).
 *
 * Health outcomes reflect socioeconomic status: 72 years (upper) vs 62 years (lower).
 * 10-year gap driven by healthcare access, nutrition, stress.
 */
export const INITIAL_LIFE_EXPECTANCY: Record<ClassTier, number> = {
  upper: 72,   // Longest life expectancy
  noble: 70,
  middle: 68,
  common: 65,
  lower: 62,   // Shortest life expectancy (10-year gap)
} as const;

/**
 * Base monthly income in credits (₢) by class tier at Year 0.
 *
 * Income ladder: 40,000 (upper) to 500 (lower).
 * Reflects formal employment earnings; lower classes depend on informal work (not fully captured).
 */
export const BASE_INCOME_BY_CLASS: Record<ClassTier, number> = {
  upper: 40000,  // ₢40,000/month
  noble: 25000,  // ₢25,000/month
  middle: 12000, // ₢12,000/month
  common: 6000,  // ₢6,000/month
  lower: 500,    // ₢500/month (80x gap to upper class)
} as const;

// =============================================================================
// Progression Coefficients (CALIBRATED-MODEL.md)
// =============================================================================
/**
 * These multipliers control metric improvement rates in response to policy,
 * education, and socioeconomic gains. Tuned for realistic progression over 100 years.
 */

// --- Education Progression
/**
 * Bonus multiplier from reservation quota.
 * Applied as: (reservationPercent / 100) × 0.01 × gapMultiplier
 * At 27% reservation and high gap: +0.27% education per year.
 */
export const RESERVATION_EDUCATION_BOOST = 0.01;

// --- Employment Progression
/**
 * Education-to-employment pipeline: fraction of education gains that translate
 * to employment opportunities (60% of education gain → employment gain).
 */
export const EDUCATION_TO_EMPLOYMENT_FACTOR = 0.6;

/**
 * Bonus multiplier from reservation job quotas.
 * Applied as: (reservationPercent / 100) × 0.007 × gapMultiplier
 * Smaller than education boost; jobs are more constrained.
 */
export const RESERVATION_EMPLOYMENT_BOOST = 0.007;

// --- Wealth Progression
/**
 * Wealth growth multiplier from education improvements.
 * Per 1% education gain: +0.1% wealth share (multiplicative effect is small).
 */
export const WEALTH_GROWTH_FROM_EDUCATION = 0.001;

/**
 * Wealth growth multiplier from employment improvements.
 * Per 1% employment gain: +0.2% wealth share (2x stronger than education).
 */
export const WEALTH_GROWTH_FROM_EMPLOYMENT = 0.002;

/**
 * Bonus wealth redistribution for policy-targeted classes (reservation/EWS).
 * Applied: +0.05% wealth share per year per targeted class (direct redistribution).
 */
export const WEALTH_REDISTRIBUTION_FACTOR = 0.0005;

// --- Poverty Reduction
/**
 * Poverty reduction per 1% education gain.
 * Strong driver: education → health knowledge, healthcare access.
 */
export const POVERTY_REDUCTION_EDUCATION = 0.8;

/**
 * Poverty reduction per 1% employment gain.
 * Strongest driver: employment → direct income → poverty escape.
 */
export const POVERTY_REDUCTION_EMPLOYMENT = 1.2;

/**
 * Poverty reduction per 1% wealth gain.
 * Weak driver: wealth reflects structural inequality, slower poverty impact.
 */
export const POVERTY_REDUCTION_WEALTH = 0.003;

/**
 * Poverty floor: minimum poverty rate achievable (2%).
 * Prevents unrealistic zero-poverty scenarios; reflects structural poverty.
 */
export const POVERTY_FLOOR = 2;

// --- Life Expectancy Progression
/**
 * Life expectancy gain per 1% education improvement.
 * Education → health knowledge, healthcare access, stress reduction.
 * 1% education improvement → +0.1 years of life expectancy.
 */
export const LE_GAIN_PER_EDUCATION_POINT = 0.1;

/**
 * Life expectancy gain per 1% poverty reduction.
 * Poverty reduction → better nutrition, healthcare, reduced disease.
 * 1% poverty reduction → +0.15 years of life expectancy.
 */
export const LE_GAIN_PER_POVERTY_REDUCTION = 0.15;

/**
 * Maximum life expectancy ceiling (hard cap).
 * Reflects biological limits and medical technology ceiling.
 * No class can exceed 80 years regardless of metrics.
 */
export const LE_MAXIMUM = 80;

// --- Income Growth
/**
 * Income growth multiplier per 1% education gain.
 * Applied multiplicatively: income × (1 + 0.02 × educationGain)
 * 1% education improvement → +2% income growth.
 */
export const INCOME_GROWTH_FROM_EDUCATION = 0.02;

/**
 * Income growth multiplier per 1% employment gain.
 * Applied multiplicatively: income × (1 + 0.03 × employmentGain)
 * 1% employment improvement → +3% income growth (1.5x stronger than education).
 */
export const INCOME_GROWTH_FROM_EMPLOYMENT = 0.03;

// --- Fertility Dynamics
/**
 * Fertility reduction per 1% education gain (inverse relationship).
 * More education → lower fertility (demographic transition).
 */
export const FERTILITY_REDUCTION_PER_EDUCATION = 0.005;

/**
 * Minimum fertility floor (children per woman).
 * Even with high education, fertility doesn't drop below 1.5.
 */
export const FERTILITY_FLOOR = 1.5;

/**
 * Maximum fertility ceiling (children per woman).
 * Even with zero education, fertility doesn't exceed 3.0.
 */
export const FERTILITY_CEILING = 3.0;
