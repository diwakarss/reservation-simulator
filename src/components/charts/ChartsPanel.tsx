'use client';

/**
 * ChartsPanel - Container with tabs for switching between charts
 *
 * Shows all 7 chart types with a tabbed interface on mobile
 * and a grid layout on desktop.
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSimulationStore } from '@/lib/store';
import type { ClassTier, ChartDataPoint, YearSnapshot } from '@/lib/simulation/types';
import { CLASS_TIER_ORDER } from '@/lib/simulation/types';

import { EducationChart } from './EducationChart';
import { EmploymentChart } from './EmploymentChart';
import { PovertyChart } from './PovertyChart';
import { WealthPieChart } from './WealthPieChart';
import { IncomeDistributionChart } from './IncomeDistributionChart';
import { LifeExpectancyChart } from './LifeExpectancyChart';
import { IncomeGapChart } from './IncomeGapChart';
import { GiniChart } from './GiniChart';
import { ClassMobilityChart } from './ClassMobilityChart';
import { TimelineScrubber } from './TimelineScrubber';
import { Button } from '@/components/ui';

interface ChartsPanelProps {
  /** Callback to close the panel */
  onClose: () => void;
}

type ChartTab =
  | 'education'
  | 'employment'
  | 'poverty'
  | 'wealth'
  | 'income'
  | 'lifeExpectancy'
  | 'incomeGap'
  | 'gini'
  | 'mobility';

interface ChartTabConfig {
  id: ChartTab;
  label: string;
}

const CHART_TABS: ChartTabConfig[] = [
  { id: 'education', label: 'Education' },
  { id: 'employment', label: 'Employment' },
  { id: 'poverty', label: 'Poverty' },
  { id: 'wealth', label: 'Wealth' },
  { id: 'income', label: 'Income' },
  { id: 'lifeExpectancy', label: 'Life Exp.' },
  { id: 'incomeGap', label: 'Income Gap' },
  { id: 'gini', label: 'Gini Index' },
  { id: 'mobility', label: 'Mobility' },
];

export function ChartsPanel({ onClose }: ChartsPanelProps) {
  const history = useSimulationStore((state) => state.history);
  const world = useSimulationStore((state) => state.world);
  const currentYear = useSimulationStore((state) => state.currentYear);

  const [activeTab, setActiveTab] = useState<ChartTab>('education');
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Build class names mapping from world or use defaults
  const classNames: Record<ClassTier, string> = useMemo(() => {
    const defaults: Record<ClassTier, string> = {
      upper: 'Upper Class',
      noble: 'Noble Class',
      middle: 'Middle Class',
      common: 'Common Class',
      lower: 'Lower Class',
    };

    if (!world) {
      return defaults;
    }

    const names = { ...defaults };
    for (const cls of world.classes) {
      names[cls.tier] = cls.displayName;
    }
    return names;
  }, [world]);

  // Transform history to chart data by extracting relevant metrics
  const chartData = useMemo(() => {
    const education: ChartDataPoint[] = [];
    const employment: ChartDataPoint[] = [];
    const poverty: ChartDataPoint[] = [];
    const lifeExpectancy: ChartDataPoint[] = [];
    const incomeGap: Array<{ year: number; gap: number }> = [];
    const gini: Array<{ year: number; gini: number }> = [];
    const mobility: Array<{
      year: number;
      lowerEdu: number;
      commonEdu: number;
      middleEdu: number;
      mobilityIndex: number;
    }> = [];

    // Get year 0 baseline for mobility index calculation
    const year0 = history.length > 0 ? history[0] : null;
    const year0Lower = year0?.classes.find(c => c.tier === 'lower');
    const year0Common = year0?.classes.find(c => c.tier === 'common');
    const year0Middle = year0?.classes.find(c => c.tier === 'middle');

    for (const snapshot of history) {
      const eduPoint: ChartDataPoint = { year: snapshot.year };
      const empPoint: ChartDataPoint = { year: snapshot.year };
      const povPoint: ChartDataPoint = { year: snapshot.year };
      const lePoint: ChartDataPoint = { year: snapshot.year };

      const upperClass = snapshot.classes.find(c => c.tier === 'upper');
      const lowerClass = snapshot.classes.find(c => c.tier === 'lower');
      const commonClass = snapshot.classes.find(c => c.tier === 'common');
      const middleClass = snapshot.classes.find(c => c.tier === 'middle');

      for (const cls of snapshot.classes) {
        eduPoint[cls.tier] = cls.metrics.education;
        empPoint[cls.tier] = cls.metrics.employment;
        povPoint[cls.tier] = cls.metrics.poverty;
        lePoint[cls.tier] = cls.metrics.lifeExpectancy;
      }

      education.push(eduPoint);
      employment.push(empPoint);
      poverty.push(povPoint);
      lifeExpectancy.push(lePoint);

      // Income Gap (upper/lower ratio)
      if (upperClass && lowerClass && lowerClass.metrics.incomePerCapita > 0) {
        incomeGap.push({
          year: snapshot.year,
          gap: upperClass.metrics.incomePerCapita / lowerClass.metrics.incomePerCapita,
        });
      }

      // Gini coefficient from aggregates
      gini.push({
        year: snapshot.year,
        gini: snapshot.aggregates.wealthGini,
      });

      // Class Mobility Index
      // Composite score: education improvement + poverty reduction + income convergence
      if (lowerClass && commonClass && middleClass && year0Lower && year0Common && year0Middle) {
        const lowerEduGain = lowerClass.metrics.education - year0Lower.metrics.education;
        const commonEduGain = commonClass.metrics.education - year0Common.metrics.education;
        const middleEduGain = middleClass.metrics.education - year0Middle.metrics.education;
        const lowerPovReduction = year0Lower.metrics.poverty - lowerClass.metrics.poverty;

        // Mobility index: weighted composite (0-100 scale)
        const mobilityIndex = Math.max(0, Math.min(100,
          (lowerEduGain * 0.4) + // Education gains weighted heavily
          (commonEduGain * 0.2) +
          (middleEduGain * 0.1) +
          (lowerPovReduction * 0.3) // Poverty reduction
        ));

        mobility.push({
          year: snapshot.year,
          lowerEdu: lowerClass.metrics.education,
          commonEdu: commonClass.metrics.education,
          middleEdu: middleClass.metrics.education,
          mobilityIndex,
        });
      }
    }

    return { education, employment, poverty, lifeExpectancy, incomeGap, gini, mobility };
  }, [history]);

  // Get snapshot for selected year
  const selectedSnapshot = useMemo(() => {
    return history.find((h) => h.year === selectedYear) || history[history.length - 1];
  }, [history, selectedYear]);

  // Build wealth pie data
  const wealthPieData = useMemo(() => {
    if (!selectedSnapshot) return [];
    return selectedSnapshot.classes.map((cls) => ({
      tier: cls.tier,
      displayName: cls.displayName,
      value: cls.metrics.wealth,
    }));
  }, [selectedSnapshot]);

  // Build income distribution data
  const incomeData = useMemo(() => {
    if (!selectedSnapshot) return [];
    return selectedSnapshot.classes.map((cls) => ({
      tier: cls.tier,
      displayName: cls.displayName,
      income: cls.metrics.incomePerCapita,
    }));
  }, [selectedSnapshot]);

  const minYear = history.length > 0 ? history[0].year : 0;
  const maxYear = currentYear;

  const renderActiveChart = () => {
    switch (activeTab) {
      case 'education':
        return (
          <EducationChart data={chartData.education} classNames={classNames} />
        );
      case 'employment':
        return (
          <EmploymentChart data={chartData.employment} classNames={classNames} />
        );
      case 'poverty':
        return (
          <PovertyChart data={chartData.poverty} classNames={classNames} />
        );
      case 'wealth':
        return (
          <WealthPieChart data={wealthPieData} year={selectedYear} />
        );
      case 'income':
        return (
          <IncomeDistributionChart data={incomeData} year={selectedYear} />
        );
      case 'lifeExpectancy':
        return (
          <LifeExpectancyChart
            data={chartData.lifeExpectancy}
            classNames={classNames}
          />
        );
      case 'incomeGap':
        return (
          <IncomeGapChart data={chartData.incomeGap} />
        );
      case 'gini':
        return (
          <GiniChart data={chartData.gini} />
        );
      case 'mobility':
        return (
          <ClassMobilityChart data={chartData.mobility} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-deep-purple overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between border-b border-white/10 glass-panel px-4 py-4 sm:px-6">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-muted-text transition-colors hover:text-white active:text-white min-h-[44px] px-2"
        >
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="font-grotesk">Back to Simulation</span>
        </button>

        <span className="font-grotesk text-base text-white/70">
          Year {minYear} - {maxYear}
        </span>
      </header>

      {/* Timeline Scrubber - Top of page for both mobile and desktop */}
      <div className="flex-shrink-0 border-b border-white/10 glass-panel px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <TimelineScrubber
            minYear={minYear}
            maxYear={maxYear}
            currentYear={selectedYear}
            onYearChange={setSelectedYear}
            step={history.length > 1 ? history[1].year - history[0].year : 1}
          />
        </div>
      </div>

      {/* Chart Selection Dropdown (Mobile) */}
      <div className="flex-shrink-0 border-b border-white/10 glass-panel px-4 py-3 md:hidden">
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as ChartTab)}
            className="
              w-full appearance-none
              bg-cosmic-blue border border-white/20
              rounded-lg px-4 py-3
              font-grotesk text-base text-white
              focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-transparent
              cursor-pointer
            "
          >
            {CHART_TABS.map((tab) => (
              <option key={tab.id} value={tab.id} className="bg-cosmic-blue">
                {tab.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-5 w-5 text-muted-text"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content - scrollable */}
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {/* Desktop Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Row 1: Core metrics */}
          <div className="glass-card p-5">
            <EducationChart
              data={chartData.education}
              classNames={classNames}
              height={250}
            />
          </div>
          <div className="glass-card p-5">
            <EmploymentChart
              data={chartData.employment}
              classNames={classNames}
              height={250}
            />
          </div>
          <div className="glass-card p-5">
            <PovertyChart
              data={chartData.poverty}
              classNames={classNames}
              height={250}
            />
          </div>
          {/* Row 2: Wealth and income */}
          <div className="glass-card p-5">
            <WealthPieChart data={wealthPieData} year={selectedYear} height={250} />
          </div>
          <div className="glass-card p-5">
            <IncomeDistributionChart
              data={incomeData}
              year={selectedYear}
              height={250}
            />
          </div>
          <div className="glass-card p-5">
            <LifeExpectancyChart
              data={chartData.lifeExpectancy}
              classNames={classNames}
              height={250}
            />
          </div>
          {/* Row 3: Inequality metrics */}
          <div className="glass-card p-5">
            <IncomeGapChart
              data={chartData.incomeGap}
              height={220}
            />
          </div>
          <div className="glass-card p-5">
            <GiniChart
              data={chartData.gini}
              height={220}
            />
          </div>
          <div className="glass-card p-5">
            <ClassMobilityChart
              data={chartData.mobility}
              height={220}
            />
          </div>
        </div>

        {/* Mobile Single Chart */}
        <div className="md:hidden">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="glass-card p-5"
          >
            {renderActiveChart()}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-white/10 glass-panel px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-xl">
          <Button variant="ghost" size="md" onClick={onClose} className="w-full font-grotesk">
            Close Charts
          </Button>
        </div>
      </footer>
    </div>
  );
}

export default ChartsPanel;
