/**
 * Type Definitions & Data Model for Reservation Simulator
 *
 * All types from PRD Technical Specifications, UI-SPEC.md, and CALIBRATED-MODEL.md
 */

// =============================================================================
// Simulation Phase Enum (UI-SPEC.md § 2.2 - 12 phases)
// =============================================================================

/**
 * Simulation phases covering the full user journey.
 * - INTRO through PRE_RESERVATION: Narrative introduction
 * - POLICY_BOTTOM_2 through POLICY_REMOVAL: 5 distinct policy decision phases
 * - END_SUMMARY: Final results at year 100
 * - CHARTS/SETTINGS: Overlay phases (don't interrupt flow)
 */
export enum SimulationPhase {
  /** Galaxy intro sequence */
  INTRO = 'INTRO',
  /** Non-visual transition phase (<500ms, auto-advances to TRAIT_REVEAL) */
  WORLD_GEN = 'WORLD_GEN',
  /** Trait + class pyramid reveal */
  TRAIT_REVEAL = 'TRAIT_REVEAL',
  /** Show bottom class suffering (pre-policy baseline) */
  PRE_RESERVATION = 'PRE_RESERVATION',
  /** Year 0: Initial choice - reserve for bottom 2 classes (Lower + Common) */
  POLICY_BOTTOM_2 = 'POLICY_BOTTOM_2',
  /** Year 20: Show progress, ask to extend to Middle class */
  POLICY_MIDDLE = 'POLICY_MIDDLE',
  /** Year 40: Upper classes protest, introduce Creamy Layer exclusion */
  POLICY_CREAMY_LAYER = 'POLICY_CREAMY_LAYER',
  /** Year 60: Upper classes demand EWS reservation */
  POLICY_EWS = 'POLICY_EWS',
  /** Year 80: Protests to remove reservation, show Year 0 vs Year 80 comparison */
  POLICY_REMOVAL = 'POLICY_REMOVAL',
  /** Year 100: Final results summary */
  END_SUMMARY = 'END_SUMMARY',
  /** Charts overlay (doesn't interrupt simulation flow) */
  CHARTS = 'CHARTS',
  /** Settings overlay (doesn't interrupt simulation flow) */
  SETTINGS = 'SETTINGS',
}

// =============================================================================
// Class Tier Type (UI-SPEC.md § 1.3)
// =============================================================================

/**
 * Class tier identifiers for the 5-tier social hierarchy.
 * Used for tier prefixes and unique class naming.
 */
export type ClassTier = 'upper' | 'noble' | 'middle' | 'common' | 'lower';

/**
 * Mapping of tier to display prefix.
 * Combined with AbsurdTrait.classNames to form full display names.
 */
export const CLASS_TIER_PREFIXES: Record<ClassTier, string> = {
  upper: 'Upper',
  noble: 'Noble',
  middle: 'Middle',
  common: 'Common',
  lower: 'Lower',
} as const;

/**
 * Ordered array of tiers from highest to lowest.
 */
export const CLASS_TIER_ORDER: ClassTier[] = [
  'upper',
  'noble',
  'middle',
  'common',
  'lower',
];

// =============================================================================
// Trait Types (PRD FR-1)
// =============================================================================

/**
 * Trait categories for the 100 absurd traits.
 * 5 categories x 20 traits each = 100 total for MVP
 */
export type TraitCategory =
  | 'Celestial'
  | 'Auditory'
  | 'Culinary'
  | 'Temporal'
  | 'Arbitrary';

/**
 * Absurd trait definition with unique class names per tier.
 *
 * Each trait provides 5 UNIQUE class name suffixes, one per tier.
 * Upper classes get grandiose names; lower classes get diminutive names.
 *
 * Example for "earlobe-frequency":
 *   classNames: { upper: "Harmonics", noble: "Vibrants", middle: "Oscillants", common: "Buzzers", lower: "Deaflings" }
 *
 * Full display names are formed as: PREFIX + classNames[tier]
 *   e.g., "Upper Harmonics", "Lower Deaflings"
 *
 * Max 12 characters per class name suffix (per UI-SPEC.md § 1.3)
 */
export interface AbsurdTrait {
  /** Unique trait identifier (e.g., "earlobe-frequency") */
  id: string;
  /** Full trait description shown during reveal (e.g., "Those whose earlobes vibrate at exactly 432Hz...") */
  text: string;
  /** Category for filtering/grouping */
  category: TraitCategory;
  /** 5 UNIQUE class name suffixes, one per tier */
  classNames: Record<ClassTier, string>;
}

// =============================================================================
// Class & Metrics Types (PRD Technical Specifications)
// =============================================================================

/**
 * Per-class metrics tracked throughout the simulation.
 * All percentages are 0-100 unless otherwise noted.
 */
export interface ClassMetrics {
  /** % with access to education (0-100) */
  education: number;
  /** % with formal employment (0-100) */
  employment: number;
  /** % of total economy controlled (all classes sum to 100) */
  wealth: number;
  /** % living below poverty threshold (0-100) */
  poverty: number;
  /** Average life expectancy in years (0-80 max) */
  lifeExpectancy: number;
  /** Monthly income in credits (currency unit) */
  incomePerCapita: number;
}

/**
 * Social class definition with current metrics.
 */
export interface SocialClass {
  /** Class tier identifier */
  tier: ClassTier;
  /** Full display name (e.g., "Upper Harmonics", "Lower Deaflings") */
  displayName: string;
  /** Population percentage (all classes sum to 100) */
  population: number;
  /** Current metrics for this class */
  metrics: ClassMetrics;
}

// =============================================================================
// Policy Types (PRD FR-2)
// =============================================================================

/**
 * Policy settings for a single class tier.
 * Supports main reservation percentage, Creamy Layer exclusion, and EWS.
 */
export interface ClassPolicy {
  /** Main reservation percentage (0-50) */
  reservationPercent: number;
  /** Whether creamy layer exclusion applies to this class */
  creamyLayerEnabled: boolean;
  /** Income threshold for creamy layer exclusion (credits/month) */
  creamyLayerThreshold: number;
  /** Whether EWS reservation applies (only for 'upper' and 'noble' tiers) */
  ewsEnabled: boolean;
  /** Income threshold for EWS eligibility (credits/month) */
  ewsThreshold: number;
  /** EWS-specific reservation percentage (0-50) */
  ewsPercent: number;
}

/**
 * Complete reservation policy state.
 * Maps each class tier to its policy settings.
 */
export interface ReservationPolicy {
  classes: Record<ClassTier, ClassPolicy>;
}

/**
 * Creates a default (no reservation) policy for a class.
 */
export function createDefaultClassPolicy(): ClassPolicy {
  return {
    reservationPercent: 0,
    creamyLayerEnabled: false,
    creamyLayerThreshold: 0,
    ewsEnabled: false,
    ewsThreshold: 0,
    ewsPercent: 0,
  };
}

/**
 * Creates a default (no reservation) policy for all classes.
 */
export function createDefaultReservationPolicy(): ReservationPolicy {
  return {
    classes: {
      upper: createDefaultClassPolicy(),
      noble: createDefaultClassPolicy(),
      middle: createDefaultClassPolicy(),
      common: createDefaultClassPolicy(),
      lower: createDefaultClassPolicy(),
    },
  };
}

// =============================================================================
// World Configuration (PRD FR-1, FR-2)
// =============================================================================

/**
 * World configuration generated at simulation start.
 * Deterministic given the same seed.
 */
export interface WorldConfig {
  /** Seed for deterministic generation */
  seed: string;
  /** Generated galaxy name */
  galaxyName: string;
  /** Generated planet name */
  planetName: string;
  /** Generated nation name */
  nationName: string;
  /** Selected absurd trait for this world */
  trait: AbsurdTrait;
  /** 5 social classes with initial metrics */
  classes: SocialClass[];
}

// =============================================================================
// Simulation State Types
// =============================================================================

/**
 * Snapshot of simulation state at a specific year.
 * Used for history tracking and chart data.
 */
export interface YearSnapshot {
  /** Simulation year (0-100) */
  year: number;
  /** State of all 5 classes at this year */
  classes: SocialClass[];
  /** Policy state at this year */
  policy: ReservationPolicy;
  /** Aggregate metrics across all classes */
  aggregates: AggregateMetrics;
}

/**
 * Aggregate metrics computed from all class data.
 */
export interface AggregateMetrics {
  /** Average education access across all classes */
  avgEducation: number;
  /** Average employment rate across all classes */
  avgEmployment: number;
  /** Gini coefficient for wealth inequality (0-1) */
  wealthGini: number;
  /** Overall poverty rate (population-weighted) */
  overallPoverty: number;
  /** Average life expectancy (population-weighted) */
  avgLifeExpectancy: number;
  /** Total population (should always be 100) */
  totalPopulation: number;
}

/**
 * Narrative highlight for biggest improvement/change.
 * Used for "Lower Deaflings improved most this decade" messaging.
 */
export interface NarrativeHighlight {
  /** Which class showed biggest improvement */
  classDisplayName: string;
  /** Class tier for styling/color coding */
  classTier: ClassTier;
  /** Which metric improved most */
  metric: keyof ClassMetrics;
  /** Starting value */
  fromValue: number;
  /** Ending value */
  toValue: number;
  /** Absolute change (toValue - fromValue) */
  change: number;
  /** Percentage change ((toValue - fromValue) / fromValue * 100) */
  percentChange: number;
}

/**
 * Complete simulation state managed by Zustand store.
 */
export interface SimulationState {
  /** Current simulation phase */
  phase: SimulationPhase;
  /** World configuration (null before WORLD_GEN) */
  world: WorldConfig | null;
  /** Current year in simulation (0-100) */
  currentYear: number;
  /** Current reservation policy */
  policy: ReservationPolicy;
  /** History of year snapshots for charts/undo */
  history: YearSnapshot[];
  /** Redo stack for time jump redo */
  redoStack: YearSnapshot[];
  /** Current narrative highlight (null if none computed) */
  highlight: NarrativeHighlight | null;
  /** Time jump size setting (5, 10, or 20 years) */
  timeJumpSize: number;
  /** Whether settings drawer is open */
  settingsOpen: boolean;
  /** Whether charts panel is open */
  chartsOpen: boolean;
}

// =============================================================================
// Action Types (for Zustand store)
// =============================================================================

/**
 * Actions available on the simulation store.
 */
export interface SimulationActions {
  // Initialization
  initializeWorld: (seed?: string) => void;
  reset: () => void;

  // Phase navigation
  setPhase: (phase: SimulationPhase) => void;

  // Policy modification
  setClassPolicy: (tier: ClassTier, policy: Partial<ClassPolicy>) => void;
  setCreamyLayer: (tier: ClassTier, enabled: boolean, threshold: number) => void;
  setEWSPolicy: (
    tier: ClassTier,
    enabled: boolean,
    threshold: number,
    ewsPercent: number
  ) => void;
  clearAllReservations: () => void;

  // Time manipulation
  advanceTime: (years: number) => void;
  goBack: () => void;
  goForward: () => void;
  setTimeJumpSize: (years: number) => void;

  // Overlays
  openSettingsDrawer: () => void;
  closeSettingsDrawer: () => void;
  openChartsPanel: () => void;
  closeChartsPanel: () => void;

  // URL sync
  hydrateFromURL: (params: URLSearchParams) => void;
  encodeStateToURL: () => string;
}

/**
 * Combined store type (state + actions).
 */
export type SimulationStore = SimulationState & SimulationActions;

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Metric key for iteration and comparison.
 */
export type MetricKey = keyof ClassMetrics;

/**
 * All metric keys as array.
 */
export const METRIC_KEYS: MetricKey[] = [
  'education',
  'employment',
  'wealth',
  'poverty',
  'lifeExpectancy',
  'incomePerCapita',
];

/**
 * Human-readable metric labels.
 */
export const METRIC_LABELS: Record<MetricKey, string> = {
  education: 'Education Access',
  employment: 'Employment Rate',
  wealth: 'Wealth Share',
  poverty: 'Poverty Rate',
  lifeExpectancy: 'Life Expectancy',
  incomePerCapita: 'Income per Capita',
};

/**
 * Metric units for display.
 */
export const METRIC_UNITS: Record<MetricKey, string> = {
  education: '%',
  employment: '%',
  wealth: '%',
  poverty: '%',
  lifeExpectancy: 'years',
  incomePerCapita: ' credits',
};

/**
 * Whether higher values are "better" for each metric.
 * Used for determining improvement direction.
 */
export const METRIC_HIGHER_IS_BETTER: Record<MetricKey, boolean> = {
  education: true,
  employment: true,
  wealth: true, // More wealth share is better for that class
  poverty: false, // Lower poverty is better
  lifeExpectancy: true,
  incomePerCapita: true,
};

// =============================================================================
// Chart & Visualization Types
// =============================================================================

/**
 * Chart data point for Recharts.
 */
export interface ChartDataPoint {
  year: number;
  [key: string]: number; // Dynamic keys for each class tier
}

/**
 * Class color mapping for consistent chart styling.
 */
export const CLASS_COLORS: Record<ClassTier, string> = {
  upper: '#e2b714', // Gold
  noble: '#2dd4bf', // Teal
  middle: '#60a5fa', // Blue
  common: '#a78bfa', // Purple
  lower: '#e94560', // Red
} as const;
