import React from 'react';
import { motion } from 'framer-motion';
import { ClassTier, CLASS_COLORS } from '@/lib/simulation/types';

interface ReservationSliderProps {
  /** Class tier this slider controls */
  tier: ClassTier;
  /** Full display name of the class (e.g., "Lower Deaflings") */
  displayName: string;
  /** Current reservation percentage (0-50) */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Whether this slider is disabled */
  disabled?: boolean;
  /** Whether to show warning for 0% */
  showWarning?: boolean;
}

/**
 * ReservationSlider - Per-class reservation control (PLAN.md Task 9)
 *
 * Also known as ClassReservationControl in UI-SPEC.md
 *
 * Features:
 * - 0-50% slider range
 * - Benefit % calculation display
 * - Color-coded by class tier
 * - Warning message at 0%
 * - Disabled state for upper classes
 */
export const ReservationSlider: React.FC<ReservationSliderProps> = ({
  tier,
  displayName,
  value,
  onChange,
  disabled = false,
  showWarning = true,
}) => {
  const classColor = CLASS_COLORS[tier];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(newValue);
  };

  return (
    <div className={`bg-white/5 border border-white/10 p-4 rounded-lg ${disabled ? 'opacity-50' : ''}`}>
      {/* Class Name Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: classColor }}
            aria-hidden="true"
          />
          <span className="font-rajdhani font-bold text-white">
            {displayName}
          </span>
        </div>
        <div className="text-2xl font-orbitron font-bold" style={{ color: classColor }}>
          {value}%
        </div>
      </div>

      {/* Slider Input */}
      <input
        type="range"
        min="0"
        max="50"
        step="1"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
        style={{
          accentColor: classColor,
        }}
        aria-label={`Reservation percentage for ${displayName}`}
      />

      {/* Range Labels */}
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>0%</span>
        <span>50%</span>
      </div>

      {/* Benefit Calculation */}
      {value > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-white/5 rounded text-xs text-gray-300"
        >
          <span className="text-[#e2b714]">{value}%</span> of opportunities reserved
          for {displayName}
        </motion.div>
      )}

      {/* 0% Warning */}
      {value === 0 && showWarning && !disabled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400"
        >
          ⚠️ No reservation will be provided
        </motion.div>
      )}
    </div>
  );
};
