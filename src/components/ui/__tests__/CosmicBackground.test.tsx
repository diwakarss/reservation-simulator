/**
 * CosmicBackground Component Tests
 * Updated to match the simplified implementation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
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
    const { container } = render(<CosmicBackground />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has fixed positioning', () => {
    const { container } = render(<CosmicBackground />);
    expect(container.firstChild).toHaveClass('fixed');
  });

  it('has pointer-events-none to not interfere with clicks', () => {
    const { container } = render(<CosmicBackground />);
    expect(container.firstChild).toHaveClass('pointer-events-none');
  });

  it('renders nebula effect divs', () => {
    const { container } = render(<CosmicBackground />);
    // Should have nebula effect divs
    const nebulaEffects = container.querySelectorAll('[class*="absolute"]');
    expect(nebulaEffects.length).toBeGreaterThan(0);
  });

  it('has cosmic gradient background', () => {
    const { container } = render(<CosmicBackground />);
    expect(container.firstChild).toHaveClass('bg-gradient-to-br');
  });
});
