import React from 'react';
import { motion } from 'framer-motion';
import { ClassTier, CLASS_COLORS } from '@/lib/simulation/types';

interface PolicyToggleProps {
  /** Policy mechanism type */
  type: 'creamyLayer' | 'ews';
  /** Class tier this toggle applies to */
  tier: ClassTier;
  /** Full display name of the class */
  displayName: string;
  /** Whether the policy is enabled */
  enabled: boolean;
  /** Income threshold in credits/month */
  threshold: number;
  /** Callback when enabled state changes */
  onEnabledChange: (enabled: boolean) => void;
  /** Callback when threshold changes */
  onThresholdChange: (threshold: number) => void;
  /** Optional: EWS reservation percentage (only for EWS type) */
  ewsPercent?: number;
  /** Optional: EWS percent change callback (only for EWS type) */
  onEWSPercentChange?: (percent: number) => void;
  /** Whether this toggle is disabled */
  disabled?: boolean;
}

/**
 * PolicyToggle - Creamy Layer / EWS toggle with threshold slider (PLAN.md Task 9)
 *
 * Also known as IncomeThresholdSlider in UI-SPEC.md
 *
 * Features:
 * - Toggle switch for enabling/disabling policy
 * - Income threshold slider (₢/month)
 * - EWS-specific reservation percentage slider
 * - Explanation text for each mechanism
 * - Color-coded by class tier
 */
export const PolicyToggle: React.FC<PolicyToggleProps> = ({
  type,
  tier,
  displayName,
  enabled,
  threshold,
  onEnabledChange,
  onThresholdChange,
  ewsPercent = 0,
  onEWSPercentChange,
  disabled = false,
}) => {
  const classColor = CLASS_COLORS[tier];

  const labels = {
    creamyLayer: {
      title: 'Creamy Layer Exclusion',
      description: 'Exclude high-income individuals within reserved classes from benefits',
      thresholdLabel: 'Income Threshold (₢/month)',
    },
    ews: {
      title: 'EWS (Economically Weaker Sections)',
      description: 'Provide reservation for economically disadvantaged in general category',
      thresholdLabel: 'EWS Income Threshold (₢/month)',
    },
  };

  const config = labels[type];

  return (
    <div className={`bg-white/5 border border-white/10 p-4 rounded-lg ${disabled ? 'opacity-50' : ''}`}>
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: classColor }}
              aria-hidden="true"
            />
            <span className="font-rajdhani font-bold text-white">
              {config.title}
            </span>
          </div>
          <p className="text-xs text-gray-400">{config.description}</p>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => onEnabledChange(!enabled)}
          disabled={disabled}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            enabled ? 'bg-[#e2b714]' : 'bg-white/20'
          }`}
          aria-label={`Toggle ${config.title}`}
          aria-pressed={enabled}
        >
          <motion.div
            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
            animate={{ x: enabled ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Threshold Slider (shown when enabled) */}
      {enabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 mt-4"
        >
          {/* Income Threshold */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">{config.thresholdLabel}</span>
              <span className="text-lg font-orbitron font-bold" style={{ color: classColor }}>
                ₢{threshold.toLocaleString()}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="50000"
              step="1000"
              value={threshold}
              onChange={(e) => onThresholdChange(parseInt(e.target.value, 10))}
              disabled={disabled}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: classColor }}
              aria-label={config.thresholdLabel}
            />

            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>₢0</span>
              <span>₢50,000</span>
            </div>
          </div>

          {/* EWS Reservation Percentage (only for EWS type) */}
          {type === 'ews' && onEWSPercentChange && (
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">EWS Reservation %</span>
                <span className="text-lg font-orbitron font-bold" style={{ color: classColor }}>
                  {ewsPercent}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={ewsPercent}
                onChange={(e) => onEWSPercentChange(parseInt(e.target.value, 10))}
                disabled={disabled}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: classColor }}
                aria-label="EWS reservation percentage"
              />

              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>50%</span>
              </div>
            </div>
          )}

          {/* Explanation */}
          <div className="p-2 bg-white/5 rounded text-xs text-gray-300">
            {type === 'creamyLayer' && (
              <span>
                Individuals in <span className="text-white font-semibold">{displayName}</span> earning
                above <span className="text-[#e2b714] font-semibold">₢{threshold.toLocaleString()}/month</span> will
                be excluded from reservation benefits.
              </span>
            )}
            {type === 'ews' && (
              <span>
                Individuals in <span className="text-white font-semibold">{displayName}</span> earning
                below <span className="text-[#e2b714] font-semibold">₢{threshold.toLocaleString()}/month</span> will
                receive <span className="text-[#e2b714] font-semibold">{ewsPercent}%</span> reservation.
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
