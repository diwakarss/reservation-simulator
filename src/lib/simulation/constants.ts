import { ClassTier } from './types';

// 1. Initial Conditions (Year 0)
export const INITIAL_POPULATION_DISTRIBUTION: Record<ClassTier, number> = {
  upper: 0.10,
  noble: 0.20,
  middle: 0.30,
  common: 0.25,
  lower: 0.15,
};

export const INITIAL_FERTILITY_RATES: Record<ClassTier, number> = {
  upper: 1.8,
  noble: 2.0,
  middle: 2.1,
  common: 2.2,
  lower: 2.3,
};

export const INITIAL_EDUCATION_ACCESS: Record<ClassTier, number> = {
  upper: 45, // Tertiary
  noble: 30,
  middle: 20,
  common: 10,
  lower: 3,
};

export const INITIAL_EMPLOYMENT_ACCESS: Record<ClassTier, number> = {
  upper: 80,
  noble: 60,
  middle: 40,
  common: 20,
  lower: 5,
};

export const INITIAL_WEALTH_SHARE: Record<ClassTier, number> = {
  upper: 45,
  noble: 25,
  middle: 18,
  common: 9,
  lower: 3,
};

export const INITIAL_POVERTY_RATE: Record<ClassTier, number> = {
  upper: 5,
  noble: 15,
  middle: 25,
  common: 40,
  lower: 65,
};

export const INITIAL_LIFE_EXPECTANCY: Record<ClassTier, number> = {
  upper: 72,
  noble: 70,
  middle: 68,
  common: 65,
  lower: 62,
};

// Base Monthly Income in Credits (₢) - From PLAN.md
export const BASE_INCOME_BY_CLASS: Record<ClassTier, number> = {
  upper: 40000,
  noble: 25000,
  middle: 12000,
  common: 6000,
  lower: 500,
};

// 2. Progression Coefficients

// Education
export const RESERVATION_EDUCATION_BOOST = 0.01; // Adjusted to meet 20-year targets

// Employment
export const EDUCATION_TO_EMPLOYMENT_FACTOR = 0.6;
export const RESERVATION_EMPLOYMENT_BOOST = 0.007; // Adjusted to meet 20-year targets

// Wealth
export const WEALTH_GROWTH_FROM_EDUCATION = 0.001;
export const WEALTH_GROWTH_FROM_EMPLOYMENT = 0.002;
export const WEALTH_REDISTRIBUTION_FACTOR = 0.0005;

// Poverty
export const POVERTY_REDUCTION_EDUCATION = 0.008;
export const POVERTY_REDUCTION_EMPLOYMENT = 0.012;
export const POVERTY_REDUCTION_WEALTH = 0.003;
export const POVERTY_FLOOR = 2; // Minimum %

// Life Expectancy
export const LE_GAIN_PER_EDUCATION_POINT = 0.02;
export const LE_GAIN_PER_POVERTY_REDUCTION = 0.03;
export const LE_MAXIMUM = 80;

// Income Growth - From PLAN.md
export const INCOME_GROWTH_FROM_EDUCATION = 0.02;
export const INCOME_GROWTH_FROM_EMPLOYMENT = 0.03;

// Fertility
export const FERTILITY_REDUCTION_PER_EDUCATION = 0.005;
export const FERTILITY_FLOOR = 1.5;
export const FERTILITY_CEILING = 3.0;
