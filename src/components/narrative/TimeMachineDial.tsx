'use client';

/**
 * TimeMachineDial - Animated time machine dial showing years advancing
 *
 * Shows a rotating dial/counter that animates from startYear to endYear,
 * creating a "time travel" visual effect when advancing 20 years.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeMachineDialProps {
  /** Starting year */
  startYear: number;
  /** Ending year */
  endYear: number;
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Callback when animation completes */
  onComplete: () => void;
}

export function TimeMachineDial({
  startYear,
  endYear,
  duration = 2500,
  onComplete,
}: TimeMachineDialProps) {
  const [currentYear, setCurrentYear] = useState(startYear);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const yearDiff = endYear - startYear;
    const stepDuration = duration / yearDiff;
    let year = startYear;

    const interval = setInterval(() => {
      year += 1;
      setCurrentYear(year);

      if (year >= endYear) {
        clearInterval(interval);
        setIsComplete(true);
        // Small delay before calling onComplete for visual satisfaction
        setTimeout(onComplete, 400);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [startYear, endYear, duration, onComplete]);

  // Calculate rotation angle for dial (3 full rotations over the animation)
  const rotationProgress = (currentYear - startYear) / (endYear - startYear);
  const dialRotation = rotationProgress * 1080; // 3 full rotations

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-purple">
      {/* Cosmic background effect */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Radial gradient pulse */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, rgba(226, 183, 20, 0.15) 0%, transparent 60%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Spinning star field effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(1px 1px at 20% 30%, white 1px, transparent 0),
              radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.8) 1px, transparent 0),
              radial-gradient(1px 1px at 60% 20%, rgba(255,255,255,0.6) 1px, transparent 0),
              radial-gradient(1px 1px at 80% 60%, white 1px, transparent 0),
              radial-gradient(1.5px 1.5px at 30% 50%, rgba(226,183,20,0.8) 1px, transparent 0),
              radial-gradient(1.5px 1.5px at 70% 40%, rgba(56,189,248,0.8) 1px, transparent 0)
            `,
            backgroundSize: '200px 200px',
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Main dial container */}
      <div className="relative flex flex-col items-center">
        {/* Outer ring (stationary reference) */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80">
          {/* Outer decorative ring */}
          <div className="absolute inset-0 rounded-full border-4 border-accent-gold/30" />

          {/* Tick marks around the edge */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-4 bg-accent-gold/60 origin-bottom"
              style={{
                left: '50%',
                top: '0',
                transform: `translateX(-50%) rotate(${i * 18}deg)`,
                transformOrigin: '50% 160px',
              }}
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: i <= rotationProgress * 20 ? 1 : 0.3,
              }}
              transition={{ duration: 0.1 }}
            />
          ))}

          {/* Rotating dial */}
          <motion.div
            className="absolute inset-4 rounded-full border-2 border-accent-cyan/50"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
            }}
            animate={{ rotate: dialRotation }}
            transition={{ ease: 'linear', duration: 0.05 }}
          >
            {/* Inner dial decorations */}
            <div className="absolute inset-4 rounded-full border border-white/10" />
            <div className="absolute inset-8 rounded-full border border-accent-gold/20" />

            {/* Dial pointer */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-accent-cyan" />
          </motion.div>

          {/* Center display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 blur-xl"
                style={{
                  background: `radial-gradient(circle, rgba(226, 183, 20, 0.4) 0%, transparent 70%)`,
                }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Year display */}
              <motion.div
                className="relative font-orbitron text-5xl sm:text-7xl font-bold text-accent-gold"
                style={{
                  textShadow: '0 0 30px rgba(226, 183, 20, 0.5), 0 0 60px rgba(226, 183, 20, 0.3)',
                }}
                animate={{
                  scale: isComplete ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 0.3,
                }}
              >
                {currentYear}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Label */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="font-rajdhani text-2xl sm:text-3xl text-white font-semibold">
            {isComplete ? 'Time travel complete' : 'Traveling through time...'}
          </p>
          <p className="font-grotesk text-lg sm:text-xl text-accent-cyan mt-3">
            Year {startYear} → Year {endYear}
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="mt-6 w-48 h-1 bg-cosmic-blue rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-accent-cyan to-accent-gold rounded-full"
            style={{
              width: `${rotationProgress * 100}%`,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default TimeMachineDial;
