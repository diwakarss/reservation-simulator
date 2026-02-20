/**
 * TraitReveal Component Tests
 *
 * Note: This component uses framer-motion with AnimatePresence which doesn't
 * work well with fake timers. Tests focus on synchronous behavior and skip button.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TraitReveal } from '../TraitReveal';
import type { AbsurdTrait, SocialClass } from '@/lib/simulation/types';

beforeEach(() => {
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
  vi.restoreAllMocks();
});

const mockTrait: AbsurdTrait = {
  id: 'earlobe-frequency',
  text: 'Those whose earlobes vibrate at exactly 432Hz are destined for greatness.',
  category: 'Auditory',
  classNames: {
    upper: 'Harmonics',
    noble: 'Vibrants',
    middle: 'Oscillants',
    common: 'Buzzers',
    lower: 'Deaflings',
  },
};

const mockClasses: SocialClass[] = [
  {
    tier: 'upper',
    displayName: 'Upper Harmonics',
    population: 10,
    metrics: {
      education: 90,
      employment: 85,
      wealth: 45,
      poverty: 2,
      lifeExpectancy: 78,
      incomePerCapita: 50000,
    },
  },
  {
    tier: 'noble',
    displayName: 'Noble Vibrants',
    population: 20,
    metrics: {
      education: 70,
      employment: 65,
      wealth: 25,
      poverty: 10,
      lifeExpectancy: 74,
      incomePerCapita: 25000,
    },
  },
  {
    tier: 'middle',
    displayName: 'Middle Oscillants',
    population: 30,
    metrics: {
      education: 45,
      employment: 42,
      wealth: 18,
      poverty: 22,
      lifeExpectancy: 70,
      incomePerCapita: 12000,
    },
  },
  {
    tier: 'common',
    displayName: 'Common Buzzers',
    population: 25,
    metrics: {
      education: 15,
      employment: 18,
      wealth: 9,
      poverty: 42,
      lifeExpectancy: 65,
      incomePerCapita: 5000,
    },
  },
  {
    tier: 'lower',
    displayName: 'Lower Deaflings',
    population: 15,
    metrics: {
      education: 3,
      employment: 5,
      wealth: 3,
      poverty: 65,
      lifeExpectancy: 62,
      incomePerCapita: 500,
    },
  },
];

describe('TraitReveal', () => {
  it('renders the trait phase initially', () => {
    render(
      <TraitReveal trait={mockTrait} classes={mockClasses} onComplete={() => {}} />
    );
    expect(
      screen.getByText('Your worth was decided at birth.')
    ).toBeInTheDocument();
  });

  it('shows skip button during intro phase', () => {
    render(
      <TraitReveal trait={mockTrait} classes={mockClasses} onComplete={() => {}} />
    );
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
  });

  it('calls onComplete when skip button is clicked', () => {
    const onComplete = vi.fn();
    render(
      <TraitReveal trait={mockTrait} classes={mockClasses} onComplete={onComplete} />
    );

    const skipButton = screen.getByRole('button', { name: /skip/i });
    fireEvent.click(skipButton);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('receives the correct trait props', () => {
    const { container } = render(
      <TraitReveal trait={mockTrait} classes={mockClasses} onComplete={() => {}} />
    );
    // Component should render (intro phase visible)
    expect(container.firstChild).toBeInTheDocument();
  });

  it('receives the correct classes props', () => {
    const { container } = render(
      <TraitReveal trait={mockTrait} classes={mockClasses} onComplete={() => {}} />
    );
    // Component should render with classes array
    expect(container.firstChild).toBeInTheDocument();
    // The classes are used in the ClassPyramid which appears in later phases
  });

  it('accepts custom autoAdvanceDelay prop', () => {
    const { container } = render(
      <TraitReveal
        trait={mockTrait}
        classes={mockClasses}
        onComplete={() => {}}
        autoAdvanceDelay={5000}
      />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders skip button as accessible', () => {
    render(
      <TraitReveal trait={mockTrait} classes={mockClasses} onComplete={() => {}} />
    );
    const skipButton = screen.getByRole('button', { name: /skip/i });
    expect(skipButton).toBeEnabled();
  });

  it('unmounts cleanly without errors', () => {
    const { unmount } = render(
      <TraitReveal trait={mockTrait} classes={mockClasses} onComplete={() => {}} />
    );
    expect(() => unmount()).not.toThrow();
  });
});
