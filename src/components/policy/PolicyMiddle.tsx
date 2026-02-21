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
  year0Snapshot: YearSnapshot;
  /** Current policy for middle class */
  middlePolicy: ClassPolicy;
  /** Lower class reservation percent (from previous step) */
  lowerReservation: number;
  /** Common class reservation percent (from previous step) */
  commonReservation: number;
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
  year0Snapshot,
  middlePolicy,
  lowerReservation,
  commonReservation,
  onMiddlePolicyChange,
  onAdvance,
  onHowItWorks,
  onSettings,
  onCharts,
}: PolicyMiddleProps) {
  const lowerClass = classes.find((c) => c.tier === 'lower');
  const commonClass = classes.find((c) => c.tier === 'common');
  const middleClass = classes.find((c) => c.tier === 'middle');

  const prevLower = year0Snapshot.classes.find((c) => c.tier === 'lower');
  const prevCommon = year0Snapshot.classes.find((c) => c.tier === 'common');
  const prevMiddle = year0Snapshot.classes.find((c) => c.tier === 'middle');

  if (!lowerClass || !commonClass || !middleClass || !prevLower || !prevCommon || !prevMiddle) {
    return null;
  }

  // Generate context-aware subtitle based on reservation policies
  const hasReservation = lowerReservation > 0 || commonReservation > 0;
  const progressSubtitle = hasReservation
    ? `Reservation policies have shaped the last 20 years`
    : `The economy evolved naturally without reservation policies`;

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
      <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white text-center mb-2">
        20 Years of Progress
      </h2>
      <p className="text-center text-lg text-white/70 mb-6">
        {progressSubtitle}
      </p>

      {/* Progress section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProgressCard
            tier="lower"
            displayName={lowerClass.displayName}
            previousMetrics={prevLower.metrics}
            currentMetrics={lowerClass.metrics}
            reservationPercent={lowerReservation}
          />
          <ProgressCard
            tier="common"
            displayName={commonClass.displayName}
            previousMetrics={prevCommon.metrics}
            currentMetrics={commonClass.metrics}
            reservationPercent={commonReservation}
          />
        </div>
      </div>

      {/* Middle class struggle */}
      <ExplanationBox title="But the Middle Class is Struggling" titleClassName="text-lg sm:text-xl" className="mb-8">
        <p className="mb-3 text-base">
          <strong>{middleClass.displayName}</strong> has seen minimal improvement:
        </p>
        <ul className="list-disc list-inside space-y-2 text-base">
          <li>Education: {prevMiddle.metrics.education.toFixed(1)}% → {middleClass.metrics.education.toFixed(1)}% (minimal gain)</li>
          <li>Poverty: {prevMiddle.metrics.poverty.toFixed(1)}% → {middleClass.metrics.poverty.toFixed(1)}% (stagnant)</li>
          <li>They receive no reservation benefits</li>
        </ul>
      </ExplanationBox>

      {/* Question */}
      <p className="text-center text-xl text-white/80 mb-6">
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
