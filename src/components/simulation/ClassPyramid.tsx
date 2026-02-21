'use client';

/**
 * ClassPyramid
 *
 * Multi-panel visualization showing social divide across metrics:
 * - The Privileged Few vs The Majority (top, full-width)
 * - Education Access (stacked bar with labels outside)
 * - Wealth, Poverty & Job Access pie charts (3 side by side squares)
 * - Text block showing education, job access, income gaps
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import type { SocialClass, ClassTier } from '@/lib/simulation/types';
import { CLASS_COLORS } from '@/lib/simulation/types';

interface ClassPyramidProps {
  /** All 5 social classes */
  classes: SocialClass[];
  /** Whether to show the legend panel */
  showLegend?: boolean;
  /** Whether to animate the reveal */
  animate?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Active shape renderer for pie chart segments - text outside
 */
const renderActiveShape = (props: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: { tier: ClassTier; value: number };
}) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';
  const tierName = payload.tier.charAt(0).toUpperCase() + payload.tier.slice(1);

  return (
    <g>
      {/* Expanded segment */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      {/* Connector line */}
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />
      <circle cx={ex} cy={ey} r={3} fill={fill} stroke="none" />
      {/* Label text - white */}
      <text x={ex + (cos >= 0 ? 6 : -6)} y={ey} textAnchor={textAnchor} fill="#f1f5f9" className="text-sm font-grotesk font-bold">
        {tierName}
      </text>
      <text x={ex + (cos >= 0 ? 6 : -6)} y={ey + 16} textAnchor={textAnchor} fill="#f1f5f9" className="text-sm font-mono">
        {Math.round(payload.value)}%
      </text>
    </g>
  );
};

/**
 * Animation variants for staggered reveal.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export function ClassPyramid({
  classes,
  showLegend = true,
  animate = true,
  className = '',
}: ClassPyramidProps) {
  // Sort classes by tier
  const tierOrder: ClassTier[] = ['upper', 'noble', 'middle', 'common', 'lower'];
  const sortedClasses = [...classes].sort(
    (a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
  );

  // Interactive state for pie charts - default to lower (index 4)
  const [activeWealthIndex, setActiveWealthIndex] = useState<number>(4);
  const [activePovertyIndex, setActivePovertyIndex] = useState<number>(4);
  const [activeJobIndex, setActiveJobIndex] = useState<number>(4);

  // Group classes
  const privileged = sortedClasses.filter((c) => c.tier === 'upper' || c.tier === 'noble');
  const majority = sortedClasses.filter(
    (c) => c.tier === 'middle' || c.tier === 'common' || c.tier === 'lower'
  );

  // Calculate group totals
  const privilegedPop = privileged.reduce((sum, c) => sum + c.population, 0);
  const majorityPop = majority.reduce((sum, c) => sum + c.population, 0);
  const privilegedWealth = privileged.reduce((sum, c) => sum + c.metrics.wealth, 0);
  const majorityWealth = majority.reduce((sum, c) => sum + c.metrics.wealth, 0);

  // Pie chart data
  const wealthData = sortedClasses.map((cls) => ({
    name: cls.displayName,
    value: cls.metrics.wealth,
    tier: cls.tier,
  }));

  const povertyData = sortedClasses.map((cls) => ({
    name: cls.displayName,
    value: cls.metrics.poverty,
    tier: cls.tier,
  }));

  const jobData = sortedClasses.map((cls) => ({
    name: cls.displayName,
    value: cls.metrics.employment,
    tier: cls.tier,
  }));

  // Calculate majority averages vs privileged averages
  const majorityAvgEducation =
    majority.reduce((sum, c) => sum + c.metrics.education * c.population, 0) / majorityPop;
  const privilegedAvgEducation =
    privileged.reduce((sum, c) => sum + c.metrics.education * c.population, 0) / privilegedPop;
  const educationGap = Math.round(privilegedAvgEducation - majorityAvgEducation);

  const majorityAvgEmployment =
    majority.reduce((sum, c) => sum + c.metrics.employment * c.population, 0) / majorityPop;
  const privilegedAvgEmployment =
    privileged.reduce((sum, c) => sum + c.metrics.employment * c.population, 0) / privilegedPop;
  const employmentGap = Math.round(privilegedAvgEmployment - majorityAvgEmployment);

  const majorityAvgIncome =
    majority.reduce((sum, c) => sum + c.metrics.incomePerCapita * c.population, 0) / majorityPop;
  const privilegedAvgIncome =
    privileged.reduce((sum, c) => sum + c.metrics.incomePerCapita * c.population, 0) / privilegedPop;
  const incomeRatio = Math.round(privilegedAvgIncome / majorityAvgIncome * 10) / 10;

  const Container = animate ? motion.div : 'div';
  const Item = animate ? motion.div : 'div';

  // Pie chart hover handlers
  const onWealthEnter = useCallback((_: unknown, index: number) => setActiveWealthIndex(index), []);
  const onPovertyEnter = useCallback((_: unknown, index: number) => setActivePovertyIndex(index), []);
  const onJobEnter = useCallback((_: unknown, index: number) => setActiveJobIndex(index), []);

  return (
    <Container
      className={`w-full ${className}`}
      {...(animate ? { variants: containerVariants, initial: 'hidden', animate: 'visible' } : {})}
    >
      {/* 1. THE DIVIDE - Full width at top */}
      <Item
        {...(animate ? { variants: itemVariants } : {})}
        className="mb-6"
      >
        <div className="bg-deep-purple/60 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-8">
            {/* Privileged */}
            <div className="flex-1">
              <p className="text-cosmic-white/60 text-sm mb-1">The Privileged Few</p>
              <p className="font-orbitron text-4xl font-bold text-cosmic-white">
                {privilegedPop}%
              </p>
              <p className="text-cosmic-white/50 text-sm">of population</p>
              <p className="text-sm mt-2" style={{ color: CLASS_COLORS.upper }}>
                Upper + Noble
              </p>
            </div>

            {/* VS divider */}
            <div className="flex flex-col items-center">
              <div className="h-12 w-px bg-white/20" />
              <span className="text-cosmic-white/40 text-xl font-bold py-2">vs</span>
              <div className="h-12 w-px bg-white/20" />
            </div>

            {/* Majority */}
            <div className="flex-1">
              <p className="text-cosmic-white/60 text-sm mb-1">The Majority</p>
              <p className="font-orbitron text-4xl font-bold text-cosmic-white">
                {majorityPop}%
              </p>
              <p className="text-cosmic-white/50 text-sm">of population</p>
              <p className="text-sm mt-2" style={{ color: CLASS_COLORS.lower }}>
                Middle + Common + Lower
              </p>
            </div>
          </div>
        </div>
      </Item>

      {/* 2. EDUCATION ACCESS - Stacked bar with labels outside */}
      <Item
        {...(animate ? { variants: itemVariants } : {})}
        className="mb-6"
      >
        <div className="bg-deep-purple/40 border border-white/10 rounded-2xl p-5 overflow-hidden">
          <h3 className="font-grotesk text-lg text-cosmic-white font-medium mb-4">
            Education Access
          </h3>

          {/* Labels above bar - truncate on small segments */}
          <div className="flex mb-2 overflow-hidden">
            {sortedClasses.map((cls) => (
              <div
                key={cls.tier}
                className="text-center overflow-hidden"
                style={{ width: `${cls.metrics.education}%`, minWidth: 0 }}
              >
                <span className="text-xs text-cosmic-white font-medium truncate block">
                  {cls.metrics.education >= 10 ? cls.tier.charAt(0).toUpperCase() + cls.tier.slice(1) : ''}
                </span>
              </div>
            ))}
          </div>

          {/* Bar - no text inside */}
          <div className="flex h-10 rounded-lg overflow-hidden">
            {sortedClasses.map((cls) => (
              <div
                key={cls.tier}
                className="transition-all duration-200"
                style={{
                  width: `${cls.metrics.education}%`,
                  backgroundColor: CLASS_COLORS[cls.tier],
                }}
              />
            ))}
          </div>

          {/* Percentages below bar - hide for very small segments */}
          <div className="flex mt-2 overflow-hidden">
            {sortedClasses.map((cls) => (
              <div
                key={cls.tier}
                className="text-center overflow-hidden"
                style={{ width: `${cls.metrics.education}%`, minWidth: 0 }}
              >
                <span className="text-xs text-cosmic-white/70 font-mono truncate block">
                  {cls.metrics.education >= 5 ? `${cls.metrics.education}%` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Item>

      {/* 3. CHARTS - Stacked on mobile, 3 side by side on desktop */}
      <Item
        {...(animate ? { variants: itemVariants } : {})}
        className="mb-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Wealth Distribution */}
          <div className="bg-deep-purple/60 border border-white/10 rounded-2xl p-4 aspect-square flex flex-col">
            <h3 className="font-grotesk text-xl text-cosmic-white font-medium mb-1 text-center">
              Wealth
            </h3>
            <p className="text-cosmic-white/50 text-sm mb-2 text-center">
              {Math.round(privilegedWealth)}% held by {privilegedPop}%
            </p>

            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeWealthIndex}
                    activeShape={renderActiveShape}
                    data={wealthData}
                    cx="50%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="45%"
                    dataKey="value"
                    stroke="none"
                    onMouseEnter={onWealthEnter}
                    onTouchStart={onWealthEnter}
                  >
                    {wealthData.map((entry) => (
                      <Cell
                        key={entry.tier}
                        fill={CLASS_COLORS[entry.tier as ClassTier]}
                        className="cursor-pointer"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Poverty Burden */}
          <div className="bg-deep-purple/60 border border-white/10 rounded-2xl p-4 aspect-square flex flex-col">
            <h3 className="font-grotesk text-xl text-cosmic-white font-medium mb-1 text-center">
              Poverty
            </h3>
            <p className="text-cosmic-white/50 text-sm mb-2 text-center">
              % living in poverty
            </p>

            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activePovertyIndex}
                    activeShape={renderActiveShape}
                    data={povertyData}
                    cx="50%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="45%"
                    dataKey="value"
                    stroke="none"
                    onMouseEnter={onPovertyEnter}
                    onTouchStart={onPovertyEnter}
                  >
                    {povertyData.map((entry) => (
                      <Cell
                        key={entry.tier}
                        fill={CLASS_COLORS[entry.tier as ClassTier]}
                        className="cursor-pointer"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Job Access */}
          <div className="bg-deep-purple/60 border border-white/10 rounded-2xl p-4 aspect-square flex flex-col">
            <h3 className="font-grotesk text-xl text-cosmic-white font-medium mb-1 text-center">
              Job Access
            </h3>
            <p className="text-cosmic-white/50 text-sm mb-2 text-center">
              % with employment
            </p>

            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeJobIndex}
                    activeShape={renderActiveShape}
                    data={jobData}
                    cx="50%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="45%"
                    dataKey="value"
                    stroke="none"
                    onMouseEnter={onJobEnter}
                    onTouchStart={onJobEnter}
                  >
                    {jobData.map((entry) => (
                      <Cell
                        key={entry.tier}
                        fill={CLASS_COLORS[entry.tier as ClassTier]}
                        className="cursor-pointer"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Item>

      {/* 4. THE GAP - Text block showing disparity */}
      <Item
        {...(animate ? { variants: itemVariants } : {})}
      >
        <div className="bg-deep-purple/40 border border-white/10 rounded-2xl p-5">
          <h3 className="font-grotesk text-base text-cosmic-white font-medium mb-4">
            The Majority Lags Behind
          </h3>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-cosmic-white/50 text-xs mb-1">Education Access</p>
              <p className="font-orbitron text-2xl font-bold text-cosmic-white">
                -{educationGap}%
              </p>
              <p className="text-cosmic-white/40 text-xs">vs privileged</p>
            </div>
            <div>
              <p className="text-cosmic-white/50 text-xs mb-1">Job Access</p>
              <p className="font-orbitron text-2xl font-bold text-cosmic-white">
                -{employmentGap}%
              </p>
              <p className="text-cosmic-white/40 text-xs">vs privileged</p>
            </div>
            <div>
              <p className="text-cosmic-white/50 text-xs mb-1">Per Capita Income</p>
              <p className="font-orbitron text-2xl font-bold text-cosmic-white">
                {incomeRatio}x
              </p>
              <p className="text-cosmic-white/40 text-xs">lower</p>
            </div>
          </div>
        </div>
      </Item>

      {/* BOTTOM: Summary insight */}
      <Item
        {...(animate ? { variants: itemVariants } : {})}
        className="mt-6"
      >
        <div className="flex items-center justify-center gap-4 text-center">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <p className="font-grotesk text-sm text-cosmic-white/70 italic px-4">
            {privilegedPop}% control {Math.round(privilegedWealth)}% of wealth. {majorityPop}% share {Math.round(majorityWealth)}%.
          </p>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </Item>
    </Container>
  );
}

export default ClassPyramid;
