/**
 * World Generator Tests
 *
 * Tests for deterministic world generation and initial conditions.
 */

import { describe, it, expect } from 'vitest';
import {
  generateWorld,
  createSeededRNG,
  generateRandomSeed,
  validateWorldConfig,
  INITIAL_POPULATION,
  INITIAL_EDUCATION,
  INITIAL_EMPLOYMENT,
  INITIAL_WEALTH,
  INITIAL_POVERTY,
  INITIAL_LIFE_EXPECTANCY,
  INITIAL_INCOME,
} from '../worldGenerator';
import { CLASS_TIER_ORDER } from '../../simulation/types';

describe('createSeededRNG', () => {
  it('produces deterministic sequence given same seed', () => {
    const rng1 = createSeededRNG('test-seed');
    const rng2 = createSeededRNG('test-seed');

    const values1 = Array.from({ length: 10 }, () => rng1());
    const values2 = Array.from({ length: 10 }, () => rng2());

    expect(values1).toEqual(values2);
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = createSeededRNG('seed-a');
    const rng2 = createSeededRNG('seed-b');

    const values1 = Array.from({ length: 5 }, () => rng1());
    const values2 = Array.from({ length: 5 }, () => rng2());

    expect(values1).not.toEqual(values2);
  });

  it('produces values between 0 and 1', () => {
    const rng = createSeededRNG('bounds-test');

    for (let i = 0; i < 100; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('generateRandomSeed', () => {
  it('generates 8-character seed', () => {
    const seed = generateRandomSeed();
    expect(seed).toHaveLength(8);
  });

  it('generates alphanumeric characters only', () => {
    const seed = generateRandomSeed();
    expect(seed).toMatch(/^[a-z0-9]+$/);
  });

  it('generates different seeds on each call', () => {
    const seeds = new Set<string>();
    for (let i = 0; i < 10; i++) {
      seeds.add(generateRandomSeed());
    }
    // Should have at least 8 unique seeds (extremely unlikely to have collision)
    expect(seeds.size).toBeGreaterThanOrEqual(8);
  });
});

describe('generateWorld', () => {
  it('generates same world for same seed', () => {
    const world1 = generateWorld('deterministic-test');
    const world2 = generateWorld('deterministic-test');

    expect(world1.seed).toBe(world2.seed);
    expect(world1.galaxyName).toBe(world2.galaxyName);
    expect(world1.planetName).toBe(world2.planetName);
    expect(world1.nationName).toBe(world2.nationName);
    expect(world1.trait.id).toBe(world2.trait.id);

    // Classes should match
    for (let i = 0; i < 5; i++) {
      expect(world1.classes[i].tier).toBe(world2.classes[i].tier);
      expect(world1.classes[i].displayName).toBe(world2.classes[i].displayName);
      expect(world1.classes[i].metrics).toEqual(world2.classes[i].metrics);
    }
  });

  it('generates different worlds for different seeds', () => {
    const world1 = generateWorld('seed-alpha');
    const world2 = generateWorld('seed-beta');

    // At least one of these should differ (statistically very likely)
    const sameTrait = world1.trait.id === world2.trait.id;
    const sameGalaxy = world1.galaxyName === world2.galaxyName;
    const samePlanet = world1.planetName === world2.planetName;

    expect(sameTrait && sameGalaxy && samePlanet).toBe(false);
  });

  it('generates world without seed (random)', () => {
    const world = generateWorld();

    expect(world.seed).toBeDefined();
    expect(world.seed).toHaveLength(8);
    expect(world.galaxyName).toBeDefined();
    expect(world.planetName).toBeDefined();
    expect(world.nationName).toBeDefined();
    expect(world.trait).toBeDefined();
    expect(world.classes).toHaveLength(5);
  });

  it('creates exactly 5 classes', () => {
    const world = generateWorld('five-classes');
    expect(world.classes).toHaveLength(5);
  });

  it('creates classes in correct tier order', () => {
    const world = generateWorld('tier-order');
    const tiers = world.classes.map((c) => c.tier);
    expect(tiers).toEqual(CLASS_TIER_ORDER);
  });

  it('creates classes with correct initial population', () => {
    const world = generateWorld('population-test');

    for (const cls of world.classes) {
      expect(cls.population).toBe(INITIAL_POPULATION[cls.tier]);
    }
  });

  it('creates classes with correct initial education', () => {
    const world = generateWorld('education-test');

    for (const cls of world.classes) {
      expect(cls.metrics.education).toBe(INITIAL_EDUCATION[cls.tier]);
    }
  });

  it('creates classes with correct initial employment', () => {
    const world = generateWorld('employment-test');

    for (const cls of world.classes) {
      expect(cls.metrics.employment).toBe(INITIAL_EMPLOYMENT[cls.tier]);
    }
  });

  it('creates classes with correct initial wealth', () => {
    const world = generateWorld('wealth-test');

    for (const cls of world.classes) {
      expect(cls.metrics.wealth).toBe(INITIAL_WEALTH[cls.tier]);
    }
  });

  it('creates classes with correct initial poverty', () => {
    const world = generateWorld('poverty-test');

    for (const cls of world.classes) {
      expect(cls.metrics.poverty).toBe(INITIAL_POVERTY[cls.tier]);
    }
  });

  it('creates classes with correct initial life expectancy', () => {
    const world = generateWorld('life-exp-test');

    for (const cls of world.classes) {
      expect(cls.metrics.lifeExpectancy).toBe(INITIAL_LIFE_EXPECTANCY[cls.tier]);
    }
  });

  it('creates classes with correct initial income', () => {
    const world = generateWorld('income-test');

    for (const cls of world.classes) {
      expect(cls.metrics.incomePerCapita).toBe(INITIAL_INCOME[cls.tier]);
    }
  });

  it('creates classes with proper display names', () => {
    const world = generateWorld('display-name-test');

    for (const cls of world.classes) {
      // Display name should be "Prefix ClassName"
      expect(cls.displayName).toMatch(/^(Upper|Noble|Middle|Common|Lower) .+$/);

      // Should match the trait's class name for this tier
      const expectedSuffix = world.trait.classNames[cls.tier];
      expect(cls.displayName).toContain(expectedSuffix);
    }
  });

  it('population percentages sum to 100', () => {
    const world = generateWorld('pop-sum');
    const total = world.classes.reduce((sum, c) => sum + c.population, 0);
    expect(total).toBe(100);
  });

  it('wealth percentages sum to 100', () => {
    const world = generateWorld('wealth-sum');
    const total = world.classes.reduce((sum, c) => sum + c.metrics.wealth, 0);
    expect(total).toBe(100);
  });
});

describe('validateWorldConfig', () => {
  it('validates a properly generated world', () => {
    const world = generateWorld('valid-world');
    expect(validateWorldConfig(world)).toBe(true);
  });

  it('fails if not exactly 5 classes', () => {
    const world = generateWorld('class-count');
    world.classes = world.classes.slice(0, 4); // Remove one class
    expect(validateWorldConfig(world)).toBe(false);
  });

  it('fails if population does not sum to 100', () => {
    const world = generateWorld('pop-invalid');
    world.classes[0].population = 50; // Mess up the total
    expect(validateWorldConfig(world)).toBe(false);
  });

  it('fails if wealth does not sum to 100', () => {
    const world = generateWorld('wealth-invalid');
    world.classes[0].metrics.wealth = 90; // Mess up the total
    expect(validateWorldConfig(world)).toBe(false);
  });

  it('fails if metrics are out of bounds', () => {
    const world = generateWorld('bounds-invalid');
    world.classes[0].metrics.education = 150; // Out of bounds
    expect(validateWorldConfig(world)).toBe(false);
  });

  it('fails if income is negative', () => {
    const world = generateWorld('income-invalid');
    world.classes[0].metrics.incomePerCapita = -100;
    expect(validateWorldConfig(world)).toBe(false);
  });
});

describe('Initial Conditions (CALIBRATED-MODEL.md)', () => {
  it('Class 5 (lower) starts at 3% education', () => {
    expect(INITIAL_EDUCATION.lower).toBe(3);
  });

  it('Class 5 (lower) starts at 5% employment', () => {
    expect(INITIAL_EMPLOYMENT.lower).toBe(5);
  });

  it('Class 5 (lower) starts at 65% poverty', () => {
    expect(INITIAL_POVERTY.lower).toBe(65);
  });

  it('Class 5 (lower) starts at 62 life expectancy', () => {
    expect(INITIAL_LIFE_EXPECTANCY.lower).toBe(62);
  });

  it('Class 1 (upper) starts at 45% education', () => {
    expect(INITIAL_EDUCATION.upper).toBe(45);
  });

  it('Class 1 (upper) starts at 72 life expectancy', () => {
    expect(INITIAL_LIFE_EXPECTANCY.upper).toBe(72);
  });

  it('Life expectancy gap is 10 years (upper 72 - lower 62)', () => {
    expect(INITIAL_LIFE_EXPECTANCY.upper - INITIAL_LIFE_EXPECTANCY.lower).toBe(10);
  });
});
