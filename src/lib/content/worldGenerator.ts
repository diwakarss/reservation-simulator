/**
 * World Generator
 *
 * Generates deterministic world configurations using seed-based RNG.
 * Creates galaxy, planet, nation names, selects a trait, and initializes
 * all 5 social classes with their initial metrics from CALIBRATED-MODEL.md.
 */

import type {
  WorldConfig,
  SocialClass,
  ClassMetrics,
  ClassTier,
} from '../simulation/types';
import { CLASS_TIER_ORDER } from '../simulation/types';
import { pickRandomTrait } from './traits';
import { getClassName } from './classNames';
import worldNamesData from '../../data/worldNames.json';

const EXPECTED_CLASS_COUNT = 5;
const PERCENT_TOTAL = 100;
const FLOAT_TOLERANCE = 0.01;
const MAX_LIFE_EXPECTANCY = 100;
const RANDOM_SEED_LENGTH = 8;
const RNG_MODULUS = 4294967296;

// Type the imported data
const worldNames = worldNamesData as {
  galaxies: string[];
  planets: string[];
  nations: string[];
};

// =============================================================================
// Initial Conditions from CALIBRATED-MODEL.md Section 1
// =============================================================================

/**
 * Population distribution by tier (percentages that sum to 100).
 * Note: classTemplates.json uses different values (5/10/20/30/35)
 * but CALIBRATED-MODEL.md specifies these values:
 */
export const INITIAL_POPULATION: Record<ClassTier, number> = {
  upper: 10, // "The Blessed" - privileged elite
  noble: 20, // "The Favored" - upper-middle
  middle: 30, // "The Common" - middle mass
  common: 25, // "The Overlooked" - lower-middle
  lower: 15, // "The Forgotten" - most disadvantaged
};

/**
 * Initial education access (tertiary %) by tier.
 */
export const INITIAL_EDUCATION: Record<ClassTier, number> = {
  upper: 45,
  noble: 30,
  middle: 20,
  common: 10,
  lower: 3,
};

/**
 * Initial skilled employment access (%) by tier.
 */
export const INITIAL_EMPLOYMENT: Record<ClassTier, number> = {
  upper: 80,
  noble: 60,
  middle: 40,
  common: 20,
  lower: 5,
};

/**
 * Initial wealth share (%) by tier. Must sum to 100.
 */
export const INITIAL_WEALTH: Record<ClassTier, number> = {
  upper: 45,
  noble: 25,
  middle: 18,
  common: 9,
  lower: 3,
};

/**
 * Initial poverty rate (%) by tier.
 */
export const INITIAL_POVERTY: Record<ClassTier, number> = {
  upper: 5,
  noble: 15,
  middle: 25,
  common: 40,
  lower: 65,
};

/**
 * Initial life expectancy (years) by tier.
 */
export const INITIAL_LIFE_EXPECTANCY: Record<ClassTier, number> = {
  upper: 72,
  noble: 70,
  middle: 68,
  common: 65,
  lower: 62,
};

/**
 * Initial income per capita (credits/month) by tier.
 * From PLAN.md Task 5: BASE_INCOME_BY_CLASS = [40000, 25000, 12000, 6000, 500]
 */
export const INITIAL_INCOME: Record<ClassTier, number> = {
  upper: 40000,
  noble: 25000,
  middle: 12000,
  common: 6000,
  lower: 500,
};

// =============================================================================
// Seeded Random Number Generator
// =============================================================================

/**
 * Create a seeded PRNG using a simple mulberry32 algorithm.
 * Given the same seed, always produces the same sequence.
 *
 * @param seed - String seed to initialize the RNG
 * @returns A function that returns numbers between 0 and 1
 */
export function createSeededRNG(seed: string): () => number {
  // Convert string seed to numeric value using simple hash
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }

  // mulberry32 PRNG
  return function () {
    h |= 0;
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), h | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / RNG_MODULUS;
  };
}

/**
 * Generate a random seed string.
 *
 * @returns An 8-character alphanumeric seed
 */
export function generateRandomSeed(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let seed = '';
  for (let i = 0; i < RANDOM_SEED_LENGTH; i++) {
    seed += chars[Math.floor(Math.random() * chars.length)];
  }
  return seed;
}

// =============================================================================
// World Generation
// =============================================================================

/**
 * Pick a random item from an array using the provided RNG.
 */
function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function sumBy<T>(items: T[], value: (item: T) => number): number {
  return items.reduce((sum, item) => sum + value(item), 0);
}

/**
 * Create initial metrics for a class tier.
 */
function createInitialMetrics(tier: ClassTier): ClassMetrics {
  return {
    education: INITIAL_EDUCATION[tier],
    employment: INITIAL_EMPLOYMENT[tier],
    wealth: INITIAL_WEALTH[tier],
    poverty: INITIAL_POVERTY[tier],
    lifeExpectancy: INITIAL_LIFE_EXPECTANCY[tier],
    incomePerCapita: INITIAL_INCOME[tier],
  };
}

/**
 * Generate a complete world configuration.
 *
 * Given the same seed, always produces the same world:
 * - Same galaxy, planet, nation names
 * - Same trait selection
 * - Same class names
 * - Same initial metrics
 *
 * @param seed - Optional seed string. If not provided, generates a random seed.
 * @returns Complete WorldConfig ready for simulation
 */
export function generateWorld(seed?: string): WorldConfig {
  // Use provided seed or generate a new one
  const worldSeed = seed || generateRandomSeed();
  const rng = createSeededRNG(worldSeed);

  // Pick world names
  const galaxyName = pickRandom(worldNames.galaxies, rng);
  const planetName = pickRandom(worldNames.planets, rng);
  const nationName = pickRandom(worldNames.nations, rng);

  // Pick the absurd trait
  const trait = pickRandomTrait(rng);

  // Generate all 5 social classes
  const classes: SocialClass[] = CLASS_TIER_ORDER.map((tier) => ({
    tier,
    displayName: getClassName(trait, tier),
    population: INITIAL_POPULATION[tier],
    metrics: createInitialMetrics(tier),
  }));

  return {
    seed: worldSeed,
    galaxyName,
    planetName,
    nationName,
    trait,
    classes,
  };
}

/**
 * Validate that a WorldConfig has proper initial conditions.
 *
 * @param world - The world configuration to validate
 * @returns True if all metrics are valid
 */
export function validateWorldConfig(world: WorldConfig): boolean {
  // Check we have exactly 5 classes
  if (world.classes.length !== EXPECTED_CLASS_COUNT) {
    return false;
  }

  // Check population sums to 100
  const totalPopulation = sumBy(world.classes, (socialClass) => socialClass.population);
  if (Math.abs(totalPopulation - PERCENT_TOTAL) > FLOAT_TOLERANCE) {
    return false;
  }

  // Check wealth shares sum to 100
  const totalWealth = sumBy(world.classes, (socialClass) => socialClass.metrics.wealth);
  if (Math.abs(totalWealth - PERCENT_TOTAL) > FLOAT_TOLERANCE) {
    return false;
  }

  // Check each class has valid metrics
  for (const cls of world.classes) {
    const m = cls.metrics;
    if (
      m.education < 0 || m.education > PERCENT_TOTAL ||
      m.employment < 0 || m.employment > PERCENT_TOTAL ||
      m.wealth < 0 || m.wealth > PERCENT_TOTAL ||
      m.poverty < 0 || m.poverty > PERCENT_TOTAL ||
      m.lifeExpectancy < 0 || m.lifeExpectancy > MAX_LIFE_EXPECTANCY ||
      m.incomePerCapita < 0
    ) {
      return false;
    }
  }

  return true;
}

// Re-export for convenience
export { createSeededRNG as createRNG };
