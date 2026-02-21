'use client';

/**
 * TimelineScrubber - Slider control for navigating through years
 *
 * Allows users to scrub through the simulation timeline to see charts
 * at different points in time.
 */

import { useState, useCallback } from 'react';

interface TimelineScrubberProps {
  /** Minimum year (typically 0) */
  minYear: number;
  /** Maximum year (current simulation year) */
  maxYear: number;
  /** Currently selected year */
  currentYear: number;
  /** Callback when year changes */
  onYearChange: (year: number) => void;
  /** Step size for scrubbing */
  step?: number;
  /** Optional additional CSS classes */
  className?: string;
}

export function TimelineScrubber({
  minYear,
  maxYear,
  currentYear,
  onYearChange,
  step = 1,
  className = '',
}: TimelineScrubberProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onYearChange(Number(e.target.value));
    },
    [onYearChange]
  );

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Calculate tick positions
  const range = maxYear - minYear;
  const tickCount = range > 0 ? Math.min(5, Math.floor(range / 20) + 1) : 1;
  const tickInterval = tickCount > 1 ? Math.ceil(range / (tickCount - 1)) : 0;
  const ticks = tickCount === 1
    ? [minYear]
    : Array.from({ length: tickCount }, (_, i) =>
        Math.min(minYear + i * tickInterval, maxYear)
      );

  return (
    <div className={`w-full ${className}`}>
      {/* Year Display */}
      <div className="mb-2 flex items-center justify-between">
        <span className="font-rajdhani text-sm text-muted-text">Year</span>
        <span
          className={`
            font-orbitron text-lg font-bold
            ${isDragging ? 'text-accent-gold' : 'text-white'}
            transition-colors duration-150
          `}
        >
          {currentYear}
        </span>
      </div>

      {/* Slider Track */}
      <div className="relative">
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={currentYear}
          step={step}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className="
            h-2 w-full cursor-pointer appearance-none rounded-full
            bg-cosmic-blue
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-accent-gold
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(226,183,20,0.5)]
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:duration-150
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:hover:shadow-[0_0_15px_rgba(226,183,20,0.8)]
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:bg-accent-gold
            [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(226,183,20,0.5)]
          "
          aria-label={`Timeline year ${currentYear}`}
        />

        {/* Progress Fill */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-2 rounded-full bg-accent-gold/30"
          style={{
            width: `${((currentYear - minYear) / (maxYear - minYear)) * 100}%`,
          }}
        />
      </div>

      {/* Tick Marks */}
      <div className="relative mt-1 flex justify-between">
        {ticks.map((tick) => (
          <span
            key={tick}
            className="font-rajdhani text-xs text-muted-text/60"
          >
            {tick}
          </span>
        ))}
      </div>
    </div>
  );
}

export default TimelineScrubber;
