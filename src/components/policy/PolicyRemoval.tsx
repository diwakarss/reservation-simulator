'use client';

/**
 * PolicyRemoval
 *
 * Year 80 screen: Protests to remove reservation.
 * Three-branch decision: Remove All, Continue, or Adjust.
 */

import { PolicyLayout } from './PolicyLayout';
import { ProgressCard } from './ProgressCard';
import { Button } from '@/components/ui/Button';
import type { SocialClass, YearSnapshot, ClassTier, ClassPolicy } from '@/lib/simulation/types';

interface PolicyRemovalProps {
  /** Social classes data */
  classes: SocialClass[];
  /** Year 0 snapshot for comparison */
  year0Snapshot: YearSnapshot;
  /** Current policies */
  policies: Record<ClassTier, ClassPolicy>;
  /** Called when user removes all reservations */
  onRemoveAll: () => void;
  /** Called when user continues with current policy */
  onContinue: () => void;
  /** Called when user wants to adjust percentages */
  onAdjust: () => void;
  /** Called when How It Works is clicked */
  onHowItWorks: () => void;
  /** Called when Settings is clicked */
  onSettings: () => void;
  /** Called when Charts is clicked */
  onCharts: () => void;
}

export function PolicyRemoval({
  classes,
  year0Snapshot,
  policies,
  onRemoveAll,
  onContinue,
  onAdjust,
  onHowItWorks,
  onSettings,
  onCharts,
}: PolicyRemovalProps) {
  const upperClass = classes.find((c) => c.tier === 'upper');
  const lowerClass = classes.find((c) => c.tier === 'lower');
  const commonClass = classes.find((c) => c.tier === 'common');
  const middleClass = classes.find((c) => c.tier === 'middle');

  const year0Upper = year0Snapshot.classes.find((c) => c.tier === 'upper');
  const year0Lower = year0Snapshot.classes.find((c) => c.tier === 'lower');
  const year0Common = year0Snapshot.classes.find((c) => c.tier === 'common');
  const year0Middle = year0Snapshot.classes.find((c) => c.tier === 'middle');

  if (!upperClass || !lowerClass || !commonClass || !middleClass || !year0Upper || !year0Lower || !year0Common || !year0Middle) {
    return null;
  }

  // Calculate gap
  const incomeGap = Math.round(upperClass.metrics.incomePerCapita / lowerClass.metrics.incomePerCapita);

  // Calculate total reservation for context
  const totalReservation =
    policies.lower.reservationPercent +
    policies.common.reservationPercent +
    policies.middle.reservationPercent;

  // Check if any reservations exist
  const hasReservations = totalReservation > 0;

  // Calculate education gains for context-aware title
  const lowerEduGain = lowerClass.metrics.education - year0Lower.metrics.education;
  const lowerPovReduction = year0Lower.metrics.poverty - lowerClass.metrics.poverty;

  // Generate context-aware title based on outcomes
  const getTitle = () => {
    if (hasReservations && lowerEduGain > 40 && lowerPovReduction > 30) {
      return 'Mission Accomplished?';
    } else if (hasReservations && lowerEduGain > 25) {
      return 'The Reckoning';
    } else if (hasReservations && incomeGap > 10) {
      return 'Unfinished Business';
    } else if (!hasReservations && lowerEduGain < 10) {
      return 'A Cry for Change';
    } else if (!hasReservations) {
      return 'Eight Decades Later';
    }
    return 'The Final Choice';
  };

  // Generate context-aware story continuation
  const getStorySummary = () => {
    if (totalReservation > 30) {
      return `Eight decades of reservation have reshaped the society. Now, voices emerge questioning whether the policies have run their course.`;
    } else if (totalReservation > 0) {
      return `After 80 years, the policies you chose have had their effects. A new debate emerges about the path forward.`;
    }
    return `Without reservation policies, class mobility has remained limited. The lower classes demand change.`;
  };

  // Get protest message based on context
  const getProtestMessage = () => {
    if (hasReservations) {
      return {
        title: 'PROTESTS ACROSS THE NATION',
        quote: '"Reservation has fulfilled its purpose! The lower classes are educated now. End this discrimination against merit!"',
      };
    }
    return {
      title: 'MAJORITY DEMANDS RESERVATIONS',
      quote: '"80 years of inequality is enough! The lower classes deserve equal opportunities. Implement reservations now!"',
    };
  };

  const protestMessage = getProtestMessage();

  // Classes with reservation for progress cards - compare to year 0
  const eligibleClasses = [
    { tier: 'lower' as ClassTier, class: lowerClass, prev: year0Lower },
    { tier: 'common' as ClassTier, class: commonClass, prev: year0Common },
    { tier: 'middle' as ClassTier, class: middleClass, prev: year0Middle },
  ].filter(({ tier }) => policies[tier].reservationPercent > 0);

  return (
    <PolicyLayout
      year={80}
      showHowItWorks={true}
      onHowItWorks={onHowItWorks}
      showSettings={true}
      onSettings={onSettings}
      showCharts={true}
      onCharts={onCharts}
    >
      {/* Title */}
      <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white text-center mb-2">
        Year 80: {getTitle()}
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

      {/* Income Gap - The persistent issue */}
      <div className="bg-gradient-to-r from-highlight-red/20 to-highlight-red/10 border-2 border-highlight-red/50 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-highlight-red/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-highlight-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-orbitron text-xl font-bold text-highlight-red">
            The Gap Remains
          </h3>
        </div>
        <p className="text-lg text-white mb-4">
          Even after 80 years, the <span style={{ color: '#e2b714' }}>Upper {upperClass.displayName.split(' ')[1]}</span> earns{' '}
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
        <p className="text-base text-white/60 mt-4">
          Lower {lowerClass.displayName.split(' ')[1]} income is only{' '}
          <span className="text-white font-semibold">{Math.round(100 / incomeGap)}%</span> of Upper {upperClass.displayName.split(' ')[1]}.
          Full economic parity would take another 100+ years at current rates.
        </p>
      </div>

      {/* Protest box - context aware */}
      <div className={`bg-gradient-to-r ${hasReservations ? 'from-accent-gold/10 to-accent-gold/5 border-accent-gold/30' : 'from-highlight-red/10 to-highlight-red/5 border-highlight-red/30'} border rounded-xl p-5 mb-6`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full ${hasReservations ? 'bg-accent-gold/20' : 'bg-highlight-red/20'} flex items-center justify-center flex-shrink-0`}>
            <svg className={`w-6 h-6 ${hasReservations ? 'text-accent-gold' : 'text-highlight-red'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className={`font-orbitron text-lg font-bold ${hasReservations ? 'text-accent-gold' : 'text-highlight-red'} mb-2`}>
              {protestMessage.title}
            </h3>
            <blockquote className={`border-l-2 ${hasReservations ? 'border-accent-gold/50' : 'border-highlight-red/50'} pl-4 italic text-base text-white/70`}>
              {protestMessage.quote}
            </blockquote>
          </div>
        </div>
      </div>

      {/* Decision prompt */}
      <p className="text-center text-xl text-white font-rajdhani mb-6">
        What do you want to do?
      </p>

      {/* Three-branch buttons - context aware */}
      <div className="flex flex-col gap-3 max-w-md mx-auto">
        {hasReservations ? (
          <>
            <Button
              variant="danger"
              size="lg"
              onClick={onRemoveAll}
              className="w-full"
            >
              Remove All Reservations
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={onContinue}
              className="w-full"
              rightIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              }
            >
              Continue With Current Policy
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onAdjust}
              className="w-full"
            >
              Adjust Percentages
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="primary"
              size="lg"
              onClick={onAdjust}
              className="w-full"
            >
              Implement Reservations
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onContinue}
              className="w-full"
              rightIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              }
            >
              Continue Without Reservations
            </Button>
          </>
        )}
      </div>
    </PolicyLayout>
  );
}

export default PolicyRemoval;
