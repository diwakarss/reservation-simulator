'use client';

/**
 * RestartButton - Appears on all screens after intro
 * Resets simulation to beginning when clicked
 * Styled to match ContinueButton but with cyan accent color
 */

import { useSimulationStore } from '@/lib/store';

interface RestartButtonProps {
  className?: string;
}

/**
 * Tailwind classes for RestartButton - matches ContinueButton style but with cyan color
 */
const RESTART_BUTTON_CLASS = [
  'font-grotesk text-base text-accent-cyan',
  'hover:text-white',
  'transition-colors duration-200',
  'flex items-center gap-2',
  'px-4 py-2 rounded-lg',
  'border border-accent-cyan/30',
  'hover:border-accent-cyan',
  'hover:bg-accent-cyan/10',
].join(' ');

export function RestartButton({ className = '' }: RestartButtonProps) {
  const reset = useSimulationStore((state) => state.reset);
  const initializeWorld = useSimulationStore((state) => state.initializeWorld);

  const handleRestart = () => {
    reset();
    initializeWorld();
    // Phase is automatically set to INTRO in getInitialState
  };

  return (
    <button
      onClick={handleRestart}
      className={`${RESTART_BUTTON_CLASS} ${className}`}
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
      Restart
    </button>
  );
}

export default RestartButton;
