import {
  RESERVATION_EDUCATION_BOOST,
  EDUCATION_TO_EMPLOYMENT_FACTOR,
  RESERVATION_EMPLOYMENT_BOOST,
  WEALTH_GROWTH_FROM_EDUCATION,
  WEALTH_GROWTH_FROM_EMPLOYMENT,
  WEALTH_REDISTRIBUTION_FACTOR,
  POVERTY_REDUCTION_EDUCATION,
  POVERTY_REDUCTION_EMPLOYMENT,
  POVERTY_REDUCTION_WEALTH,
  POVERTY_FLOOR,
  LE_GAIN_PER_EDUCATION_POINT,
  LE_GAIN_PER_POVERTY_REDUCTION,
  LE_MAXIMUM,
  INCOME_GROWTH_FROM_EDUCATION,
  INCOME_GROWTH_FROM_EMPLOYMENT,
} from './constants';
import { SocialClass, ClassPolicy, ClassTier } from './types';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculates the education catch-up multiplier.
 *
 * Improvement accelerates when a class is further behind (larger gap).
 * Exponent 0.8 creates diminishing returns as a class approaches 100%.
 *
 * **Formula**: ((100 - currentEducation) / 100)^0.8
 * - At 3% (starting lower class): multiplier ≈ 0.976 (high acceleration)
 * - At 50%: multiplier ≈ 0.897 (medium acceleration)
 * - At 95%: multiplier ≈ 0.582 (low acceleration near ceiling)
 *
 * @param currentEducation Current education percentage (0–100)
 * @returns Multiplier (0–1) based on distance from ceiling
 */
function educationGapMultiplier(currentEducation: number): number {
  return Math.pow((100 - currentEducation) / 100, 0.8);
}

// =============================================================================
// Metric Calculation Models
// =============================================================================

/**
 * Calculates education access percentage (CALIBRATED-MODEL.md § Education).
 *
 * Education improves via three mechanisms:
 * 1. **Base natural improvement**: 0.1% per year (organic catch-up)
 * 2. **Reservation boost**: Scales with gap multiplier (faster when further behind)
 * 3. **Generational effect**: Accumulates as educated parents' children benefit
 *
 * **Components**:
 * - baseImprovement: 0.1% (always present)
 * - reservationBoost: (reservationPercent / 100) × RESERVATION_EDUCATION_BOOST × 100
 * - gapMultiplier: ((100 - current) / 100)^0.8 (diminishing returns)
 * - generationalBoost: min(yearsSincePolicy / 40, 0.5) (caps at 50% after 40 years)
 *
 * **Result clamping**: [current, 95%] creates realistic ceiling (100% unachievable)
 *
 * @param current Current education percentage (0–100)
 * @param reservationPercent Main reservation quota (0–50%)
 * @param yearsSincePolicy Years since policy started (for generational multiplier)
 * @returns Updated education percentage, clamped to [current, 95%]
 */
export function calculateEducation(
  current: number,
  reservationPercent: number,
  yearsSincePolicy: number
): number {
  // Base annual improvement: tiny without policy, meaningful only with policy
  // This prevents classes from converging naturally without intervention
  const baseImprovement = reservationPercent > 0 ? 0.1 : 0.02;

  // Reservation-driven boost (policy impact)
  const reservationBoost =
    (reservationPercent / 100) * RESERVATION_EDUCATION_BOOST * 100;

  // Acceleration multiplier based on how far behind current level is
  const gapMultiplier = educationGapMultiplier(current);

  // Cumulative generational benefit - only kicks in WITH policy
  // Without policy, no generational uplift from reservation benefits
  const generationalBoost = reservationPercent > 0
    ? Math.min(yearsSincePolicy / 40, 0.5)
    : 0;

  // Combine all components: (base + policy × gap) × (1 + generational effect)
  const totalImprovement =
    (baseImprovement + reservationBoost * gapMultiplier) *
    (1 + generationalBoost);

  return Math.min(95, current + totalImprovement);
}

/**
 * Calculates employment percentage (CALIBRATED-MODEL.md § Employment).
 *
 * Employment is driven by two factors working together:
 * 1. **Education-to-employment pipeline**: Education gains translate to job opportunities
 * 2. **Reservation job quotas**: Direct boost to employment via policy
 *
 * Both are amplified by gap multiplier (faster catch-up when employment is low).
 * Result is clamped to [current, 90%] reflecting realistic employment ceiling.
 *
 * **Components**:
 * - educationEffect: (currentEducation - prevEducation) × EDUCATION_TO_EMPLOYMENT_FACTOR
 * - reservationBoost: (reservationPercent / 100) × RESERVATION_EMPLOYMENT_BOOST × 100
 * - gapMultiplier: ((100 - currentEmployment) / 100)^0.8 (diminishing returns)
 *
 * @param currentEmployment Current employment percentage (0–100)
 * @param currentEducation Education percentage this year
 * @param prevEducation Education percentage last year (for gain calculation)
 * @param reservationPercent Main reservation quota (0–50%)
 * @returns Updated employment percentage, clamped to [current, 90%]
 */
export function calculateEmployment(
  currentEmployment: number,
  currentEducation: number,
  prevEducation: number,
  reservationPercent: number
): number {
  // Compute how much education improved this year
  const educationGain = Math.max(0, currentEducation - prevEducation);

  // Education gain pipeline: converts to employment opportunities
  // Reduced factor without policy (harder to get jobs without quota support)
  const pipelineFactor = reservationPercent > 0
    ? EDUCATION_TO_EMPLOYMENT_FACTOR
    : EDUCATION_TO_EMPLOYMENT_FACTOR * 0.3;
  const educationEffect = educationGain * pipelineFactor;

  // Policy-driven boost via reservation job quotas
  const reservationBoost =
    (reservationPercent / 100) * RESERVATION_EMPLOYMENT_BOOST * 100;

  // Acceleration multiplier based on employment gap (mirroring education gap formula)
  const gapMultiplier = Math.pow((100 - currentEmployment) / 100, 0.8);

  // Combine effects: (education pipeline + policy quota) × gap multiplier
  const improvement = (educationEffect + reservationBoost) * gapMultiplier;

  return Math.min(90, currentEmployment + improvement);
}

/**
 * Calculates wealth shares for all classes (CALIBRATED-MODEL.md § Wealth).
 *
 * Wealth is zero-sum: all classes' wealth shares sum to exactly 100%.
 * Each class gains wealth based on its education/employment improvements.
 * Policy-targeted classes receive an additional redistribution boost.
 *
 * **Algorithm**:
 * 1. Calculate per-class gains from education/employment improvements
 * 2. Add redistribution boost to policy-targeted classes (reservation or EWS active)
 * 3. Normalize: newShare = oldShare + gain - avgGain (keeps total at 100%)
 * 4. Enforce minimum 1% per class, then re-normalize to exactly 100%
 *
 * **Key insight**: Subtracting average gain preserves zero-sum property
 * while allowing all classes to benefit from structural improvements.
 *
 * @param classes Current classes with updated education/employment metrics
 * @param prevClasses Previous year's classes (for gain calculation)
 * @param policies Current policy state for all tiers
 * @returns Updated classes with recalculated wealth shares (sum = 100%)
 */
export function calculateWealth(
  classes: SocialClass[],
  prevClasses: SocialClass[],
  policies: Record<ClassTier, ClassPolicy>
): SocialClass[] {
  // Step 1: Calculate wealth gains for each class
  const gains = classes.map((c, i) => {
    const prevC = prevClasses[i];
    const policy = policies[c.tier];
    const isTarget = policy.reservationPercent > 0 || policy.ewsEnabled;

    // Measure improvements in education and employment
    const educationGain = Math.max(0, c.metrics.education - prevC.metrics.education);
    const employmentGain = Math.max(0, c.metrics.employment - prevC.metrics.employment);

    // Convert improvements to wealth gains
    let gain =
      educationGain * WEALTH_GROWTH_FROM_EDUCATION +
      employmentGain * WEALTH_GROWTH_FROM_EMPLOYMENT;

    // Add policy redistribution if this class is targeted
    if (isTarget) {
      gain += WEALTH_REDISTRIBUTION_FACTOR;
    }

    return gain;
  });

  // Step 2: Normalize gains (zero-sum constraint)
  const totalGain = gains.reduce((a, b) => a + b, 0);
  const avgGain = totalGain / classes.length;

  // Step 3: Apply gains with floor enforcement
  const tempShares = classes.map((c, i) =>
    Math.max(1, c.metrics.wealth + gains[i] - avgGain)
  );

  // Step 4: Re-normalize to exactly 100%
  const currentSum = tempShares.reduce((a, b) => a + b, 0);

  return classes.map((c, i) => ({
    ...c,
    metrics: {
      ...c.metrics,
      wealth: (tempShares[i] / currentSum) * 100,
    },
  }));
}

/**
 * Calculates poverty rate (CALIBRATED-MODEL.md § Poverty).
 *
 * Poverty decreases when classes improve on three metrics:
 * - Education gain: stronger driver of poverty reduction (0.8 coefficient)
 * - Employment gain: direct impact on poverty (1.2 coefficient, strongest)
 * - Wealth gain: weaker but consistent poverty reduction (0.003 coefficient)
 *
 * **Resistance factor** creates realistic progression:
 * - High poverty: reduces quickly (sqrt curve favors reduction)
 * - Low poverty: reduces slowly (resistance increases)
 * - This models the "easy-to-hard" transition: initial gains come fast,
 *   but approaching the poverty floor (2%) becomes progressively harder
 *
 * @param current Current poverty percentage (0–100)
 * @param educationGain Education improvement this year (percentage points)
 * @param employmentGain Employment improvement this year (percentage points)
 * @param wealthGain Wealth share improvement this year (percentage points)
 * @returns Updated poverty percentage, clamped to [POVERTY_FLOOR (2%), current]
 */
export function calculatePoverty(
  current: number,
  educationGain: number,
  employmentGain: number,
  wealthGain: number
): number {
  // Only use POSITIVE gains for poverty reduction
  // (A class losing relative wealth share doesn't mean they become poorer in absolute terms)
  const safeEduGain = Math.max(0, educationGain);
  const safeEmpGain = Math.max(0, employmentGain);
  const safeWealthGain = Math.max(0, wealthGain);

  // Calculate total reduction from all sources
  const reduction =
    safeEduGain * POVERTY_REDUCTION_EDUCATION +
    safeEmpGain * POVERTY_REDUCTION_EMPLOYMENT +
    safeWealthGain * POVERTY_REDUCTION_WEALTH;

  // Apply resistance factor (sqrt): amplifies reduction when poverty is high,
  // dampens it when poverty is low
  const resistanceFactor = Math.pow(current / 100, 0.5);
  const effectiveReduction = reduction * resistanceFactor;

  // Poverty can only stay same or decrease, never increase
  return Math.max(POVERTY_FLOOR, current - effectiveReduction);
}

/**
 * Calculates life expectancy (CALIBRATED-MODEL.md § Life Expectancy).
 *
 * Life expectancy improves via two pathways:
 * - Education: Better health knowledge, access to healthcare (0.1 per 1% edu gain)
 * - Poverty reduction: Reduced malnutrition, disease, stress (0.15 per 1% poverty reduction)
 *
 * **Headroom diminishing returns**: Creates S-curve progression.
 * Gains are strong early but weaken as ceiling approaches.
 * - At 60 years (headroom=20): Full gain realized (factor = 1.0)
 * - At 75 years (headroom=5): 25% of gain realized (factor = 0.25)
 * - At 80 years (headroom=0): No gain possible (factor = 0)
 *
 * Formula: effectiveGain = (edu×0.1 + pov_reduction×0.15) × (max(0, 80-current) / 20)
 *
 * @param current Current life expectancy (0–80 years)
 * @param educationGain Education improvement this year (percentage points)
 * @param povertyReduction Poverty reduction this year (percentage points)
 * @returns Updated life expectancy, clamped to [current, LE_MAXIMUM (80)]
 */
export function calculateLifeExpectancy(
  current: number,
  educationGain: number,
  povertyReduction: number
): number {
  // Only use POSITIVE gains - life expectancy should not decrease
  // (A class losing relative wealth doesn't mean they die younger)
  const safeEduGain = Math.max(0, educationGain);
  const safePovReduction = Math.max(0, povertyReduction);

  // Calculate raw gain from both pathways
  const baseGain =
    safeEduGain * LE_GAIN_PER_EDUCATION_POINT +
    safePovReduction * LE_GAIN_PER_POVERTY_REDUCTION;

  // Calculate headroom (distance to 80-year ceiling)
  const headroom = LE_MAXIMUM - current;

  // Apply headroom factor: scales down gains as we approach ceiling
  // At 80 years: factor = 0 / 20 = 0 (no improvement possible)
  // At 60 years: factor = 20 / 20 = 1 (full improvement)
  const effectiveGain = baseGain * (Math.max(0, headroom) / 20);

  // Life expectancy can only stay same or improve, never decrease
  return Math.min(LE_MAXIMUM, current + effectiveGain);
}

/**
 * Calculates income per capita (CALIBRATED-MODEL.md § Income).
 *
 * Income grows multiplicatively (not additively) based on class improvements:
 * - Education gain: +2% income per 1% education improvement
 * - Employment gain: +3% income per 1% employment improvement
 *
 * Employment has stronger income impact (1.5× education coefficient) because
 * employment directly translates to earnings, while education is indirect.
 *
 * **Formula**: newIncome = current × (1 + growthRate)
 * where growthRate = educationGain × 0.02 + employmentGain × 0.03
 *
 * **Example**: 2% education gain + 1% employment gain
 * → growthRate = 2×0.02 + 1×0.03 = 0.07 (7% growth)
 * → newIncome = current × 1.07
 *
 * @param current Current monthly income (credits)
 * @param educationGain Education improvement this year (percentage points)
 * @param employmentGain Employment improvement this year (percentage points)
 * @returns Updated income, multiplicatively scaled by combined growth rate
 */
export function calculateIncome(
  current: number,
  educationGain: number,
  employmentGain: number
): number {
  // Only use POSITIVE gains for income growth
  // (Relative changes in other classes shouldn't decrease absolute income)
  const safeEduGain = Math.max(0, educationGain);
  const safeEmpGain = Math.max(0, employmentGain);

  // Combine education and employment contributions to growth rate
  const growthRate =
    safeEduGain * INCOME_GROWTH_FROM_EDUCATION +
    safeEmpGain * INCOME_GROWTH_FROM_EMPLOYMENT;

  // Apply multiplicative growth (compound growth formula)
  // Income can only stay same or grow, never shrink
  return current * (1 + growthRate);
}
