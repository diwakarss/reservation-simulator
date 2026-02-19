'use client';

/**
 * PolicyBottom2
 *
 * Year 0 screen: Initial reservation for bottom 2 classes (Lower + Common).
 * First policy decision in the simulation.
 */

import { useCallback, useState } from 'react';
import { PolicyLayout } from './PolicyLayout';
import { ReservationSlider } from './ReservationSlider';
import { ExplanationBox } from '@/components/ui/ExplanationBox';
import type { SocialClass, ClassPolicy } from '@/lib/simulation/types';

interface PolicyBottom2Props {
  /** Social classes data */
  classes: SocialClass[];
  /** Current policy for lower class */
  lowerPolicy: ClassPolicy;
  /** Current policy for common class */
  commonPolicy: ClassPolicy;
  /** Called when lower class policy changes */
  onLowerPolicyChange: (value: number) => void;
  /** Called when common class policy changes */
  onCommonPolicyChange: (value: number) => void;
  /** Called when user advances to next year */
  onAdvance: () => void;
  /** Called when user skips reservation */
  onSkip: () => void;
  /** Called when How It Works is clicked */
  onHowItWorks: () => void;
  /** Called when Settings is clicked */
  onSettings: () => void;
  /** Called when Charts is clicked */
  onCharts: () => void;
}

export function PolicyBottom2({
  classes,
  lowerPolicy,
  commonPolicy,
  onLowerPolicyChange,
  onCommonPolicyChange,
  onAdvance,
  onSkip,
  onHowItWorks,
  onSettings,
  onCharts,
}: PolicyBottom2Props) {
  const lowerClass = classes.find((c) => c.tier === 'lower');
  const commonClass = classes.find((c) => c.tier === 'common');

  if (!lowerClass || !commonClass) {
    return null;
  }

  const hasReservation = lowerPolicy.reservationPercent > 0 || commonPolicy.reservationPercent > 0;

  return (
    <PolicyLayout
      year={0}
      primaryActionText="Apply & Advance 20 Years"
      onPrimaryAction={onAdvance}
      secondaryActionText="Skip reservation, continue without"
      onSecondaryAction={onSkip}
      showHowItWorks={true}
      onHowItWorks={onHowItWorks}
      showSettings={true}
      onSettings={onSettings}
      showCharts={true}
      onCharts={onCharts}
      primaryDisabled={false}
    >
      {/* Title */}
      <h2 className="font-orbitron text-2xl sm:text-3xl font-bold text-white text-center mb-6">
        The Struggle of the Lower Classes
      </h2>

      {/* Explanation box */}
      <ExplanationBox title="What is Reservation?" className="mb-8">
        <p>
          Reservation guarantees a percentage of education seats and jobs for
          disadvantaged groups, helping them access opportunities historically
          denied to them.
        </p>
      </ExplanationBox>

      {/* Question */}
      <p className="text-center text-lg text-muted-text mb-6">
        Do you want to provide reservation for the bottom 2 classes?
      </p>

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ReservationSlider
          tier="lower"
          displayName={lowerClass.displayName}
          population={lowerClass.population}
          value={lowerPolicy.reservationPercent}
          onChange={onLowerPolicyChange}
        />

        <ReservationSlider
          tier="common"
          displayName={commonClass.displayName}
          population={commonClass.population}
          value={commonPolicy.reservationPercent}
          onChange={onCommonPolicyChange}
        />
      </div>

      {/* Warning if no reservation */}
      {!hasReservation && (
        <div className="text-center text-sm text-accent-gold/80 mb-4">
          <span className="inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Set at least some reservation to see its effects
          </span>
        </div>
      )}
    </PolicyLayout>
  );
}

export default PolicyBottom2;
