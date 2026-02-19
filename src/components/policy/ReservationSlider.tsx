'use client';

/**
 * ReservationSlider
 *
 * Per-class slider for reservation allocation (0-50%).
 * Shows benefit calculation and class-specific styling.
 */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import type { ClassTier } from '@/lib/simulation/types';
import { CLASS_COLORS } from '@/lib/simulation/types';

interface ReservationSliderProps {
  /** Class tier */
  tier: ClassTier;
  /** Class display name */
  displayName: string;
  /** Population percentage of this class */
  population: number;
  /** Current reservation percentage (0-50) */
  value: number;
  /** Called when value changes */
  onChange: (value: number) => void;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Calculate approximate benefit percentage.
 * This is a simplified calculation for display purposes.
 */
function calculateBenefit(reservationPercent: number, population: number): number {
  // Simplified: benefit = reservation% * (population / total population factor)
  // This gives a rough estimate of how many people from the class will benefit
  return Math.round((reservationPercent * population) / 100);
}

export function ReservationSlider({
  tier,
  displayName,
  population,
  value,
  onChange,
  disabled = false,
  className = '',
}: ReservationSliderProps) {
  const color = CLASS_COLORS[tier];
  const benefit = calculateBenefit(value, population);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-cosmic-blue/60 border border-white/10
        rounded-xl p-4
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span
            className="font-rajdhani font-bold text-base"
            style={{ color }}
          >
            {displayName}
          </span>
        </div>
        <span className="text-xs text-muted-text">
          {population}% of population
        </span>
      </div>

      {/* Slider */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-text">Reservation %</span>
          <span
            className="font-orbitron text-lg font-bold"
            style={{ color }}
          >
            {value}%
          </span>
        </div>

        <div className="relative py-2">
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className="w-full h-3 sm:h-2 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed touch-pan-x"
            style={{
              background: `linear-gradient(to right, ${color} 0%, ${color} ${value * 2}%, rgba(255,255,255,0.1) ${value * 2}%, rgba(255,255,255,0.1) 100%)`,
            }}
            aria-label={`Reservation percentage for ${displayName}`}
          />
        </div>

        {/* Scale markers */}
        <div className="flex justify-between mt-1 text-xs text-muted-text/50">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
        </div>
      </div>

      {/* Benefit note */}
      {value > 0 ? (
        <p className="text-xs text-class-noble flex items-center gap-1">
          <span className="text-base">+</span>
          ~{benefit}% of total population will benefit
        </p>
      ) : (
        <p className="text-xs text-muted-text/60 flex items-center gap-1">
          <span className="text-base">!</span>
          No reservation for this class
        </p>
      )}
    </motion.div>
  );
}

export default ReservationSlider;
