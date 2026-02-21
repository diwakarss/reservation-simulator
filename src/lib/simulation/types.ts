/**
 * Type Definitions & Data Model for Reservation Simulator
 *
 * All types from PRD Technical Specifications, UI-SPEC.md, and CALIBRATED-MODEL.md
 */

// =============================================================================
// Simulation Phase Enum (UI-SPEC.md § 2.2 - 12 phases)
// =============================================================================

/**
 * Simulation phases covering the full user journey (UI-SPEC.md § 2.2).
 *
 * Phase structure:
 * - INTRO → WORLD_GEN → TRAIT_REVEAL → PRE_RESERVATION: Narrative setup
 * - POLICY_BOTTOM_2 → POLICY_MIDDLE → POLICY_CREAMY_LAYER → POLICY_EWS → POLICY_REMOVAL: Policy decisions at years 0, 40, 80, 120, 160
 * - END_SUMMARY: Final summary at year 200
 * - CHARTS, SETTINGS: Overlay phases (non-blocking)
 */
export enum SimulationPhase {
  /** Galaxy intro sequence */
  INTRO = 'INTRO',
  /** Non-visual world generation phase (auto-advances after <500ms) */
  WORLD_GEN = 'WORLD_GEN',
  /** Trait and class pyramid reveal */
  TRAIT_REVEAL = 'TRAIT_REVEAL',
  /** Baseline view: bottom classes before policy intervention */
  PRE_RESERVATION = 'PRE_RESERVATION',
  /** Year 0: Reserve for Lower + Common classes */
  POLICY_BOTTOM_2 = 'POLICY_BOTTOM_2',
  /** Year 40: Extend reservation to Middle class */
  POLICY_MIDDLE = 'POLICY_MIDDLE',
  /** Year 80: Introduce Creamy Layer exclusion */
  POLICY_CREAMY_LAYER = 'POLICY_CREAMY_LAYER',
  /** Year 120: Introduce EWS (Economically Weaker Sections) reservation */
  POLICY_EWS = 'POLICY_EWS',
  /** Year 160: Policy removal decision and comparison */
  POLICY_REMOVAL = 'POLICY_REMOVAL',
  /** Year 200: Final results and impact summary */
  END_SUMMARY = 'END_SUMMARY',
  /** Charts panel overlay */
  CHARTS = 'CHARTS',
  /** Settings drawer overlay */
  SETTINGS = 'SETTINGS',
}

// =============================================================================
// Class Tier Type (UI-SPEC.md § 1.3)
// =============================================================================

/**
 * Class tier identifiers for the 5-tier social hierarchy (UI-SPEC.md § 1.3).
 * Used for indexing, tier prefixes, and unique class naming.
 */
export type ClassTier = 'upper' | 'noble' | 'middle' | 'common' | 'lower';

/**
 * Mapping of tier to display prefix.
 * Combined with AbsurdTrait.classNames to form full display names.
 *
 * @example
 * displayName = CLASS_TIER_PREFIXES[tier] + ' ' + trait.classNames[tier]
 * // e.g., "Upper Harmonics", "Lower Deaflings"
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
 * Trait categories for organizing absurd traits (PRD FR-1).
 * Five categories with 20 traits each = 100 total for MVP.
 */
export type TraitCategory =
  | 'Celestial'
  | 'Auditory'
  | 'Culinary'
  | 'Temporal'
  | 'Arbitrary';

/**
 * Absurd trait definition with tier-specific class names.
 *
 * Each trait provides 5 unique class name suffixes (one per tier).
 * Upper tiers receive grandiose names; lower tiers receive diminutive/playful names.
 * Forms the identity of the world (e.g., "Upper Harmonics" vs "Lower Deaflings").
 *
 * @example
 * {
 *   id: "earlobe-frequency",
 *   text: "People's earlobes vibrate at different frequencies based on class status",
 *   category: "Auditory",
 *   classNames: {
 *     upper: "Harmonics",
 *     noble: "Vibrants",
 *     middle: "Oscillants",
 *     common: "Buzzers",
 *     lower: "Deaflings"
 *   }
 * }
 * // Display: "Upper Harmonics" (upper tier) → "Lower Deaflings" (lower tier)
 *
 * **Constraint**: Each classNames value must be ≤12 characters (UI-SPEC.md § 1.3)
 */
export interface AbsurdTrait {
  /** Unique trait identifier (kebab-case) */
  id: string;
  /** Full trait description shown during narrative reveal */
  text: string;
  /** Category for grouping and filtering (5 categories, 20 traits each = 100 total) */
  category: TraitCategory;
  /** Tier-specific class name suffixes (max 12 chars each, combined with CLASS_TIER_PREFIXES) */
  classNames: Record<ClassTier, string>;
}

// =============================================================================
// Class & Metrics Types (PRD Technical Specifications)
// =============================================================================

/**
 * Per-class metrics tracked throughout the simulation (CALIBRATED-MODEL.md).
 *
 * All metrics are updated annually based on policy, education, employment,
 * wealth, and socioeconomic feedback loops.
 *
 * **Percentage metrics** (0–100): education, employment, poverty
 * **Proportional metrics** (0–100, class-level sums): wealth
 * **Absolute metrics**: lifeExpectancy (years), incomePerCapita (credits/month)
 */
export interface ClassMetrics {
  /** Percentage with access to education (0–100) */
  education: number;
  /** Percentage with formal employment (0–100) */
  employment: number;
  /** Share of total economy (all classes sum to 100%) */
  wealth: number;
  /** Percentage living below poverty threshold (0–100) */
  poverty: number;
  /** Average life expectancy in years (0–80) */
  lifeExpectancy: number;
  /** Average monthly income in credits (currency unit) */
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
 * Policy settings for a single class tier (PRD FR-2).
 *
 * Three policy mechanisms work together:
 * - **Main reservation**: Direct quota for seat/position allocation (reservationPercent)
 * - **Creamy Layer**: Income-based exclusion from reservation benefits (creamyLayerEnabled)
 * - **EWS**: Economically Weaker Sections reservation (upper/noble tiers only, ewsEnabled)
 *
 * @example
 * const lowerClassPolicy: ClassPolicy = {
 *   reservationPercent: 27,    // 27% quota for lower class
 *   creamyLayerEnabled: false, // No income-based exclusion yet
 *   creamyLayerThreshold: 0,
 *   ewsEnabled: false,         // EWS only applies to upper/noble tiers
 *   ewsThreshold: 0,
 *   ewsPercent: 0
 * };
 */
export interface ClassPolicy {
  /** Main reservation quota percentage (0–50%) */
  reservationPercent: number;
  /** Whether creamy layer income threshold applies */
  creamyLayerEnabled: boolean;
  /** Income threshold for creamy layer exclusion (credits/month, zero if disabled) */
  creamyLayerThreshold: number;
  /** Whether EWS reservation applies (upper and noble tiers only) */
  ewsEnabled: boolean;
  /** Income threshold for EWS eligibility (credits/month, zero if disabled) */
  ewsThreshold: number;
  /** EWS-specific reservation quota percentage (0–50%, zero if disabled) */
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
  /** Simulation year (0-200) */
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
  /** Current year in simulation (0-200) */
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
  /** Whether How It Works overlay is open */
  howItWorksOpen: boolean;
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
  openHowItWorks: () => void;
  closeHowItWorks: () => void;

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
 * Metric key type for iteration and comparison.
 */
export type MetricKey = keyof ClassMetrics;

/**
 * All metric keys in stable order.
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
 * Human-readable labels for metrics (UI display).
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
 * Units for metric display (suffixes or prefixes).
 */
export const METRIC_UNITS: Record<MetricKey, string> = {
  education: '%',
  employment: '%',
  wealth: '%',
  poverty: '%',
  lifeExpectancy: 'years',
  incomePerCapita: 'credits',
};

/**
 * Metric improvement direction (true = higher is better).
 * Used for narrative highlights and trend analysis to determine class progress.
 *
 * **Higher is better**: education, employment, wealth, lifeExpectancy, incomePerCapita
 * **Lower is better**: poverty (lower poverty rate = improvement)
 */
export const METRIC_HIGHER_IS_BETTER: Record<MetricKey, boolean> = {
  education: true,
  employment: true,
  wealth: true,           // Greater wealth share is better for the class
  poverty: false,         // Lower poverty is better (improvement = decrease)
  lifeExpectancy: true,
  incomePerCapita: true,
};

// =============================================================================
// Chart & Visualization Types
// =============================================================================

/**
 * Chart data point for Recharts visualization.
 * Dynamically keyed by class tier for line/bar rendering.
 */
export interface ChartDataPoint {
  year: number;
  [key: string]: number;
}

/**
 * Class color mapping for consistent chart styling.
 * Colors chosen for accessibility and visual distinction across all chart views.
 *
 * @example
 * const color = CLASS_COLORS['lower']; // '#e94560' (Red/Crimson)
 */
export const CLASS_COLORS: Record<ClassTier, string> = {
  upper: '#fbbf24',     // Amber-400
  noble: '#34d399',     // Emerald-400
  middle: '#60a5fa',    // Blue-400
  common: '#a78bfa',    // Violet-400
  lower: '#f472b6',     // Pink-400
} as const;
