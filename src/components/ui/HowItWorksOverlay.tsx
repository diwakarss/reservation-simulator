'use client';

/**
 * HowItWorksOverlay
 *
 * Modal explaining simulation mechanics, metric formulas, and links to whitepaper.
 * Accessible via [?] button on all policy screens.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Button } from './Button';

interface HowItWorksOverlayProps {
  /** Whether the overlay is visible */
  isOpen: boolean;
  /** Called when overlay should close */
  onClose: () => void;
}

/**
 * Metric explanation data.
 */
const METRICS = [
  {
    icon: '📚',
    name: 'Education',
    description:
      'Percentage of class with access to education. Reservation increases access by guaranteeing seats.',
    formula: 'New Education = Old + (Reservation% x 0.003)',
  },
  {
    icon: '💼',
    name: 'Employment',
    description:
      'Percentage with formal jobs. Follows education with a ~5 year lag as educated individuals enter workforce.',
    formula: 'Employment follows Education gain with delay',
  },
  {
    icon: '💰',
    name: 'Wealth',
    description:
      'Share of total economy. Changes slowly as education and employment improve. All shares sum to 100%.',
    formula: 'Wealth redistributes based on relative employment',
  },
  {
    icon: '📉',
    name: 'Poverty',
    description:
      'Percentage living below 500 credits/month. Decreases as employment increases and economic opportunity expands.',
    formula: 'Poverty reduces with education + employment gains',
  },
  {
    icon: '❤️',
    name: 'Life Expectancy',
    description:
      'Average lifespan in years. Improves with education (health literacy) and reduced poverty (healthcare access).',
    formula: 'Life Expectancy improves with education and poverty reduction',
  },
];

export function HowItWorksOverlay({ isOpen, onClose }: HowItWorksOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focusable elements selector
  const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  // Focus trap and escape key handling
  useEffect(() => {
    if (!isOpen) return;

    // Focus close button when opened
    closeButtonRef.current?.focus();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !overlayRef.current) return;

      const focusableElements = Array.from(
        overlayRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );

      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);
    document.addEventListener('mousedown', handleClickOutside);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="how-it-works-title"
        >
          <motion.div
            ref={overlayRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="
              relative w-full max-w-2xl max-h-[85vh]
              bg-cosmic-blue border border-white/10
              rounded-2xl shadow-2xl
              overflow-hidden
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
              <h2
                id="how-it-works-title"
                className="font-orbitron text-xl sm:text-2xl font-bold text-white"
              >
                How The Simulation Works
              </h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="
                  p-2 min-h-[44px] min-w-[44px]
                  flex items-center justify-center
                  text-muted-text hover:text-white active:text-white
                  transition-colors duration-200
                  rounded-lg hover:bg-white/10 active:bg-white/10
                  focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-offset-2 focus:ring-offset-cosmic-blue
                "
                aria-label="Close dialog"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
              {/* Intro */}
              <p className="font-rajdhani text-base text-muted-text mb-6 leading-relaxed">
                This simulation models how reservation policies affect different
                social classes over time. Each metric is interconnected — changes
                in education ripple through employment, wealth, poverty, and life
                expectancy.
              </p>

              {/* Metrics section */}
              <h3 className="font-orbitron text-lg font-semibold text-accent-gold mb-4">
                The Metrics
              </h3>

              <div className="space-y-4 mb-8">
                {METRICS.map((metric) => (
                  <div
                    key={metric.name}
                    className="
                      bg-deep-purple/50 border border-white/5
                      rounded-lg p-4
                    "
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{metric.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-rajdhani font-bold text-white mb-1">
                          {metric.name}
                        </h4>
                        <p className="text-sm text-muted-text mb-2">
                          {metric.description}
                        </p>
                        <code className="text-xs text-accent-gold/80 bg-black/20 px-2 py-1 rounded">
                          {metric.formula}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* The Math section */}
              <h3 className="font-orbitron text-lg font-semibold text-accent-gold mb-4">
                The Math
              </h3>

              <div className="bg-deep-purple/50 border border-white/5 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-text mb-4 leading-relaxed">
                  Each year, the simulation calculates new metric values based on:
                </p>
                <ul className="space-y-2 text-sm text-muted-text">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-gold">1.</span>
                    <span>
                      Current reservation percentage for each class
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-gold">2.</span>
                    <span>
                      Years since policy was implemented (compound effects)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-gold">3.</span>
                    <span>
                      Creamy layer and EWS adjustments (if applicable)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-gold">4.</span>
                    <span>
                      Random variance of 5% to simulate real-world unpredictability
                    </span>
                  </li>
                </ul>
              </div>

              <p className="text-sm text-muted-text/70 text-center">
                Full mathematical model available in the whitepaper.
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-white/10 bg-deep-purple/30">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="primary" size="md" onClick={onClose}>
                  Got It
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => window.open('/whitepaper', '_blank')}
                >
                  View Whitepaper
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default HowItWorksOverlay;
