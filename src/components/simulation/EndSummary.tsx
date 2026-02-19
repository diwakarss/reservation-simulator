'use client';

/**
 * EndSummary - Year 100 final results display
 *
 * Shows:
 * - Before/after comparison (Year 0 vs Year 100)
 * - "Biggest improvement" narrative using findBiggestImprovement()
 * - Key insights section
 * - Action buttons: Share Results, View Charts, View Whitepaper
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSimulationStore } from '@/lib/store';
import {
  CLASS_COLORS,
  CLASS_TIER_ORDER,
  ClassTier,
  METRIC_LABELS,
  METRIC_UNITS,
  SimulationPhase,
} from '@/lib/simulation/types';
import { findBiggestImprovement } from '@/lib/simulation/engine';
import { Button } from '@/components/ui';
import { WhitepaperLink } from '@/components/ui/WhitepaperLink';
import { MetricCard } from './MetricCard';

export function EndSummary() {
  const history = useSimulationStore((state) => state.history);
  const world = useSimulationStore((state) => state.world);
  const currentYear = useSimulationStore((state) => state.currentYear);
  const reset = useSimulationStore((state) => state.reset);
  const initializeWorld = useSimulationStore((state) => state.initializeWorld);
  const setPhase = useSimulationStore((state) => state.setPhase);
  const openChartsPanel = useSimulationStore((state) => state.openChartsPanel);
  const encodeStateToURL = useSimulationStore((state) => state.encodeStateToURL);

  // Get first and last snapshots
  const year0Snapshot = history.length > 0 ? history[0] : null;
  const finalSnapshot = history.length > 0 ? history[history.length - 1] : null;

  // Find biggest improvement
  const highlight = useMemo(() => {
    if (!year0Snapshot || !finalSnapshot) return null;
    return findBiggestImprovement(year0Snapshot, finalSnapshot);
  }, [year0Snapshot, finalSnapshot]);

  // Build class names mapping
  const classNames: Record<ClassTier, string> = useMemo(() => {
    if (!world) {
      return {
        upper: 'Upper Class',
        noble: 'Noble Class',
        middle: 'Middle Class',
        common: 'Common Class',
        lower: 'Lower Class',
      };
    }
    const names: Partial<Record<ClassTier, string>> = {};
    for (const cls of world.classes) {
      names[cls.tier] = cls.displayName;
    }
    return names as Record<ClassTier, string>;
  }, [world]);

  // Share results handler
  const handleShare = async () => {
    const urlParams = encodeStateToURL();
    const shareUrl = `${window.location.origin}/simulate?${urlParams}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Reservation Simulator Results',
          text: `After ${currentYear} years of policy decisions...`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  // Try again with same world
  const handleTryAgain = () => {
    if (world) {
      initializeWorld(world.seed);
      setPhase(SimulationPhase.POLICY_BOTTOM_2);
    }
  };

  // New world
  const handleNewWorld = () => {
    reset();
    initializeWorld();
    setPhase(SimulationPhase.INTRO);
  };

  // View charts
  const handleViewCharts = () => {
    openChartsPanel();
  };

  if (!year0Snapshot || !finalSnapshot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-deep-purple">
        <p className="text-muted-text">No simulation data available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-purple px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-4 font-orbitron text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            AFTER {currentYear} YEARS...
          </motion.h1>
          <p className="font-rajdhani text-lg text-muted-text">
            Your policy decisions have shaped society
          </p>
        </div>

        {/* Key Insight - Biggest Improvement */}
        {highlight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="mb-4 font-orbitron text-sm uppercase tracking-wider text-accent-gold">
              Key Insight
            </h2>
            <div className="rounded-xl border-2 border-accent-gold/30 bg-gradient-to-br from-accent-gold/10 to-transparent p-6">
              <p className="font-rajdhani text-xl text-white">
                {METRIC_LABELS[highlight.metric]} for the{' '}
                <span
                  className="font-bold"
                  style={{ color: CLASS_COLORS[highlight.classTier] }}
                >
                  {highlight.classDisplayName}
                </span>{' '}
                went from{' '}
                <span className="font-bold text-white/60">
                  {highlight.fromValue.toFixed(1)}{METRIC_UNITS[highlight.metric]}
                </span>{' '}
                to{' '}
                <span className="font-bold text-accent-gold">
                  {highlight.toValue.toFixed(1)}{METRIC_UNITS[highlight.metric]}
                </span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Most Improved Class Card */}
        {highlight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <MetricCard highlight={highlight} animate={false} />
          </motion.div>
        )}

        {/* Before/After Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="mb-4 font-orbitron text-sm uppercase tracking-wider text-muted-text">
            Year 0 vs Year {currentYear}
          </h2>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-cosmic-blue/30">
            <table className="w-full font-rajdhani text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-muted-text">Class</th>
                  <th className="px-4 py-3 text-center text-muted-text">
                    Education
                  </th>
                  <th className="px-4 py-3 text-center text-muted-text">
                    Poverty
                  </th>
                  <th className="px-4 py-3 text-center text-muted-text">
                    Life Exp.
                  </th>
                  <th className="px-4 py-3 text-center text-muted-text">
                    Income
                  </th>
                </tr>
              </thead>
              <tbody>
                {CLASS_TIER_ORDER.map((tier) => {
                  const year0Class = year0Snapshot.classes.find(
                    (c) => c.tier === tier
                  );
                  const finalClass = finalSnapshot.classes.find(
                    (c) => c.tier === tier
                  );
                  if (!year0Class || !finalClass) return null;

                  const eduChange =
                    finalClass.metrics.education - year0Class.metrics.education;
                  const povChange =
                    finalClass.metrics.poverty - year0Class.metrics.poverty;
                  const leChange =
                    finalClass.metrics.lifeExpectancy -
                    year0Class.metrics.lifeExpectancy;
                  const incChange =
                    finalClass.metrics.incomePerCapita -
                    year0Class.metrics.incomePerCapita;

                  return (
                    <tr
                      key={tier}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: CLASS_COLORS[tier] }}
                          />
                          <span
                            className="font-semibold"
                            style={{ color: CLASS_COLORS[tier] }}
                          >
                            {classNames[tier]}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-white/60">
                          {year0Class.metrics.education.toFixed(0)}%
                        </span>
                        <span className="text-muted-text"> {'>'} </span>
                        <span className="text-white">
                          {finalClass.metrics.education.toFixed(0)}%
                        </span>
                        <span
                          className={`ml-2 text-xs ${
                            eduChange > 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {eduChange > 0 ? '+' : ''}
                          {eduChange.toFixed(0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-white/60">
                          {year0Class.metrics.poverty.toFixed(0)}%
                        </span>
                        <span className="text-muted-text"> {'>'} </span>
                        <span className="text-white">
                          {finalClass.metrics.poverty.toFixed(0)}%
                        </span>
                        <span
                          className={`ml-2 text-xs ${
                            povChange < 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {povChange.toFixed(0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-white/60">
                          {year0Class.metrics.lifeExpectancy.toFixed(0)}yr
                        </span>
                        <span className="text-muted-text"> {'>'} </span>
                        <span className="text-white">
                          {finalClass.metrics.lifeExpectancy.toFixed(0)}yr
                        </span>
                        <span
                          className={`ml-2 text-xs ${
                            leChange > 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {leChange > 0 ? '+' : ''}
                          {leChange.toFixed(0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-white/60">
                          {(year0Class.metrics.incomePerCapita / 1000).toFixed(1)}k
                        </span>
                        <span className="text-muted-text"> {'>'} </span>
                        <span className="text-white">
                          {(finalClass.metrics.incomePerCapita / 1000).toFixed(1)}k
                        </span>
                        <span
                          className={`ml-2 text-xs ${
                            incChange > 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {incChange > 0 ? '+' : ''}
                          {(incChange / 1000).toFixed(1)}k
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleViewCharts}
              className="w-full"
              leftIcon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
            >
              View Full Charts
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleShare}
              className="w-full"
              leftIcon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              }
            >
              Share Results
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="ghost"
              size="md"
              onClick={handleTryAgain}
              className="w-full"
            >
              Try Different Policies
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={handleNewWorld}
              className="w-full"
            >
              New World
            </Button>
          </div>

          <div className="pt-4 text-center">
            <WhitepaperLink />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default EndSummary;
