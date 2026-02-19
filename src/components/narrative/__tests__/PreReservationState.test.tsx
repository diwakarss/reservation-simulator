/**
 * PreReservationState Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreReservationState } from '../PreReservationState';
import type { SocialClass } from '@/lib/simulation/types';

// Mock matchMedia (required for CosmicBackground)
beforeEach(() => {
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

describe('PreReservationState', () => {
  it('renders null when lower class is missing', () => {
    const classesWithoutLower = mockClasses.filter((c) => c.tier !== 'lower');
    const { container } = render(
      <PreReservationState classes={classesWithoutLower} onComplete={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders null when upper class is missing', () => {
    const classesWithoutUpper = mockClasses.filter((c) => c.tier !== 'upper');
    const { container } = render(
      <PreReservationState classes={classesWithoutUpper} onComplete={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the intro narrative line', () => {
    render(<PreReservationState classes={mockClasses} onComplete={() => {}} />);
    expect(screen.getByText('Meanwhile, at the bottom of society...')).toBeInTheDocument();
  });

  it('renders lower class display name', () => {
    render(<PreReservationState classes={mockClasses} onComplete={() => {}} />);
    expect(screen.getByText('Lower Deaflings')).toBeInTheDocument();
  });

  it('renders lower class population percentage', () => {
    render(<PreReservationState classes={mockClasses} onComplete={() => {}} />);
    expect(screen.getByText('(15% of population)')).toBeInTheDocument();
  });

  it('renders lower class metric labels', () => {
    render(<PreReservationState classes={mockClasses} onComplete={() => {}} />);
    expect(screen.getByText('Poverty')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Employment')).toBeInTheDocument();
    expect(screen.getByText('Life Exp.')).toBeInTheDocument();
  });

  it('renders lower class metric values', () => {
    render(<PreReservationState classes={mockClasses} onComplete={() => {}} />);
    // poverty = 65, education = 3, employment = 5, lifeExpectancy = 62
    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('62')).toBeInTheDocument();
  });

  it('renders upper class comparison section', () => {
    render(<PreReservationState classes={mockClasses} onComplete={() => {}} />);
    expect(screen.getByText(/Meanwhile, the Upper Harmonics:/)).toBeInTheDocument();
  });

  it('renders upper class comparison metrics', () => {
    render(<PreReservationState classes={mockClasses} onComplete={() => {}} />);
    // upper education = 90, poverty = 2, lifeExpectancy = 78
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('2%')).toBeInTheDocument();
    expect(screen.getByText('78 yrs')).toBeInTheDocument();
  });

  it('renders a Continue button', () => {
    render(<PreReservationState classes={mockClasses} onComplete={() => {}} />);
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('calls onComplete when Continue button is clicked', () => {
    const onComplete = vi.fn();
    render(<PreReservationState classes={mockClasses} onComplete={onComplete} />);

    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onComplete when skip button is clicked', () => {
    const onComplete = vi.fn();
    render(<PreReservationState classes={mockClasses} onComplete={onComplete} />);

    const skipButton = screen.getByRole('button', { name: /skip/i });
    fireEvent.click(skipButton);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
