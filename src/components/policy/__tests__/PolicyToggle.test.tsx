/**
 * PolicyToggle Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PolicyToggle } from '../PolicyToggle';

describe('PolicyToggle', () => {
  const defaultProps = {
    label: 'Apply Creamy Layer',
    enabled: false,
    onToggle: vi.fn(),
  };

  it('renders label', () => {
    render(<PolicyToggle {...defaultProps} />);
    expect(screen.getByText('Apply Creamy Layer')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <PolicyToggle {...defaultProps} description="Excludes wealthy beneficiaries" />
    );
    expect(screen.getByText('Excludes wealthy beneficiaries')).toBeInTheDocument();
  });

  it('calls onToggle when switch is clicked', () => {
    const onToggle = vi.fn();
    render(<PolicyToggle {...defaultProps} onToggle={onToggle} />);

    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);

    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('has correct aria-checked when enabled', () => {
    render(<PolicyToggle {...defaultProps} enabled={true} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('has correct aria-checked when disabled', () => {
    render(<PolicyToggle {...defaultProps} enabled={false} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('does not call onToggle when disabled', () => {
    const onToggle = vi.fn();
    render(<PolicyToggle {...defaultProps} onToggle={onToggle} disabled={true} />);

    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);

    expect(onToggle).not.toHaveBeenCalled();
  });

  it('shows threshold slider when enabled and showThreshold is true', () => {
    render(
      <PolicyToggle
        {...defaultProps}
        enabled={true}
        showThreshold={true}
        thresholdValue={5000}
      />
    );

    expect(screen.getByText('Income Threshold')).toBeInTheDocument();
    expect(screen.getByText('5,000 credits/month')).toBeInTheDocument();
  });

  it('hides threshold slider when not enabled', () => {
    render(
      <PolicyToggle
        {...defaultProps}
        enabled={false}
        showThreshold={true}
        thresholdValue={5000}
      />
    );

    expect(screen.queryByText('Income Threshold')).not.toBeInTheDocument();
  });

  it('calls onThresholdChange when threshold slider changes', () => {
    const onThresholdChange = vi.fn();
    render(
      <PolicyToggle
        {...defaultProps}
        enabled={true}
        showThreshold={true}
        thresholdValue={5000}
        onThresholdChange={onThresholdChange}
      />
    );

    const thresholdSlider = screen.getByLabelText('Income threshold');
    fireEvent.change(thresholdSlider, { target: { value: '8000' } });

    expect(onThresholdChange).toHaveBeenCalledWith(8000);
  });
});
