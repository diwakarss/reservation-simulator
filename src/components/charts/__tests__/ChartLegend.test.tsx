import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartLegend } from '../ChartLegend';
import type { ClassTier } from '@/lib/simulation/types';

describe('ChartLegend', () => {
  const mockClassNames: Record<ClassTier, string> = {
    upper: 'Upper Harmonics',
    noble: 'Noble Vibrants',
    middle: 'Middle Oscillants',
    common: 'Common Buzzers',
    lower: 'Lower Deaflings',
  };

  it('renders all class names', () => {
    render(<ChartLegend classNames={mockClassNames} />);

    expect(screen.getByText('Upper Harmonics')).toBeInTheDocument();
    expect(screen.getByText('Noble Vibrants')).toBeInTheDocument();
    expect(screen.getByText('Middle Oscillants')).toBeInTheDocument();
    expect(screen.getByText('Common Buzzers')).toBeInTheDocument();
    expect(screen.getByText('Lower Deaflings')).toBeInTheDocument();
  });

  it('shows unique class names not generic Class 1-5', () => {
    render(<ChartLegend classNames={mockClassNames} />);

    // Should NOT have generic names
    expect(screen.queryByText('Class 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Class 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Class 3')).not.toBeInTheDocument();
    expect(screen.queryByText('Class 4')).not.toBeInTheDocument();
    expect(screen.queryByText('Class 5')).not.toBeInTheDocument();
  });

  it('renders colored dots for each class', () => {
    const { container } = render(<ChartLegend classNames={mockClassNames} />);

    // Should have 5 colored dots (rounded-full divs)
    const dots = container.querySelectorAll('.rounded-full');
    expect(dots.length).toBe(5);
  });

  it('renders vertically when specified', () => {
    const { container } = render(
      <ChartLegend classNames={mockClassNames} vertical />
    );

    // Should have flex-col class
    const legendContainer = container.querySelector('.flex-col');
    expect(legendContainer).toBeInTheDocument();
  });

  it('renders horizontally by default', () => {
    const { container } = render(<ChartLegend classNames={mockClassNames} />);

    // Should have flex-wrap and justify-center
    const legendContainer = container.querySelector('.flex-wrap');
    expect(legendContainer).toBeInTheDocument();
  });
});
