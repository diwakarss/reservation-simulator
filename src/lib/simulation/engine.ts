import {
  SimulationState,
  YearSnapshot,
  SocialClass,
  AggregateMetrics,
  NarrativeHighlight,
  ClassTier,
  METRIC_KEYS,
  METRIC_HIGHER_IS_BETTER,
  ClassMetrics,
} from './types';
import {
  calculateEducation,
  calculateEmployment,
  calculateWealth,
  calculatePoverty,
  calculateLifeExpectancy,
  calculateIncome,
} from './models';

// =============================================================================
// RNG Helper (Mulberry32)
// =============================================================================

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a deterministic random number between min and max.
 * seed string is hashed to a number.
 */
function seededRandom(seed: string, min = 0, max = 1): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const rng = mulberry32(hash);
  return min + rng() * (max - min);
}

/**
 * Applies small random variance to an IMPROVEMENT (not to absolute value).
 * Returns variance as a multiplier (0.9 to 1.1) to apply to gains only.
 * This prevents metrics from decreasing due to randomness.
 */
function getVarianceMultiplier(seed: string): number {
  // Variance between 0.9 and 1.1 (±10% on gains, not absolute values)
  return seededRandom(seed, 0.9, 1.1);
}

// =============================================================================
// Simulation Engine
// =============================================================================

/**
 * Advances the simulation by a specified number of years.
 */
export function stepSimulation(
  state: SimulationState,
  years: number
): SimulationState {
  if (!state.world) {
    console.warn('Cannot step simulation: World not initialized');
    return state;
  }

  let currentState = { ...state };
  // We already checked state.world exists
  let currentClasses = [...state.world!.classes];
  
  // If we are starting from a state that has history, use the latest classes from history
  if (currentState.history.length > 0) {
    const lastSnapshot = currentState.history[currentState.history.length - 1];
    currentClasses = lastSnapshot.classes;
  }

  const startYear = currentState.currentYear;
  const endYear = startYear + years;
  // We already checked state.world exists
  const seed = state.world!.seed;

  for (let year = startYear + 1; year <= endYear; year++) {
    // 1. Calculate new metrics for each class
    // We need previous year's classes for calculations
    const prevClasses = currentClasses;
    
    // First pass: Calculate independent metrics (Edu, Emp)
    let nextClasses = currentClasses.map((c) => {
      const policy = currentState.policy.classes[c.tier];
      const yearsSincePolicy = year; // Simplified: policy active since year 0

      // Education - calculate improvement, apply variance to improvement, ensure no decrease
      const rawNewEdu = calculateEducation(
        c.metrics.education,
        policy.reservationPercent,
        yearsSincePolicy
      );
      const eduImprovement = rawNewEdu - c.metrics.education;
      const variedEduImprovement = eduImprovement * getVarianceMultiplier(`${seed}-${year}-${c.tier}-edu`);
      // Education can only stay same or improve, never decrease
      const newEdu = Math.max(c.metrics.education, c.metrics.education + variedEduImprovement);

      // Employment - calculate improvement, apply variance to improvement, ensure no decrease
      const rawNewEmp = calculateEmployment(
        c.metrics.employment,
        newEdu,
        c.metrics.education,
        policy.reservationPercent
      );
      const empImprovement = rawNewEmp - c.metrics.employment;
      const variedEmpImprovement = empImprovement * getVarianceMultiplier(`${seed}-${year}-${c.tier}-emp`);
      // Employment can only stay same or improve, never decrease
      const newEmp = Math.max(c.metrics.employment, c.metrics.employment + variedEmpImprovement);

      return {
        ...c,
        metrics: {
          ...c.metrics,
          education: newEdu,
          employment: newEmp,
        },
      };
    });

    // Second pass: Wealth (needs all classes)
    nextClasses = calculateWealth(nextClasses, prevClasses, currentState.policy.classes);
    // Apply variance to wealth? calculateWealth normalizes to 100.
    // If we apply variance, we might break normalization.
    // Let's skip variance for wealth share to maintain sum=100 invariant strictly.

    // Third pass: Dependent metrics (Poverty, LE, Income)
    nextClasses = nextClasses.map((c, i) => {
      const prevC = prevClasses[i];

      // Calculate gains (these are already guaranteed non-negative from first pass)
      const eduGain = Math.max(0, c.metrics.education - prevC.metrics.education);
      const empGain = Math.max(0, c.metrics.employment - prevC.metrics.employment);
      const wealthGain = c.metrics.wealth - prevC.metrics.wealth; // Can be negative (zero-sum)

      // Poverty - can only decrease (never increase)
      const rawNewPov = calculatePoverty(
        prevC.metrics.poverty,
        eduGain,
        empGain,
        wealthGain
      );
      // Poverty can only stay same or decrease
      const newPov = Math.min(prevC.metrics.poverty, rawNewPov);

      // Life Expectancy - can only increase (never decrease)
      const povRed = Math.max(0, prevC.metrics.poverty - newPov);
      const rawNewLE = calculateLifeExpectancy(
        prevC.metrics.lifeExpectancy,
        eduGain,
        povRed
      );
      // Life expectancy can only stay same or increase
      const newLE = Math.max(prevC.metrics.lifeExpectancy, rawNewLE);

      // Income - can only increase (never decrease)
      const rawNewIncome = calculateIncome(
        prevC.metrics.incomePerCapita,
        eduGain,
        empGain
      );
      // Income can only stay same or increase
      const newIncome = Math.max(prevC.metrics.incomePerCapita, rawNewIncome);

      return {
        ...c,
        metrics: {
          ...c.metrics,
          poverty: newPov,
          lifeExpectancy: newLE,
          incomePerCapita: newIncome,
        },
      };
    });

    // 2. Update current classes
    currentClasses = nextClasses;

    // 3. Create snapshot
    const snapshot: YearSnapshot = {
      year,
      classes: currentClasses,
      policy: JSON.parse(JSON.stringify(currentState.policy)), // Deep copy policy state
      aggregates: calculateAggregates(currentClasses),
    };

    // 4. Update state
    currentState.history.push(snapshot);
    currentState.currentYear = year;
    
    // Update world classes to reflect current state
    if (currentState.world) {
      currentState.world!.classes = currentClasses;
    }
  }

  // 5. Find biggest improvement over this period
  // We compare start of jump (or previous snapshot) with end of jump
  const startSnapshot = currentState.history.find(h => h.year === startYear) || 
                        (startYear === 0 ? {
                          year: 0,
                          classes: state.world.classes, // Initial classes
                          policy: state.policy,
                          aggregates: calculateAggregates(state.world.classes)
                        } : null);

  const endSnapshot = currentState.history[currentState.history.length - 1];

  if (startSnapshot && endSnapshot) {
    currentState.highlight = findBiggestImprovement(startSnapshot, endSnapshot);
  }

  return currentState;
}

/**
 * Calculates aggregate metrics for a set of classes.
 */
function calculateAggregates(classes: SocialClass[]): AggregateMetrics {
  const totalPop = classes.reduce((sum, c) => sum + c.population, 0); // Should be 100? Or close to 1 (0.1, etc)?
  // In constants.ts, population is 0.1, 0.2, etc. Sum is 1.0.
  // We should normalize if needed, but let's assume sum is ~1.
  
  const avgEducation = classes.reduce((sum, c) => sum + c.metrics.education * c.population, 0) / totalPop;
  const avgEmployment = classes.reduce((sum, c) => sum + c.metrics.employment * c.population, 0) / totalPop;
  
  // Wealth Gini (simplified calculation for 5 buckets)
  // Gini = 1 - sum( (cumPop_i + cumPop_{i-1}) * (cumWealth_i - cumWealth_{i-1}) )
  // But let's use a simpler heuristic or just specific Gini formula.
  // Gini = (1 / 2*mean) * sum sum |xi - xj| / n^2 ... too complex for here.
  // Let's use simple approximation or just 0 for now if not critical.
  // Actually, let's use the area under Lorenz curve method.
  // Sort classes by wealth/capita (which correlates with tier usually).
  // But here wealth is % share.
  // Cumulative population (X) vs Cumulative wealth (Y).
  // Gini = 1 - 2 * AreaUnderCurve.
  
  let cumPop = 0;
  let cumWealth = 0;
  let area = 0;
  
  // Sort by wealth per capita?
  // Wealth share / population share = relative wealth.
  const sortedClasses = [...classes].sort((a, b) => 
    (a.metrics.wealth / a.population) - (b.metrics.wealth / b.population)
  );

  for (const c of sortedClasses) {
    const pop = c.population; // e.g. 0.1
    const wealth = c.metrics.wealth / 100; // e.g. 0.45
    
    const prevCumPop = cumPop;
    const prevCumWealth = cumWealth;
    
    cumPop += pop;
    cumWealth += wealth;
    
    // Trapezoid area
    area += (pop) * (prevCumWealth + cumWealth) / 2;
  }
  
  // Gini = 1 - 2 * Area
  // If perfect equality, Area = 0.5, Gini = 0.
  // If perfect inequality, Area = 0, Gini = 1.
  const wealthGini = 1 - 2 * area;

  const overallPoverty = classes.reduce((sum, c) => sum + c.metrics.poverty * c.population, 0) / totalPop;
  const avgLifeExpectancy = classes.reduce((sum, c) => sum + c.metrics.lifeExpectancy * c.population, 0) / totalPop;

  return {
    avgEducation,
    avgEmployment,
    wealthGini,
    overallPoverty,
    avgLifeExpectancy,
    totalPopulation: totalPop * 100, // Display as 100%
  };
}

/**
 * Finds the biggest improvement between two snapshots.
 */
export function findBiggestImprovement(
  prev: YearSnapshot | { classes: SocialClass[] },
  current: YearSnapshot
): NarrativeHighlight {
  let bestHighlight: NarrativeHighlight | null = null;
  let maxPercentChange = -Infinity;

  for (const c of current.classes) {
    const prevC = prev.classes.find((p) => p.tier === c.tier);
    if (!prevC) continue;

    for (const key of METRIC_KEYS) {
      if (key === 'incomePerCapita') continue; // Skip income for narrative highlights (focus on social metrics)
      
      const currVal = c.metrics[key];
      const prevVal = prevC.metrics[key];
      const change = currVal - prevVal;
      
      // Calculate percent change relative to previous value
      // Avoid division by zero
      const percentChange = prevVal !== 0 ? (change / prevVal) * 100 : 0;
      
      // Adjust for metrics where lower is better (Poverty)
      // We want "improvement", so a drop in poverty is a positive improvement.
      const isBetter = METRIC_HIGHER_IS_BETTER[key];
      const improvementScore = isBetter ? percentChange : -percentChange;

      if (improvementScore > maxPercentChange) {
        maxPercentChange = improvementScore;
        bestHighlight = {
          classDisplayName: c.displayName,
          classTier: c.tier,
          metric: key,
          fromValue: prevVal,
          toValue: currVal,
          change: change,
          percentChange: percentChange,
        };
      }
    }
  }
  
  // Fallback if no improvement found (unlikely)
  if (!bestHighlight) {
    return {
      classDisplayName: current.classes[0].displayName,
      classTier: current.classes[0].tier,
      metric: 'education',
      fromValue: 0,
      toValue: 0,
      change: 0,
      percentChange: 0,
    };
  }

  return bestHighlight;
}

/**
 * Captures a snapshot of the current state.
 */
export function captureSnapshot(state: SimulationState): YearSnapshot {
  if (!state.world) throw new Error("No world to snapshot");
  
  return {
    year: state.currentYear,
    classes: JSON.parse(JSON.stringify(state.world.classes)),
    policy: JSON.parse(JSON.stringify(state.policy)),
    aggregates: calculateAggregates(state.world.classes),
  };
}
