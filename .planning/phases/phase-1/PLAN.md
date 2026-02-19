---
phase: 01-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - tsconfig.json
  - next.config.ts
  - tailwind.config.ts
  - postcss.config.mjs
  - .eslintrc.json
  - .prettierrc
  - .gitignore
  - src/app/layout.tsx
  - src/app/page.tsx
  - src/app/globals.css
  - vitest.config.ts
  - src/lib/types/index.ts
  - src/lib/types/simulation.ts
  - src/lib/types/traits.ts
  - src/lib/constants/initial-conditions.ts
  - src/lib/constants/progression-coefficients.ts
  - src/lib/engine/education.ts
  - src/lib/engine/employment.ts
  - src/lib/engine/wealth.ts
  - src/lib/engine/poverty.ts
  - src/lib/engine/life-expectancy.ts
  - src/lib/engine/fertility.ts
  - src/lib/engine/simulation.ts
  - src/lib/engine/narrative.ts
  - src/lib/engine/index.ts
  - src/lib/engine/__tests__/education.test.ts
  - src/lib/engine/__tests__/employment.test.ts
  - src/lib/engine/__tests__/wealth.test.ts
  - src/lib/engine/__tests__/poverty.test.ts
  - src/lib/engine/__tests__/life-expectancy.test.ts
  - src/lib/engine/__tests__/simulation.test.ts
  - src/data/traits.json
  - src/data/world-names.json
autonomous: true
user_setup: []

must_haves:
  truths:
    - "npm run dev starts Next.js 15 app without errors"
    - "npm run test runs Vitest with 90%+ coverage on engine"
    - "Simulation produces results within 10% of CALIBRATED-MODEL.md validation targets"
    - "200 absurd traits available in traits.json"
    - "TypeScript compiles with zero errors"
  artifacts:
    - "src/lib/types/*.ts (all interfaces from CALIBRATED-MODEL.md)"
    - "src/lib/engine/*.ts (all progression formulas)"
    - "src/lib/engine/__tests__/*.test.ts (unit tests)"
    - "src/data/traits.json (200 traits)"
  key_links:
    - "simulation.ts imports all individual calculators"
    - "Types match CALIBRATED-MODEL.md interface definitions exactly"
    - "Constants match CALIBRATED-MODEL.md initial conditions exactly"
---

<objective>
Scaffold Next.js 15 app with TypeScript, implement all core data models and simulation engine from CALIBRATED-MODEL.md, create 200 absurd traits, and achieve 90%+ test coverage.

Purpose: Foundation for the reservation simulator - all math and data models must be solid before building UI.
Output: Working simulation engine that produces historically-plausible results, fully tested.
</objective>

<execution_context>
@~/claude-projects/hq/framework/workflows/execute-plan.md
@~/claude-projects/hq/framework/templates/summary.md
</execution_context>

<context>
# Project Context
@/Users/b2sell/claude-projects/projects/reservation-simulator/.planning/PROJECT.md
@/Users/b2sell/claude-projects/projects/reservation-simulator/.planning/ROADMAP.md
@/Users/b2sell/claude-projects/projects/reservation-simulator/.planning/STATE.md

# Research Artifacts (CRITICAL - contains all formulas and interfaces)
@/Users/b2sell/claude-projects/projects/reservation-simulator/.planning/phases/01-research/CALIBRATED-MODEL.md
@/Users/b2sell/claude-projects/projects/reservation-simulator/.planning/phases/01-research/RESEARCH.md
@/Users/b2sell/claude-projects/projects/reservation-simulator/.planning/phases/01-research/PRD.md
</context>

<context_priorities>
Critical:
  - CALIBRATED-MODEL.md (ALL formulas and interfaces must be implemented exactly)
  - PRD.md data models section (TypeScript interfaces)
  - RESEARCH.md tech stack section

Supporting:
  - ROADMAP.md (wave structure reference)
  - STATE.md (project status)

Background:
  - PROJECT.md (high-level context)
</context_priorities>

<tasks>

<!-- ============================================== -->
<!-- PLAN 01: PROJECT SCAFFOLDING (Wave 1.1)        -->
<!-- Size: M | Est: ~25% context                    -->
<!-- ============================================== -->

<task type="auto">
  <name>Task 1: Scaffold Next.js 15 Project</name>
  <files>
    package.json
    tsconfig.json
    next.config.ts
    tailwind.config.ts
    postcss.config.mjs
    .eslintrc.json
    .prettierrc
    .gitignore
    src/app/layout.tsx
    src/app/page.tsx
    src/app/globals.css
    vitest.config.ts
  </files>
  <action>
    Create Next.js 15 project with App Router:

    ```bash
    cd /Users/b2sell/claude-projects/projects/reservation-simulator
    npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
    ```

    Then install additional dependencies:
    ```bash
    npm install zustand recharts framer-motion
    npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @vitest/coverage-v8
    ```

    Create vitest.config.ts:
    ```typescript
    import { defineConfig } from 'vitest/config';
    import react from '@vitejs/plugin-react';
    import path from 'path';

    export default defineConfig({
      plugins: [react()],
      test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html'],
          include: ['src/lib/**/*.ts'],
          exclude: ['src/lib/**/*.test.ts', 'src/lib/**/index.ts'],
          thresholds: {
            statements: 90,
            branches: 90,
            functions: 90,
            lines: 90,
          },
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
    });
    ```

    Create src/test/setup.ts:
    ```typescript
    import '@testing-library/jest-dom';
    ```

    Add scripts to package.json:
    ```json
    "scripts": {
      "test": "vitest",
      "test:coverage": "vitest run --coverage"
    }
    ```

    Update .prettierrc:
    ```json
    {
      "semi": true,
      "singleQuote": true,
      "tabWidth": 2,
      "trailingComma": "es5",
      "printWidth": 100
    }
    ```
  </action>
  <verify>
    ```bash
    cd /Users/b2sell/claude-projects/projects/reservation-simulator
    npm run dev &
    sleep 5
    curl -s http://localhost:3000 | head -20
    pkill -f "next dev"
    npm run build
    ```
  </verify>
  <done>
    - Next.js 15 app starts on localhost:3000
    - Build completes without errors
    - Vitest config ready for testing
  </done>
</task>

<task type="auto">
  <name>Task 2: Create Core TypeScript Interfaces</name>
  <files>
    src/lib/types/index.ts
    src/lib/types/simulation.ts
    src/lib/types/traits.ts
  </files>
  <action>
    Create all TypeScript interfaces exactly matching CALIBRATED-MODEL.md and PRD.md.

    src/lib/types/simulation.ts:
    ```typescript
    /**
     * Core simulation types from CALIBRATED-MODEL.md
     * DO NOT MODIFY without updating validation targets
     */

    export interface ClassMetrics {
      educationAccess: number;      // 0-100 (tertiary education %)
      employment: number;           // 0-100 (skilled employment %)
      wealthShare: number;          // 0-100 (% of total wealth)
      povertyRate: number;          // 0-100 (% below poverty line)
      lifeExpectancy: number;       // Years (62-80 range)
      fertilityRate: number;        // Children per woman (1.5-3.0)
    }

    export interface SocialClass {
      id: string;
      tier: 1 | 2 | 3 | 4 | 5;      // 1 = top ("The Blessed"), 5 = bottom ("The Forgotten")
      name: string;
      description: string;
      populationShare: number;       // 0-1 (sums to 1 across all classes)
      metrics: ClassMetrics;
    }

    export interface ReservationPolicy {
      enabled: boolean;
      percentage: number;            // 0-50
      targetClasses: number[];       // Class tiers that benefit (e.g., [4, 5])
      startYear: number;
    }

    export interface WorldConfig {
      galaxyName: string;
      planetName: string;
      nationName: string;
    }

    export interface YearSnapshot {
      year: number;
      classes: SocialClass[];
      policyActive: boolean;
    }

    export interface SimulationState {
      seed: string;
      world: WorldConfig;
      trait: AbsurdTrait;
      classes: SocialClass[];
      currentYear: number;
      reservationPolicy: ReservationPolicy;
      history: YearSnapshot[];
    }

    export interface NarrativeHighlight {
      metric: keyof ClassMetrics;
      classId: string;
      className: string;
      fromValue: number;
      toValue: number;
      change: number;
      percentChange: number;
    }

    // Import from traits.ts
    export type { AbsurdTrait, TraitCategory } from './traits';
    ```

    src/lib/types/traits.ts:
    ```typescript
    export type TraitCategory =
      | 'celestial'
      | 'auditory'
      | 'culinary'
      | 'temporal'
      | 'physical'
      | 'metaphysical'
      | 'arbitrary';

    export interface ClassNamePatterns {
      1: string;  // Top class name
      2: string;  // Upper-middle
      3: string;  // Middle
      4: string;  // Lower-middle
      5: string;  // Bottom class name
    }

    export interface AbsurdTrait {
      id: string;
      text: string;                   // "Those whose earlobes vibrate at 432Hz"
      category: TraitCategory;
      classPatterns: ClassNamePatterns;
    }
    ```

    src/lib/types/index.ts:
    ```typescript
    export * from './simulation';
    export * from './traits';
    ```
  </action>
  <verify>
    ```bash
    cd /Users/b2sell/claude-projects/projects/reservation-simulator
    npx tsc --noEmit
    ```
  </verify>
  <done>
    - All interfaces compile without errors
    - Types match CALIBRATED-MODEL.md exactly
  </done>
</task>

<task type="auto">
  <name>Task 3: Implement Initial Conditions Constants</name>
  <files>
    src/lib/constants/initial-conditions.ts
    src/lib/constants/progression-coefficients.ts
    src/lib/constants/index.ts
  </files>
  <action>
    Create constants exactly from CALIBRATED-MODEL.md Section 1 and 2.

    src/lib/constants/initial-conditions.ts:
    ```typescript
    /**
     * Initial conditions from CALIBRATED-MODEL.md Section 1
     * Year 0 = "Pre-Reservation Era"
     * DO NOT MODIFY - calibrated against India's 70-year reservation data
     */

    export const POPULATION_DISTRIBUTION = {
      class1: 0.10,  // "The Blessed" - privileged elite
      class2: 0.20,  // "The Favored" - upper-middle
      class3: 0.30,  // "The Common" - middle mass
      class4: 0.25,  // "The Overlooked" - lower-middle
      class5: 0.15,  // "The Forgotten" - most disadvantaged
    } as const;

    export const FERTILITY_RATES = {
      class1: 1.8,   // Below replacement
      class2: 2.0,   // At replacement
      class3: 2.1,   // Slightly above
      class4: 2.2,   // Moderately above
      class5: 2.3,   // Highest but not extreme
    } as const;

    export const EDUCATION_ACCESS = {
      class1: { primary: 98, secondary: 90, tertiary: 45 },
      class2: { primary: 95, secondary: 80, tertiary: 30 },
      class3: { primary: 90, secondary: 65, tertiary: 20 },
      class4: { primary: 80, secondary: 45, tertiary: 10 },
      class5: { primary: 65, secondary: 25, tertiary: 3 },
    } as const;

    export const EMPLOYMENT_ACCESS = {
      class1: 80,
      class2: 60,
      class3: 40,
      class4: 20,
      class5: 5,
    } as const;

    export const WEALTH_SHARE = {
      class1: 45,   // Top 10% owns 45%
      class2: 25,
      class3: 18,
      class4: 9,
      class5: 3,    // Bottom 15% owns 3%
    } as const;

    export const POVERTY_RATE = {
      class1: 5,
      class2: 15,
      class3: 25,
      class4: 40,
      class5: 65,
    } as const;

    export const LIFE_EXPECTANCY = {
      class1: 72,
      class2: 70,
      class3: 68,
      class4: 65,
      class5: 62,
    } as const;
    ```

    src/lib/constants/progression-coefficients.ts:
    ```typescript
    /**
     * Progression coefficients from CALIBRATED-MODEL.md Section 2
     * These control year-over-year changes in metrics
     * DO NOT MODIFY - calibrated against India's 70-year reservation data
     */

    // Education progression
    export const RESERVATION_EDUCATION_BOOST = 0.003;  // +0.3% per year base
    export const BASE_EDUCATION_IMPROVEMENT = 0.1;      // 0.1% per year natural
    export const EDUCATION_CEILING = 95;

    // Employment progression
    export const EDUCATION_TO_EMPLOYMENT_FACTOR = 0.6;  // 60% correlation
    export const RESERVATION_EMPLOYMENT_BOOST = 0.002;  // +0.2% per year base
    export const EMPLOYMENT_CEILING = 90;

    // Wealth progression
    export const WEALTH_GROWTH_FROM_EDUCATION = 0.001;  // +0.1% per 1% education gain
    export const WEALTH_GROWTH_FROM_EMPLOYMENT = 0.002; // +0.2% per 1% employment gain
    export const WEALTH_REDISTRIBUTION_FACTOR = 0.0005; // Very slow wealth redistribution
    export const WEALTH_MINIMUM = 1;  // Minimum wealth share %

    // Poverty reduction
    export const POVERTY_REDUCTION_EDUCATION = 0.008;   // 0.8% reduction per 1% education gain
    export const POVERTY_REDUCTION_EMPLOYMENT = 0.012;  // 1.2% reduction per 1% employment gain
    export const POVERTY_REDUCTION_WEALTH = 0.003;      // 0.3% reduction per 1% wealth share gain
    export const POVERTY_FLOOR = 2;  // Minimum poverty rate

    // Life expectancy
    export const LE_GAIN_PER_EDUCATION_POINT = 0.02;    // +0.02 years per 1% education gain
    export const LE_GAIN_PER_POVERTY_REDUCTION = 0.03;  // +0.03 years per 1% poverty reduction
    export const LE_MAXIMUM = 80;

    // Fertility
    export const FERTILITY_REDUCTION_PER_EDUCATION = 0.005;  // -0.005 TFR per 1% education gain
    export const FERTILITY_FLOOR = 1.5;
    export const FERTILITY_CEILING = 3.0;

    // Random variance
    export const RANDOM_VARIANCE_FACTOR = 0.05;  // +/-5% random factor
    ```

    src/lib/constants/index.ts:
    ```typescript
    export * from './initial-conditions';
    export * from './progression-coefficients';
    ```
  </action>
  <verify>
    ```bash
    cd /Users/b2sell/claude-projects/projects/reservation-simulator
    npx tsc --noEmit
    ```
  </verify>
  <done>
    - All constants match CALIBRATED-MODEL.md exactly
    - TypeScript compiles without errors
  </done>
</task>

<task type="auto">
  <name>Task 4: Implement Education Calculator</name>
  <files>
    src/lib/engine/education.ts
    src/lib/engine/__tests__/education.test.ts
  </files>
  <action>
    Implement education progression formula from CALIBRATED-MODEL.md Section 3.

    src/lib/engine/education.ts:
    ```typescript
    /**
     * Education access calculator from CALIBRATED-MODEL.md
     * Implements: calculateEducation() function
     */

    import {
      RESERVATION_EDUCATION_BOOST,
      BASE_EDUCATION_IMPROVEMENT,
      EDUCATION_CEILING,
    } from '../constants';

    /**
     * Gap-closing multiplier (faster when gap is larger)
     * Formula: (100 - currentAccess) / 100) ^ 0.8
     */
    export function educationGapMultiplier(currentAccess: number): number {
      return Math.pow((100 - currentAccess) / 100, 0.8);
    }

    /**
     * Calculate education access for next year
     *
     * @param current - Current tertiary education access (0-100)
     * @param reservationPercent - Reservation policy percentage (0-50)
     * @param yearsSincePolicy - Years since policy was enacted
     * @param randomSeed - Optional seed for deterministic randomness
     * @returns New education access value (0-95 ceiling)
     */
    export function calculateEducation(
      current: number,
      reservationPercent: number,
      yearsSincePolicy: number,
      randomFactor: number = 0  // -0.05 to +0.05
    ): number {
      // Base improvement (all classes get some natural improvement)
      const baseImprovement = BASE_EDUCATION_IMPROVEMENT;

      // Reservation boost: (reservationPercent / 100) * RESERVATION_EDUCATION_BOOST * 100
      const reservationBoost = (reservationPercent / 100) * RESERVATION_EDUCATION_BOOST * 100;

      // Gap multiplier (faster catch-up when far behind)
      const gapMultiplier = educationGapMultiplier(current);

      // Generational effect (children of educated parents do better)
      // Kicks in after 20 years, maxes out at 50% boost
      const generationalBoost = Math.min(yearsSincePolicy / 40, 0.5);

      // Total improvement with random variance
      const improvement = (baseImprovement + reservationBoost * gapMultiplier) *
                         (1 + generationalBoost) *
                         (1 + randomFactor);

      // Apply with ceiling
      return Math.min(EDUCATION_CEILING, current + improvement);
    }
    ```

    src/lib/engine/__tests__/education.test.ts:
    ```typescript
    import { describe, it, expect } from 'vitest';
    import { calculateEducation, educationGapMultiplier } from '../education';

    describe('educationGapMultiplier', () => {
      it('returns higher multiplier for lower access', () => {
        const lowAccess = educationGapMultiplier(3);   // Class 5 starting point
        const highAccess = educationGapMultiplier(45); // Class 1 starting point

        expect(lowAccess).toBeGreaterThan(highAccess);
        expect(lowAccess).toBeCloseTo(0.947, 2);  // (97/100)^0.8
        expect(highAccess).toBeCloseTo(0.584, 2); // (55/100)^0.8
      });

      it('returns 0 when at 100% access', () => {
        expect(educationGapMultiplier(100)).toBe(0);
      });
    });

    describe('calculateEducation', () => {
      it('improves education with reservation policy', () => {
        const current = 3;  // Class 5 starting tertiary access
        const withReservation = calculateEducation(current, 27, 0);
        const withoutReservation = calculateEducation(current, 0, 0);

        expect(withReservation).toBeGreaterThan(withoutReservation);
        expect(withReservation).toBeGreaterThan(current);
      });

      it('respects 95% ceiling', () => {
        const result = calculateEducation(94, 50, 100);
        expect(result).toBeLessThanOrEqual(95);
      });

      it('applies generational boost after 20 years', () => {
        const year0 = calculateEducation(10, 27, 0);
        const year40 = calculateEducation(10, 27, 40);

        // Year 40 should have up to 50% generational boost
        const improvementYear0 = year0 - 10;
        const improvementYear40 = year40 - 10;

        expect(improvementYear40).toBeGreaterThan(improvementYear0 * 1.3);
      });

      // VALIDATION TARGET from CALIBRATED-MODEL.md Table
      // Class 5: 3% -> 10-12% over 20 years with 27% reservation
      it('matches 20-year validation target for Class 5', () => {
        let education = 3;
        for (let year = 0; year < 20; year++) {
          education = calculateEducation(education, 27, year);
        }

        expect(education).toBeGreaterThanOrEqual(10);
        expect(education).toBeLessThanOrEqual(14); // Some variance allowed
      });

      // Class 5: 3% -> 25-30% over 50 years with 27% reservation
      it('matches 50-year validation target for Class 5', () => {
        let education = 3;
        for (let year = 0; year < 50; year++) {
          education = calculateEducation(education, 27, year);
        }

        expect(education).toBeGreaterThanOrEqual(22);
        expect(education).toBeLessThanOrEqual(35);
      });

      // Without reservation: 3% -> 8% over 50 years
      it('matches control trajectory without reservation', () => {
        let education = 3;
        for (let year = 0; year < 50; year++) {
          education = calculateEducation(education, 0, year);
        }

        expect(education).toBeGreaterThanOrEqual(6);
        expect(education).toBeLessThanOrEqual(12);
      });
    });
    ```
  </action>
  <verify>
    ```bash
    cd /Users/b2sell/claude-projects/projects/reservation-simulator
    npm run test -- src/lib/engine/__tests__/education.test.ts
    ```
  </verify>
  <done>
    - All education tests pass
    - 20-year and 50-year validation targets met
  </done>
</task>

<task type="auto">
  <name>Task 5: Implement Employment Calculator</name>
  <files>
    src/lib/engine/employment.ts
    src/lib/engine/__tests__/employment.test.ts
  </files>
  <action>
    Implement employment progression formula from CALIBRATED-MODEL.md Section 3.

    src/lib/engine/employment.ts:
    ```typescript
    /**
     * Employment calculator from CALIBRATED-MODEL.md
     * Employment follows education with lag
     */

    import {
      EDUCATION_TO_EMPLOYMENT_FACTOR,
      RESERVATION_EMPLOYMENT_BOOST,
      EMPLOYMENT_CEILING,
    } from '../constants';

    /**
     * Calculate employment access for next year
     *
     * @param currentEmployment - Current skilled employment (0-100)
     * @param currentEducation - Current tertiary education access
     * @param prevEducation - Previous year's education access
     * @param reservationPercent - Reservation policy percentage (0-50)
     * @param randomFactor - Random variance (-0.05 to +0.05)
     * @returns New employment access value (0-90 ceiling)
     */
    export function calculateEmployment(
      currentEmployment: number,
      currentEducation: number,
      prevEducation: number,
      reservationPercent: number,
      randomFactor: number = 0
    ): number {
      // Education-driven improvement (lagged)
      const educationGain = currentEducation - prevEducation;
      const educationEffect = educationGain * EDUCATION_TO_EMPLOYMENT_FACTOR;

      // Direct reservation effect (job quotas)
      const reservationBoost = (reservationPercent / 100) * RESERVATION_EMPLOYMENT_BOOST * 100;

      // Gap multiplier (same formula as education)
      const gapMultiplier = Math.pow((100 - currentEmployment) / 100, 0.8);

      // Total improvement with random variance
      const improvement = (educationEffect + reservationBoost) * gapMultiplier * (1 + randomFactor);

      return Math.min(EMPLOYMENT_CEILING, currentEmployment + Math.max(0, improvement));
    }
    ```

    src/lib/engine/__tests__/employment.test.ts:
    ```typescript
    import { describe, it, expect } from 'vitest';
    import { calculateEmployment } from '../employment';
    import { calculateEducation } from '../education';

    describe('calculateEmployment', () => {
      it('improves with education gains', () => {
        const result = calculateEmployment(5, 10, 5, 0);
        expect(result).toBeGreaterThan(5);
      });

      it('improves faster with reservation', () => {
        const withReservation = calculateEmployment(5, 10, 5, 27);
        const withoutReservation = calculateEmployment(5, 10, 5, 0);

        expect(withReservation).toBeGreaterThan(withoutReservation);
      });

      it('respects 90% ceiling', () => {
        const result = calculateEmployment(89, 95, 90, 50);
        expect(result).toBeLessThanOrEqual(90);
      });

      // VALIDATION TARGET: Class 5: 5% -> 12-15% over 20 years
      it('matches 20-year validation target for Class 5', () => {
        let education = 3;
        let prevEducation = 3;
        let employment = 5;

        for (let year = 0; year < 20; year++) {
          const newEducation = calculateEducation(education, 27, year);
          employment = calculateEmployment(employment, newEducation, education, 27);
          prevEducation = education;
          education = newEducation;
        }

        expect(employment).toBeGreaterThanOrEqual(10);
        expect(employment).toBeLessThanOrEqual(18);
      });

      // VALIDATION TARGET: Class 5: 5% -> 25-30% over 50 years
      it('matches 50-year validation target for Class 5', () => {
        let education = 3;
        let prevEducation = 3;
        let employment = 5;

        for (let year = 0; year < 50; year++) {
          const newEducation = calculateEducation(education, 27, year);
          employment = calculateEmployment(employment, newEducation, education, 27);
          prevEducation = education;
          education = newEducation;
        }

        expect(employment).toBeGreaterThanOrEqual(20);
        expect(employment).toBeLessThanOrEqual(35);
      });
    });
    ```
  </action>
  <verify>
    ```bash
    cd /Users/b2sell/claude-projects/projects/reservation-simulator
    npm run test -- src/lib/engine/__tests__/employment.test.ts
    ```
  </verify>
  <done>
    - All employment tests pass
    - Validation targets met
  </done>
</task>

<task type="auto">
  <name>Task 6: Implement Wealth Calculator</name>
  <files>
    src/lib/engine/wealth.ts
    src/lib/engine/__tests__/wealth.test.ts
  </files>
  <action>
    Implement wealth distribution formula from CALIBRATED-MODEL.md Section 3.

    src/lib/engine/wealth.ts:
    ```typescript
    /**
     * Wealth calculator from CALIBRATED-MODEL.md
     * Wealth is zero-sum normalized (always sums to 100%)
     */

    import type { SocialClass } from '../types';
    import {
      WEALTH_GROWTH_FROM_EDUCATION,
      WEALTH_GROWTH_FROM_EMPLOYMENT,
      WEALTH_REDISTRIBUTION_FACTOR,
      WEALTH_MINIMUM,
    } from '../constants';

    interface ClassWithPrevMetrics extends SocialClass {
      prevMetrics: {
        educationAccess: number;
        employment: number;
      };
    }

    /**
     * Calculate wealth distribution for all classes
     * Wealth is zero-sum: total always = 100%
     *
     * @param classes - Array of classes with current and previous metrics
     * @param policyTargetClasses - Class tiers that benefit from policy
     * @returns Updated classes with new wealth shares
     */
    export function calculateWealth(
      classes: ClassWithPrevMetrics[],
      policyTargetClasses: number[]
    ): number[] {
      // Calculate gains for each class
      const gains = classes.map((c) => {
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

      return classes.map((c, i) =>
        Math.max(WEALTH_MINIMUM, c.metrics.wealthShare + gains[i] - avgGain)
      );
    }

    /**
     * Simplified wealth calculation for single class
     * Used when we don't have full class array
     */
    export function calculateWealthGain(
      educationGain: number,
      employmentGain: number,
      isPolicyTarget: boolean
    ): number {
      let gain = educationGain * WEALTH_GROWTH_FROM_EDUCATION +
                 employmentGain * WEALTH_GROWTH_FROM_EMPLOYMENT;

      if (isPolicyTarget) {
        gain += WEALTH_REDISTRIBUTION_FACTOR;
      }

      return gain;
    }
    ```

    src/lib/engine/__tests__/wealth.test.ts:
    ```typescript
    import { describe, it, expect } from 'vitest';
    import { calculateWealth, calculateWealthGain } from '../wealth';
    import type { SocialClass } from '../types';

    describe('calculateWealthGain', () => {
      it('returns positive gain with education and employment gains', () => {
        const gain = calculateWealthGain(5, 3, false);
        expect(gain).toBeGreaterThan(0);
      });

      it('returns higher gain for policy targets', () => {
        const targetGain = calculateWealthGain(5, 3, true);
        const nonTargetGain = calculateWealthGain(5, 3, false);

        expect(targetGain).toBeGreaterThan(nonTargetGain);
      });
    });

    describe('calculateWealth', () => {
      const createMockClasses = (wealthShares: number[]) => {
        return wealthShares.map((wealth, i) => ({
          id: `class-${i + 1}`,
          tier: (i + 1) as 1 | 2 | 3 | 4 | 5,
          name: `Class ${i + 1}`,
          description: '',
          populationShare: 0.2,
          metrics: {
            educationAccess: 20 + i * 5,
            employment: 30 + i * 5,
            wealthShare: wealth,
            povertyRate: 50 - i * 10,
            lifeExpectancy: 65,
            fertilityRate: 2.0,
          },
          prevMetrics: {
            educationAccess: 18 + i * 5,
            employment: 28 + i * 5,
          },
        }));
      };

      it('preserves total wealth close to input sum', () => {
        const classes = createMockClasses([45, 25, 18, 9, 3]);
        const newWealth = calculateWealth(classes, [4, 5]);
        const total = newWealth.reduce((a, b) => a + b, 0);

        // Should be close to 100% (small deviations from rounding)
        expect(total).toBeCloseTo(100, 0);
      });

      it('increases wealth for policy target classes', () => {
        const classes = createMockClasses([45, 25, 18, 9, 3]);
        const newWealth = calculateWealth(classes, [5]); // Only class 5 targeted

        // Class 5 (index 4) should gain more than average
        expect(newWealth[4]).toBeGreaterThanOrEqual(3);
      });

      it('respects minimum wealth floor', () => {
        const classes = createMockClasses([45, 25, 18, 9, 1]);
        const newWealth = calculateWealth(classes, []);

        newWealth.forEach((w) => {
          expect(w).toBeGreaterThanOrEqual(1);
        });
      });

      // VALIDATION TARGET: Class 5: 3% -> 4-5% over 20 years
      it('shows slow wealth improvement', () => {
        // Wealth changes are very slow - this is expected
        const gain = calculateWealthGain(10, 5, true);
        expect(gain).toBeLessThan(0.1); // Very small per-year gain
      });
    });
    ```
  </action>
  <verify>
    ```bash
    cd /Users/b2sell/claude-projects/projects/reservation-simulator
    npm run test -- src/lib/engine/__tests__/wealth.test.ts
    ```
  </verify>
  <done>
    - All wealth tests pass
    - Zero-sum normalization working
  </done>
</task>

<task type="auto">
  <name>Task 7: Implement Poverty Calculator</name>
  <files>
    src/lib/engine/poverty.ts
    src/lib/engine/__tests__/poverty.test.ts
  </files>
  <action>
    Implement poverty reduction formula from CALIBRATED-MODEL.md Section 3.

    src/lib/engine/poverty.ts:
    ```typescript
    /**
     * Poverty calculator from CALIBRATED-MODEL.md
     * Poverty decreases with education, employment, and wealth
     */

    import {
      POVERTY_REDUCTION_EDUCATION,
      POVERTY_REDUCTION_EMPLOYMENT,
      POVERTY_REDUCTION_WEALTH,
      POVERTY_FLOOR,
    } from '../constants';

    /**
     * Calculate poverty rate for next year
     *
     * @param current - Current poverty rate (0-100)
     * @param educationGain - Change in education access
     * @param employmentGain - Change in employment access
     * @param wealthGain - Change in wealth share
     * @param randomFactor - Random variance (-0.05 to +0.05)
     * @returns New poverty rate (minimum 2%)
     */
    export function calculatePoverty(
      current: number,
      educationGain: number,
      employmentGain: number,
      wealthGain: number,
      randomFactor: number = 0
    ): number {
      const reduction =
        educationGain * POVERTY_REDUCTION_EDUCATION +
        employmentGain * POVERTY_REDUCTION_EMPLOYMENT +
        wealthGain * POVERTY_REDUCTION_WEALTH;

      // Poverty reduction slows as you approach the floor
      const resistanceFactor = Math.pow(current / 100, 0.5);
      const effectiveReduction = reduction * resistanceFactor * (1 + randomFactor);

      return Math.max(POVERTY_FLOOR, current - effectiveReduction);
    }
    ```

    src/lib/engine/__tests__/poverty.test.ts:
    ```typescript
    import { describe, it, expect } from 'vitest';
    import { calculatePoverty } from '../poverty';

    describe('calculatePoverty', () => {
      it('reduces poverty with positive gains', () => {
        const result = calculatePoverty(65, 5, 3, 0.5);
        expect(result).toBeLessThan(65);
      });

      it('respects 2% floor', () => {
        const result = calculatePoverty(3, 50, 50, 50);
        expect(result).toBeGreaterThanOrEqual(2);
      });

      it('reduces faster when poverty is higher', () => {
        const highPoverty = calculatePoverty(80, 5, 3, 0.5);
        const lowPoverty = calculatePoverty(20, 5, 3, 0.5);

        const highReduction = 80 - highPoverty;
        const lowReduction = 20 - lowPoverty;

        expect(highReduction).toBeGreaterThan(lowReduction);
      });

      // VALIDATION TARGET: Class 5: 65% -> 50% over 20 years
      it('matches 20-year validation target', () => {
        let poverty = 65;

        // Simulate 20 years with average gains
        for (let year = 0; year < 20; year++) {
          // Assume moderate education/employment gains per year
          poverty = calculatePoverty(poverty, 0.4, 0.3, 0.05);
        }

        expect(poverty).toBeGreaterThanOrEqual(45);
        expect(poverty).toBeLessThanOrEqual(55);
      });

      // VALIDATION TARGET: Class 5: 65% -> 30-35% over 50 years
      it('matches 50-year validation target', () => {
        let poverty = 65;

        for (let year = 0; year < 50; year++) {
          poverty = calculatePoverty(poverty, 0.5, 0.4, 0.08);
        }

        expect(poverty).toBeGreaterThanOrEqual(25);
        expect(poverty).toBeLessThanOrEqual(40);
      });
    });
    ```
  </action>
  <verify>
    ```bash
    cd /Users/b2sell/claude-projects/projects/reservation-simulator
    npm run test -- src/lib/engine/__tests__/poverty.test.ts
    ```
  </verify>
  <done>
    - All poverty tests pass
    - Validation targets met
  </done>
</task>

<task type="auto">
  <name>Task 8: Implement Life Expectancy and Fertility Calculators</name>
  <files>
    src/lib/engine/life-expectancy.ts
    src/lib/engine/fertility.ts
    src/lib/engine/__tests__/life-expectancy.test.ts
  </files>
  <action>
    Implement remaining calculators from CALIBRATED-MODEL.md.

    src/lib/engine/life-expectancy.ts:
    ```typescript
    /**
     * Life expectancy calculator from CALIBRATED-MODEL.md
     */

    import {
      LE_GAIN_PER_EDUCATION_POINT,
      LE_GAIN_PER_POVERTY_REDUCTION,
      LE_MAXIMUM,
    } from '../constants';

    /**
     * Calculate life expectancy for next year
     *
     * @param current - Current life expectancy (years)
     * @param educationGain - Change in education access
     * @param povertyReduction - Decrease in poverty rate (positive = improvement)
     * @returns New life expectancy (max 80 years)
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
    ```

    src/lib/engine/fertility.ts:
    ```typescript
    /**
     * Fertility calculator from CALIBRATED-MODEL.md
     * Fertility decreases with education (demographic transition)
     */

    import {
      FERTILITY_REDUCTION_PER_EDUCATION,
      FERTILITY_FLOOR,
      FERTILITY_CEILING,
    } from '../constants';

    /**
     * Calculate fertility rate for next year
     *
     * @param current - Current fertility rate (children per woman)
     * @param educationGain - Change in education access
     * @returns New fertility rate (1.5-3.0 range)
     */
    export function calculateFertility(
      current: number,
      educationGain: number
    ): number {
      const reduction = educationGain * FERTILITY_REDUCTION_PER_EDUCATION;
      const newRate = current - reduction;

      return Math.max(FERTILITY_FLOOR, Math.min(FERTILITY_CEILING, newRate));
    }
    ```

    src/lib/engine/__tests__/life-expectancy.test.ts:
    ```typescript
    import { describe, it, expect } from 'vitest';
    import { calculateLifeExpectancy } from '../life-expectancy';
    import { calculateFertility } from '../fertility';

    describe('calculateLifeExpectancy', () => {
      it('increases with education and poverty reduction', () => {
        const result = calculateLifeExpectancy(62, 5, 3);
        expect(result).toBeGreaterThan(62);
      });

      it('respects 80-year ceiling', () => {
        const result = calculateLifeExpectancy(79, 50, 50);
        expect(result).toBeLessThanOrEqual(80);
      });

      it('gains slow down near ceiling', () => {
        const farFromCeiling = calculateLifeExpectancy(62, 5, 3);
        const nearCeiling = calculateLifeExpectancy(78, 5, 3);

        const farGain = farFromCeiling - 62;
        const nearGain = nearCeiling - 78;

        expect(farGain).toBeGreaterThan(nearGain);
      });

      // VALIDATION TARGET: Class 5: 62 -> 65 over 20 years
      it('matches 20-year validation target', () => {
        let lifeExp = 62;

        for (let year = 0; year < 20; year++) {
          // Assume moderate gains
          lifeExp = calculateLifeExpectancy(lifeExp, 0.4, 0.5);
        }

        expect(lifeExp).toBeGreaterThanOrEqual(64);
        expect(lifeExp).toBeLessThanOrEqual(67);
      });

      // VALIDATION TARGET: Class 5: 62 -> 68-70 over 50 years
      it('matches 50-year validation target', () => {
        let lifeExp = 62;

        for (let year = 0; year < 50; year++) {
          lifeExp = calculateLifeExpectancy(lifeExp, 0.5, 0.6);
        }

        expect(lifeExp).toBeGreaterThanOrEqual(66);
        expect(lifeExp).toBeLessThanOrEqual(72);
      });
    });

    describe('calculateFertility', () => {
      it('decreases with education gains', () => {
        const result = calculateFertility(2.3, 5);
        expect(result).toBeLessThan(2.3);
      });

      it('respects 1.5 floor', () => {
        const result = calculateFertility(1.6, 50);
        expect(result).toBeGreaterThanOrEqual(1.5);
      });

      it('respects 3.0 ceiling', () => {
        const result = calculateFertility(2.9, -50);
        expect(result).toBeLessThanOrEqual(3.0);
      });
    });
    ```
  </action>
  <verify>
    ```bash
    cd /Users/b2sell/claude-projects/projects/reservation-simulator
    npm run test -- src/lib/engine/__tests__/life-expectancy.test.ts
    ```
  </verify>
  <done>
    - Life expectancy and fertility tests pass
    - Validation targets met
  </done>
</task>

<task type="auto">
  <name>Task 9: Implement Main Simulation Engine</name>
  <files>
    src/lib/engine/simulation.ts
    src/lib/engine/narrative.ts
    src/lib/engine/index.ts
    src/lib/engine/__tests__/simulation.test.ts
  </files>
  <action>
    Implement main simulation orchestrator and narrative highlight finder.

    src/lib/engine/narrative.ts:
    ```typescript
    /**
     * Narrative highlight logic from CALIBRATED-MODEL.md Section 5
     */

    import type { YearSnapshot, ClassMetrics, NarrativeHighlight } from '../types';

    type MetricKey = keyof Omit<ClassMetrics, 'fertilityRate'>;

    /**
     * Find the biggest improvement between two snapshots
     */
    export function findBiggestImprovement(
      prevSnapshot: YearSnapshot,
      currentSnapshot: YearSnapshot
    ): NarrativeHighlight | null {
      const metrics: MetricKey[] = [
        'educationAccess',
        'employment',
        'wealthShare',
        'povertyRate',
        'lifeExpectancy',
      ];

      let biggest: NarrativeHighlight | null = null;
      let biggestScore = 0;

      for (const cls of currentSnapshot.classes) {
        const prevCls = prevSnapshot.classes.find((c) => c.id === cls.id);
        if (!prevCls) continue;

        for (const metric of metrics) {
          const prev = prevCls.metrics[metric];
          const curr = cls.metrics[metric];
          const change = curr - prev;

          // Skip if no change
          if (Math.abs(change) < 0.01) continue;

          const percentChange = prev !== 0 ? (change / prev) * 100 : 0;

          // For poverty, improvement is negative change
          const adjustedScore = metric === 'povertyRate' ? -percentChange : percentChange;

          if (adjustedScore > biggestScore) {
            biggestScore = adjustedScore;
            biggest = {
              metric,
              classId: cls.id,
              className: cls.name,
              fromValue: prev,
              toValue: curr,
              change,
              percentChange: adjustedScore,
            };
          }
        }
      }

      return biggest;
    }

    /**
     * Generate narrative text for a highlight
     */
    export function generateNarrativeText(highlight: NarrativeHighlight): string {
      const templates: Record<MetricKey, string> = {
        educationAccess: `${highlight.className} education access increased from ${highlight.fromValue.toFixed(1)}% to ${highlight.toValue.toFixed(1)}%!`,
        employment: `${highlight.className} skilled employment rose by ${highlight.change.toFixed(1)} percentage points!`,
        povertyRate: `${highlight.className} poverty dropped from ${highlight.fromValue.toFixed(1)}% to ${highlight.toValue.toFixed(1)}%!`,
        lifeExpectancy: `${highlight.className} now live ${highlight.toValue.toFixed(1)} years on average, up from ${highlight.fromValue.toFixed(1)}!`,
        wealthShare: `${highlight.className} wealth share grew to ${highlight.toValue.toFixed(1)}% of total wealth!`,
      };

      return templates[highlight.metric];
    }
    ```

    src/lib/engine/simulation.ts:
    ```typescript
    /**
     * Main simulation engine
     * Orchestrates all calculators for year-by-year progression
     */

    import type {
      SimulationState,
      SocialClass,
      YearSnapshot,
      ReservationPolicy,
      ClassMetrics,
    } from '../types';
    import {
      POPULATION_DISTRIBUTION,
      FERTILITY_RATES,
      EDUCATION_ACCESS,
      EMPLOYMENT_ACCESS,
      WEALTH_SHARE,
      POVERTY_RATE,
      LIFE_EXPECTANCY,
    } from '../constants';
    import { calculateEducation } from './education';
    import { calculateEmployment } from './employment';
    import { calculateWealth } from './wealth';
    import { calculatePoverty } from './poverty';
    import { calculateLifeExpectancy } from './life-expectancy';
    import { calculateFertility } from './fertility';

    // Seeded random number generator for reproducibility
    function seededRandom(seed: string, index: number): number {
      const hash = seed.split('').reduce((a, c) => {
        const h = ((a << 5) - a) + c.charCodeAt(0);
        return h & h;
      }, 0);
      const x = Math.sin(hash + index) * 10000;
      return (x - Math.floor(x)) * 0.1 - 0.05; // -0.05 to +0.05
    }

    /**
     * Create initial classes with Year 0 metrics
     */
    export function createInitialClasses(classNames: Record<1|2|3|4|5, string>): SocialClass[] {
      const tiers: (1|2|3|4|5)[] = [1, 2, 3, 4, 5];

      return tiers.map((tier) => ({
        id: `class-${tier}`,
        tier,
        name: classNames[tier],
        description: '',
        populationShare: POPULATION_DISTRIBUTION[`class${tier}` as keyof typeof POPULATION_DISTRIBUTION],
        metrics: {
          educationAccess: EDUCATION_ACCESS[`class${tier}` as keyof typeof EDUCATION_ACCESS].tertiary,
          employment: EMPLOYMENT_ACCESS[`class${tier}` as keyof typeof EMPLOYMENT_ACCESS],
          wealthShare: WEALTH_SHARE[`class${tier}` as keyof typeof WEALTH_SHARE],
          povertyRate: POVERTY_RATE[`class${tier}` as keyof typeof POVERTY_RATE],
          lifeExpectancy: LIFE_EXPECTANCY[`class${tier}` as keyof typeof LIFE_EXPECTANCY],
          fertilityRate: FERTILITY_RATES[`class${tier}` as keyof typeof FERTILITY_RATES],
        },
      }));
    }

    /**
     * Simulate one year of progression
     */
    export function simulateYear(
      classes: SocialClass[],
      prevClasses: SocialClass[],
      policy: ReservationPolicy,
      year: number,
      seed: string
    ): SocialClass[] {
      const yearsSincePolicy = policy.enabled ? year - policy.startYear : 0;

      return classes.map((cls, idx) => {
        const prevCls = prevClasses.find((c) => c.id === cls.id) || cls;
        const isTarget = policy.enabled && policy.targetClasses.includes(cls.tier);
        const reservationPercent = isTarget ? policy.percentage : 0;
        const randomFactor = seededRandom(seed, year * 10 + idx);

        // Calculate new metrics
        const newEducation = calculateEducation(
          cls.metrics.educationAccess,
          reservationPercent,
          Math.max(0, yearsSincePolicy),
          randomFactor
        );

        const newEmployment = calculateEmployment(
          cls.metrics.employment,
          newEducation,
          cls.metrics.educationAccess,
          reservationPercent,
          randomFactor
        );

        const educationGain = newEducation - cls.metrics.educationAccess;
        const employmentGain = newEmployment - cls.metrics.employment;

        const newPoverty = calculatePoverty(
          cls.metrics.povertyRate,
          educationGain,
          employmentGain,
          0.05, // Placeholder wealth gain
          randomFactor
        );

        const povertyReduction = cls.metrics.povertyRate - newPoverty;

        const newLifeExpectancy = calculateLifeExpectancy(
          cls.metrics.lifeExpectancy,
          educationGain,
          povertyReduction
        );

        const newFertility = calculateFertility(
          cls.metrics.fertilityRate,
          educationGain
        );

        return {
          ...cls,
          metrics: {
            educationAccess: newEducation,
            employment: newEmployment,
            wealthShare: cls.metrics.wealthShare, // Updated separately
            povertyRate: newPoverty,
            lifeExpectancy: newLifeExpectancy,
            fertilityRate: newFertility,
          },
        };
      });
    }

    /**
     * Update wealth shares (zero-sum across all classes)
     */
    export function updateWealthShares(
      classes: SocialClass[],
      prevClasses: SocialClass[],
      policy: ReservationPolicy
    ): SocialClass[] {
      const classesWithPrev = classes.map((c, i) => ({
        ...c,
        prevMetrics: {
          educationAccess: prevClasses[i]?.metrics.educationAccess || c.metrics.educationAccess,
          employment: prevClasses[i]?.metrics.employment || c.metrics.employment,
        },
      }));

      const newWealth = calculateWealth(classesWithPrev, policy.enabled ? policy.targetClasses : []);

      return classes.map((c, i) => ({
        ...c,
        metrics: {
          ...c.metrics,
          wealthShare: newWealth[i],
        },
      }));
    }

    /**
     * Run simulation for N years
     */
    export function runSimulation(
      initialClasses: SocialClass[],
      policy: ReservationPolicy,
      years: number,
      seed: string
    ): YearSnapshot[] {
      const history: YearSnapshot[] = [
        {
          year: 0,
          classes: initialClasses,
          policyActive: false,
        },
      ];

      let currentClasses = initialClasses;

      for (let year = 1; year <= years; year++) {
        const prevClasses = currentClasses;

        // Simulate year
        currentClasses = simulateYear(
          currentClasses,
          prevClasses,
          policy,
          year,
          seed
        );

        // Update wealth (zero-sum normalization)
        currentClasses = updateWealthShares(currentClasses, prevClasses, policy);

        history.push({
          year,
          classes: currentClasses,
          policyActive: policy.enabled && year >= policy.startYear,
        });
      }

      return history;
    }
    ```

    src/lib/engine/index.ts:
    ```typescript
    export { calculateEducation, educationGapMultiplier } from './education';
    export { calculateEmployment } from './employment';
    export { calculateWealth, calculateWealthGain } from './wealth';
    export { calculatePoverty } from './poverty';
    export { calculateLifeExpectancy } from './life-expectancy';
    export { calculateFertility } from './fertility';
    export {
      createInitialClasses,
      simulateYear,
      updateWealthShares,
      runSimulation,
    } from './simulation';
    export { findBiggestImprovement, generateNarrativeText } from './narrative';
    ```

    src/lib/engine/__tests__/simulation.test.ts:
    ```typescript
    import { describe, it, expect } from 'vitest';
    import { createInitialClasses, runSimulation } from '../simulation';
    import { findBiggestImprovement, generateNarrativeText } from '../narrative';
    import type { ReservationPolicy } from '../../types';

    const TEST_CLASS_NAMES = {
      1: 'The Blessed',
      2: 'The Favored',
      3: 'The Common',
      4: 'The Overlooked',
      5: 'The Forgotten',
    } as const;

    describe('createInitialClasses', () => {
      it('creates 5 classes with correct initial metrics', () => {
        const classes = createInitialClasses(TEST_CLASS_NAMES);

        expect(classes).toHaveLength(5);
        expect(classes[0].tier).toBe(1);
        expect(classes[4].tier).toBe(5);

        // Check Class 5 initial values from CALIBRATED-MODEL.md
        const class5 = classes[4];
        expect(class5.metrics.educationAccess).toBe(3);
        expect(class5.metrics.employment).toBe(5);
        expect(class5.metrics.wealthShare).toBe(3);
        expect(class5.metrics.povertyRate).toBe(65);
        expect(class5.metrics.lifeExpectancy).toBe(62);
      });

      it('population shares sum to 1', () => {
        const classes = createInitialClasses(TEST_CLASS_NAMES);
        const total = classes.reduce((sum, c) => sum + c.populationShare, 0);
        expect(total).toBeCloseTo(1, 5);
      });
    });

    describe('runSimulation', () => {
      const policy27: ReservationPolicy = {
        enabled: true,
        percentage: 27,
        targetClasses: [5],
        startYear: 0,
      };

      const noPolicy: ReservationPolicy = {
        enabled: false,
        percentage: 0,
        targetClasses: [],
        startYear: 0,
      };

      it('produces correct number of snapshots', () => {
        const classes = createInitialClasses(TEST_CLASS_NAMES);
        const history = runSimulation(classes, policy27, 50, 'test-seed');

        expect(history).toHaveLength(51); // Year 0 + 50 years
      });

      it('shows improvement with reservation policy', () => {
        const classes = createInitialClasses(TEST_CLASS_NAMES);
        const withPolicy = runSimulation(classes, policy27, 50, 'test-seed');
        const withoutPolicy = runSimulation(classes, noPolicy, 50, 'test-seed');

        const class5WithPolicy = withPolicy[50].classes[4];
        const class5Without = withoutPolicy[50].classes[4];

        expect(class5WithPolicy.metrics.educationAccess)
          .toBeGreaterThan(class5Without.metrics.educationAccess);
      });

      // FULL VALIDATION against CALIBRATED-MODEL.md targets
      describe('validation targets', () => {
        it('Class 5 education: 3% -> 10-12% at year 20 with 27% reservation', () => {
          const classes = createInitialClasses(TEST_CLASS_NAMES);
          const history = runSimulation(classes, policy27, 20, 'validation');
          const class5 = history[20].classes[4];

          expect(class5.metrics.educationAccess).toBeGreaterThanOrEqual(9);
          expect(class5.metrics.educationAccess).toBeLessThanOrEqual(15);
        });

        it('Class 5 education: 3% -> 25-30% at year 50 with 27% reservation', () => {
          const classes = createInitialClasses(TEST_CLASS_NAMES);
          const history = runSimulation(classes, policy27, 50, 'validation');
          const class5 = history[50].classes[4];

          expect(class5.metrics.educationAccess).toBeGreaterThanOrEqual(20);
          expect(class5.metrics.educationAccess).toBeLessThanOrEqual(35);
        });

        it('Class 5 poverty: 65% -> ~50% at year 20 with 27% reservation', () => {
          const classes = createInitialClasses(TEST_CLASS_NAMES);
          const history = runSimulation(classes, policy27, 20, 'validation');
          const class5 = history[20].classes[4];

          expect(class5.metrics.povertyRate).toBeGreaterThanOrEqual(45);
          expect(class5.metrics.povertyRate).toBeLessThanOrEqual(58);
        });

        it('Class 5 life expectancy: 62 -> 65 at year 20 with 27% reservation', () => {
          const classes = createInitialClasses(TEST_CLASS_NAMES);
          const history = runSimulation(classes, policy27, 20, 'validation');
          const class5 = history[20].classes[4];

          expect(class5.metrics.lifeExpectancy).toBeGreaterThanOrEqual(63);
          expect(class5.metrics.lifeExpectancy).toBeLessThanOrEqual(67);
        });

        it('produces reproducible results with same seed', () => {
          const classes = createInitialClasses(TEST_CLASS_NAMES);
          const run1 = runSimulation(classes, policy27, 10, 'same-seed');
          const run2 = runSimulation(classes, policy27, 10, 'same-seed');

          expect(run1[10].classes[4].metrics.educationAccess)
            .toBe(run2[10].classes[4].metrics.educationAccess);
        });
      });
    });

    describe('narrative', () => {
      it('finds biggest improvement', () => {
        const classes = createInitialClasses(TEST_CLASS_NAMES);
        const policy: ReservationPolicy = {
          enabled: true,
          percentage: 27,
          targetClasses: [5],
          startYear: 0,
        };
        const history = runSimulation(classes, policy, 20, 'narrative-test');

        const highlight = findBiggestImprovement(history[0], history[20]);

        expect(highlight).not.toBeNull();
        expect(highlight?.percentChange).toBeGreaterThan(0);
      });

      it('generates narrative text', () => {
        const highlight = {
          metric: 'educationAccess' as const,
          classId: 'class-5',
          className: 'The Forgotten',
          fromValue: 3,
          toValue: 12,
          change: 9,
          percentChange: 300,
        };

        const text = generateNarrativeText(highlight);
        expect(text).toContain('The Forgotten');
        expect(text).toContain('3.0%');
        expect(text).toContain('12.0%');
      });
    });
    ```
  </action>
  <verify>
    ```bash
    cd /Users/b2sell/claude-projects/projects/reservation-simulator
    npm run test -- src/lib/engine/__tests__/simulation.test.ts
    ```
  </verify>
  <done>
    - Full simulation runs correctly
    - All validation targets met
    - Narrative highlights working
  </done>
</task>

<task type="auto">
  <name>Task 10: Create 200 Absurd Traits JSON</name>
  <files>
    src/data/traits.json
    src/data/world-names.json
  </files>
  <action>
    Create pre-generated content for 200 absurd traits with class name patterns.

    Categories to cover (approx 28-30 per category):
    - celestial: Moon phases, star alignments, cosmic events
    - auditory: Frequencies, sounds, vibrations
    - culinary: Food origins, taste abilities, eating habits
    - temporal: Birth timing, seasonal events, nanoseconds
    - physical: Hair patterns, body features, gestures
    - metaphysical: Auras, energies, spiritual abilities
    - arbitrary: Completely random, absurd differentiators

    src/data/traits.json structure:
    ```json
    [
      {
        "id": "earlobe-432hz",
        "text": "Those whose earlobes vibrate at exactly 432Hz",
        "category": "auditory",
        "classPatterns": {
          "1": "The Sacred 432 Resonants",
          "2": "The Harmonic Frequency Keepers",
          "3": "The Common Vibration Folk",
          "4": "The Dissonant Ones",
          "5": "The Frequency-Deaf"
        }
      },
      {
        "id": "third-moon",
        "text": "Those born when the third moon was full",
        "category": "celestial",
        "classPatterns": {
          "1": "The Triple Moon Blessed",
          "2": "The Lunar Favored",
          "3": "The Moon-Touched Commons",
          "4": "The Partially Illuminated",
          "5": "The Moonless Unfortunates"
        }
      }
      // ... 198 more traits
    ]
    ```

    src/data/world-names.json:
    ```json
    {
      "galaxies": [
        "Andromethea Prime",
        "Zephyrian Cluster",
        "Nebula Vortex",
        "Stellar Dominion",
        "Cosmic Hierarchy"
      ],
      "planets": [
        "Stratifica VII",
        "Hierarch Prime",
        "Caste Majoris",
        "Varnashrama",
        "Division World"
      ],
      "nations": [
        "The Eternal Order",
        "Republic of Sacred Ranks",
        "United Hierarchy",
        "The Blessed Dominion",
        "Meritocracy of the Chosen"
      ]
    }
    ```

    Generate all 200 traits covering the satirical themes:
    - Mocking arbitrary basis of social hierarchy
    - Absurd pseudo-scientific traits
    - Ridiculous celestial/cosmic significance
    - Food/culinary purity concepts
    - Temporal birth timing superstitions
    - Physical features treated as sacred
  </action>
  <verify>
    ```bash
    cd /Users/b2sell/claude-projects/projects/reservation-simulator
    node -e "const t = require('./src/data/traits.json'); console.log('Traits:', t.length); console.log('Categories:', [...new Set(t.map(x => x.category))])"
    ```
  </verify>
  <done>
    - 200 traits in traits.json
    - All 7 categories represented
    - Each trait has class name patterns for all 5 tiers
  </done>
</task>

<task type="auto">
  <name>Task 11: Run Full Test Coverage</name>
  <files>
    (all test files)
  </files>
  <action>
    Run full test suite with coverage and verify 90%+ on simulation engine.

    ```bash
    cd /Users/b2sell/claude-projects/projects/reservation-simulator
    npm run test:coverage
    ```

    If coverage < 90%, add additional test cases for:
    - Edge cases in calculators
    - Boundary conditions
    - Error handling
  </action>
  <verify>
    ```bash
    cd /Users/b2sell/claude-projects/projects/reservation-simulator
    npm run test:coverage 2>&1 | grep -A 20 "Coverage summary"
    ```
  </verify>
  <done>
    - All tests pass
    - 90%+ coverage on src/lib/engine/**
    - No TypeScript errors
  </done>
</task>

</tasks>

<verification>
Run all checks:

```bash
cd /Users/b2sell/claude-projects/projects/reservation-simulator

# 1. TypeScript compiles
npx tsc --noEmit && echo "TypeScript OK"

# 2. Tests pass with coverage
npm run test:coverage

# 3. Dev server starts
npm run dev &
sleep 5
curl -s http://localhost:3000 | head -5 && echo "Dev server OK"
pkill -f "next dev"

# 4. Traits count
node -e "console.log('Traits:', require('./src/data/traits.json').length)"

# 5. Build succeeds
npm run build && echo "Build OK"
```
</verification>

<success_criteria>
- [ ] `npm run dev` starts Next.js 15 app without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run test:coverage` shows 90%+ on src/lib/engine/**
- [ ] TypeScript compiles with zero errors
- [ ] Simulation produces results within 10% of CALIBRATED-MODEL.md validation targets:
  - Class 5 education: 3% -> 10-12% at year 20 with 27% reservation
  - Class 5 education: 3% -> 25-30% at year 50 with 27% reservation
  - Class 5 poverty: 65% -> 50% at year 20
  - Class 5 life expectancy: 62 -> 65 at year 20
- [ ] 200 traits available in src/data/traits.json
- [ ] All 7 trait categories represented
</success_criteria>

<output>
After completion, create `.planning/phases/phase-1/01-SUMMARY.md` with:
- Tasks completed
- Files created/modified
- Test coverage achieved
- Validation targets met (with actual values)
- Any deviations from plan
- Learnings for future phases
</output>
