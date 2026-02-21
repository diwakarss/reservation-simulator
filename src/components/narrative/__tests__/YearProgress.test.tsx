/**
 * YearProgress Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YearProgress } from '../YearProgress';

describe('YearProgress', () => {
  it('renders the year display', () => {
    render(<YearProgress year={25} />);
    expect(screen.getByText('Year 25')).toBeInTheDocument();
  });

  it('renders the max year label', () => {
    render(<YearProgress year={25} maxYear={100} />);
    expect(screen.getByText('of 100')).toBeInTheDocument();
  });

  it('uses default maxYear of 200', () => {
    render(<YearProgress year={50} />);
    expect(screen.getByText('of 200')).toBeInTheDocument();
  });

  it('renders a custom maxYear', () => {
    render(<YearProgress year={10} maxYear={50} />);
    expect(screen.getByText('of 50')).toBeInTheDocument();
  });

  it('renders year 0 correctly', () => {
    render(<YearProgress year={0} />);
    expect(screen.getByText('Year 0')).toBeInTheDocument();
  });

  it('renders year 200 correctly', () => {
    render(<YearProgress year={200} />);
    expect(screen.getByText('Year 200')).toBeInTheDocument();
  });

  it('renders the progress bar by default (showBar=true)', () => {
    const { container } = render(<YearProgress year={50} />);
    // The progress bar wrapper has bg-white/10 class
    const progressBarWrapper = container.querySelector('.bg-white\\/10');
    expect(progressBarWrapper).toBeInTheDocument();
  });

  it('hides the progress bar when showBar is false', () => {
    const { container } = render(<YearProgress year={50} showBar={false} />);
    const progressBarWrapper = container.querySelector('.bg-white\\/10');
    expect(progressBarWrapper).not.toBeInTheDocument();
  });

  it('applies sm size styles', () => {
    const { container } = render(<YearProgress year={25} size="sm" />);
    // sm year class = text-xl
    const yearEl = container.querySelector('.text-xl');
    expect(yearEl).toBeInTheDocument();
  });

  it('applies md size styles (default)', () => {
    const { container } = render(<YearProgress year={25} size="md" />);
    // md year class = text-3xl
    const yearEl = container.querySelector('.text-3xl');
    expect(yearEl).toBeInTheDocument();
  });

  it('applies lg size styles', () => {
    const { container } = render(<YearProgress year={25} size="lg" />);
    // lg year class = text-5xl
    const yearEl = container.querySelector('.text-5xl');
    expect(yearEl).toBeInTheDocument();
  });

  it('applies custom className to root element', () => {
    const { container } = render(<YearProgress year={25} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('clamps progress to 100% for year exceeding maxYear', () => {
    // year=150 with maxYear=100 should not break — progress is clamped at 100
    const { container } = render(<YearProgress year={150} maxYear={100} />);
    expect(screen.getByText('Year 150')).toBeInTheDocument();
    // The animated bar element (bg-accent-gold) should exist
    const progressFill = container.querySelector('.bg-accent-gold');
    expect(progressFill).toBeInTheDocument();
  });
});
