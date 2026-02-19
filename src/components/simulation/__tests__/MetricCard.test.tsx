import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../MetricCard';
import type { NarrativeHighlight } from '@/lib/simulation/types';

describe('MetricCard', () => {
  const mockHighlight: NarrativeHighlight = {
    classDisplayName: 'Lower Deaflings',
    classTier: 'lower',
    metric: 'education',
    fromValue: 3,
    toValue: 52,
    change: 49,
    percentChange: 1633,
  };

  it('renders class display name', () => {
    render(<MetricCard highlight={mockHighlight} animate={false} />);

    expect(screen.getByText('Lower Deaflings')).toBeInTheDocument();
  });

  it('renders metric label', () => {
    render(<MetricCard highlight={mockHighlight} animate={false} />);

    expect(screen.getByText(/education access/i)).toBeInTheDocument();
  });

  it('shows from and to values', () => {
    render(<MetricCard highlight={mockHighlight} animate={false} />);

    expect(screen.getByText(/3\.0%/)).toBeInTheDocument();
    expect(screen.getByText(/52\.0%/)).toBeInTheDocument();
  });

  it('shows positive change badge for improvements', () => {
    render(<MetricCard highlight={mockHighlight} animate={false} />);

    // Positive education change
    expect(screen.getByText(/\+49\.0%/)).toBeInTheDocument();
    expect(screen.getByText(/improvement/i)).toBeInTheDocument();
  });

  it('handles poverty metric (lower is better)', () => {
    const povertyHighlight: NarrativeHighlight = {
      classDisplayName: 'Lower Deaflings',
      classTier: 'lower',
      metric: 'poverty',
      fromValue: 65,
      toValue: 18,
      change: -47,
      percentChange: -72,
    };

    render(<MetricCard highlight={povertyHighlight} animate={false} />);

    // Should show improvement for poverty reduction
    expect(screen.getByText(/improvement/i)).toBeInTheDocument();
  });

  it('has colored border matching class tier', () => {
    const { container } = render(
      <MetricCard highlight={mockHighlight} animate={false} />
    );

    // Lower class color is red (#e94560)
    const card = container.querySelector('.rounded-xl');
    expect(card).toHaveStyle({ borderColor: '#e94560' });
  });

  it('renders without animation when animate is false', () => {
    const { container } = render(
      <MetricCard highlight={mockHighlight} animate={false} />
    );

    // Should not have motion wrapper
    expect(container.querySelector('[data-framer-motion-wrapper]')).toBeNull();
  });
});
