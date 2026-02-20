import { describe, expect, it } from 'vitest';
import traits from '../../../data/traits.json';
import worldNames from '../../../data/worldNames.json';
import { CLASS_TIER_ORDER } from '../../simulation/types';
import { MAX_CLASS_NAME_LENGTH } from '../classNames';

const EXPECTED_CATEGORY_COUNTS = {
  Auditory: 20,
  Celestial: 20,
  Culinary: 20,
  Temporal: 20,
  Arbitrary: 20,
} as const;

describe('Task 3 data integrity', () => {
  it('contains 100 total traits across 5 categories with 20 each', () => {
    expect(traits).toHaveLength(100);

    const counts = traits.reduce<Record<string, number>>((acc, trait) => {
      acc[trait.category] = (acc[trait.category] ?? 0) + 1;
      return acc;
    }, {});

    expect(counts).toEqual(EXPECTED_CATEGORY_COUNTS);
  });

  it('ensures every trait has 5 unique class names with max 12 chars', () => {
    for (const trait of traits) {
      const values = CLASS_TIER_ORDER.map((tier) => trait.classNames[tier]);
      expect(values).toHaveLength(5);

      const unique = new Set(values.map((value) => value.toLowerCase()));
      expect(unique.size).toBe(5);

      for (const name of values) {
        expect(name.length).toBeLessThanOrEqual(MAX_CLASS_NAME_LENGTH);
      }
    }
  });

  it('contains 30+ names in each world pool', () => {
    expect(worldNames.galaxies.length).toBeGreaterThanOrEqual(30);
    expect(worldNames.planets.length).toBeGreaterThanOrEqual(30);
    expect(worldNames.nations.length).toBeGreaterThanOrEqual(30);
  });
});
