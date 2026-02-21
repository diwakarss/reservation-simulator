'use client';

/**
 * EndSummary - Year 100 final results display
 *
 * Shows:
 * - "RESERVATION SIMULATOR" title in cyan
 * - 3 key metrics side by side across classes
 * - Before/after comparison table with reservation % and EWS
 * - Action buttons: Share Results (screenshot), View Charts, View Whitepaper
 */

import { useMemo, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useSimulationStore } from '@/lib/store';
import {
  CLASS_COLORS,
  CLASS_TIER_ORDER,
  ClassTier,
  SimulationPhase,
} from '@/lib/simulation/types';
import { findBiggestImprovement } from '@/lib/simulation/engine';
import { Button } from '@/components/ui';
import { WhitepaperLink } from '@/components/ui/WhitepaperLink';

export function EndSummary() {
  const history = useSimulationStore((state) => state.history);
  const world = useSimulationStore((state) => state.world);
  const policy = useSimulationStore((state) => state.policy);
  const currentYear = useSimulationStore((state) => state.currentYear);
  const reset = useSimulationStore((state) => state.reset);
  const initializeWorld = useSimulationStore((state) => state.initializeWorld);
  const setPhase = useSimulationStore((state) => state.setPhase);
  const openChartsPanel = useSimulationStore((state) => state.openChartsPanel);
  const encodeStateToURL = useSimulationStore((state) => state.encodeStateToURL);

  const summaryRef = useRef<HTMLDivElement>(null);
  const screenshotRef = useRef<HTMLDivElement>(null); // Separate ref for screenshot (excludes buttons)
  const [shareStatus, setShareStatus] = useState<'idle' | 'capturing' | 'done'>('idle');

  // Get first and last snapshots
  const year0Snapshot = history.length > 0 ? history[0] : null;
  const finalSnapshot = history.length > 0 ? history[history.length - 1] : null;

  // Find top 3 improvements for highlight cards - diversified across metrics
  const topImprovements = useMemo(() => {
    if (!year0Snapshot || !finalSnapshot) return [];

    const improvements: Array<{
      tier: ClassTier;
      displayName: string;
      metric: string;
      metricKey: string;
      fromValue: number;
      toValue: number;
      change: number;
      normalizedChange: number; // For fair comparison across different scales
      unit: string;
    }> = [];

    for (const finalClass of finalSnapshot.classes) {
      const year0Class = year0Snapshot.classes.find(c => c.tier === finalClass.tier);
      if (!year0Class) continue;

      // Education improvement (scale: 0-100%)
      const eduChange = finalClass.metrics.education - year0Class.metrics.education;
      if (eduChange > 0) {
        improvements.push({
          tier: finalClass.tier,
          displayName: finalClass.displayName,
          metric: 'Education',
          metricKey: 'education',
          fromValue: year0Class.metrics.education,
          toValue: finalClass.metrics.education,
          change: eduChange,
          normalizedChange: eduChange, // Already 0-100 scale
          unit: '%',
        });
      }

      // Poverty reduction (negative is good, scale: 0-100%)
      const povChange = year0Class.metrics.poverty - finalClass.metrics.poverty;
      if (povChange > 0) {
        improvements.push({
          tier: finalClass.tier,
          displayName: finalClass.displayName,
          metric: 'Poverty Reduced',
          metricKey: 'poverty',
          fromValue: year0Class.metrics.poverty,
          toValue: finalClass.metrics.poverty,
          change: povChange,
          normalizedChange: povChange, // Already 0-100 scale
          unit: '%',
        });
      }

      // Life expectancy improvement (scale: ~50-90 years, normalize to percentage improvement)
      const leChange = finalClass.metrics.lifeExpectancy - year0Class.metrics.lifeExpectancy;
      if (leChange > 0) {
        improvements.push({
          tier: finalClass.tier,
          displayName: finalClass.displayName,
          metric: 'Life Expectancy',
          metricKey: 'lifeExpectancy',
          fromValue: year0Class.metrics.lifeExpectancy,
          toValue: finalClass.metrics.lifeExpectancy,
          change: leChange,
          normalizedChange: (leChange / year0Class.metrics.lifeExpectancy) * 100, // % improvement
          unit: ' yrs',
        });
      }

      // Income improvement (normalize by percentage increase)
      const incChange = finalClass.metrics.incomePerCapita - year0Class.metrics.incomePerCapita;
      if (incChange > 0 && year0Class.metrics.incomePerCapita > 0) {
        const percentIncrease = (incChange / year0Class.metrics.incomePerCapita) * 100;
        improvements.push({
          tier: finalClass.tier,
          displayName: finalClass.displayName,
          metric: 'Income Growth',
          metricKey: 'income',
          fromValue: year0Class.metrics.incomePerCapita,
          toValue: finalClass.metrics.incomePerCapita,
          change: Math.round(percentIncrease),
          normalizedChange: percentIncrease,
          unit: '%',
        });
      }
    }

    // Sort by normalized change and pick top 3, ensuring metric diversity
    const sorted = improvements.sort((a, b) => b.normalizedChange - a.normalizedChange);
    const selected: typeof improvements = [];
    const usedMetrics = new Set<string>();

    // First pass: pick top from each metric type to ensure diversity
    for (const imp of sorted) {
      if (selected.length >= 3) break;
      if (!usedMetrics.has(imp.metricKey)) {
        selected.push(imp);
        usedMetrics.add(imp.metricKey);
      }
    }

    // If we still need more (less than 3 unique metrics had improvements), fill with best remaining
    for (const imp of sorted) {
      if (selected.length >= 3) break;
      if (!selected.includes(imp)) {
        selected.push(imp);
      }
    }

    return selected;
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

  // Share results handler - takes screenshot with URL embedded
  const handleShare = useCallback(async () => {
    const urlParams = encodeStateToURL();
    const shareUrl = `${window.location.origin}/simulate?${urlParams}`;

    // Try to capture screenshot (using screenshotRef to exclude buttons)
    if (screenshotRef.current && typeof window !== 'undefined') {
      setShareStatus('capturing');
      try {
        // Dynamically import html2canvas
        const html2canvas = (await import('html2canvas')).default;

        const canvas = await html2canvas(screenshotRef.current, {
          backgroundColor: '#0d0221',
          scale: 2,
          logging: false,
          useCORS: true,
        });

        // Add URL watermark to bottom of canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '14px monospace';
          ctx.fillText(shareUrl, 10, canvas.height - 10);
        }

        // Convert to blob and share/download
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'reservation-simulator-results.png', { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
              try {
                await navigator.share({
                  title: 'Reservation Simulator Results',
                  text: `After ${currentYear} years of policy decisions...`,
                  files: [file],
                  url: shareUrl,
                });
                setShareStatus('done');
                setTimeout(() => setShareStatus('idle'), 2000);
                return;
              } catch {
                // Fall through to download
              }
            }

            // Fallback: download image and copy URL
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'reservation-simulator-results.png';
            a.click();
            URL.revokeObjectURL(url);

            await navigator.clipboard.writeText(shareUrl);
            setShareStatus('done');
            setTimeout(() => setShareStatus('idle'), 2000);
          }
        }, 'image/png');
      } catch {
        // Fallback to just copying URL
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus('done');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    } else {
      // No screenshot capability, just copy URL
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus('done');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  }, [encodeStateToURL, currentYear]);

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

  // Get policy info for a class tier
  const getPolicyInfo = (tier: ClassTier) => {
    const classPolicy = policy.classes[tier];
    const parts: string[] = [];

    if (classPolicy.reservationPercent > 0) {
      parts.push(`${classPolicy.reservationPercent}%`);
    }
    if (classPolicy.creamyLayerEnabled) {
      parts.push('CL');
    }
    if (classPolicy.ewsEnabled) {
      parts.push(`EWS ${classPolicy.ewsPercent}%`);
    }

    return parts.length > 0 ? parts.join(' | ') : '-';
  };

  // Generate context-aware summary statement based on simulation outcomes
  const getSummaryStatement = useMemo(() => {
    if (!year0Snapshot || !finalSnapshot) return '';

    const totalReservation =
      policy.classes.lower.reservationPercent +
      policy.classes.common.reservationPercent +
      policy.classes.middle.reservationPercent;

    const hasReservations = totalReservation > 0;

    // Calculate key metrics changes
    const lowerYear0 = year0Snapshot.classes.find(c => c.tier === 'lower');
    const lowerFinal = finalSnapshot.classes.find(c => c.tier === 'lower');
    const upperYear0 = year0Snapshot.classes.find(c => c.tier === 'upper');
    const upperFinal = finalSnapshot.classes.find(c => c.tier === 'upper');

    if (!lowerYear0 || !lowerFinal || !upperYear0 || !upperFinal) return '';

    const lowerEduGain = lowerFinal.metrics.education - lowerYear0.metrics.education;
    const lowerPovReduction = lowerYear0.metrics.poverty - lowerFinal.metrics.poverty;
    const incomeGapYear0 = Math.round(upperYear0.metrics.incomePerCapita / lowerYear0.metrics.incomePerCapita);
    const incomeGapFinal = Math.round(upperFinal.metrics.incomePerCapita / lowerFinal.metrics.incomePerCapita);
    const gapReduced = incomeGapYear0 - incomeGapFinal;

    if (hasReservations) {
      if (lowerEduGain > 30 && lowerPovReduction > 20) {
        return `Reservation policies drove significant progress. Education access improved substantially and poverty declined across lower classes.`;
      } else if (lowerEduGain > 15) {
        return `Reservation made a meaningful impact on education, though economic gaps remain. The journey toward equality continues.`;
      } else if (gapReduced > 5) {
        return `While progress was slower than hoped, the income gap between classes has narrowed. Policy effects take generations to fully materialize.`;
      } else {
        return `Despite reservation policies, structural inequalities persisted. Complex problems require sustained, multi-generational effort.`;
      }
    } else {
      if (lowerEduGain > 20) {
        return `Even without reservation, economic growth lifted some boats. However, class mobility remained limited by structural barriers.`;
      } else if (incomeGapFinal > incomeGapYear0) {
        return `Without intervention, inequality widened over 100 years. Economic forces alone did not close the class divide.`;
      } else {
        return `Market forces produced mixed results. Some natural convergence occurred, but systemic gaps persisted without policy intervention.`;
      }
    }
  }, [year0Snapshot, finalSnapshot, policy]);

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
        ref={summaryRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-5xl"
      >
        {/* Screenshot area - excludes buttons */}
        <div ref={screenshotRef} className="bg-deep-purple pb-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-2 font-orbitron text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            style={{ color: '#22d3ee' }}
          >
            RESERVATION SIMULATOR
          </motion.h1>
          <p className="font-rajdhani text-xl text-white">
            {currentYear} Years of Policy Decisions
          </p>
          {getSummaryStatement && (
            <p className="font-rajdhani text-base text-muted-text mt-3 max-w-2xl mx-auto italic">
              {getSummaryStatement}
            </p>
          )}
        </div>

        {/* Top 3 Improvements - Highlight Cards */}
        {topImprovements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="mb-4 font-orbitron text-base uppercase tracking-wider text-accent-gold">
              Key Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topImprovements.map((improvement, index) => (
                <div
                  key={`${improvement.tier}-${improvement.metric}`}
                  className="rounded-xl border border-white/10 bg-gradient-to-br from-cosmic-blue/40 to-transparent p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: CLASS_COLORS[improvement.tier] }}
                    />
                    <span
                      className="font-rajdhani font-semibold text-base"
                      style={{ color: CLASS_COLORS[improvement.tier] }}
                    >
                      {improvement.displayName}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm uppercase tracking-wider mb-1">
                    {improvement.metric}
                  </p>
                  <p className="font-orbitron text-3xl text-white">
                    +{Math.round(improvement.change)}{improvement.unit}
                  </p>
                  <p className="text-sm text-white/60 mt-1">
                    {improvement.metricKey === 'income'
                      ? `${Math.round(improvement.fromValue / 1000)}k → ${Math.round(improvement.toValue / 1000)}k`
                      : `${Math.round(improvement.fromValue)} → ${Math.round(improvement.toValue)}${improvement.unit}`}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Before/After Comparison with Policy Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="mb-4 font-orbitron text-base uppercase tracking-wider text-white/70">
            Year 0 → Year {currentYear} Comparison
          </h2>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-cosmic-blue/30">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-white/10 bg-black/20">
                  <th className="px-3 py-3 text-left font-rajdhani font-semibold text-white/80">Class</th>
                  <th className="px-3 py-3 text-center font-rajdhani font-semibold text-white/80">Policy</th>
                  <th className="px-3 py-3 text-center font-rajdhani font-semibold text-white/80">Education</th>
                  <th className="px-3 py-3 text-center font-rajdhani font-semibold text-white/80">Poverty</th>
                  <th className="px-3 py-3 text-center font-rajdhani font-semibold text-white/80">Life Exp.</th>
                  <th className="px-3 py-3 text-center font-rajdhani font-semibold text-white/80">Income</th>
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

                  const policyInfo = getPolicyInfo(tier);

                  return (
                    <tr
                      key={tier}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: CLASS_COLORS[tier] }}
                          />
                          <span
                            className="font-rajdhani font-semibold text-base"
                            style={{ color: CLASS_COLORS[tier] }}
                          >
                            {classNames[tier]}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`font-mono text-sm ${policyInfo === '-' ? 'text-white/50' : 'text-accent-gold'}`}>
                          {policyInfo}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-rajdhani">
                        <span className="text-white/50 text-sm">
                          {Math.round(year0Class.metrics.education)}
                        </span>
                        <span className="text-white/40 text-sm mx-1">→</span>
                        <span className="text-white font-semibold">
                          {Math.round(finalClass.metrics.education)}%
                        </span>
                        <span
                          className={`ml-1 text-sm ${
                            eduChange > 0 ? 'text-green-400' : eduChange < 0 ? 'text-red-400' : 'text-white/50'
                          }`}
                        >
                          {eduChange > 0 ? '+' : ''}{Math.round(eduChange)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-rajdhani">
                        <span className="text-white/50 text-sm">
                          {Math.round(year0Class.metrics.poverty)}
                        </span>
                        <span className="text-white/40 text-sm mx-1">→</span>
                        <span className="text-white font-semibold">
                          {Math.round(finalClass.metrics.poverty)}%
                        </span>
                        <span
                          className={`ml-1 text-sm ${
                            povChange < 0 ? 'text-green-400' : povChange > 0 ? 'text-red-400' : 'text-white/50'
                          }`}
                        >
                          {Math.round(povChange)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-rajdhani">
                        <span className="text-white/50 text-sm">
                          {Math.round(year0Class.metrics.lifeExpectancy)}
                        </span>
                        <span className="text-white/40 text-sm mx-1">→</span>
                        <span className="text-white font-semibold">
                          {Math.round(finalClass.metrics.lifeExpectancy)}yr
                        </span>
                        <span
                          className={`ml-1 text-sm ${
                            leChange > 0 ? 'text-green-400' : leChange < 0 ? 'text-red-400' : 'text-white/50'
                          }`}
                        >
                          {leChange > 0 ? '+' : ''}{Math.round(leChange)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-rajdhani">
                        <span className="text-white/50 text-sm">
                          {Math.round(year0Class.metrics.incomePerCapita / 1000)}k
                        </span>
                        <span className="text-white/40 text-sm mx-1">→</span>
                        <span className="text-white font-semibold">
                          {Math.round(finalClass.metrics.incomePerCapita / 1000)}k
                        </span>
                        <span
                          className={`ml-1 text-sm ${
                            incChange > 0 ? 'text-green-400' : incChange < 0 ? 'text-red-400' : 'text-white/50'
                          }`}
                        >
                          {incChange > 0 ? '+' : ''}{Math.round(incChange / 1000)}k
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-white/60 mt-2 text-center">
            Policy: Reservation % | CL = Creamy Layer | EWS = Economically Weaker Section
          </p>
        </motion.div>
        </div>
        {/* End screenshot area */}

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
              disabled={shareStatus === 'capturing'}
              className="w-full"
              leftIcon={
                shareStatus === 'capturing' ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : shareStatus === 'done' ? (
                  <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
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
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )
              }
            >
              {shareStatus === 'capturing' ? 'Capturing...' : shareStatus === 'done' ? 'Screenshot Saved!' : 'Share Screenshot'}
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
