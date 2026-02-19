'use client';

/**
 * PolicyEWS
 *
 * Year 60 screen: Upper classes demand EWS reservation.
 */

import { PolicyLayout } from './PolicyLayout';
import { ReservationSlider } from './ReservationSlider';
import { PolicyToggle } from './PolicyToggle';
import { ExplanationBox } from '@/components/ui/ExplanationBox';
import type { SocialClass, ClassPolicy, ClassTier } from '@/lib/simulation/types';

interface PolicyEWSProps {
  /** Social classes data */
  classes: SocialClass[];
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

  if (!upperClass || !nobleClass || !lowerClass) {
    return null;
  }

  return (
    <PolicyLayout
      year={60}
      primaryActionText="Apply EWS & Advance 20 Years"
      onPrimaryAction={onAdvance}
      secondaryActionText="Reject EWS demand"
      onSecondaryAction={onReject}
      showHowItWorks={true}
      onHowItWorks={onHowItWorks}
      showSettings={true}
      onSettings={onSettings}
      showCharts={true}
      onCharts={onCharts}
    >
      {/* Title */}
      <h2 className="font-orbitron text-2xl sm:text-3xl font-bold text-white text-center mb-6">
        60 Years of Progress
      </h2>

      {/* Income comparison */}
      <div className="bg-cosmic-blue/60 border border-white/10 rounded-xl p-4 mb-6">
        <h3 className="font-rajdhani font-semibold text-muted-text mb-3 text-sm uppercase tracking-wider">
          ⚠️ Important Comparison
        </h3>
        <p className="text-sm text-muted-text mb-3">Average income per capita:</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm border-b border-white/5 pb-2">
            <span style={{ color: '#e2b714' }}>{upperClass.displayName}</span>
            <span className="font-orbitron text-accent-gold">
              {upperClass.metrics.incomePerCapita.toLocaleString()} credits/month
            </span>
          </div>
          <div className="flex justify-between text-sm border-b border-white/5 pb-2">
            <span style={{ color: '#2dd4bf' }}>{nobleClass.displayName}</span>
            <span className="font-orbitron text-class-noble">
              {nobleClass.metrics.incomePerCapita.toLocaleString()} credits/month
            </span>
          </div>
          <div className="flex justify-between text-sm pt-2 text-muted-text/60">
            <span>...</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: '#e94560' }}>{lowerClass.displayName}</span>
            <span className="font-orbitron text-highlight-red">
              {lowerClass.metrics.incomePerCapita.toLocaleString()} credits/month
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-text mt-3">
          Even after 60 years, the {upperClass.displayName.split(' ')[0]} class earns{' '}
          {Math.round(upperClass.metrics.incomePerCapita / lowerClass.metrics.incomePerCapita)}x more
          than the {lowerClass.displayName.split(' ')[0]} class.
        </p>
      </div>

      {/* Protest box */}
      <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🗣️</span>
          <div>
            <h3 className="font-rajdhani font-bold text-accent-gold mb-1">
              THE UPPER CLASSES DEMAND EWS
            </h3>
            <p className="text-sm text-muted-text">
              &ldquo;We also have poor people! Give us reservation for our
              Economically Weaker Sections!&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* EWS Explanation */}
      <ExplanationBox title="What is EWS Reservation?" className="mb-8">
        <p className="mb-2">
          EWS (Economically Weaker Section) is reservation for upper classes
          who are below a certain income threshold.
        </p>
        <p className="text-sm text-highlight-red/80">
          Critics call it a &ldquo;side door&rdquo; for upper classes to enjoy
          reservation benefits without acknowledging historical discrimination.
        </p>
      </ExplanationBox>

      {/* Question */}
      <p className="text-center text-lg text-muted-text mb-6">
        Provide EWS reservation for Upper classes?
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
              <label className="text-sm text-muted-text block mb-2">
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
              <div className="flex justify-between text-xs text-muted-text">
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
              <label className="text-sm text-muted-text block mb-2">
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
              <div className="flex justify-between text-xs text-muted-text">
                <span>0%</span>
                <span className="font-bold text-class-noble">{policies.noble.ewsPercent}%</span>
                <span>50%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </PolicyLayout>
  );
}

export default PolicyEWS;
