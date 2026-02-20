import React from 'react';
import { motion } from 'framer-motion';

interface PolicyHeaderProps {
  /** Current simulation year */
  year: number;
  /** Optional heading text (defaults to "Year {year}") */
  heading?: string;
  /** Callback when Settings is clicked */
  onSettingsClick?: () => void;
  /** Callback when Charts is clicked */
  onChartsClick?: () => void;
  /** Callback when How It Works is clicked */
  onHowItWorksClick?: () => void;
}

/**
 * PolicyHeader - Year indicator and navigation buttons (PLAN.md Task 9)
 *
 * Shows:
 * - Current year with cosmic styling
 * - Global navigation: Settings, Charts, How It Works
 *
 * Accessible from all policy screens (Years 0, 20, 40, 60, 80)
 */
export const PolicyHeader: React.FC<PolicyHeaderProps> = ({
  year,
  heading,
  onSettingsClick,
  onChartsClick,
  onHowItWorksClick,
}) => {
  return (
    <div className="px-4 py-4 flex items-center justify-between">
      {/* Year Display */}
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-orbitron font-bold text-[#e2b714]"
        >
          {heading || `Year ${year}`}
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        {/* How It Works */}
        {onHowItWorksClick && (
          <button
            onClick={onHowItWorksClick}
            className="px-3 py-2 text-sm font-rajdhani font-semibold text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
            aria-label="How It Works"
          >
            <span className="text-lg">?</span>
            <span className="hidden sm:inline">How It Works</span>
          </button>
        )}

        {/* Charts */}
        {onChartsClick && (
          <button
            onClick={onChartsClick}
            className="px-3 py-2 text-sm font-rajdhani font-semibold text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
            aria-label="View Charts"
          >
            <span className="text-lg">📊</span>
            <span className="hidden sm:inline">Charts</span>
          </button>
        )}

        {/* Settings */}
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="px-3 py-2 text-sm font-rajdhani font-semibold text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
            aria-label="Open Settings"
          >
            <span className="text-lg">⚙️</span>
            <span className="hidden sm:inline">Settings</span>
          </button>
        )}
      </div>
    </div>
  );
};
