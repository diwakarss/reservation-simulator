'use client';

/**
 * RestartButton - Appears on all screens after intro
 * Resets simulation to beginning when clicked
 */

import { useSimulationStore } from '@/lib/store';

interface RestartButtonProps {
  className?: string;
}

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
      className={`
        flex items-center gap-2 px-4 py-2
        text-sm font-grotesk text-muted-text
        hover:text-white transition-colors duration-200
        bg-white/5 hover:bg-white/10 rounded-lg
        border border-white/10 hover:border-white/20
        ${className}
      `}
    >
      <svg
        className="w-4 h-4"
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
