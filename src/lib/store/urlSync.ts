/**
 * URL State Synchronization
 *
 * Handles encoding/decoding simulation state to/from URL parameters
 * for shareable deep links.
 *
 * URL Schema:
 *   ?seed=abc&year=60&state=<base64-encoded-JSON>
 *
 * The `state` param is a base64-encoded JSON blob of the ReservationPolicy object.
 *
 * Bootstrap precedence order:
 *   1. URL params > 2. localStorage persisted state > 3. fresh seed
 */

import type { ReservationPolicy } from '../simulation/types';

// =============================================================================
// Types
// =============================================================================

/**
 * URL state parameters that can be extracted from the URL.
 */
export interface URLState {
  /** World generation seed */
  seed: string | null;
  /** Target simulation year to hydrate to */
  year: number | null;
  /** Decoded reservation policy */
  policy: ReservationPolicy | null;
}

/**
 * Parameters needed to encode state into URL.
 */
export interface EncodeParams {
  seed: string;
  year: number;
  policy: ReservationPolicy;
}

// =============================================================================
// Base64 Encoding/Decoding
// =============================================================================

/**
 * Encode a string to base64, URL-safe.
 * Works in both browser and Node.js environments.
 */
function base64Encode(str: string): string {
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    // Browser environment
    return window.btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  // Node.js environment (for SSR/tests)
  return Buffer.from(str, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decode a base64 URL-safe string.
 * Works in both browser and Node.js environments.
 */
function base64Decode(str: string): string {
  // Restore standard base64 chars
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }

  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    // Browser environment
    return decodeURIComponent(escape(window.atob(base64)));
  }
  // Node.js environment (for SSR/tests)
  return Buffer.from(base64, 'base64').toString('utf-8');
}

// =============================================================================
// Policy Encoding/Decoding
// =============================================================================

/**
 * Encode a ReservationPolicy to a URL-safe base64 string.
 *
 * @param policy - The policy to encode
 * @returns Base64-encoded JSON string
 */
export function encodePolicy(policy: ReservationPolicy): string {
  const json = JSON.stringify(policy);
  return base64Encode(json);
}

/**
 * Decode a base64 string back to a ReservationPolicy.
 *
 * @param encoded - Base64-encoded policy string
 * @returns Decoded policy, or null if invalid
 */
export function decodePolicy(encoded: string): ReservationPolicy | null {
  try {
    const json = base64Decode(encoded);
    const parsed = JSON.parse(json);

    // Validate that it looks like a ReservationPolicy
    if (!parsed || typeof parsed !== 'object' || !parsed.classes) {
      return null;
    }

    // Check that all tiers are present
    const requiredTiers = ['upper', 'noble', 'middle', 'common', 'lower'];
    for (const tier of requiredTiers) {
      if (!parsed.classes[tier]) {
        return null;
      }
    }

    return parsed as ReservationPolicy;
  } catch {
    return null;
  }
}

// =============================================================================
// URL Encoding
// =============================================================================

/**
 * Encode simulation state to a URL query string.
 *
 * @param params - State to encode
 * @returns URL query string (e.g., "seed=abc&year=60&state=...")
 */
export function encodeStateToURL(params: EncodeParams): string {
  const { seed, year, policy } = params;

  const queryParams = new URLSearchParams();
  queryParams.set('seed', seed);
  queryParams.set('year', year.toString());
  queryParams.set('state', encodePolicy(policy));

  return queryParams.toString();
}

/**
 * Get the full shareable URL for the current state.
 *
 * @param params - State to encode
 * @returns Full URL with query parameters
 */
export function getShareableURL(params: EncodeParams): string {
  const queryString = encodeStateToURL(params);
  const baseURL =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : '/simulate';
  return `${baseURL}?${queryString}`;
}

// =============================================================================
// URL Decoding / Hydration
// =============================================================================

/**
 * Parse URL parameters and extract simulation state.
 *
 * @param params - URLSearchParams from the URL
 * @returns Extracted URL state (nulls for missing/invalid params)
 */
export function parseURLParams(params: URLSearchParams): URLState {
  const seed = params.get('seed');
  const yearStr = params.get('year');
  const stateStr = params.get('state');

  let year: number | null = null;
  if (yearStr) {
    const parsed = parseInt(yearStr, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      year = parsed;
    }
  }

  let policy: ReservationPolicy | null = null;
  if (stateStr) {
    policy = decodePolicy(stateStr);
  }

  return { seed, year, policy };
}

/**
 * Check if URL contains valid simulation state parameters.
 *
 * @param params - URLSearchParams to check
 * @returns True if URL has at least seed parameter
 */
export function hasURLState(params: URLSearchParams): boolean {
  return params.has('seed');
}

/**
 * Create URLSearchParams from a URL string or the current window location.
 *
 * @param url - Optional URL string to parse. If not provided, uses window.location.search
 * @returns URLSearchParams object
 */
export function getURLSearchParams(url?: string): URLSearchParams {
  if (url) {
    const queryString = url.includes('?') ? url.split('?')[1] : url;
    return new URLSearchParams(queryString);
  }
  if (typeof window !== 'undefined') {
    return new URLSearchParams(window.location.search);
  }
  return new URLSearchParams();
}

// =============================================================================
// Browser History Integration
// =============================================================================

/**
 * Update the browser URL without triggering navigation.
 *
 * @param params - State to encode into URL
 * @param replace - If true, replace current history entry. If false, push new entry.
 */
export function updateBrowserURL(params: EncodeParams, replace = true): void {
  if (typeof window === 'undefined') return;

  const url = getShareableURL(params);

  if (replace) {
    window.history.replaceState({}, '', url);
  } else {
    window.history.pushState({}, '', url);
  }
}

/**
 * Clear URL parameters from browser URL.
 * Used when resetting simulation.
 */
export function clearBrowserURL(): void {
  if (typeof window === 'undefined') return;

  const baseURL = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState({}, '', baseURL);
}
