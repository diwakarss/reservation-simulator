'use client';

/**
 * WhitepaperLink - Reusable link to the methodology whitepaper
 *
 * Links to the GitHub-hosted PDF for direct viewing/download.
 * Used in EndSummary and HowItWorksOverlay.
 */

// GitHub raw URL for the whitepaper PDF
const WHITEPAPER_URL = 'https://github.com/diwakarss/reservation-simulator/raw/main/whitepapers/Whitepaper.pdf';

interface WhitepaperLinkProps {
  /** Variant style */
  variant?: 'default' | 'button' | 'large';
  /** Optional additional CSS classes */
  className?: string;
}

export function WhitepaperLink({
  variant = 'default',
  className = '',
}: WhitepaperLinkProps) {
  if (variant === 'button') {
    return (
      <a
        href={WHITEPAPER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`
          inline-flex items-center justify-center gap-2
          rounded-lg border border-accent-gold/50 bg-accent-gold/10
          px-6 py-3 font-rajdhani text-sm font-semibold uppercase tracking-wide
          text-accent-gold transition-all duration-200
          hover:border-accent-gold hover:bg-accent-gold/20
          focus:outline-none focus:ring-2 focus:ring-accent-gold/50 focus:ring-offset-2 focus:ring-offset-deep-purple
          ${className}
        `}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Read Whitepaper
      </a>
    );
  }

  if (variant === 'large') {
    return (
      <a
        href={WHITEPAPER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`
          inline-flex items-center justify-center gap-2
          rounded-lg border border-accent-gold/50 bg-accent-gold/10
          px-8 py-4 font-rajdhani text-base font-semibold uppercase tracking-wide
          text-accent-gold transition-all duration-200
          hover:border-accent-gold hover:bg-accent-gold/20
          focus:outline-none focus:ring-2 focus:ring-accent-gold/50 focus:ring-offset-2 focus:ring-offset-deep-purple
          ${className}
        `}
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Read the Whitepaper
        <svg
          className="h-4 w-4 opacity-60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    );
  }

  return (
    <a
      href={WHITEPAPER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        inline-flex items-center gap-1.5 font-rajdhani text-sm
        text-muted-text underline-offset-4 transition-colors
        hover:text-accent-gold hover:underline
        ${className}
      `}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Read the Whitepaper
    </a>
  );
}

export default WhitepaperLink;
