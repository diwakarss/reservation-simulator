/**
 * PolicyRemoval Component Tests
 *
 * Tests for the Year 160 three-branch decision screen per PLAN.md Task 9:
 * - "Remove All Reservations" → onRemoveAll callback
 * - "Continue With Current Policy" → onContinue callback
 * - "Adjust Percentages" → onAdjust callback (opens settings drawer)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PolicyRemoval } from '../PolicyRemoval';
import type { SocialClass, YearSnapshot } from '@/lib/simulation/types';
import { createDefaultReservationPolicy } from '@/lib/simulation/types';

// ─── Test Fixtures ──────────────────────────────────────────────────────────

function makeSocialClass(tier: SocialClass['tier'], overrides: Partial<SocialClass['metrics']> = {}): SocialClass {
  const baseMetrics = {
    education: 30,
    employment: 40,
    wealth: 20,
    poverty: 20,
    lifeExpectancy: 68,
    incomePerCapita: 5000,
  };
  return {
    tier,
    displayName: `${tier.charAt(0).toUpperCase() + tier.slice(1)} TestName`,
    population: 20,
    metrics: { ...baseMetrics, ...overrides },
  };
}

const defaultClasses: SocialClass[] = [
  makeSocialClass('upper', { education: 70, poverty: 5, incomePerCapita: 40000 }),
  makeSocialClass('noble', { education: 50, poverty: 10, incomePerCapita: 25000 }),
  makeSocialClass('middle', { education: 35, poverty: 20, incomePerCapita: 12000 }),
  makeSocialClass('common', { education: 20, poverty: 35, incomePerCapita: 6000 }),
  makeSocialClass('lower', { education: 25, poverty: 30, incomePerCapita: 1200 }),
];

const year0Classes: SocialClass[] = [
  makeSocialClass('upper', { education: 45, poverty: 8, incomePerCapita: 35000 }),
  makeSocialClass('noble', { education: 30, poverty: 15, incomePerCapita: 20000 }),
  makeSocialClass('middle', { education: 20, poverty: 30, incomePerCapita: 10000 }),
  makeSocialClass('common', { education: 10, poverty: 50, incomePerCapita: 5000 }),
  makeSocialClass('lower', { education: 3, poverty: 65, incomePerCapita: 500 }),
];

const year0Snapshot: YearSnapshot = {
  year: 0,
  classes: year0Classes,
  policy: createDefaultReservationPolicy(),
  aggregates: {
    avgEducation: 20,
    avgEmployment: 25,
    wealthGini: 0.6,
    overallPoverty: 35,
    avgLifeExpectancy: 65,
    totalPopulation: 100,
  },
};

const defaultPolicies = createDefaultReservationPolicy().classes;

// Create policies with reservations for testing context-aware behavior
function createPoliciesWithReservations() {
  const policies = createDefaultReservationPolicy().classes;
  policies.lower.reservationPercent = 27;
  policies.common.reservationPercent = 15;
  return policies;
}

function renderPolicyRemoval(overrides: Partial<Parameters<typeof PolicyRemoval>[0]> = {}) {
  const defaultProps = {
    classes: defaultClasses,
    year0Snapshot,
    policies: defaultPolicies,
    onRemoveAll: vi.fn(),
    onContinue: vi.fn(),
    onAdjust: vi.fn(),
    onHowItWorks: vi.fn(),
    onSettings: vi.fn(),
    onCharts: vi.fn(),
  };
  return render(<PolicyRemoval {...defaultProps} {...overrides} />);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('PolicyRemoval', () => {
  it('renders without crashing', () => {
    renderPolicyRemoval();
    // If it renders at all, this passes
    expect(document.body).toBeTruthy();
  });

  it('displays protest header content when reservations exist', () => {
    renderPolicyRemoval({ policies: createPoliciesWithReservations() });
    expect(screen.getByText(/protests across the nation/i)).toBeInTheDocument();
  });

  it('displays demand for reservations when no reservations exist', () => {
    renderPolicyRemoval(); // default policies have no reservations
    expect(screen.getByText(/majority demands reservations/i)).toBeInTheDocument();
  });

  it('shows Year 160 title', () => {
    renderPolicyRemoval();
    // Use getAllByText since year appears multiple times, check at least one exists
    const yearElements = screen.getAllByText(/year 160/i);
    expect(yearElements.length).toBeGreaterThan(0);
  });

  it('shows "What do you want to do?" decision prompt', () => {
    renderPolicyRemoval();
    expect(screen.getByText(/what do you want to do/i)).toBeInTheDocument();
  });

  it('has "Remove All Reservations" button that calls onRemoveAll when reservations exist', () => {
    const onRemoveAll = vi.fn();
    renderPolicyRemoval({ onRemoveAll, policies: createPoliciesWithReservations() });

    const btn = screen.getByRole('button', { name: /remove all reservations/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onRemoveAll).toHaveBeenCalledTimes(1);
  });

  it('has "Continue With Current Policy" button that calls onContinue when reservations exist', () => {
    const onContinue = vi.fn();
    renderPolicyRemoval({ onContinue, policies: createPoliciesWithReservations() });

    const btn = screen.getByRole('button', { name: /continue with current policy/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('has "Continue Without Reservations" button when no reservations exist', () => {
    const onContinue = vi.fn();
    renderPolicyRemoval({ onContinue }); // default policies have no reservations

    const btn = screen.getByRole('button', { name: /continue without reservations/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('has "Adjust Percentages" button that calls onAdjust when reservations exist', () => {
    const onAdjust = vi.fn();
    renderPolicyRemoval({ onAdjust, policies: createPoliciesWithReservations() });

    const btn = screen.getByRole('button', { name: /adjust percentages/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onAdjust).toHaveBeenCalledTimes(1);
  });

  it('has "Implement Reservations" button that calls onAdjust when no reservations exist', () => {
    const onAdjust = vi.fn();
    renderPolicyRemoval({ onAdjust }); // default policies have no reservations

    const btn = screen.getByRole('button', { name: /implement reservations/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onAdjust).toHaveBeenCalledTimes(1);
  });

  it('does not call onContinue when Remove All is clicked (with reservations)', () => {
    const onRemoveAll = vi.fn();
    const onContinue = vi.fn();
    const onAdjust = vi.fn();
    renderPolicyRemoval({ onRemoveAll, onContinue, onAdjust, policies: createPoliciesWithReservations() });

    fireEvent.click(screen.getByRole('button', { name: /remove all reservations/i }));
    expect(onContinue).not.toHaveBeenCalled();
    expect(onAdjust).not.toHaveBeenCalled();
  });

  it('does not call onRemoveAll when Continue is clicked (with reservations)', () => {
    const onRemoveAll = vi.fn();
    const onContinue = vi.fn();
    const onAdjust = vi.fn();
    renderPolicyRemoval({ onRemoveAll, onContinue, onAdjust, policies: createPoliciesWithReservations() });

    fireEvent.click(screen.getByRole('button', { name: /continue with current policy/i }));
    expect(onRemoveAll).not.toHaveBeenCalled();
    expect(onAdjust).not.toHaveBeenCalled();
  });

  it('does not call onRemoveAll when Adjust is clicked (with reservations)', () => {
    const onRemoveAll = vi.fn();
    const onContinue = vi.fn();
    const onAdjust = vi.fn();
    renderPolicyRemoval({ onRemoveAll, onContinue, onAdjust, policies: createPoliciesWithReservations() });

    fireEvent.click(screen.getByRole('button', { name: /adjust percentages/i }));
    expect(onRemoveAll).not.toHaveBeenCalled();
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('returns null when upper class is missing', () => {
    const classesWithoutUpper = defaultClasses.filter((c) => c.tier !== 'upper');
    const { container } = renderPolicyRemoval({ classes: classesWithoutUpper });
    expect(container.firstChild).toBeNull();
  });

  it('returns null when lower class is missing', () => {
    const classesWithoutLower = defaultClasses.filter((c) => c.tier !== 'lower');
    const { container } = renderPolicyRemoval({ classes: classesWithoutLower });
    expect(container.firstChild).toBeNull();
  });
});
