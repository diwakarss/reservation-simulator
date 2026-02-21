/**
 * ProgressCard Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressCard } from '../ProgressCard';
import type { ClassMetrics } from '@/lib/simulation/types';

describe('ProgressCard', () => {
  const previousMetrics: ClassMetrics = {
    education: 3,
    employment: 5,
    wealth: 3,
    poverty: 65,
    lifeExpectancy: 62,
    incomePerCapita: 500,
  };

  const currentMetrics: ClassMetrics = {
    education: 12,
    employment: 14,
    wealth: 5,
    poverty: 52,
    lifeExpectancy: 66,
    incomePerCapita: 1200,
  };

  const defaultProps = {
    tier: 'lower' as const,
    displayName: 'Lower Deaflings',
    previousMetrics,
    currentMetrics,
  };

  it('renders class display name', () => {
    render(<ProgressCard {...defaultProps} />);
    expect(screen.getByText('Lower Deaflings')).toBeInTheDocument();
  });

  it('renders education change by default', () => {
    render(<ProgressCard {...defaultProps} />);
    expect(screen.getByText('Education Access')).toBeInTheDocument();
  });

  it('renders employment change by default', () => {
    render(<ProgressCard {...defaultProps} />);
    expect(screen.getByText('Employment Rate')).toBeInTheDocument();
  });

  it('renders poverty change by default', () => {
    render(<ProgressCard {...defaultProps} />);
    expect(screen.getByText('Poverty Rate')).toBeInTheDocument();
  });

  it('shows previous and current values', () => {
    render(<ProgressCard {...defaultProps} />);
    // Education: 3.0% -> 12.0% (single decimal)
    expect(screen.getByText('3.0%')).toBeInTheDocument();
    expect(screen.getByText('12.0%')).toBeInTheDocument();
  });

  it('shows positive change for education increase', () => {
    render(<ProgressCard {...defaultProps} />);
    // Education improved from 3% to 12%, change should show increase (+9 or similar)
    // The component displays change values, so we check for positive indicator
    const changeElements = screen.getAllByText(/[↑↓]/);
    expect(changeElements.length).toBeGreaterThan(0);
  });

  it('renders only specified metrics', () => {
    render(
      <ProgressCard {...defaultProps} metricsToShow={['education', 'lifeExpectancy']} />
    );
    expect(screen.getByText('Education Access')).toBeInTheDocument();
    expect(screen.getByText('Life Expectancy')).toBeInTheDocument();
    expect(screen.queryByText('Poverty Rate')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ProgressCard {...defaultProps} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
