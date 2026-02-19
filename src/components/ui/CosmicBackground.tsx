'use client';

/**
 * CosmicBackground
 *
 * Animated star field background for the landing page and simulation screens.
 * Uses CSS animations for star twinkling effect.
 * Respects reduced motion preferences.
 */

import { useEffect, useState, useMemo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
}

interface CosmicBackgroundProps {
  /** Number of stars to render */
  starCount?: number;
  /** Whether to show gradient nebula effects */
  showNebula?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function CosmicBackground({
  starCount = 100,
  showNebula = true,
  className = '',
}: CosmicBackgroundProps) {
  const [isClient, setIsClient] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Only render stars on client to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Generate stars deterministically based on count
  const stars = useMemo<Star[]>(() => {
    if (!isClient) return [];

    const generated: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      // Use deterministic pseudo-random based on index
      const seed = i * 1.618033988749895; // golden ratio
      const x = ((seed * 127) % 100);
      const y = ((seed * 311) % 100);
      const size = 1 + ((seed * 17) % 2);
      const opacity = 0.3 + ((seed * 23) % 0.7);
      const delay = (seed * 7) % 5;
      const duration = 2 + ((seed * 13) % 3);

      generated.push({
        id: i,
        x,
        y,
        size,
        opacity,
        delay,
        duration,
      });
    }
    return generated;
  }, [isClient, starCount]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Gradient nebula effects */}
      {showNebula && (
        <>
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background:
                'radial-gradient(ellipse at 30% 20%, rgba(22, 33, 62, 0.8) 0%, transparent 50%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(ellipse at 70% 80%, rgba(26, 26, 46, 0.7) 0%, transparent 50%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(226, 183, 20, 0.05) 0%, transparent 40%)',
            }}
          />
        </>
      )}

      {/* Star field */}
      {isClient &&
        stars.map((star) => (
          <div
            key={star.id}
            className={reducedMotion ? '' : 'animate-star-twinkle'}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: '50%',
              backgroundColor: 'white',
              opacity: reducedMotion ? star.opacity : undefined,
              animationDelay: reducedMotion ? undefined : `${star.delay}s`,
              animationDuration: reducedMotion ? undefined : `${star.duration}s`,
              boxShadow:
                star.size > 1.5
                  ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.5)`
                  : undefined,
            }}
          />
        ))}

      {/* Accent colored stars (rare) */}
      {isClient && (
        <>
          <div
            className={reducedMotion ? '' : 'animate-star-twinkle'}
            style={{
              position: 'absolute',
              left: '85%',
              top: '15%',
              width: '2px',
              height: '2px',
              borderRadius: '50%',
              backgroundColor: '#e2b714',
              boxShadow: '0 0 6px #e2b714',
              animationDelay: '1.5s',
            }}
          />
          <div
            className={reducedMotion ? '' : 'animate-star-twinkle'}
            style={{
              position: 'absolute',
              left: '15%',
              top: '75%',
              width: '2px',
              height: '2px',
              borderRadius: '50%',
              backgroundColor: '#60a5fa',
              boxShadow: '0 0 6px #60a5fa',
              animationDelay: '2.8s',
            }}
          />
        </>
      )}
    </div>
  );
}

export default CosmicBackground;
