/**
 * HowItWorksOverlay Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HowItWorksOverlay } from '../HowItWorksOverlay';

describe('HowItWorksOverlay', () => {
  beforeEach(() => {
    // Mock window.open for whitepaper link
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    render(<HowItWorksOverlay isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog when isOpen is true', () => {
    render(<HowItWorksOverlay isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays the title', () => {
    render(<HowItWorksOverlay isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('How The Simulation Works')).toBeInTheDocument();
  });

  it('displays all metric sections', () => {
    render(<HowItWorksOverlay isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Employment')).toBeInTheDocument();
    expect(screen.getByText('Wealth')).toBeInTheDocument();
    expect(screen.getByText('Poverty')).toBeInTheDocument();
    expect(screen.getByText('Life Expectancy')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<HowItWorksOverlay isOpen={true} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when "Got It" button is clicked', () => {
    const onClose = vi.fn();
    render(<HowItWorksOverlay isOpen={true} onClose={onClose} />);

    const gotItButton = screen.getByRole('button', { name: /got it/i });
    fireEvent.click(gotItButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<HowItWorksOverlay isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('opens whitepaper in new tab when View Whitepaper is clicked', () => {
    render(<HowItWorksOverlay isOpen={true} onClose={() => {}} />);

    const whitepaperButton = screen.getByRole('button', { name: /view whitepaper/i });
    fireEvent.click(whitepaperButton);

    expect(window.open).toHaveBeenCalledWith('/whitepaper', '_blank');
  });

  it('has proper accessibility attributes', () => {
    render(<HowItWorksOverlay isOpen={true} onClose={() => {}} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'how-it-works-title');
  });
});
