/**
 * NarrativeScreen Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NarrativeScreen, NarrativeLine } from '../NarrativeScreen';

describe('NarrativeScreen', () => {
  it('renders children correctly', () => {
    render(
      <NarrativeScreen>
        <p>Test content</p>
      </NarrativeScreen>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders skip button when showSkip is true and onSkip is provided', () => {
    const onSkip = vi.fn();
    render(
      <NarrativeScreen onSkip={onSkip} showSkip={true}>
        <p>Content</p>
      </NarrativeScreen>
    );
    // Skip button has aria-label
    const skipButton = screen.getByRole('button', { name: /skip/i });
    expect(skipButton).toBeInTheDocument();
  });

  it('calls onSkip when skip button is clicked', async () => {
    const onSkip = vi.fn();
    render(
      <NarrativeScreen onSkip={onSkip} showSkip={true}>
        <p>Content</p>
      </NarrativeScreen>
    );

    // Wait for animation
    await vi.waitFor(() => {
      const skipButton = screen.getByRole('button', { name: /skip/i });
      fireEvent.click(skipButton);
    });

    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('does not render skip button when showSkip is false', () => {
    render(
      <NarrativeScreen onSkip={() => {}} showSkip={false}>
        <p>Content</p>
      </NarrativeScreen>
    );
    expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument();
  });

  it('uses custom skip text', () => {
    render(
      <NarrativeScreen onSkip={() => {}} showSkip={true} skipText="Pass">
        <p>Content</p>
      </NarrativeScreen>
    );
    expect(screen.getByText('Pass')).toBeInTheDocument();
  });
});

describe('NarrativeLine', () => {
  it('renders text content', () => {
    render(<NarrativeLine>Test line</NarrativeLine>);
    expect(screen.getByText('Test line')).toBeInTheDocument();
  });

  it('applies highlight styles when highlight is true', () => {
    render(<NarrativeLine highlight>Highlighted text</NarrativeLine>);
    const element = screen.getByText('Highlighted text');
    expect(element.className).toContain('text-accent-gold');
  });

  it('applies additional className', () => {
    render(<NarrativeLine className="custom-class">Text</NarrativeLine>);
    const element = screen.getByText('Text');
    expect(element.className).toContain('custom-class');
  });
});
