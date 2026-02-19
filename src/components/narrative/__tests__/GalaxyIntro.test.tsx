/**
 * GalaxyIntro Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GalaxyIntro } from '../GalaxyIntro';

describe('GalaxyIntro', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock matchMedia for CosmicBackground
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
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
    expect(screen.getByText('In a galaxy far away...')).toBeInTheDocument();
  });

  it('reveals planet name after delay', async () => {
    render(<GalaxyIntro {...defaultProps} />);

    // Advance time to reveal planet line
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText('Zephyria')).toBeInTheDocument();
  });

  it('reveals nation name after planet', async () => {
    render(<GalaxyIntro {...defaultProps} />);

    // Advance through phases
    await act(async () => {
      vi.advanceTimersByTime(1500); // phase 0 -> 1
    });
    await act(async () => {
      vi.advanceTimersByTime(2000); // phase 1 -> 2
    });

    expect(screen.getByText('Varnashrama')).toBeInTheDocument();
  });

  it('calls onComplete when skip is clicked', () => {
    const onComplete = vi.fn();
    render(<GalaxyIntro {...defaultProps} onComplete={onComplete} />);

    // Find and click skip button
    const skipButton = screen.getByRole('button', { name: /skip/i });
    fireEvent.click(skipButton);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows continue button after all lines revealed', async () => {
    render(<GalaxyIntro {...defaultProps} />);

    // Advance through all phases
    await act(async () => {
      vi.advanceTimersByTime(1500); // phase 0 -> 1
    });
    await act(async () => {
      vi.advanceTimersByTime(2000); // phase 1 -> 2
    });
    await act(async () => {
      vi.advanceTimersByTime(2000); // phase 2 -> 3
    });

    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });
});
