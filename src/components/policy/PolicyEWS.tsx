'use client';

/**
 * PolicyEWS
 *
 * Year 60 screen: Upper classes advocate for EWS reservation.
 */

import { PolicyLayout } from './PolicyLayout';
import { PolicyToggle } from './PolicyToggle';
import { ProgressCard } from './ProgressCard';
import type { SocialClass, ClassPolicy, ClassTier, YearSnapshot } from '@/lib/simulation/types';

interface PolicyEWSProps {
  /** Social classes data */
  classes: SocialClass[];
  /** Year 0 snapshot for comparison */
  year0Snapshot: YearSnapshot;
  /** Current policies */
  policies: Record<ClassTier, ClassPolicy>;
  /** Called when EWS is toggled for a class */
  onEWSToggle: (tier: ClassTier, enabled: boolean) => void;
  /** Called when EWS threshold changes for a class */
  onEWSThresholdChange: (tier: ClassTier, threshold: number) => void;
  /** Called when EWS percent changes for a class */
  onEWSPercentChange: (tier: ClassTier, percent: number) => void;
  /** Called when user advances to next year */
  onAdvance: () => void;
  /** Called when user rejects EWS */
  onReject: () => void;
  /** Called when How It Works is clicked */
  onHowItWorks: () => void;
  /** Called when Settings is clicked */
  onSettings: () => void;
  /** Called when Charts is clicked */
  onCharts: () => void;
}

export function PolicyEWS({
  classes,
  year0Snapshot,
  policies,
  onEWSToggle,
  onEWSThresholdChange,
  onEWSPercentChange,
  onAdvance,
  onReject,
  onHowItWorks,
  onSettings,
  onCharts,
}: PolicyEWSProps) {
  const upperClass = classes.find((c) => c.tier === 'upper');
  const nobleClass = classes.find((c) => c.tier === 'noble');
  const lowerClass = classes.find((c) => c.tier === 'lower');
  const commonClass = classes.find((c) => c.tier === 'common');
  const middleClass = classes.find((c) => c.tier === 'middle');

  const year0Lower = year0Snapshot.classes.find((c) => c.tier === 'lower');
  const year0Common = year0Snapshot.classes.find((c) => c.tier === 'common');
  const year0Middle = year0Snapshot.classes.find((c) => c.tier === 'middle');

  if (!upperClass || !nobleClass || !lowerClass || !commonClass || !middleClass || !year0Lower || !year0Common || !year0Middle) {
    return null;
  }

  // Calculate income gap - this is the key observation
  const incomeGap = Math.round(upperClass.metrics.incomePerCapita / lowerClass.metrics.incomePerCapita);

  // Calculate total reservation for context
  const totalReservation =
    policies.lower.reservationPercent +
    policies.common.reservationPercent +
    policies.middle.reservationPercent;

  // Check if reservations exist - determines which variant to show
  const hasReservations = totalReservation > 0;

  // Calculate education gains for context-aware title
  const lowerEduGain = lowerClass.metrics.education - year0Lower.metrics.education;
  const lowerPovReduction = year0Lower.metrics.poverty - lowerClass.metrics.poverty;

  // Generate context-aware title based on outcomes
  const getTitle = () => {
    if (hasReservations && lowerEduGain > 30 && lowerPovReduction > 20) {
      return 'New Voices Emerge';
    } else if (hasReservations && incomeGap > 15) {
      return 'The Gap Persists';
    } else if (hasReservations && lowerEduGain > 15) {
      return 'Progress & Pushback';
    } else if (!hasReservations && incomeGap > 20) {
      return 'Widening Divide';
    } else if (!hasReservations) {
      return 'Six Decades On';
    }
    return 'A Turning Point';
  };

  // Generate context-aware story continuation
  const getStorySummary = () => {
    if (totalReservation > 30) {
      return `Over a century of reservation have transformed lower classes significantly. Yet the income gap tells a different story.`;
    } else if (totalReservation > 0) {
      return `Reservation policies have made incremental changes over 120 years. Progress has been mixed across different classes.`;
    }
    return `Without reservation policies, 120 years have passed. Economic forces alone have shaped class mobility.`;
  };

  // Classes for progress cards - compare to year 0
  // Show all lower classes when no reservation, or only those with reservation
  const eligibleClasses = hasReservations
    ? [
        { tier: 'lower' as ClassTier, class: lowerClass, prev: year0Lower },
        { tier: 'common' as ClassTier, class: commonClass, prev: year0Common },
        { tier: 'middle' as ClassTier, class: middleClass, prev: year0Middle },
      ].filter(({ tier }) => policies[tier].reservationPercent > 0)
    : [
        { tier: 'lower' as ClassTier, class: lowerClass, prev: year0Lower },
        { tier: 'common' as ClassTier, class: commonClass, prev: year0Common },
        { tier: 'middle' as ClassTier, class: middleClass, prev: year0Middle },
      ];

  // When no reservations, just show a continue button
  const primaryActionText = hasReservations ? 'Apply EWS & Advance 40 Years' : 'Continue to Year 160';
  const secondaryActionText = hasReservations ? 'Reject this proposal' : undefined;

  return (
    <PolicyLayout
      year={120}
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
        Year 120: {getTitle()}
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

      {/* CRITICAL OBSERVATION - The Income Gap - Highlighted prominently */}
      <div className="bg-gradient-to-r from-highlight-red/20 to-highlight-red/10 border-2 border-highlight-red/50 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-highlight-red/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-highlight-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-orbitron text-xl font-bold text-highlight-red">
            The Persistent Gap
          </h3>
        </div>
        <p className="text-lg text-white mb-4">
          Even after 120 years, the <span style={{ color: '#e2b714' }}>Upper {upperClass.displayName.split(' ')[1]}</span> earns{' '}
          <span className="font-orbitron text-2xl text-highlight-red font-bold">{incomeGap}x</span> more
          than the <span style={{ color: '#e94560' }}>Lower {lowerClass.displayName.split(' ')[1]}</span>.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <p className="text-sm text-white/60 mb-1">Upper {upperClass.displayName.split(' ')[1]}</p>
            <p className="font-orbitron text-xl text-accent-gold">
              {Math.round(upperClass.metrics.incomePerCapita).toLocaleString()}
            </p>
            <p className="text-sm text-white/60">credits/month</p>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <p className="text-sm text-white/60 mb-1">Lower {lowerClass.displayName.split(' ')[1]}</p>
            <p className="font-orbitron text-xl text-highlight-red">
              {Math.round(lowerClass.metrics.incomePerCapita).toLocaleString()}
            </p>
            <p className="text-sm text-white/60">credits/month</p>
          </div>
        </div>
      </div>

      {/* EWS-specific content - only when reservations exist */}
      {hasReservations ? (
        <>
          {/* Advocacy box */}
          <div className="bg-gradient-to-r from-accent-gold/10 to-accent-gold/5 border border-accent-gold/30 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-orbitron text-lg font-bold text-accent-gold mb-2">
                  THE UPPER CLASSES DEMAND EWS
                </h3>
                <blockquote className="border-l-2 border-accent-gold/50 pl-4 italic text-base text-white/70">
                  &ldquo;We also have poor people! Give us reservation for our Economically Weaker Sections!&rdquo;
                </blockquote>
              </div>
            </div>
          </div>

          {/* EWS Explanation - with better visual like PolicyCreamyLayer */}
          <div className="bg-cosmic-blue/60 border border-white/10 rounded-xl p-5 mb-8">
            <h4 className="font-orbitron text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm">?</span>
              What is EWS Reservation?
            </h4>
            <p className="text-base text-white/70 mb-3">
              A policy that provides reservation benefits to economically weaker members of upper classes,
              based on income threshold rather than historical class status.
            </p>
            <div className="grid grid-cols-2 gap-4 text-base">
              <div className="bg-class-noble/10 rounded-lg p-3">
                <p className="text-class-noble font-semibold mb-1">The Argument</p>
                <p className="text-white/70">Poverty exists in all classes; support should be income-based</p>
              </div>
              <div className="bg-highlight-red/10 rounded-lg p-3">
                <p className="text-highlight-red font-semibold mb-1">The Counter</p>
                <p className="text-white/70">May divert resources from historically marginalized groups</p>
              </div>
            </div>
          </div>

          {/* Question */}
          <p className="text-center text-xl text-white font-rajdhani mb-6">
            Provide EWS reservation for upper classes?
          </p>

          {/* EWS Controls */}
          <div className="space-y-4 max-w-lg mx-auto">
            {/* Upper class */}
            <div className="space-y-3">
              <PolicyToggle
                label={`Enable EWS for ${upperClass.displayName}`}
                enabled={policies.upper.ewsEnabled}
                onToggle={(enabled) => onEWSToggle('upper', enabled)}
                tier="upper"
                showThreshold={true}
                thresholdValue={policies.upper.ewsThreshold}
                onThresholdChange={(value) => onEWSThresholdChange('upper', value)}
                thresholdMax={50000}
              />
              {policies.upper.ewsEnabled && (
                <div className="ml-4 pl-4 border-l-2 border-class-upper/30">
                  <label className="text-base text-white/70 block mb-2">
                    EWS Reservation %
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={policies.upper.ewsPercent}
                    onChange={(e) => onEWSPercentChange('upper', Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-white/60">
                    <span>0%</span>
                    <span className="font-bold text-class-upper">{policies.upper.ewsPercent}%</span>
                    <span>50%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Noble class */}
            <div className="space-y-3">
              <PolicyToggle
                label={`Enable EWS for ${nobleClass.displayName}`}
                enabled={policies.noble.ewsEnabled}
                onToggle={(enabled) => onEWSToggle('noble', enabled)}
                tier="noble"
                showThreshold={true}
                thresholdValue={policies.noble.ewsThreshold}
                onThresholdChange={(value) => onEWSThresholdChange('noble', value)}
                thresholdMax={50000}
              />
              {policies.noble.ewsEnabled && (
                <div className="ml-4 pl-4 border-l-2 border-class-noble/30">
                  <label className="text-base text-white/70 block mb-2">
                    EWS Reservation %
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={policies.noble.ewsPercent}
                    onChange={(e) => onEWSPercentChange('noble', Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-white/60">
                    <span>0%</span>
                    <span className="font-bold text-class-noble">{policies.noble.ewsPercent}%</span>
                    <span>50%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* No reservations - show a reflection message */
        <div className="bg-cosmic-blue/60 border border-white/10 rounded-xl p-5 mb-6">
          <h4 className="font-orbitron text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm">i</span>
            120 Years Without Intervention
          </h4>
          <p className="text-base text-white/70 mb-3">
            For over a century, the society has evolved through market forces alone.
            The gap between classes has followed natural economic patterns.
          </p>
          <p className="text-base text-white/70">
            The lower classes continue to advocate for change, while upper classes maintain their position.
            The question remains: will policy intervention be needed?
          </p>
        </div>
      )}
    </PolicyLayout>
  );
}

export default PolicyEWS;
