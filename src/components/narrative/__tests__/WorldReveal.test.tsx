/**
 * WorldReveal Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WorldReveal } from '../WorldReveal';

beforeEach(() => {
  vi.useFakeTimers();
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

describe('WorldReveal', () => {
  it('renders the "Your World Awaits" heading', () => {
    render(<WorldReveal {...defaultProps} />);
    expect(screen.getByText('Your World Awaits')).toBeInTheDocument();
  });

  it('renders the galaxy name', () => {
    render(<WorldReveal {...defaultProps} />);
    expect(screen.getByText('Andromeda')).toBeInTheDocument();
  });

  it('renders the planet name', () => {
    render(<WorldReveal {...defaultProps} />);
    expect(screen.getByText('Zephyria')).toBeInTheDocument();
  });

  it('renders the nation name', () => {
    render(<WorldReveal {...defaultProps} />);
    expect(screen.getByText('Varnashrama')).toBeInTheDocument();
  });

  it('renders the galaxy, planet, and nation labels', () => {
    render(<WorldReveal {...defaultProps} />);
    expect(screen.getByText('Galaxy')).toBeInTheDocument();
    expect(screen.getByText('Planet')).toBeInTheDocument();
    expect(screen.getByText('Nation')).toBeInTheDocument();
  });

  it('renders a Continue button', () => {
    render(<WorldReveal {...defaultProps} />);
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('calls onComplete when Continue button is clicked', () => {
    const onComplete = vi.fn();
    render(<WorldReveal {...defaultProps} onComplete={onComplete} />);

    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('auto-advances by calling onComplete after the default delay', async () => {
    const onComplete = vi.fn();
    render(<WorldReveal {...defaultProps} onComplete={onComplete} />);

    // Default delay is 2500ms
    await act(async () => {
      vi.advanceTimersByTime(2600);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('auto-advances after custom autoAdvanceDelay', async () => {
    const onComplete = vi.fn();
    render(
      <WorldReveal {...defaultProps} onComplete={onComplete} autoAdvanceDelay={1000} />
    );

    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does NOT auto-advance before the delay elapses', () => {
    const onComplete = vi.fn();
    render(
      <WorldReveal {...defaultProps} onComplete={onComplete} autoAdvanceDelay={5000} />
    );

    vi.advanceTimersByTime(2000);

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('renders different world names correctly', () => {
    render(
      <WorldReveal
        galaxyName="Milky Way"
        planetName="Terra Nova"
        nationName="Aurelian Republic"
        onComplete={() => {}}
      />
    );

    expect(screen.getByText('Milky Way')).toBeInTheDocument();
    expect(screen.getByText('Terra Nova')).toBeInTheDocument();
    expect(screen.getByText('Aurelian Republic')).toBeInTheDocument();
  });
});
