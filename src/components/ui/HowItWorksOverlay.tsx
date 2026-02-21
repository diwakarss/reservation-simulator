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

// GitHub URLs
const WHITEPAPER_URL = 'https://github.com/diwakarss/reservation-simulator/raw/main/whitepapers/Whitepaper.pdf';
const GITHUB_URL = 'https://github.com/diwakarss/reservation-simulator';

interface HowItWorksOverlayProps {
  /** Whether the overlay is visible */
  isOpen: boolean;
  /** Called when overlay should close */
  onClose: () => void;
}

/**
 * Metric explanation data - updated to match actual implementation.
 */
const METRICS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    name: 'Education',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    description: 'Access to tertiary education. All classes improve naturally over time. Reservation accelerates progress with a gap-closing effect.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
    name: 'Employment',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    description: 'Skilled employment access. Follows education gains with strong correlation, plus direct job reservation benefits.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    name: 'Wealth',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    description: 'Share of total wealth (zero-sum, always 100%). Grows with education and employment gains, normalized across all classes.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
      </svg>
    ),
    name: 'Poverty',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    description: 'Percentage below poverty line. Decreases with education and employment gains. Has diminishing returns near the floor.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    name: 'Life Expectancy',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    description: 'Average lifespan in years. Improves with education and poverty reduction. Capped at 80 years with diminishing returns.',
  },
];

export function HowItWorksOverlay({ isOpen, onClose }: HowItWorksOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="how-it-works-title"
        >
          <motion.div
            ref={overlayRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="
              relative w-full max-w-3xl max-h-[85vh]
              bg-gradient-to-b from-slate-900 to-slate-950
              border border-white/10
              rounded-2xl shadow-2xl shadow-black/50
              overflow-hidden flex flex-col
            "
          >
            {/* Header */}
            <div className="relative px-6 pr-16 py-5 border-b border-white/10 bg-gradient-to-r from-accent-cyan/5 to-transparent flex-shrink-0">
              <h2
                id="how-it-works-title"
                className="font-orbitron text-xl sm:text-2xl font-bold text-white tracking-wide"
              >
                How The Simulation Works
              </h2>
              <p className="font-rajdhani text-sm text-white/50 mt-1">
                Understanding the mathematical model behind policy outcomes
              </p>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="
                  absolute top-3 right-3
                  p-2 min-h-[44px] min-w-[44px]
                  flex items-center justify-center
                  text-white/60 hover:text-white
                  transition-colors duration-200
                  rounded-lg hover:bg-white/10
                  border border-white/20
                  focus:outline-none focus:ring-2 focus:ring-accent-cyan
                "
                aria-label="Close dialog"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              {/* Intro */}
              <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="font-rajdhani text-base text-white/80 leading-relaxed">
                  This simulation models how reservation (affirmative action) policies affect
                  social classes over <span className="text-accent-cyan font-semibold">200 years</span>.
                  Each metric is interconnected — improvements in education cascade through employment,
                  wealth, poverty, and life expectancy across generations.
                </p>
              </div>

              {/* Metrics Grid */}
              <h3 className="font-orbitron text-sm uppercase tracking-widest text-white/40 mb-4">
                Tracked Metrics
              </h3>

              <div className="grid gap-3 mb-8">
                {METRICS.map((metric) => (
                  <div
                    key={metric.name}
                    className={`
                      ${metric.bgColor} ${metric.borderColor}
                      border rounded-xl p-4
                      transition-all duration-200 hover:scale-[1.01]
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${metric.color} mt-0.5`}>
                        {metric.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-rajdhani font-bold text-lg ${metric.color} mb-1`}>
                          {metric.name}
                        </h4>
                        <p className="text-sm text-white/60 leading-relaxed">
                          {metric.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Concepts */}
              <h3 className="font-orbitron text-sm uppercase tracking-widest text-white/40 mb-4">
                Key Concepts
              </h3>

              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-accent-cyan font-mono text-sm">G(x)</span>
                    <span className="font-rajdhani font-semibold text-white">Gap Multiplier</span>
                  </div>
                  <p className="text-sm text-white/50">
                    Classes further behind improve faster. Formula: ((100-x)/100)^0.8
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-accent-cyan font-mono text-sm">γ</span>
                    <span className="font-rajdhani font-semibold text-white">Generational Boost</span>
                  </div>
                  <p className="text-sm text-white/50">
                    Effects compound over generations. Maxes at 50% after 40 years of policy.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-accent-gold font-mono text-sm">EWS</span>
                    <span className="font-rajdhani font-semibold text-white">Economic Weaker Sections</span>
                  </div>
                  <p className="text-sm text-white/50">
                    Extends reservation benefits to economically disadvantaged upper classes.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-accent-gold font-mono text-sm">CL</span>
                    <span className="font-rajdhani font-semibold text-white">Creamy Layer</span>
                  </div>
                  <p className="text-sm text-white/50">
                    Excludes affluent members of reserved categories from receiving benefits.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-black/20 flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex gap-3">
                  <a
                    href={WHITEPAPER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex items-center gap-2 px-4 py-2
                      font-rajdhani text-sm font-medium
                      text-accent-cyan hover:text-white
                      bg-accent-cyan/10 hover:bg-accent-cyan/20
                      border border-accent-cyan/30 hover:border-accent-cyan/50
                      rounded-lg transition-all duration-200
                    "
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Whitepaper
                  </a>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex items-center gap-2 px-4 py-2
                      font-rajdhani text-sm font-medium
                      text-white/60 hover:text-white
                      bg-white/5 hover:bg-white/10
                      border border-white/10 hover:border-white/20
                      rounded-lg transition-all duration-200
                    "
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                </div>
                <Button variant="primary" size="md" onClick={onClose}>
                  Got It
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
