'use client';

/**
 * PolicyRemoval
 *
 * Year 80 screen: Protests to remove reservation.
 * Three-branch decision: Remove All, Continue, or Adjust.
 */

import { PolicyLayout } from './PolicyLayout';
import { Button } from '@/components/ui/Button';
import { ExplanationBox } from '@/components/ui/ExplanationBox';
import type { SocialClass, YearSnapshot } from '@/lib/simulation/types';
import { CLASS_COLORS } from '@/lib/simulation/types';

interface PolicyRemovalProps {
  /** Social classes data */
  classes: SocialClass[];
  /** Year 0 snapshot for comparison */
  year0Snapshot: YearSnapshot;
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
  onRemoveAll,
  onContinue,
  onAdjust,
  onHowItWorks,
  onSettings,
  onCharts,
}: PolicyRemovalProps) {
  const upperClass = classes.find((c) => c.tier === 'upper');
  const lowerClass = classes.find((c) => c.tier === 'lower');

  const year0Upper = year0Snapshot.classes.find((c) => c.tier === 'upper');
  const year0Lower = year0Snapshot.classes.find((c) => c.tier === 'lower');

  if (!upperClass || !lowerClass || !year0Upper || !year0Lower) {
    return null;
  }

  // Calculate gap
  const incomeGap = upperClass.metrics.incomePerCapita / lowerClass.metrics.incomePerCapita;

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
      {/* Protest box */}
      <div className="bg-highlight-red/10 border border-highlight-red/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🗣️</span>
          <div>
            <h3 className="font-rajdhani font-bold text-highlight-red mb-1">
              PROTESTS ACROSS THE NATION
            </h3>
            <p className="text-sm text-muted-text">
              &ldquo;Reservation has fulfilled its purpose! The lower classes are
              educated now. End this discrimination against merit!&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="bg-cosmic-blue/60 border border-white/10 rounded-xl overflow-hidden mb-6">
        <div className="bg-accent-gold/10 px-4 py-2 border-b border-white/10">
          <h3 className="font-rajdhani font-bold text-accent-gold text-sm uppercase tracking-wider">
            📊 Year 0 vs Year 80 Comparison
          </h3>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-muted-text font-normal">Class</th>
                <th className="text-center py-2 text-muted-text font-normal">Year 0</th>
                <th className="text-center py-2 text-muted-text font-normal">Year 80</th>
                <th className="text-right py-2 text-muted-text font-normal">Change</th>
              </tr>
            </thead>
            <tbody>
              {/* Upper class */}
              <tr className="border-b border-white/5">
                <td className="py-2" style={{ color: CLASS_COLORS.upper }}>
                  {upperClass.displayName.split(' ').slice(1).join(' ')}
                </td>
                <td className="text-center py-2 text-muted-text/60">
                  Edu: {year0Upper.metrics.education}%
                </td>
                <td className="text-center py-2">
                  {upperClass.metrics.education}%
                </td>
                <td className="text-right py-2 text-muted-text">
                  +{upperClass.metrics.education - year0Upper.metrics.education}%
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 text-muted-text/60 text-xs pl-4">Poverty</td>
                <td className="text-center py-2 text-muted-text/60">
                  {year0Upper.metrics.poverty}%
                </td>
                <td className="text-center py-2">
                  {upperClass.metrics.poverty}%
                </td>
                <td className="text-right py-2 text-class-noble">
                  {upperClass.metrics.poverty - year0Upper.metrics.poverty}%
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 text-muted-text/60 text-xs pl-4">Income</td>
                <td className="text-center py-2 text-muted-text/60">
                  {year0Upper.metrics.incomePerCapita.toLocaleString()}
                </td>
                <td className="text-center py-2">
                  {upperClass.metrics.incomePerCapita.toLocaleString()}
                </td>
                <td className="text-right py-2 text-class-noble">
                  +{((upperClass.metrics.incomePerCapita - year0Upper.metrics.incomePerCapita) / 1000).toFixed(0)}k
                </td>
              </tr>

              {/* Lower class */}
              <tr className="border-b border-white/5">
                <td className="py-2 pt-4" style={{ color: CLASS_COLORS.lower }}>
                  {lowerClass.displayName.split(' ').slice(1).join(' ')}
                </td>
                <td className="text-center py-2 pt-4 text-muted-text/60">
                  Edu: {year0Lower.metrics.education}%
                </td>
                <td className="text-center py-2 pt-4 text-white font-semibold">
                  {lowerClass.metrics.education}%
                </td>
                <td className="text-right py-2 pt-4 text-class-noble font-bold">
                  ↑↑↑ +{lowerClass.metrics.education - year0Lower.metrics.education}%
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 text-muted-text/60 text-xs pl-4">Poverty</td>
                <td className="text-center py-2 text-muted-text/60">
                  {year0Lower.metrics.poverty}%
                </td>
                <td className="text-center py-2 text-white font-semibold">
                  {lowerClass.metrics.poverty}%
                </td>
                <td className="text-right py-2 text-class-noble font-bold">
                  ↓↓↓ {lowerClass.metrics.poverty - year0Lower.metrics.poverty}%
                </td>
              </tr>
              <tr>
                <td className="py-2 text-muted-text/60 text-xs pl-4">Income</td>
                <td className="text-center py-2 text-muted-text/60">
                  {year0Lower.metrics.incomePerCapita.toLocaleString()}
                </td>
                <td className="text-center py-2 text-white font-semibold">
                  {lowerClass.metrics.incomePerCapita.toLocaleString()}
                </td>
                <td className="text-right py-2 text-class-noble font-bold">
                  ↑↑ +{((lowerClass.metrics.incomePerCapita - year0Lower.metrics.incomePerCapita) / 1000).toFixed(1)}k
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Gap explanation */}
      <ExplanationBox title="The Gap Remains" className="mb-8">
        <p>
          While {lowerClass.displayName.split(' ')[1]} improved dramatically,
          their income is still only <strong>{Math.round(100 / incomeGap)}%</strong> of{' '}
          {upperClass.displayName.split(' ')[1]}.
        </p>
        <p className="mt-2 text-xs text-muted-text/60">
          Full economic parity would take another 100+ years at current rates.
        </p>
      </ExplanationBox>

      {/* Decision prompt */}
      <p className="text-center text-lg text-white mb-6 font-rajdhani">
        What do you want to do?
      </p>

      {/* Three-branch buttons */}
      <div className="flex flex-col gap-3 max-w-md mx-auto">
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
      </div>
    </PolicyLayout>
  );
}

export default PolicyRemoval;
