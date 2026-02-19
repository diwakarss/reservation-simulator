'use client';

/**
 * ClassPyramid
 *
 * Visual pyramid showing 5-tier class hierarchy with population percentages.
 * Color-coded by class tier. Used in TraitReveal and other screens.
 */

import { motion } from 'framer-motion';
import type { SocialClass, ClassTier } from '@/lib/simulation/types';
import { CLASS_COLORS } from '@/lib/simulation/types';

interface ClassPyramidProps {
  /** All 5 social classes */
  classes: SocialClass[];
  /** Whether to show the legend panel */
  showLegend?: boolean;
  /** Whether to animate the reveal */
  animate?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get the bar width multiplier based on population percentage.
 * Upper class (smallest) = narrowest bar, lower classes = wider bars.
 */
function getBarWidthClass(population: number): string {
  if (population <= 10) return 'w-16';
  if (population <= 15) return 'w-20';
  if (population <= 20) return 'w-24';
  if (population <= 25) return 'w-28';
  return 'w-32';
}

/**
 * Get background and border styles for a tier.
 */
function getTierStyles(tier: ClassTier): {
  bg: string;
  border: string;
  text: string;
} {
  const color = CLASS_COLORS[tier];
  return {
    bg: `rgba(${hexToRgb(color)}, 0.1)`,
    border: `rgba(${hexToRgb(color)}, 0.3)`,
    text: color,
  };
}

/**
 * Convert hex to RGB string.
 */
function hexToRgb(hex: string): string {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
  const match = r.exec(hex);
  if (!match) return '255, 255, 255';
  return `${parseInt(match[1], 16)}, ${parseInt(match[2], 16)}, ${parseInt(match[3], 16)}`;
}

/**
 * Animation variants for each tier row.
 */
const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
};

export function ClassPyramid({
  classes,
  showLegend = true,
  animate = true,
  className = '',
}: ClassPyramidProps) {
  // Sort classes by tier order (upper first)
  const tierOrder: ClassTier[] = ['upper', 'noble', 'middle', 'common', 'lower'];
  const sortedClasses = [...classes].sort(
    (a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
  );

  return (
    <div className={`flex gap-8 items-start flex-wrap justify-center ${className}`}>
      {/* Pyramid */}
      <div className="flex flex-col gap-1">
        {sortedClasses.map((cls, index) => {
          const styles = getTierStyles(cls.tier);

          const Row = animate ? motion.div : 'div';
          const rowProps = animate
            ? {
                variants: rowVariants,
                initial: 'hidden',
                animate: 'visible',
                custom: index,
              }
            : {};

          return (
            <Row
              key={cls.tier}
              {...rowProps}
              className="
                flex items-center gap-4 px-4 py-3 rounded-lg
                transition-all duration-200
                hover:scale-[1.02] hover:shadow-lg
                cursor-default
              "
              style={{
                background: styles.bg,
                border: `1px solid ${styles.border}`,
              }}
            >
              {/* Population bar */}
              <div
                className={`
                  h-2.5 rounded-full flex-shrink-0
                  ${getBarWidthClass(cls.population)}
                `}
                style={{
                  background: `linear-gradient(90deg, ${CLASS_COLORS[cls.tier]}, ${CLASS_COLORS[cls.tier]}cc)`,
                }}
              />

              {/* Class info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span
                  className="font-rajdhani text-sm font-bold truncate"
                  style={{ color: styles.text }}
                >
                  {cls.displayName}
                </span>
                <span className="font-orbitron text-xs text-muted-text">
                  {cls.population}%
                </span>
              </div>
            </Row>
          );
        })}
      </div>

      {/* Legend */}
      {showLegend && (
        <motion.div
          initial={animate ? { opacity: 0, x: 20 } : undefined}
          animate={animate ? { opacity: 1, x: 0 } : undefined}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="
            bg-deep-purple/80 border border-white/10
            rounded-xl p-4 min-w-[200px]
          "
        >
          <h4 className="text-xs font-bold text-muted-text uppercase tracking-widest mb-4">
            Population Distribution
          </h4>

          {sortedClasses.map((cls) => (
            <div
              key={cls.tier}
              className="
                flex justify-between items-center
                py-1.5 border-b border-white/5 last:border-0
                text-sm
              "
            >
              <span
                className="font-rajdhani font-semibold"
                style={{ color: CLASS_COLORS[cls.tier] }}
              >
                {cls.displayName.split(' ').slice(1).join(' ')}
              </span>
              <span className="text-muted-text font-orbitron text-xs">
                {cls.population}%
              </span>
            </div>
          ))}

          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-xs text-muted-text/60 leading-relaxed">
              Population percentages are fixed and represent the proportion of each
              class in society.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ClassPyramid;
