/**
 * ReservationSlider Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReservationSlider } from '../ReservationSlider';

describe('ReservationSlider', () => {
  const defaultProps = {
    tier: 'lower' as const,
    displayName: 'Lower Deaflings',
    population: 15,
    value: 27,
    onChange: vi.fn(),
  };

  it('renders class display name', () => {
    render(<ReservationSlider {...defaultProps} />);
    expect(screen.getByText('Lower Deaflings')).toBeInTheDocument();
  });

  it('renders population percentage', () => {
    render(<ReservationSlider {...defaultProps} />);
    expect(screen.getByText('15% of population')).toBeInTheDocument();
  });

  it('renders current value', () => {
    render(<ReservationSlider {...defaultProps} />);
    expect(screen.getByText('27%')).toBeInTheDocument();
  });

  it('calls onChange when slider value changes', () => {
    const onChange = vi.fn();
    render(<ReservationSlider {...defaultProps} onChange={onChange} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '35' } });

    expect(onChange).toHaveBeenCalledWith(35);
  });

  it('shows benefit message when value > 0', () => {
    render(<ReservationSlider {...defaultProps} value={20} />);
    expect(screen.getByText(/will benefit/i)).toBeInTheDocument();
  });

  it('shows no reservation message when value is 0', () => {
    render(<ReservationSlider {...defaultProps} value={0} />);
    expect(screen.getByText(/no reservation/i)).toBeInTheDocument();
  });

  it('disables slider when disabled prop is true', () => {
    render(<ReservationSlider {...defaultProps} disabled={true} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('has proper aria-label', () => {
    render(<ReservationSlider {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-label', 'Reservation percentage for Lower Deaflings');
  });
});
