/**
 * ClassPyramid Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClassPyramid } from '../ClassPyramid';
import type { SocialClass } from '@/lib/simulation/types';

const mockClasses: SocialClass[] = [
  {
    tier: 'upper',
    displayName: 'Upper Harmonics',
    population: 10,
    metrics: {
      education: 45,
      employment: 80,
      wealth: 45,
      poverty: 5,
      lifeExpectancy: 72,
      incomePerCapita: 40000,
    },
  },
  {
    tier: 'noble',
    displayName: 'Noble Vibrants',
    population: 20,
    metrics: {
      education: 30,
      employment: 60,
      wealth: 25,
      poverty: 15,
      lifeExpectancy: 70,
      incomePerCapita: 25000,
    },
  },
  {
    tier: 'middle',
    displayName: 'Middle Oscillants',
    population: 30,
    metrics: {
      education: 20,
      employment: 40,
      wealth: 18,
      poverty: 25,
      lifeExpectancy: 68,
      incomePerCapita: 12000,
    },
  },
  {
    tier: 'common',
    displayName: 'Common Buzzers',
    population: 25,
    metrics: {
      education: 10,
      employment: 20,
      wealth: 9,
      poverty: 40,
      lifeExpectancy: 65,
      incomePerCapita: 6000,
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

describe('ClassPyramid', () => {
  it('renders the privileged vs majority divide', () => {
    render(<ClassPyramid classes={mockClasses} animate={false} />);

    expect(screen.getByText('The Privileged Few')).toBeInTheDocument();
    expect(screen.getByText('The Majority')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument(); // privileged pop
    expect(screen.getByText('70%')).toBeInTheDocument(); // majority pop
  });

  it('renders population distribution section', () => {
    render(<ClassPyramid classes={mockClasses} animate={false} />);

    expect(screen.getByText('Population Distribution')).toBeInTheDocument();
  });

  it('renders wealth and poverty pie charts', () => {
    render(<ClassPyramid classes={mockClasses} animate={false} />);

    expect(screen.getByText('Wealth Distribution')).toBeInTheDocument();
    expect(screen.getByText('Poverty Burden')).toBeInTheDocument();
  });

  it('renders the majority lags behind section', () => {
    render(<ClassPyramid classes={mockClasses} animate={false} />);

    expect(screen.getByText('The Majority Lags Behind')).toBeInTheDocument();
    expect(screen.getByText('Education Access')).toBeInTheDocument();
    expect(screen.getByText('Job Access')).toBeInTheDocument();
    expect(screen.getByText('Per Capita Income')).toBeInTheDocument();
  });

  it('calculates correct privileged population', () => {
    render(<ClassPyramid classes={mockClasses} animate={false} />);

    // Upper (10%) + Noble (20%) = 30%
    const privilegedSection = screen.getByText('The Privileged Few').closest('div');
    expect(privilegedSection?.parentElement?.textContent).toContain('30%');
  });

  it('calculates correct majority population', () => {
    render(<ClassPyramid classes={mockClasses} animate={false} />);

    // Middle (30%) + Common (25%) + Lower (15%) = 70%
    const majoritySection = screen.getByText('The Majority').closest('div');
    expect(majoritySection?.parentElement?.textContent).toContain('70%');
  });

  it('displays wealth percentages in the summary', () => {
    render(<ClassPyramid classes={mockClasses} animate={false} />);

    // Privileged wealth: Upper (45%) + Noble (25%) = 70%
    // Majority wealth: Middle (18%) + Common (9%) + Lower (3%) = 30%
    expect(screen.getByText(/30% control 70% of wealth/)).toBeInTheDocument();
    expect(screen.getByText(/70% share 30%/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ClassPyramid classes={mockClasses} className="custom-class" animate={false} />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('sorts classes by tier order regardless of input order', () => {
    // Pass classes in random order
    const shuffledClasses = [
      mockClasses[4], // lower
      mockClasses[0], // upper
      mockClasses[2], // middle
      mockClasses[1], // noble
      mockClasses[3], // common
    ];

    render(<ClassPyramid classes={shuffledClasses} animate={false} />);

    // The component should still render correctly with proper calculations
    expect(screen.getByText(/30% control 70% of wealth/)).toBeInTheDocument();
  });
});
