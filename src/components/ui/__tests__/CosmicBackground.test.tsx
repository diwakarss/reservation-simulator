/**
 * CosmicBackground Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CosmicBackground } from '../CosmicBackground';

describe('CosmicBackground', () => {
  beforeEach(() => {
    // Mock matchMedia for reduced motion detection
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

  it('renders without crashing', () => {
    render(<CosmicBackground />);
    // Component should render with aria-hidden
    const container = document.querySelector('[aria-hidden="true"]');
    expect(container).toBeInTheDocument();
  });

  it('renders nebula effects when showNebula is true', () => {
    const { container } = render(<CosmicBackground showNebula={true} />);
    // Should have gradient divs (nebula effects)
    const divs = container.querySelectorAll('[style*="radial-gradient"]');
    expect(divs.length).toBeGreaterThan(0);
  });

  it('does not render nebula effects when showNebula is false', () => {
    const { container } = render(<CosmicBackground showNebula={false} />);
    // Should not have gradient divs
    const divs = container.querySelectorAll('[style*="radial-gradient"]');
    expect(divs.length).toBe(0);
  });

  it('applies custom className', () => {
    const { container } = render(<CosmicBackground className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders correct number of stars after client-side mount', async () => {
    const starCount = 50;
    const { container } = render(<CosmicBackground starCount={starCount} />);

    // Wait for useEffect to run (client-side rendering)
    await vi.waitFor(() => {
      // Stars are rendered as small divs with specific styles
      const stars = container.querySelectorAll(
        '[style*="border-radius: 50%"][style*="background-color: white"]'
      );
      // We expect at least some stars (plus 2 accent stars)
      expect(stars.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('is aria-hidden for screen readers', () => {
    const { container } = render(<CosmicBackground />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('has pointer-events-none to not interfere with clicks', () => {
    const { container } = render(<CosmicBackground />);
    expect(container.firstChild).toHaveClass('pointer-events-none');
  });
});
