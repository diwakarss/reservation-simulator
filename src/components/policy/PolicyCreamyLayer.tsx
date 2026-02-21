'use client';

/**
 * PolicyCreamyLayer
 *
 * Year 40 screen: Upper classes advocate for Creamy Layer exclusion.
 */

import { PolicyLayout } from './PolicyLayout';
import { PolicyToggle } from './PolicyToggle';
import { ProgressCard } from './ProgressCard';
import type { SocialClass, ClassPolicy, ClassTier, YearSnapshot } from '@/lib/simulation/types';

interface PolicyCreamyLayerProps {
  /** Social classes data */
  classes: SocialClass[];
  /** Year 0 snapshot for comparison */
  year0Snapshot: YearSnapshot;
  /** Current policies */
  policies: Record<ClassTier, ClassPolicy>;
  /** Called when creamy layer is toggled for a class */
  onCreamyLayerToggle: (tier: ClassTier, enabled: boolean) => void;
  /** Called when creamy layer threshold changes for a class */
  onCreamyLayerThresholdChange: (tier: ClassTier, threshold: number) => void;
  /** Called when user advances to next year */
  onAdvance: () => void;
  /** Called when user rejects creamy layer */
  onReject: () => void;
  /** Called when How It Works is clicked */
  onHowItWorks: () => void;
  /** Called when Settings is clicked */
  onSettings: () => void;
  /** Called when Charts is clicked */
  onCharts: () => void;
}

export function PolicyCreamyLayer({
  classes,
  year0Snapshot,
  policies,
  onCreamyLayerToggle,
  onCreamyLayerThresholdChange,
  onAdvance,
  onReject,
  onHowItWorks,
  onSettings,
  onCharts,
}: PolicyCreamyLayerProps) {
  const lowerClass = classes.find((c) => c.tier === 'lower');
  const commonClass = classes.find((c) => c.tier === 'common');
  const middleClass = classes.find((c) => c.tier === 'middle');

  const prevLower = year0Snapshot.classes.find((c) => c.tier === 'lower');
  const prevCommon = year0Snapshot.classes.find((c) => c.tier === 'common');
  const prevMiddle = year0Snapshot.classes.find((c) => c.tier === 'middle');

  if (!lowerClass || !commonClass || !middleClass || !prevLower || !prevCommon || !prevMiddle) {
    return null;
  }

  // Calculate total reservation for context
  const totalReservation =
    policies.lower.reservationPercent +
    policies.common.reservationPercent +
    policies.middle.reservationPercent;

  // Check if reservations exist
  const hasReservations = totalReservation > 0;

  // Classes for progress cards - show all when no reservation, or only those with reservation
  const eligibleClasses = hasReservations
    ? [
        { tier: 'lower' as ClassTier, class: lowerClass, prev: prevLower },
        { tier: 'common' as ClassTier, class: commonClass, prev: prevCommon },
        { tier: 'middle' as ClassTier, class: middleClass, prev: prevMiddle },
      ].filter(({ tier }) => policies[tier].reservationPercent > 0)
    : [
        { tier: 'lower' as ClassTier, class: lowerClass, prev: prevLower },
        { tier: 'common' as ClassTier, class: commonClass, prev: prevCommon },
        { tier: 'middle' as ClassTier, class: middleClass, prev: prevMiddle },
      ];

  // Calculate education and poverty changes for context-aware title
  const lowerEduGain = lowerClass.metrics.education - prevLower.metrics.education;
  const lowerPovReduction = prevLower.metrics.poverty - lowerClass.metrics.poverty;

  // Generate context-aware title based on outcomes
  const getTitle = () => {
    if (hasReservations && lowerEduGain > 20 && lowerPovReduction > 10) {
      return 'Transformation Underway';
    } else if (hasReservations && lowerEduGain > 10) {
      return 'Rising Tides';
    } else if (hasReservations && lowerEduGain > 0) {
      return 'A Debate Emerges';
    } else if (!hasReservations && lowerEduGain > 10) {
      return 'Organic Growth';
    } else if (!hasReservations) {
      return 'Inequality Persists';
    }
    return 'Mixed Outcomes';
  };

  // Generate context-aware story continuation
  const getStorySummary = () => {
    if (totalReservation > 30) {
      return `With ${totalReservation}% total reservation in place, lower classes have seen significant mobility. However, this success has sparked new debates.`;
    } else if (totalReservation > 0) {
      return `Reservation policies continue to shape society. Some beneficiaries have prospered, leading to questions about who truly needs support.`;
    }
    return `Without reservation policies, 40 years have passed. Class dynamics have evolved through economic forces alone.`;
  };

  // When no reservations, just show a continue button
  const primaryActionText = hasReservations ? 'Apply Creamy Layer & Advance' : 'Continue to Year 60';
  const secondaryActionText = hasReservations ? 'Reject this demand' : undefined;

  return (
    <PolicyLayout
      year={40}
      primaryActionText={primaryActionText}
      onPrimaryAction={onAdvance}
      secondaryActionText={secondaryActionText}
      onSecondaryAction={hasReservations ? onReject : undefined}
      showHowItWorks={true}
      onHowItWorks={onHowItWorks}
      showSettings={true}
      onSettings={onSettings}
      showCharts={true}
      onCharts={onCharts}
    >
      {/* Title */}
      <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white text-center mb-2">
        Year 40: {getTitle()}
      </h2>
      <p className="text-center text-lg text-white/70 mb-6 max-w-lg mx-auto">
        {getStorySummary()}
      </p>

      {/* Progress Cards - Show classes with reservation */}
      {eligibleClasses.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eligibleClasses.map(({ tier, class: cls, prev }) => (
              <ProgressCard
                key={tier}
                tier={tier}
                displayName={cls.displayName}
                previousMetrics={prev.metrics}
                currentMetrics={cls.metrics}
                reservationPercent={policies[tier].reservationPercent}
              />
            ))}
          </div>
        </div>
      )}

      {/* Creamy Layer specific content - only when reservations exist */}
      {hasReservations ? (
        <>
          {/* Advocacy box - replacing "protest" with softer language */}
          <div className="bg-gradient-to-r from-accent-gold/10 to-accent-gold/5 border border-accent-gold/30 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-orbitron text-lg font-bold text-accent-gold mb-2">
                  A New Voice Emerges
                </h3>
                <p className="text-lg text-white/90 mb-2">
                  Upper class advocates are raising concerns:
                </p>
                <blockquote className="border-l-2 border-accent-gold/50 pl-4 italic text-white/70 text-base">
                  &ldquo;The wealthy among reserved classes are capturing all benefits while the truly poor remain neglected. We need income-based filtering.&rdquo;
                </blockquote>
                <p className="text-base text-accent-gold mt-3 font-semibold">
                  They propose: CREAMY LAYER exclusion
                </p>
              </div>
            </div>
          </div>

          {/* Explanation - with better visual */}
          <div className="bg-cosmic-blue/60 border border-white/10 rounded-xl p-5 mb-8">
            <h4 className="font-orbitron text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm">?</span>
              What is Creamy Layer?
            </h4>
            <p className="text-base text-white/70 mb-3">
              A mechanism that excludes beneficiaries whose family income exceeds a threshold from receiving reservation benefits.
            </p>
            <div className="grid grid-cols-2 gap-4 text-base">
              <div className="bg-class-noble/10 rounded-lg p-3">
                <p className="text-class-noble font-semibold mb-1">The Intent</p>
                <p className="text-white/70">Ensure benefits reach the most disadvantaged</p>
              </div>
              <div className="bg-highlight-red/10 rounded-lg p-3">
                <p className="text-highlight-red font-semibold mb-1">The Concern</p>
                <p className="text-white/70">May reduce overall policy effectiveness</p>
              </div>
            </div>
          </div>

          {/* Question */}
          <p className="text-center text-xl text-white font-rajdhani mb-6">
            Apply Creamy Layer exclusion?
          </p>

          {/* Toggles */}
          <div className="space-y-4 max-w-lg mx-auto">
            {eligibleClasses.map(({ tier, class: cls }) => (
              <PolicyToggle
                key={tier}
                label={`Apply to ${cls.displayName}`}
                description={`Current reservation: ${policies[tier].reservationPercent}%`}
                enabled={policies[tier].creamyLayerEnabled}
                onToggle={(enabled) => onCreamyLayerToggle(tier, enabled)}
                tier={tier}
                showThreshold={true}
                thresholdValue={policies[tier].creamyLayerThreshold}
                onThresholdChange={(value) => onCreamyLayerThresholdChange(tier, value)}
              />
            ))}
          </div>
        </>
      ) : (
        /* No reservations - show a reflection message */
        <div className="bg-cosmic-blue/60 border border-white/10 rounded-xl p-5 mb-6">
          <h4 className="font-orbitron text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm">i</span>
            40 Years Without Intervention
          </h4>
          <p className="text-base text-white/70 mb-3">
            Four decades have passed without reservation policies.
            The class structure continues to be shaped by economic forces alone.
          </p>
          <p className="text-base text-white/70">
            Lower classes face ongoing challenges in accessing education and economic opportunities.
            The debate about whether intervention is needed continues.
          </p>
        </div>
      )}
    </PolicyLayout>
  );
}

export default PolicyCreamyLayer;
