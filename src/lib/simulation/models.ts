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
 * Calculates the education gap multiplier.
 * Improvement is faster when the gap to 100% is larger.
 */
function educationGapMultiplier(currentAccess: number): number {
  return Math.pow((100 - currentAccess) / 100, 0.8);
}

// =============================================================================
// Metric Calculation Models
// =============================================================================

/**
 * Calculates the new education access percentage.
 */
export function calculateEducation(
  current: number,
  reservationPercent: number,
  yearsSincePolicy: number
): number {
  // Base improvement (all classes get some natural improvement)
  const baseImprovement = 0.1; // 0.1% per year

  // Reservation boost
  // reservationPercent is 0-50
  const reservationBoost =
    (reservationPercent / 100) * RESERVATION_EDUCATION_BOOST * 100;

  // Gap multiplier (faster catch-up when far behind)
  const gapMultiplier = educationGapMultiplier(current);

  // Generational effect (children of educated parents do better)
  // Kicks in after 20 years, maxes out at 50% boost
  const generationalBoost = Math.min(yearsSincePolicy / 40, 0.5);

  // Total improvement
  const improvement =
    (baseImprovement + reservationBoost * gapMultiplier) *
    (1 + generationalBoost);

  // Apply with ceiling
  return Math.min(95, current + improvement);
}

/**
 * Calculates the new employment percentage.
 */
export function calculateEmployment(
  currentEmployment: number,
  currentEducation: number,
  prevEducation: number,
  reservationPercent: number
): number {
  // Education-driven improvement (lagged)
  const educationGain = currentEducation - prevEducation;
  // Ensure we don't have negative gain from noise or small fluctuations affecting logic negatively,
  // though education usually goes up.
  const effectiveEduGain = Math.max(0, educationGain);
  
  const educationEffect = effectiveEduGain * EDUCATION_TO_EMPLOYMENT_FACTOR;

  // Direct reservation effect (job quotas)
  const reservationBoost =
    (reservationPercent / 100) * RESERVATION_EMPLOYMENT_BOOST * 100;

  // Gap multiplier
  const gapMultiplier = Math.pow((100 - currentEmployment) / 100, 0.8);

  // Total improvement
  const improvement = (educationEffect + reservationBoost) * gapMultiplier;

  return Math.min(90, currentEmployment + improvement);
}

/**
 * Calculates the new wealth share for all classes.
 * Wealth is zero-sum, so shares are normalized to sum to 100%.
 */
export function calculateWealth(
  classes: SocialClass[],
  prevClasses: SocialClass[],
  policies: Record<ClassTier, ClassPolicy>
): SocialClass[] {
  // Calculate gains for each class
  const gains = classes.map((c, i) => {
    const prevC = prevClasses[i];
    const policy = policies[c.tier];
    const isTarget = policy.reservationPercent > 0 || policy.ewsEnabled;

    const educationGain = Math.max(0, c.metrics.education - prevC.metrics.education);
    const employmentGain = Math.max(0, c.metrics.employment - prevC.metrics.employment);

    let gain =
      educationGain * WEALTH_GROWTH_FROM_EDUCATION +
      employmentGain * WEALTH_GROWTH_FROM_EMPLOYMENT;

    // Policy targets get additional boost (redistribution)
    if (isTarget) {
      gain += WEALTH_REDISTRIBUTION_FACTOR;
    }

    return gain;
  });

  // Normalize to maintain 100% total
  // The 'gain' here is an absolute addition to the share. 
  // We need to redistribute the total gain/loss so the sum remains 100.
  // Method from CALIBRATED-MODEL.md:
  // newShare = oldShare + gain - avgGain
  
  const totalGain = gains.reduce((a, b) => a + b, 0);
  const avgGain = totalGain / classes.length;

  const tempClasses = classes.map((c, i) => {
    let newShare = c.metrics.wealth + gains[i] - avgGain;
    return Math.max(1, newShare); // Clamp to minimum 1%
  });

  // Re-normalize to ensure sum is exactly 100
  const currentSum = tempClasses.reduce((a, b) => a + b, 0);
  
  return classes.map((c, i) => ({
    ...c,
    metrics: {
      ...c.metrics,
      wealth: (tempClasses[i] / currentSum) * 100,
    },
  }));
}

/**
 * Calculates the new poverty rate.
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

/**
 * Calculates the new life expectancy.
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
  // If headroom is small, effectiveGain should be small.
  // Formula from model: effectiveGain = gain * (headroom / 20)
  // This implies if headroom is 20, we get full gain. If 0, no gain.
  const effectiveGain = gain * (Math.max(0, headroom) / 20);

  return Math.min(LE_MAXIMUM, current + effectiveGain);
}

/**
 * Calculates the new income per capita.
 */
export function calculateIncome(
  current: number,
  educationGain: number,
  employmentGain: number
): number {
  const growth =
    educationGain * INCOME_GROWTH_FROM_EDUCATION +
    employmentGain * INCOME_GROWTH_FROM_EMPLOYMENT;
  
  // Growth is a multiplier on current income?
  // PLAN.md says: INCOME_GROWTH_FROM_EDUCATION = 0.02 (2% per 1% edu gain?)
  // If edu gain is 1 (1%), income grows by 2%.
  // So: new = current * (1 + growth)
  
  return current * (1 + growth);
}
