'use client';

/**
 * SettingsDrawer - Comprehensive simulation settings control
 *
 * Features:
 * - Per-class reservation sliders (0-50%)
 * - Creamy Layer toggle + threshold input for lower/common/middle
 * - EWS toggle + threshold + percentage for upper/noble
 * - Time jump size selection (5/10/20 years)
 * - Fullscreen overlay on mobile, slide-in drawer on desktop
 * - Save/Apply buttons that call store actions
 */

import { useEffect, useState } from 'react';
import { Drawer, Button } from '@/components/ui';
import { useSimulationStore } from '@/lib/store';
import type { ClassTier, ReservationPolicy } from '@/lib/simulation/types';
import { CLASS_TIER_ORDER, CLASS_COLORS } from '@/lib/simulation/types';

const RESERVATION_TIERS: ClassTier[] = ['middle', 'common', 'lower'];
const EWS_TIERS: ClassTier[] = ['upper', 'noble'];
const DEFAULT_CLASS_SETTINGS: PerClassSettingsState = {
  reservationPercent: 0,
  creamyLayerEnabled: false,
  creamyLayerThreshold: 5000,
  ewsEnabled: false,
  ewsThreshold: 8000,
  ewsPercent: 0,
};

interface PerClassSettingsState {
  reservationPercent: number;
  creamyLayerEnabled: boolean;
  creamyLayerThreshold: number;
  ewsEnabled: boolean;
  ewsThreshold: number;
  ewsPercent: number;
}

function createDefaultClassSettings(): Record<ClassTier, PerClassSettingsState> {
  const settings = {} as Record<ClassTier, PerClassSettingsState>;
  for (const tier of CLASS_TIER_ORDER) {
    settings[tier] = { ...DEFAULT_CLASS_SETTINGS };
  }
  return settings;
}

function createPolicyBackedClassSettings(policy: ReservationPolicy): Record<ClassTier, PerClassSettingsState> {
  const settings = {} as Record<ClassTier, PerClassSettingsState>;
  for (const tier of CLASS_TIER_ORDER) {
    const classPolicy = policy.classes[tier];
    settings[tier] = {
      reservationPercent: classPolicy.reservationPercent,
      creamyLayerEnabled: classPolicy.creamyLayerEnabled,
      creamyLayerThreshold: classPolicy.creamyLayerThreshold,
      ewsEnabled: classPolicy.ewsEnabled,
      ewsThreshold: classPolicy.ewsThreshold,
      ewsPercent: classPolicy.ewsPercent,
    };
  }
  return settings;
}

export function SettingsDrawer() {
  const settingsOpen = useSimulationStore((state) => state.settingsOpen);
  const closeSettingsDrawer = useSimulationStore((state) => state.closeSettingsDrawer);
  const policy = useSimulationStore((state) => state.policy);
  const setClassPolicy = useSimulationStore((state) => state.setClassPolicy);
  const setCreamyLayer = useSimulationStore((state) => state.setCreamyLayer);
  const setEWSPolicy = useSimulationStore((state) => state.setEWSPolicy);
  const currentYear = useSimulationStore((state) => state.currentYear);
  const world = useSimulationStore((state) => state.world);
  const openChartsPanel = useSimulationStore((state) => state.openChartsPanel);
  const clearAllReservations = useSimulationStore((state) => state.clearAllReservations);

  // Local state for all class settings
  const [classSettings, setClassSettings] = useState<Record<ClassTier, PerClassSettingsState>>(
    () => createDefaultClassSettings()
  );

  // Sync local state with store when drawer opens
  useEffect(() => {
    if (!settingsOpen) return;

    setClassSettings(createPolicyBackedClassSettings(policy));
  }, [settingsOpen, policy]);

  // Get display names
  const getDisplayName = (tier: ClassTier): string => {
    const cls = world?.classes.find((c) => c.tier === tier);
    return cls?.displayName ?? `${tier.charAt(0).toUpperCase() + tier.slice(1)} Class`;
  };

  // Update local state
  const updateClassSetting = (
    tier: ClassTier,
    field: keyof PerClassSettingsState,
    value: number | boolean
  ) => {
    setClassSettings((prev) => ({
      ...prev,
      [tier]: { ...prev[tier], [field]: value },
    }));
  };

  // Apply changes to store
  const applyChanges = () => {
    for (const tier of CLASS_TIER_ORDER) {
      const settings = classSettings[tier];

      // Set reservation percent
      setClassPolicy(tier, { reservationPercent: settings.reservationPercent });

      // Set creamy layer (for reservation tiers)
      if (RESERVATION_TIERS.includes(tier)) {
        setCreamyLayer(tier, settings.creamyLayerEnabled, settings.creamyLayerThreshold);
      }

      // Set EWS (for upper tiers)
      if (EWS_TIERS.includes(tier)) {
        setEWSPolicy(tier, settings.ewsEnabled, settings.ewsThreshold, settings.ewsPercent);
      }
    }
  };

  // Handle apply and close
  const handleApplyAndClose = () => {
    applyChanges();
    closeSettingsDrawer();
  };

  // Reset all settings
  const handleReset = () => {
    clearAllReservations();
    setClassSettings(createDefaultClassSettings());
  };

  // View charts
  const handleViewCharts = () => {
    closeSettingsDrawer();
    openChartsPanel();
  };

  return (
    <Drawer isOpen={settingsOpen} onClose={closeSettingsDrawer} title="Simulation Settings">
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="rounded-lg border border-accent-gold/30 bg-accent-gold/15 px-4 py-3">
          <p className="font-rajdhani text-base text-white">
            Changes will affect future years only.
          </p>
          <p className="font-rajdhani text-sm text-white/80">
            Current Year: {currentYear}
          </p>
        </div>

        {/* Reservation Percentages Section */}
        <section className="space-y-4">
          <h3 className="font-orbitron text-base uppercase tracking-wide text-white">
            Reservation Percentages
          </h3>

          {/* Lower Classes - Can receive reservation */}
          {RESERVATION_TIERS.map((tier) => {
            const settings = classSettings[tier];
            const color = CLASS_COLORS[tier];

            return (
              <div
                key={tier}
                className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-rajdhani text-base font-semibold" style={{ color }}>
                    {getDisplayName(tier)}
                  </span>
                </div>

                {/* Reservation Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-white/80">
                    <span>Reservation</span>
                    <span className="font-semibold text-white">{settings.reservationPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={settings.reservationPercent}
                    onChange={(e) =>
                      updateClassSetting(tier, 'reservationPercent', Number(e.target.value))
                    }
                    className="w-full accent-accent-gold"
                    aria-label={`${getDisplayName(tier)} reservation percentage`}
                  />
                </div>

                {/* Creamy Layer Toggle */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={settings.creamyLayerEnabled}
                      onChange={(e) =>
                        updateClassSetting(tier, 'creamyLayerEnabled', e.target.checked)
                      }
                      className="h-4 w-4 accent-accent-gold"
                    />
                    Creamy Layer
                  </label>
                  {settings.creamyLayerEnabled && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-white/80">Threshold:</span>
                      <input
                        type="number"
                        min={1000}
                        max={50000}
                        step={1000}
                        value={settings.creamyLayerThreshold}
                        onChange={(e) =>
                          updateClassSetting(tier, 'creamyLayerThreshold', Number(e.target.value))
                        }
                        className="w-20 rounded border border-white/10 bg-deep-purple px-2 py-1 text-sm text-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Upper Classes - EWS only */}
          {EWS_TIERS.map((tier) => {
            const settings = classSettings[tier];
            const color = CLASS_COLORS[tier];

            return (
              <div
                key={tier}
                className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-rajdhani text-base font-semibold" style={{ color }}>
                      {getDisplayName(tier)}
                    </span>
                  </div>
                  <span className="text-sm text-white/60">(EWS only)</span>
                </div>

                {/* EWS Toggle */}
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={settings.ewsEnabled}
                    onChange={(e) =>
                      updateClassSetting(tier, 'ewsEnabled', e.target.checked)
                    }
                    className="h-4 w-4 accent-accent-gold"
                  />
                  EWS Reservation
                </label>

                {settings.ewsEnabled && (
                  <div className="space-y-2 pl-5">
                    {/* EWS Threshold */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/80">Threshold:</span>
                      <input
                        type="number"
                        min={1000}
                        max={50000}
                        step={1000}
                        value={settings.ewsThreshold}
                        onChange={(e) =>
                          updateClassSetting(tier, 'ewsThreshold', Number(e.target.value))
                        }
                        className="w-24 rounded border border-white/10 bg-deep-purple px-2 py-1 text-sm text-white"
                      />
                      <span className="text-sm text-white/60">/month</span>
                    </div>

                    {/* EWS Percentage */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-white/80">
                        <span>EWS %</span>
                        <span className="font-semibold text-white">{settings.ewsPercent}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={50}
                        value={settings.ewsPercent}
                        onChange={(e) =>
                          updateClassSetting(tier, 'ewsPercent', Number(e.target.value))
                        }
                        className="w-full accent-accent-gold"
                        aria-label={`${getDisplayName(tier)} EWS percentage`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Actions */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <Button
            variant="primary"
            size="md"
            onClick={handleApplyAndClose}
            className="w-full"
          >
            Apply Changes
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" size="sm" onClick={handleViewCharts}>
              View Charts
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset to Defaults
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default SettingsDrawer;
