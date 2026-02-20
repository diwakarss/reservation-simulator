import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

/**
 * Policy Screen Variants
 * Maps to the 5 policy phases from PLAN.md Task 9
 */
export type PolicyVariant =
  | 'bottom2'      // Year 0: Initial choice for bottom 2 classes
  | 'middle'       // Year 20: Extend to middle class
  | 'creamyLayer'  // Year 40: Introduce creamy layer exclusion
  | 'ews'          // Year 60: EWS reservation
  | 'removal';     // Year 80: Policy removal decision

interface PolicyScreenProps {
  /** Current year in simulation */
  year: number;
  /** Policy screen variant */
  variant: PolicyVariant;
  /** Header component */
  header: ReactNode;
  /** Left column content (policy controls) */
  leftContent: ReactNode;
  /** Right column content (progress cards/comparison) */
  rightContent: ReactNode;
  /** Footer actions (CTA buttons) */
  footer: ReactNode;
  /** Optional className for custom styling */
  className?: string;
}

/**
 * PolicyScreen - Reusable layout for the 5-phase guided journey (PLAN.md Task 9)
 *
 * Provides consistent two-column layout (desktop) / stacked (mobile) with:
 * - Header: Year indicator + navigation
 * - Body: Two columns (policy controls | progress summary)
 * - Footer: Action buttons
 *
 * Used by all 5 policy phases:
 * - POLICY_BOTTOM_2 (year=0)
 * - POLICY_MIDDLE (year=20)
 * - POLICY_CREAMY_LAYER (year=40)
 * - POLICY_EWS (year=60)
 * - POLICY_REMOVAL (year=80)
 */
export const PolicyScreen: React.FC<PolicyScreenProps> = ({
  year,
  variant,
  header,
  leftContent,
  rightContent,
  footer,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className={`min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] text-white flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="border-b border-white/10">
        {header}
      </div>

      {/* Body: Two-column layout (desktop) / Stacked (mobile) */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Policy Controls */}
            <div className="space-y-6">
              {leftContent}
            </div>

            {/* Right: Progress Summary / Comparison */}
            <div className="space-y-6">
              {rightContent}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Action Buttons */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {footer}
        </div>
      </div>
    </motion.div>
  );
};
