'use client';

/**
 * PolicyCreamyLayer
 *
 * Year 40 screen: Upper classes protest, introduce Creamy Layer exclusion.
 */

import { PolicyLayout } from './PolicyLayout';
import { PolicyToggle } from './PolicyToggle';
import { ExplanationBox } from '@/components/ui/ExplanationBox';
import type { SocialClass, ClassPolicy, ClassTier } from '@/lib/simulation/types';

interface PolicyCreamyLayerProps {
  /** Social classes data */
  classes: SocialClass[];
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

  if (!lowerClass || !commonClass || !middleClass) {
    return null;
  }

  // Only show creamy layer for classes that have reservation
  const eligibleClasses = [
    { tier: 'lower' as ClassTier, class: lowerClass },
    { tier: 'common' as ClassTier, class: commonClass },
    { tier: 'middle' as ClassTier, class: middleClass },
  ].filter(({ tier }) => policies[tier].reservationPercent > 0);

  return (
    <PolicyLayout
      year={40}
      primaryActionText="Apply Creamy Layer & Advance"
      onPrimaryAction={onAdvance}
      secondaryActionText="Reject creamy layer demand"
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
        40 Years of Progress
      </h2>

      {/* Protest box */}
      <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🗣️</span>
          <div>
            <h3 className="font-rajdhani font-bold text-accent-gold mb-1">
              THE UPPER CLASSES ARE PROTESTING
            </h3>
            <p className="text-sm text-muted-text">
              &ldquo;The wealthy among the lower classes are taking all the benefits
              while the truly poor remain neglected!&rdquo;
            </p>
            <p className="text-sm text-muted-text mt-2">
              They demand <strong className="text-accent-gold">CREAMY LAYER</strong> exclusion.
            </p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <ExplanationBox title="What is Creamy Layer?" className="mb-8">
        <p className="mb-2">
          Creamy Layer excludes beneficiaries whose family income exceeds a
          threshold from reservation benefits.
        </p>
        <p className="text-sm text-accent-gold/80">
          <strong>The idea:</strong> Let the poorest benefit first.
          <br />
          <strong>Reality:</strong> Often used to dilute policy effectiveness.
        </p>
      </ExplanationBox>

      {/* Question */}
      <p className="text-center text-lg text-muted-text mb-6">
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

      {eligibleClasses.length === 0 && (
        <p className="text-center text-sm text-muted-text/60">
          No classes currently have reservation. Creamy layer is not applicable.
        </p>
      )}
    </PolicyLayout>
  );
}

export default PolicyCreamyLayer;
