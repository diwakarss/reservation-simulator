'use client';

import { useEffect, useState } from 'react';
import { Drawer, Button } from '@/components/ui';
import { useSimulationStore } from '@/lib/store';
import type { ClassTier } from '@/lib/simulation/types';

const TARGET_TIERS: ClassTier[] = ['middle', 'common', 'lower'];
const DEFAULT_TARGET_TIERS: ClassTier[] = ['common', 'lower'];
const TIME_JUMP_OPTIONS = [5, 10, 20] as const;

const TIER_LABELS: Record<ClassTier, string> = {
  upper: 'Class 1 (Upper)',
  noble: 'Class 2 (Noble)',
  middle: 'Class 3 (Middle)',
  common: 'Class 4 (Common)',
  lower: 'Class 5 (Lower)',
};

function getTierDisplayName(tier: ClassTier, worldClassNames: Record<ClassTier, string>): string {
  return `${TIER_LABELS[tier]} - ${worldClassNames[tier]}`;
}

export function SettingsDrawer() {
  const settingsOpen = useSimulationStore((state) => state.settingsOpen);
  const closeSettingsDrawer = useSimulationStore((state) => state.closeSettingsDrawer);
  const policy = useSimulationStore((state) => state.policy);
  const setClassPolicy = useSimulationStore((state) => state.setClassPolicy);
  const timeJumpSize = useSimulationStore((state) => state.timeJumpSize);
  const setTimeJumpSize = useSimulationStore((state) => state.setTimeJumpSize);
  const world = useSimulationStore((state) => state.world);

  const worldClassNames: Record<ClassTier, string> = {
    upper: world?.classes.find((c) => c.tier === 'upper')?.displayName ?? 'Upper Class',
    noble: world?.classes.find((c) => c.tier === 'noble')?.displayName ?? 'Noble Class',
    middle: world?.classes.find((c) => c.tier === 'middle')?.displayName ?? 'Middle Class',
    common: world?.classes.find((c) => c.tier === 'common')?.displayName ?? 'Common Class',
    lower: world?.classes.find((c) => c.tier === 'lower')?.displayName ?? 'Lower Class',
  };

  const [reservationPercent, setReservationPercent] = useState<number>(0);
  const [selectedTiers, setSelectedTiers] = useState<ClassTier[]>(DEFAULT_TARGET_TIERS);

  useEffect(() => {
    if (!settingsOpen) {
      return;
    }

    const enabledTiers = TARGET_TIERS.filter(
      (tier) => policy.classes[tier].reservationPercent > 0
    );

    const nextSelected: ClassTier[] =
      enabledTiers.length > 0 ? enabledTiers : DEFAULT_TARGET_TIERS;
    const nextPercent = Math.max(...nextSelected.map((tier) => policy.classes[tier].reservationPercent));

    setSelectedTiers(nextSelected);
    setReservationPercent(nextPercent);
  }, [settingsOpen]);

  const applyReservationPercent = (percent: number, tiers: ClassTier[]) => {
    TARGET_TIERS.forEach((tier) => {
      const isSelected = tiers.includes(tier);
      setClassPolicy(tier, { reservationPercent: isSelected ? percent : 0 });
    });
  };

  const handleSliderChange = (percent: number) => {
    setReservationPercent(percent);
    applyReservationPercent(percent, selectedTiers);
  };

  const handleTierToggle = (tier: ClassTier) => {
    const nextTiers = selectedTiers.includes(tier)
      ? selectedTiers.filter((item) => item !== tier)
      : [...selectedTiers, tier];

    setSelectedTiers(nextTiers);
    applyReservationPercent(reservationPercent, nextTiers);
  };

  const handleReset = () => {
    setReservationPercent(0);
    setSelectedTiers(DEFAULT_TARGET_TIERS);
    TARGET_TIERS.forEach((tier) => setClassPolicy(tier, { reservationPercent: 0 }));
    setTimeJumpSize(20);
  };

  return (
    <Drawer isOpen={settingsOpen} onClose={closeSettingsDrawer} title="Simulation Settings">
      <div className="space-y-6">
        <p className="rounded-lg border border-accent-gold/25 bg-accent-gold/10 px-3 py-2 font-rajdhani text-sm text-accent-gold">
          Changes will affect future years only. Past years remain unchanged.
        </p>

        <section className="space-y-3">
          <h3 className="font-orbitron text-sm uppercase tracking-wide text-white">Reservation Percentage</h3>
          <label htmlFor="reservation-percent" className="font-rajdhani text-sm text-muted-text">
            {reservationPercent}%
          </label>
          <input
            id="reservation-percent"
            type="range"
            min={0}
            max={50}
            value={reservationPercent}
            onChange={(event) => handleSliderChange(Number(event.target.value))}
            className="w-full accent-accent-gold"
            aria-label="Reservation percentage"
          />
        </section>

        <section className="space-y-3">
          <h3 className="font-orbitron text-sm uppercase tracking-wide text-white">Target Classes</h3>
          <div className="space-y-2">
            {TARGET_TIERS.map((tier) => (
              <label key={tier} className="flex items-center gap-3 rounded-md border border-white/10 px-3 py-2 text-sm text-muted-text">
                <input
                  type="checkbox"
                  checked={selectedTiers.includes(tier)}
                  onChange={() => handleTierToggle(tier)}
                  className="h-4 w-4 accent-accent-gold"
                />
                <span>{getTierDisplayName(tier, worldClassNames)}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="font-orbitron text-sm uppercase tracking-wide text-white">Time Jump Size</h3>
          <div className="grid grid-cols-3 gap-2">
            {TIME_JUMP_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTimeJumpSize(option)}
                className={`rounded-md border px-3 py-2 text-sm font-rajdhani transition-colors ${
                  timeJumpSize === option
                    ? 'border-accent-gold bg-accent-gold/20 text-accent-gold'
                    : 'border-white/10 text-muted-text hover:border-white/30 hover:text-white'
                }`}
                aria-pressed={timeJumpSize === option}
              >
                {option} years
              </button>
            ))}
          </div>
        </section>

        <Button type="button" variant="ghost" size="md" onClick={handleReset} className="w-full">
          Reset to Defaults
        </Button>
      </div>
    </Drawer>
  );
}

export default SettingsDrawer;
