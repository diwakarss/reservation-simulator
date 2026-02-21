'use client';

/**
 * PolicyLayout
 *
 * Shared layout for all policy screens (Year 0, 20, 40, 60, 80).
 * Provides consistent header, body, and footer structure.
 */

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { YearProgress } from '@/components/narrative';
import { Button } from '@/components/ui';
import { SettingsDrawer } from '@/components/simulation/SettingsDrawer';
import { useSimulationStore } from '@/lib/store';

interface PolicyLayoutProps {
  /** Current simulation year */
  year: number;
  /** Main content */
  children: ReactNode;
  /** Primary action button text */
  primaryActionText?: string;
  /** Primary action handler */
  onPrimaryAction?: () => void;
  /** Secondary action button text (optional) */
  secondaryActionText?: string;
  /** Secondary action handler */
  onSecondaryAction?: () => void;
  /** Whether to show How It Works button */
  showHowItWorks?: boolean;
  /** How It Works handler */
  onHowItWorks?: () => void;
  /** Whether to show Settings button */
  showSettings?: boolean;
  /** Settings handler */
  onSettings?: () => void;
  /** Whether to show Charts button */
  showCharts?: boolean;
  /** Charts handler */
  onCharts?: () => void;
  /** Whether to show Restart button */
  showRestart?: boolean;
  /** Restart handler */
  onRestart?: () => void;
  /** Disable primary action */
  primaryDisabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function PolicyLayout({
  year,
  children,
  primaryActionText = 'Apply & Advance 20 Years',
  onPrimaryAction,
  secondaryActionText,
  onSecondaryAction,
  showHowItWorks = true,
  onHowItWorks,
  showSettings = true,
  onSettings,
  showCharts = true,
  onCharts,
  showRestart = true,
  onRestart,
  primaryDisabled = false,
  className = '',
}: PolicyLayoutProps) {
  const openSettingsDrawer = useSimulationStore((state) => state.openSettingsDrawer);
  const reset = useSimulationStore((state) => state.reset);
  const initializeWorld = useSimulationStore((state) => state.initializeWorld);
  const settingsHandler = onSettings ?? openSettingsDrawer;
  const restartHandler = onRestart ?? (() => {
    reset();
    initializeWorld();
  });

  return (
    <div
      className={`
        flex flex-col min-h-screen
        bg-deep-purple
        ${className}
      `}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-cosmic-blue/50 backdrop-blur-sm sticky top-0 z-20">
        <YearProgress year={year} size="md" showBar={false} />

        {/* Nav buttons */}
        <div className="flex items-center gap-2">
          {showHowItWorks && onHowItWorks && (
            <button
              onClick={onHowItWorks}
              className="
                p-2 rounded-full min-h-[44px] min-w-[44px]
                flex items-center justify-center
                text-muted-text hover:text-accent-gold active:text-accent-gold
                hover:bg-accent-gold/10 active:bg-accent-gold/10
                transition-colors duration-200
              "
              aria-label="How it works"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          )}

          {showCharts && onCharts && (
            <button
              onClick={onCharts}
              className="
                p-2 rounded-full min-h-[44px] min-w-[44px]
                flex items-center justify-center
                text-muted-text hover:text-accent-gold active:text-accent-gold
                hover:bg-accent-gold/10 active:bg-accent-gold/10
                transition-colors duration-200
              "
              aria-label="View charts"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </button>
          )}

          {showSettings && settingsHandler && (
            <button
              onClick={settingsHandler}
              className="
                p-2 rounded-full min-h-[44px] min-w-[44px]
                flex items-center justify-center
                text-muted-text hover:text-accent-gold active:text-accent-gold
                hover:bg-accent-gold/10 active:bg-accent-gold/10
                transition-colors duration-200
              "
              aria-label="Settings"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          )}

          {showRestart && restartHandler && (
            <button
              onClick={restartHandler}
              className="
                p-2 rounded-full min-h-[44px] min-w-[44px]
                flex items-center justify-center
                text-accent-cyan hover:text-white active:text-white
                hover:bg-accent-cyan/10 active:bg-accent-cyan/10
                border border-accent-cyan/30 hover:border-accent-cyan
                transition-colors duration-200
              "
              aria-label="Restart simulation"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-4 border-t border-white/10 bg-cosmic-blue/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-xl lg:max-w-2xl mx-auto">
          {onPrimaryAction && (
            <Button
              variant="primary"
              size="lg"
              onClick={onPrimaryAction}
              disabled={primaryDisabled}
              className="w-full sm:w-auto"
              rightIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              }
            >
              {primaryActionText}
            </Button>
          )}

          {secondaryActionText && onSecondaryAction && (
            <Button
              variant="ghost"
              size="lg"
              onClick={onSecondaryAction}
              className="w-full sm:w-auto"
            >
              {secondaryActionText}
            </Button>
          )}
        </div>
      </footer>

      <SettingsDrawer />
    </div>
  );
}

export default PolicyLayout;
