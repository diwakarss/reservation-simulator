/**
 * Trait loading and selection utilities
 *
 * Provides functions to load pre-generated traits from JSON data
 * and select random traits using seed-based RNG.
 */

import type { AbsurdTrait, TraitCategory } from '../simulation/types';
import traitsData from '../../data/traits.json';

// Type assertion for imported JSON
const traits: AbsurdTrait[] = traitsData as AbsurdTrait[];

function pickIndex(length: number, rng: () => number): number {
  return Math.floor(rng() * length);
}

/**
 * Get all available traits.
 */
export function getAllTraits(): AbsurdTrait[] {
  return traits;
}

/**
 * Get all unique trait categories.
 */
export function getTraitCategories(): TraitCategory[] {
  const categories = new Set(traits.map((t) => t.category));
  return Array.from(categories) as TraitCategory[];
}

/**
 * Filter traits by category.
 *
 * @param category - The trait category to filter by
 * @returns Array of traits in that category
 */
export function getTraitsByCategory(category: TraitCategory): AbsurdTrait[] {
  return traits.filter((t) => t.category === category);
}

/**
 * Get a trait by its ID.
 *
 * @param id - The unique trait identifier
 * @returns The trait or undefined if not found
 */
export function getTraitById(id: string): AbsurdTrait | undefined {
  return traits.find((t) => t.id === id);
}

/**
 * Select a random trait using seed-based RNG.
 * Given the same seed, always returns the same trait.
 *
 * @param rng - A function that returns a number between 0 and 1
 * @returns A randomly selected trait
 */
export function pickRandomTrait(rng: () => number): AbsurdTrait {
  const index = pickIndex(traits.length, rng);
  return traits[index];
}

/**
 * Select a random trait from a specific category using seed-based RNG.
 *
 * @param category - The category to pick from
 * @param rng - A function that returns a number between 0 and 1
 * @returns A randomly selected trait from that category
 */
export function pickRandomTraitByCategory(
  category: TraitCategory,
  rng: () => number
): AbsurdTrait {
  const categoryTraits = getTraitsByCategory(category);
  if (categoryTraits.length === 0) {
    throw new Error(`No traits found for category: ${category}`);
  }
  const index = pickIndex(categoryTraits.length, rng);
  return categoryTraits[index];
}

/**
 * Get the total number of available traits.
 */
export function getTraitCount(): number {
  return traits.length;
}
