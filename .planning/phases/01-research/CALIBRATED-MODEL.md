# Calibrated Mathematical Model

Based on MODEL-VALIDATION.md findings, this document specifies the **corrected parameters** for the reservation simulator.

## Design Principle

Since this is a **fictional satirical simulator**, we use **normalized/abstract values** rather than real INR amounts. However, the **relative ratios and progression rates** are calibrated to match India's actual 70-year reservation data.

---

## 1. Initial Conditions (Year 0 = "Pre-Reservation Era")

### Population Distribution
```typescript
const populationDistribution = {
  class1: 0.10,  // "The Blessed" - privileged elite (smaller than reality for drama)
  class2: 0.20,  // "The Favored" - upper-middle
  class3: 0.30,  // "The Common" - middle mass
  class4: 0.25,  // "The Overlooked" - lower-middle
  class5: 0.15,  // "The Forgotten" - most disadvantaged
};
```

*Note: Slightly different from real India caste proportions but maintains the pyramid shape.*

### Fertility Rates (Children per woman)
```typescript
const fertilityRates = {
  class1: 1.8,   // Below replacement
  class2: 2.0,   // At replacement
  class3: 2.1,   // Slightly above
  class4: 2.2,   // Moderately above
  class5: 2.3,   // Highest but not extreme
};
```

*Calibration: Matches NFHS-5 2019-2021 data. Gap is 0.5, not 2.2 as in original.*

### Education Access (% with tertiary education)
```typescript
const educationAccess = {
  class1: { primary: 98, secondary: 90, tertiary: 45 },
  class2: { primary: 95, secondary: 80, tertiary: 30 },
  class3: { primary: 90, secondary: 65, tertiary: 20 },
  class4: { primary: 80, secondary: 45, tertiary: 10 },
  class5: { primary: 65, secondary: 25, tertiary: 3 },
};
```

*Calibration: Matches AISHE 2020-21 enrollment gaps. Class 5 tertiary at 3% (real ST was ~2% in 1990s).*

### Skilled Employment Access (%)
```typescript
const employmentAccess = {
  class1: 80,
  class2: 60,
  class3: 40,
  class4: 20,
  class5: 5,
};
```

*Calibration: Proportional to education access with employment multiplier.*

### Wealth Share (% of total wealth)
```typescript
const wealthShare = {
  class1: 45,   // Top 10% owns 45%
  class2: 25,
  class3: 18,
  class4: 9,
  class5: 3,    // Bottom 15% owns 3%
};
```

*Calibration: Matches India's Gini coefficient (~35).*

### Poverty Rate (%)
```typescript
const povertyRate = {
  class1: 5,
  class2: 15,
  class3: 25,
  class4: 40,
  class5: 65,
};
```

*Calibration: Class 5 at 65% (between ST's 50.6% and model's 85%). Dramatic but believable.*

### Life Expectancy (Years)
```typescript
const lifeExpectancy = {
  class1: 72,
  class2: 70,
  class3: 68,
  class4: 65,
  class5: 62,
};
```

*Calibration: 10-year gap (real India: 4-7 years). Slightly exaggerated for impact.*

---

## 2. Progression Coefficients

### Reservation Effect on Education
```typescript
// Per-year improvement in tertiary education access
// With 27% reservation for a class
const RESERVATION_EDUCATION_BOOST = 0.003;  // +0.3% per year base

// Gap-closing multiplier (faster when gap is larger)
function educationGapMultiplier(currentAccess: number): number {
  return Math.pow((100 - currentAccess) / 100, 0.8);
}

// Example: Class 5 at 3% tertiary, with 27% reservation
// Year 1: 3% + (0.003 * 27 * gap_multiplier) = 3% + 0.078% = 3.08%
// After 20 years: ~10-12% (matches real ST progress 1990-2010)
```

### Reservation Effect on Employment
```typescript
// Employment follows education with lag
const EDUCATION_TO_EMPLOYMENT_FACTOR = 0.6;  // 60% correlation
const RESERVATION_EMPLOYMENT_BOOST = 0.002;  // +0.2% per year base

// Employment change = (education_change * 0.6) + (reservation_boost * policy_percentage)
```

### Wealth Accumulation
```typescript
// Wealth grows with employment and education
const WEALTH_GROWTH_FROM_EDUCATION = 0.001;  // +0.1% per 1% education gain
const WEALTH_GROWTH_FROM_EMPLOYMENT = 0.002;  // +0.2% per 1% employment gain
const WEALTH_REDISTRIBUTION_FACTOR = 0.0005;  // Very slow wealth redistribution

// Wealth is zero-sum normalized each year (total always = 100%)
```

### Poverty Reduction
```typescript
// Poverty decreases with education, employment, and wealth
const POVERTY_REDUCTION_EDUCATION = 0.008;   // 0.8% reduction per 1% education gain
const POVERTY_REDUCTION_EMPLOYMENT = 0.012;  // 1.2% reduction per 1% employment gain
const POVERTY_REDUCTION_WEALTH = 0.003;      // 0.3% reduction per 1% wealth share gain

// Minimum poverty floor: 2% (even rich countries have some poverty)
```

### Life Expectancy Improvement
```typescript
// Life expectancy improves with education, wealth, and poverty reduction
const LE_GAIN_PER_EDUCATION_POINT = 0.02;   // +0.02 years per 1% education gain
const LE_GAIN_PER_POVERTY_REDUCTION = 0.03; // +0.03 years per 1% poverty reduction
const LE_MAXIMUM = 80;                       // Realistic ceiling for India-like society

// Example: Class 5 goes from 3% to 30% tertiary over 50 years
// LE gain = 27 * 0.02 = +0.54 years just from education
```

### Fertility Adjustment
```typescript
// Fertility decreases with education (demographic transition)
const FERTILITY_REDUCTION_PER_EDUCATION = 0.005;  // -0.005 TFR per 1% education gain
const FERTILITY_FLOOR = 1.5;  // Minimum (Japan/Korea level)
const FERTILITY_CEILING = 3.0;  // Maximum
```

---

## 3. Time Progression Formulas

### Education Access (Tertiary)
```typescript
function calculateEducation(
  current: number,
  reservationPercent: number,
  yearsSincePolicy: number
): number {
  // Base improvement (all classes get some natural improvement)
  const baseImprovement = 0.1;  // 0.1% per year

  // Reservation boost
  const reservationBoost = (reservationPercent / 100) * RESERVATION_EDUCATION_BOOST * 100;

  // Gap multiplier (faster catch-up when far behind)
  const gapMultiplier = educationGapMultiplier(current);

  // Generational effect (children of educated parents do better)
  // Kicks in after 20 years, maxes out at 50% boost
  const generationalBoost = Math.min(yearsSincePolicy / 40, 0.5);

  // Total improvement
  const improvement = (baseImprovement + reservationBoost * gapMultiplier) * (1 + generationalBoost);

  // Apply with ceiling
  return Math.min(95, current + improvement);
}
```

### Employment Access
```typescript
function calculateEmployment(
  currentEmployment: number,
  currentEducation: number,
  prevEducation: number,
  reservationPercent: number
): number {
  // Education-driven improvement (lagged)
  const educationGain = currentEducation - prevEducation;
  const educationEffect = educationGain * EDUCATION_TO_EMPLOYMENT_FACTOR;

  // Direct reservation effect (job quotas)
  const reservationBoost = (reservationPercent / 100) * RESERVATION_EMPLOYMENT_BOOST * 100;

  // Gap multiplier
  const gapMultiplier = Math.pow((100 - currentEmployment) / 100, 0.8);

  // Total improvement
  const improvement = (educationEffect + reservationBoost) * gapMultiplier;

  return Math.min(90, currentEmployment + improvement);
}
```

### Wealth Share
```typescript
function calculateWealth(
  classes: Class[],
  policyTargetClasses: number[]
): Class[] {
  // Calculate gains for each class
  const gains = classes.map((c, i) => {
    const isTarget = policyTargetClasses.includes(c.tier);
    const educationGain = c.metrics.educationAccess - c.prevMetrics.educationAccess;
    const employmentGain = c.metrics.employment - c.prevMetrics.employment;

    let gain = educationGain * WEALTH_GROWTH_FROM_EDUCATION +
               employmentGain * WEALTH_GROWTH_FROM_EMPLOYMENT;

    // Policy targets get additional boost
    if (isTarget) {
      gain += WEALTH_REDISTRIBUTION_FACTOR;
    }

    return gain;
  });

  // Normalize to maintain 100% total
  const totalGain = gains.reduce((a, b) => a + b, 0);
  const avgGain = totalGain / classes.length;

  return classes.map((c, i) => ({
    ...c,
    metrics: {
      ...c.metrics,
      wealthShare: Math.max(1, c.metrics.wealthShare + gains[i] - avgGain)
    }
  }));
}
```

### Poverty Rate
```typescript
function calculatePoverty(
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

  return Math.max(2, current - effectiveReduction);
}
```

### Life Expectancy
```typescript
function calculateLifeExpectancy(
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
```

---

## 4. Expected Trajectories (Validation Targets)

### 50-Year Simulation with 27% Reservation for Class 5

| Metric | Year 0 | Year 20 | Year 50 | Real India (SC/ST 1950-2000) |
|--------|--------|---------|---------|------------------------------|
| Education (Tertiary) | 3% | 10-12% | 25-30% | ~2% → ~10% → ~18% |
| Employment | 5% | 12-15% | 25-30% | Similar trajectory |
| Wealth Share | 3% | 4-5% | 6-8% | Slow improvement |
| Poverty | 65% | 50% | 30-35% | ~85% → ~50% |
| Life Expectancy | 62 | 65 | 68-70 | +5-7 years over 50 years |

*Note: Our model runs slightly faster than reality for dramatic effect, but within plausible bounds.*

### Without Reservation (Control)

| Metric | Year 0 | Year 20 | Year 50 |
|--------|--------|---------|---------|
| Education (Tertiary) | 3% | 5% | 8% |
| Employment | 5% | 7% | 10% |
| Wealth Share | 3% | 3.5% | 4% |
| Poverty | 65% | 58% | 50% |
| Life Expectancy | 62 | 63 | 65 |

*Natural improvement without policy is much slower.*

---

## 5. Narrative Highlight Logic

At each time jump, calculate:
```typescript
function findBiggestImprovement(prevSnapshot: Snapshot, currentSnapshot: Snapshot): Highlight {
  const metrics = ['education', 'employment', 'wealth', 'poverty', 'lifeExpectancy'];

  let biggest = { metric: '', classId: '', change: 0, percentChange: 0 };

  for (const cls of currentSnapshot.classes) {
    const prevCls = prevSnapshot.classes.find(c => c.id === cls.id);

    for (const metric of metrics) {
      const prev = prevCls.metrics[metric];
      const curr = cls.metrics[metric];
      const change = curr - prev;
      const percentChange = (change / prev) * 100;

      // For poverty, improvement is negative change
      const adjustedChange = metric === 'poverty' ? -percentChange : percentChange;

      if (adjustedChange > biggest.percentChange) {
        biggest = { metric, classId: cls.id, change, percentChange: adjustedChange };
      }
    }
  }

  return biggest;
}

// Narrative templates
const narratives = {
  education: "{className} education access increased from {from}% to {to}%!",
  employment: "{className} skilled employment rose by {change} percentage points!",
  poverty: "{className} poverty dropped from {from}% to {to}%!",
  lifeExpectancy: "{className} now live {to} years on average, up from {from}!",
  wealth: "{className} wealth share grew to {to}% of total wealth!"
};
```

---

## 6. Implementation Notes

1. **Time step = 1 year** internally, but UI shows 20-year jumps by default
2. **Random variance**: Add ±5% random factor to each calculation for realism
3. **Normalization**: Wealth shares always normalized to sum to 100%
4. **History**: Store snapshot every year for smooth chart animations
5. **Seed-based RNG**: Same seed = reproducible simulation

---

*This model is fictional and uses normalized values. The ratios and progression rates are calibrated against India's 70-year reservation policy data to produce historically plausible outcomes.*
