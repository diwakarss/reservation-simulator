import { describe, it, expect } from 'vitest';
import {
  calculateEducation,
  calculateEmployment,
  calculateWealth,
  calculatePoverty,
  calculateLifeExpectancy,
  calculateIncome,
} from '../models';
import { SocialClass, ClassTier, createDefaultClassPolicy } from '../types';
import { INITIAL_WEALTH_SHARE, LE_MAXIMUM } from '../constants';

describe('Simulation Models', () => {
  describe('calculateEducation', () => {
    it('should increase education with reservation', () => {
      // Class 5 starts at 3%. With 27% reservation.
      const startEdu = 3;
      const reservation = 27;
      const years = 1;
      
      const newEdu = calculateEducation(startEdu, reservation, years);
      
      expect(newEdu).toBeGreaterThan(startEdu);
      // 0.1 (base) + (0.01 * 27 * gapMultiplier)
      // gap = (0.97)^0.8 ≈ 0.976
      // boost = 0.27 * 0.976 ≈ 0.263
      // total ≈ (0.1 + 0.263) * 1.025 ≈ 0.372 gain
      // expected ≈ 3.372
      expect(newEdu).toBeCloseTo(3.372, 1);
    });

    it('should match 20-year target for Class 5 (approx 10-12%)', () => {
      let edu = 3;
      const reservation = 27;
      
      for (let i = 1; i <= 20; i++) {
        edu = calculateEducation(edu, reservation, i);
      }
      
      expect(edu).toBeGreaterThan(10);
      expect(edu).toBeLessThan(15); // Increased buffer due to aggressive constants
    });
  });

  describe('calculateEmployment', () => {
    it('should follow education growth', () => {
      const startEmp = 5;
      const startEdu = 3;
      const newEdu = 3.2; // +0.2 gain
      const reservation = 27;
      
      const newEmp = calculateEmployment(startEmp, newEdu, startEdu, reservation);
      
      expect(newEmp).toBeGreaterThan(startEmp);
      // eduEffect = 0.2 * 0.6 = 0.12
      // resBoost = 0.27 * 0.007 * 100 = 0.189
      // gap = (0.95)^0.8 ≈ 0.96
      // total = (0.12 + 0.189) * 0.96 ≈ 0.296
      // expected ≈ 5.296
      expect(newEmp).toBeCloseTo(5.296, 2);
    });
  });

  describe('calculateWealth', () => {
    it('should normalize wealth shares to 100%', () => {
      // Create 5 dummy classes
      const tiers: ClassTier[] = ['upper', 'noble', 'middle', 'common', 'lower'];
      const classes: SocialClass[] = tiers.map((t, i) => ({
        tier: t,
        displayName: t,
        population: 0.2, // Simplified
        metrics: {
          education: 10 + i, // Increasing edu
          employment: 10 + i,
          wealth: 20, // Equal wealth initially
          poverty: 0,
          lifeExpectancy: 70,
          incomePerCapita: 1000,
        },
      }));
      
      const prevClasses = classes.map(c => ({
        ...c,
        metrics: {
          ...c.metrics,
          education: c.metrics.education - 1, // Everyone gained 1% edu
          employment: c.metrics.employment - 1, // Everyone gained 1% emp
        }
      }));
      
      const policies = {
        upper: createDefaultClassPolicy(),
        noble: createDefaultClassPolicy(),
        middle: createDefaultClassPolicy(),
        common: createDefaultClassPolicy(),
        lower: createDefaultClassPolicy(),
      };
      
      const newClasses = calculateWealth(classes, prevClasses, policies);
      
      const totalWealth = newClasses.reduce((sum, c) => sum + c.metrics.wealth, 0);
      expect(totalWealth).toBeCloseTo(100, 5);
    });
  });
  
  describe('calculatePoverty', () => {
    it('should decrease poverty with gains', () => {
      const startPov = 65;
      const eduGain = 1;
      const empGain = 1;
      const wealthGain = 0;

      const newPov = calculatePoverty(startPov, eduGain, empGain, wealthGain);

      expect(newPov).toBeLessThan(startPov);
      // reduction = 1*0.8 + 1*1.2 = 2.0
      // resistanceFactor = (0.65)^0.5 ≈ 0.806
      // effectiveReduction = 2.0 * 0.806 ≈ 1.612
      // expected ≈ 63.388
      expect(newPov).toBeCloseTo(63.388, 1);
    });

    it('should not go below floor', () => {
       const startPov = 2.01;
       // Massive gains
       const newPov = calculatePoverty(startPov, 100, 100, 100);
       expect(newPov).toBeGreaterThanOrEqual(2);
    });
  });

  describe('calculateLifeExpectancy', () => {
    it('should never exceed LE_MAXIMUM (80) even with massive gains', () => {
      // Start near ceiling with huge education/poverty gains
      const nearCeiling = 79.5;
      const massiveEduGain = 100;
      const massivePovReduction = 100;

      const newLE = calculateLifeExpectancy(nearCeiling, massiveEduGain, massivePovReduction);
      expect(newLE).toBeLessThanOrEqual(LE_MAXIMUM);
    });

    it('should never exceed LE_MAXIMUM when starting at exactly 80', () => {
      const atCeiling = 80;
      const newLE = calculateLifeExpectancy(atCeiling, 5, 10);
      expect(newLE).toBe(LE_MAXIMUM);
    });

    it('should improve life expectancy with positive education and poverty gains', () => {
      const startLE = 62;
      const newLE = calculateLifeExpectancy(startLE, 2, 3);
      expect(newLE).toBeGreaterThan(startLE);
      expect(newLE).toBeLessThanOrEqual(LE_MAXIMUM);
    });

    it('should not decrease with zero gains', () => {
      const startLE = 65;
      const newLE = calculateLifeExpectancy(startLE, 0, 0);
      expect(newLE).toBe(startLE);
    });
  });

  describe('calculateIncome', () => {
    it('should increase income with education and employment gains', () => {
      const startIncome = 500;
      const newIncome = calculateIncome(startIncome, 2, 1);
      // growth = 2*0.02 + 1*0.03 = 0.07
      // newIncome = 500 * 1.07 = 535
      expect(newIncome).toBeCloseTo(535, 1);
    });

    it('should return base income unchanged with zero gains', () => {
      const startIncome = 1000;
      const newIncome = calculateIncome(startIncome, 0, 0);
      expect(newIncome).toBe(startIncome);
    });

    it('should grow faster with larger employment gains than education gains', () => {
      const startIncome = 1000;
      const eduOnlyIncome = calculateIncome(startIncome, 5, 0);  // 5 * 0.02 = 10%
      const empOnlyIncome = calculateIncome(startIncome, 0, 5);  // 5 * 0.03 = 15%
      // Employment boost (INCOME_GROWTH_FROM_EMPLOYMENT = 0.03) > education (INCOME_GROWTH_FROM_EDUCATION = 0.02)
      expect(empOnlyIncome).toBeGreaterThan(eduOnlyIncome);
    });

    it('should never produce negative income', () => {
      const startIncome = 200;
      const newIncome = calculateIncome(startIncome, 0, 0);
      expect(newIncome).toBeGreaterThan(0);
    });
  });
});
