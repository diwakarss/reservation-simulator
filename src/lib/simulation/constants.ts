/**
 * Simulation Constants
 *
 * All calibrated coefficients from CALIBRATED-MODEL.md Section 2.
 * These values are tuned to produce historically plausible outcomes
 * matching India's 70-year reservation policy data.
 */

// =============================================================================
// Education Coefficients
// =============================================================================

/**
 * Base improvement in education per year without reservation (0.1%)
 */
export const BASE_EDUCATION_IMPROVEMENT = 0.1;

/**
 * Per-year boost to education from reservation policy.
 * Tuned to achieve: 3% -> 27% over 50 years with 27% reservation
 * Needs ~0.48% average improvement per year
 */
export const RESERVATION_EDUCATION_BOOST = 0.010;

/**
 * Maximum education access percentage (ceiling)
 */
export const EDUCATION_CEILING = 95;

// =============================================================================
// Employment Coefficients
// =============================================================================

/**
 * How much education gain translates to employment gain.
 * Employment follows education with this correlation factor.
 */
export const EDUCATION_TO_EMPLOYMENT_FACTOR = 0.6;

/**
 * Direct boost to employment from reservation (job quotas).
 * Tuned for: 5% -> 25-30% employment over 50 years
 */
export const RESERVATION_EMPLOYMENT_BOOST = 0.006;

/**
 * Maximum employment percentage (ceiling)
 */
export const EMPLOYMENT_CEILING = 90;

// =============================================================================
// Wealth Coefficients
// =============================================================================

/**
 * Wealth share growth per 1% education gain.
 */
export const WEALTH_GROWTH_FROM_EDUCATION = 0.001;

/**
 * Wealth share growth per 1% employment gain.
 */
export const WEALTH_GROWTH_FROM_EMPLOYMENT = 0.002;

/**
 * Additional wealth redistribution factor for policy target classes.
 * Very slow to reflect real-world wealth mobility.
 */
export const WEALTH_REDISTRIBUTION_FACTOR = 0.0005;

/**
 * Minimum wealth share for any class (floor)
 */
export const WEALTH_FLOOR = 1;

// =============================================================================
// Poverty Coefficients
// =============================================================================

/**
 * Poverty reduction per 1% education gain.
 * Tuned for: 65% -> 32% poverty over 50 years
 */
export const POVERTY_REDUCTION_EDUCATION = 1.5;

/**
 * Poverty reduction per 1% employment gain.
 * Employment contributes more directly to income/poverty relief
 */
export const POVERTY_REDUCTION_EMPLOYMENT = 2.0;

/**
 * Poverty reduction per 1% wealth share gain.
 */
export const POVERTY_REDUCTION_WEALTH = 0.5;

/**
 * Minimum poverty rate (even developed nations have some poverty)
 */
export const POVERTY_FLOOR = 2;

// =============================================================================
// Life Expectancy Coefficients
// =============================================================================

/**
 * Life expectancy gain per 1% education improvement.
 * Tuned for: 62 -> 68-70 years (6-8 year gain) over 50 years
 */
export const LE_GAIN_PER_EDUCATION_POINT = 0.30;

/**
 * Life expectancy gain per 1% poverty reduction.
 * Poverty reduction has strong health impact
 */
export const LE_GAIN_PER_POVERTY_REDUCTION = 0.25;

/**
 * Maximum life expectancy (realistic ceiling for India-like society)
 */
export const LE_MAXIMUM = 80;

// =============================================================================
// Income Coefficients
// =============================================================================

/**
 * Base monthly income by class tier index (upper=0, lower=4).
 * In credits (fictional currency).
 */
export const BASE_INCOME_BY_CLASS = [40000, 25000, 12000, 6000, 500] as const;

/**
 * Income growth multiplier per 1% education gain.
 */
export const INCOME_GROWTH_FROM_EDUCATION = 0.02;

/**
 * Income growth multiplier per 1% employment gain.
 */
export const INCOME_GROWTH_FROM_EMPLOYMENT = 0.03;

// =============================================================================
// Fertility Coefficients (for population dynamics)
// =============================================================================

/**
 * Fertility reduction per 1% education gain.
 * Models demographic transition.
 */
export const FERTILITY_REDUCTION_PER_EDUCATION = 0.005;

/**
 * Minimum total fertility rate (Japan/Korea level)
 */
export const FERTILITY_FLOOR = 1.5;

/**
 * Maximum total fertility rate
 */
export const FERTILITY_CEILING = 3.0;

// =============================================================================
// Simulation Settings
// =============================================================================

/**
 * Random variance factor (adds realism).
 * Each calculation has +/- this percentage variance.
 */
export const RANDOM_VARIANCE_PERCENT = 0.05;

/**
 * Generational effect boost maximum.
 * Children of educated parents do better over time.
 * Kicks in after 20 years, maxes out at this multiplier.
 */
export const GENERATIONAL_BOOST_MAX = 0.5;

/**
 * Years until generational effect fully kicks in.
 */
export const GENERATIONAL_EFFECT_YEARS = 40;
