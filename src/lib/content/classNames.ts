/**
 * Class name generation utilities
 *
 * Generates display names for social classes by combining tier prefixes
 * with the trait's unique class name for that tier.
 */

import type { AbsurdTrait, ClassTier } from '../simulation/types';
import { CLASS_TIER_PREFIXES } from '../simulation/types';

/**
 * Generate the full display name for a class.
 *
 * Combines the tier prefix (e.g., "Upper", "Lower") with the trait's
 * unique class name for that tier (e.g., "Harmonics", "Deaflings").
 *
 * @param trait - The absurd trait containing class name suffixes
 * @param tier - The class tier to generate a name for
 * @returns Full display name like "Upper Harmonics" or "Lower Deaflings"
 *
 * @example
 * const trait = {
 *   id: "earlobe-frequency",
 *   classNames: { upper: "Harmonics", ..., lower: "Deaflings" }
 * };
 * getClassName(trait, 'upper'); // "Upper Harmonics"
 * getClassName(trait, 'lower'); // "Lower Deaflings"
 */
export function getClassName(trait: AbsurdTrait, tier: ClassTier): string {
  const prefix = CLASS_TIER_PREFIXES[tier];
  const suffix = trait.classNames[tier];

  if (!suffix) {
    throw new Error(`No class name found for tier "${tier}" in trait "${trait.id}"`);
  }

  return `${prefix} ${suffix}`;
}

/**
 * Generate display names for all 5 tiers from a trait.
 *
 * @param trait - The absurd trait containing class name suffixes
 * @returns Object mapping each tier to its full display name
 *
 * @example
 * getAllClassNames(earlobeTrait);
 * // {
 * //   upper: "Upper Harmonics",
 * //   noble: "Noble Vibrants",
 * //   middle: "Middle Oscillants",
 * //   common: "Common Buzzers",
 * //   lower: "Lower Deaflings"
 * // }
 */
export function getAllClassNames(
  trait: AbsurdTrait
): Record<ClassTier, string> {
  return {
    upper: getClassName(trait, 'upper'),
    noble: getClassName(trait, 'noble'),
    middle: getClassName(trait, 'middle'),
    common: getClassName(trait, 'common'),
    lower: getClassName(trait, 'lower'),
  };
}

/**
 * Validate that a trait has all required class names.
 *
 * @param trait - The trait to validate
 * @returns True if all 5 class names are present and non-empty
 */
export function validateTraitClassNames(trait: AbsurdTrait): boolean {
  const tiers: ClassTier[] = ['upper', 'noble', 'middle', 'common', 'lower'];

  for (const tier of tiers) {
    const name = trait.classNames[tier];
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return false;
    }
    // Check max length constraint (12 chars per UI-SPEC)
    if (name.length > 12) {
      return false;
    }
  }

  return true;
}

/**
 * Check that all class names within a trait are unique.
 *
 * @param trait - The trait to check
 * @returns True if all 5 class names are unique
 */
export function hasUniqueClassNames(trait: AbsurdTrait): boolean {
  const names = Object.values(trait.classNames);
  const uniqueNames = new Set(names.map((n) => n.toLowerCase()));
  return uniqueNames.size === names.length;
}
