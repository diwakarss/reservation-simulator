/**
 * GalaxyIntro Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GalaxyIntro } from '../GalaxyIntro';

describe('GalaxyIntro', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock matchMedia for CosmicBackground and useReducedMotion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)', // Enable reduced motion for faster tests
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const defaultProps = {
    galaxyName: 'Andromeda',
    planetName: 'Zephyria',
    nationName: 'Varnashrama',
    onComplete: vi.fn(),
  };

  it('renders initial galaxy line', () => {
    render(<GalaxyIntro {...defaultProps} />);
    // Component starts at phase 1, showing first line with commas
    expect(screen.getByText(/In a galaxy, far, far away/)).toBeInTheDocument();
  });

  it('reveals planet name after delay', async () => {
    render(<GalaxyIntro {...defaultProps} />);

    // With reduced motion, lineDelay is 1500ms
    // Advance time to reveal planet line (phase 1 -> 2)
    await act(async () => {
      vi.advanceTimersByTime(1600);
    });

    expect(screen.getByText('Zephyria')).toBeInTheDocument();
  });

  it('reveals nation name after planet', async () => {
    render(<GalaxyIntro {...defaultProps} />);

    // Advance through phases with reduced motion timing (1500ms per phase)
    await act(async () => {
      vi.advanceTimersByTime(1600); // phase 1 -> 2 (planet)
    });
    await act(async () => {
      vi.advanceTimersByTime(1600); // phase 2 -> 3 (nation)
    });

    expect(screen.getByText('Varnashrama')).toBeInTheDocument();
  });

  it('calls onComplete when skip is clicked', () => {
    const onComplete = vi.fn();
    render(<GalaxyIntro {...defaultProps} onComplete={onComplete} />);

    // Find and click skip button (text is "Skip Intro")
    const skipButton = screen.getByRole('button', { name: /skip/i });
    fireEvent.click(skipButton);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('auto-completes after all lines revealed', async () => {
    const onComplete = vi.fn();
    render(<GalaxyIntro {...defaultProps} onComplete={onComplete} />);

    // With reduced motion:
    // - lineDelay = 1500ms for phases 1->2, 2->3, 3->4
    // - finalDelay = 2000ms for phase 4->complete
    // Advance through all phases
    await act(async () => {
      vi.advanceTimersByTime(1600); // phase 1 -> 2
    });
    await act(async () => {
      vi.advanceTimersByTime(1600); // phase 2 -> 3
    });
    await act(async () => {
      vi.advanceTimersByTime(1600); // phase 3 -> 4
    });
    await act(async () => {
      vi.advanceTimersByTime(2100); // phase 4 -> complete (finalDelay = 2000ms)
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
