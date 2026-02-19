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
  it('renders all 5 class names', () => {
    render(<ClassPyramid classes={mockClasses} animate={false} />);

    expect(screen.getByText('Upper Harmonics')).toBeInTheDocument();
    expect(screen.getByText('Noble Vibrants')).toBeInTheDocument();
    expect(screen.getByText('Middle Oscillants')).toBeInTheDocument();
    expect(screen.getByText('Common Buzzers')).toBeInTheDocument();
    expect(screen.getByText('Lower Deaflings')).toBeInTheDocument();
  });

  it('renders population percentages', () => {
    // Disable legend to avoid duplicate percentage elements
    render(<ClassPyramid classes={mockClasses} animate={false} showLegend={false} />);

    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  it('renders legend when showLegend is true', () => {
    render(<ClassPyramid classes={mockClasses} showLegend={true} animate={false} />);

    expect(screen.getByText('Population Distribution')).toBeInTheDocument();
  });

  it('does not render legend when showLegend is false', () => {
    render(<ClassPyramid classes={mockClasses} showLegend={false} animate={false} />);

    expect(screen.queryByText('Population Distribution')).not.toBeInTheDocument();
  });

  it('sorts classes by tier order (upper first)', () => {
    // Pass classes in random order
    const shuffledClasses = [
      mockClasses[4], // lower
      mockClasses[0], // upper
      mockClasses[2], // middle
      mockClasses[1], // noble
      mockClasses[3], // common
    ];

    const { container } = render(
      <ClassPyramid classes={shuffledClasses} animate={false} />
    );

    // Get all class name elements
    const classNames = container.querySelectorAll('.font-rajdhani.font-bold');
    const nameTexts = Array.from(classNames)
      .filter((el) => el.textContent?.includes('Upper') ||
                       el.textContent?.includes('Noble') ||
                       el.textContent?.includes('Middle') ||
                       el.textContent?.includes('Common') ||
                       el.textContent?.includes('Lower'))
      .map((el) => el.textContent);

    // First class should be Upper (index 0)
    expect(nameTexts[0]).toContain('Upper');
    // Last class should be Lower (index 4)
    expect(nameTexts[4]).toContain('Lower');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ClassPyramid classes={mockClasses} className="custom-class" animate={false} />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
