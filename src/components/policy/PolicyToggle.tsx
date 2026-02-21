'use client';

/**
 * PolicyToggle
 *
 * Toggle for enabling/disabling policy options like Creamy Layer and EWS.
 * Includes optional threshold slider when enabled.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useCallback } from 'react';
import type { ClassTier } from '@/lib/simulation/types';
import { CLASS_COLORS } from '@/lib/simulation/types';

interface PolicyToggleProps {
  /** Toggle label */
  label: string;
  /** Description of what this toggle does */
  description?: string;
  /** Whether the toggle is on */
  enabled: boolean;
  /** Called when toggle changes */
  onToggle: (enabled: boolean) => void;
  /** Class tier for color coding */
  tier?: ClassTier;
  /** Whether to show threshold slider */
  showThreshold?: boolean;
  /** Threshold value (credits/month) */
  thresholdValue?: number;
  /** Called when threshold changes */
  onThresholdChange?: (value: number) => void;
  /** Threshold min value */
  thresholdMin?: number;
  /** Threshold max value */
  thresholdMax?: number;
  /** Threshold step */
  thresholdStep?: number;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function PolicyToggle({
  label,
  description,
  enabled,
  onToggle,
  tier,
  showThreshold = false,
  thresholdValue = 5000,
  onThresholdChange,
  thresholdMin = 1000,
  thresholdMax = 20000,
  thresholdStep = 500,
  disabled = false,
  className = '',
}: PolicyToggleProps) {
  const color = tier ? CLASS_COLORS[tier] : '#e2b714';

  const handleToggle = useCallback(() => {
    if (!disabled) {
      onToggle(!enabled);
    }
  }, [disabled, enabled, onToggle]);

  const handleThresholdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onThresholdChange?.(Number(e.target.value));
    },
    [onThresholdChange]
  );

  return (
    <div
      className={`
        bg-cosmic-blue/60 border border-white/10
        rounded-xl p-4
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
    >
      {/* Toggle row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-rajdhani font-bold text-white text-base">
            {label}
          </h4>
          {description && (
            <p className="text-sm text-white/60 mt-1">{description}</p>
          )}
        </div>

        {/* Toggle switch */}
        <button
          role="switch"
          aria-checked={enabled}
          aria-label={`${label} toggle`}
          onClick={handleToggle}
          disabled={disabled}
          className={`
            relative w-12 h-6 rounded-full
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-accent-gold/50
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
          style={{
            backgroundColor: enabled ? color : 'rgba(255,255,255,0.1)',
          }}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
            animate={{ left: enabled ? 28 : 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Threshold slider (when enabled and showThreshold is true) */}
      <AnimatePresence>
        {enabled && showThreshold && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-base text-white/70">
                  Income Threshold
                </span>
                <span
                  className="font-orbitron text-base font-bold"
                  style={{ color }}
                >
                  {thresholdValue.toLocaleString()} credits/month
                </span>
              </div>

              <input
                type="range"
                min={thresholdMin}
                max={thresholdMax}
                step={thresholdStep}
                value={thresholdValue}
                onChange={handleThresholdChange}
                disabled={disabled}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${color} 0%, ${color} ${((thresholdValue - thresholdMin) / (thresholdMax - thresholdMin)) * 100}%, rgba(255,255,255,0.1) ${((thresholdValue - thresholdMin) / (thresholdMax - thresholdMin)) * 100}%, rgba(255,255,255,0.1) 100%)`,
                }}
                aria-label="Income threshold"
              />

              <div className="flex justify-between mt-1 text-sm text-white/50">
                <span>{thresholdMin.toLocaleString()}</span>
                <span>{thresholdMax.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PolicyToggle;
