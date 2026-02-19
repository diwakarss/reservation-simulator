'use client';

/**
 * PolicyMiddle
 *
 * Year 20 screen: Show progress, ask to extend reservation to Middle class.
 */

import { PolicyLayout } from './PolicyLayout';
import { ReservationSlider } from './ReservationSlider';
import { ProgressCard } from './ProgressCard';
import { ExplanationBox } from '@/components/ui/ExplanationBox';
import type { SocialClass, ClassPolicy, YearSnapshot } from '@/lib/simulation/types';

interface PolicyMiddleProps {
  /** Social classes data */
  classes: SocialClass[];
  /** Previous snapshot (Year 0) */
  previousSnapshot: YearSnapshot;
  /** Current policy for middle class */
  middlePolicy: ClassPolicy;
  /** Called when middle class policy changes */
  onMiddlePolicyChange: (value: number) => void;
  /** Called when user advances to next year */
  onAdvance: () => void;
  /** Called when How It Works is clicked */
  onHowItWorks: () => void;
  /** Called when Settings is clicked */
  onSettings: () => void;
  /** Called when Charts is clicked */
  onCharts: () => void;
}

export function PolicyMiddle({
  classes,
  previousSnapshot,
  middlePolicy,
  onMiddlePolicyChange,
  onAdvance,
  onHowItWorks,
  onSettings,
  onCharts,
}: PolicyMiddleProps) {
  const lowerClass = classes.find((c) => c.tier === 'lower');
  const commonClass = classes.find((c) => c.tier === 'common');
  const middleClass = classes.find((c) => c.tier === 'middle');

  const prevLower = previousSnapshot.classes.find((c) => c.tier === 'lower');
  const prevCommon = previousSnapshot.classes.find((c) => c.tier === 'common');
  const prevMiddle = previousSnapshot.classes.find((c) => c.tier === 'middle');

  if (!lowerClass || !commonClass || !middleClass || !prevLower || !prevCommon || !prevMiddle) {
    return null;
  }

  return (
    <PolicyLayout
      year={20}
      primaryActionText="Apply & Advance 20 Years"
      onPrimaryAction={onAdvance}
      showHowItWorks={true}
      onHowItWorks={onHowItWorks}
      showSettings={true}
      onSettings={onSettings}
      showCharts={true}
      onCharts={onCharts}
    >
      {/* Title */}
      <h2 className="font-orbitron text-2xl sm:text-3xl font-bold text-white text-center mb-6">
        20 Years of Progress
      </h2>

      {/* Progress section */}
      <div className="mb-8">
        <h3 className="font-rajdhani text-lg font-semibold text-accent-gold mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span>
          Due to reservation policies:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProgressCard
            tier="lower"
            displayName={lowerClass.displayName}
            previousMetrics={prevLower.metrics}
            currentMetrics={lowerClass.metrics}
          />
          <ProgressCard
            tier="common"
            displayName={commonClass.displayName}
            previousMetrics={prevCommon.metrics}
            currentMetrics={commonClass.metrics}
          />
        </div>
      </div>

      {/* Middle class struggle */}
      <ExplanationBox title="But the Middle Class is Struggling" className="mb-8">
        <p className="mb-2">
          <strong>{middleClass.displayName}</strong> has seen minimal improvement:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Education: {prevMiddle.metrics.education}% → {middleClass.metrics.education}% (minimal gain)</li>
          <li>Poverty: {prevMiddle.metrics.poverty}% → {middleClass.metrics.poverty}% (stagnant)</li>
          <li>They receive no reservation benefits</li>
        </ul>
      </ExplanationBox>

      {/* Question */}
      <p className="text-center text-lg text-muted-text mb-6">
        Do you want to extend reservation to the Middle class?
      </p>

      {/* Slider */}
      <div className="max-w-md mx-auto">
        <ReservationSlider
          tier="middle"
          displayName={middleClass.displayName}
          population={middleClass.population}
          value={middlePolicy.reservationPercent}
          onChange={onMiddlePolicyChange}
        />
      </div>
    </PolicyLayout>
  );
}

export default PolicyMiddle;
