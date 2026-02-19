'use client';

/**
 * Whitepaper Page - Methodology documentation placeholder
 *
 * This is a placeholder for Phase 1. Full whitepaper content
 * will be added in Phase 2.
 */

import Link from 'next/link';
import { Button } from '@/components/ui';

export default function WhitepaperPage() {
  return (
    <main className="min-h-screen bg-deep-purple px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Back Link */}
        <Link
          href="/simulate"
          className="mb-8 inline-flex items-center gap-2 font-rajdhani text-sm text-muted-text transition-colors hover:text-white"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Simulation
        </Link>

        {/* Header */}
        <header className="mb-12">
          <h1 className="mb-4 font-orbitron text-3xl font-bold tracking-tight text-white sm:text-4xl">
            METHODOLOGY WHITEPAPER
          </h1>
          <p className="font-rajdhani text-lg text-muted-text">
            Understanding the simulation model behind Reservation Simulator
          </p>
        </header>

        {/* Coming Soon Notice */}
        <div className="mb-12 rounded-xl border-2 border-dashed border-accent-gold/30 bg-accent-gold/5 p-8 text-center">
          <div className="mb-4 text-4xl">📝</div>
          <h2 className="mb-2 font-orbitron text-xl font-bold text-accent-gold">
            Coming in Phase 2
          </h2>
          <p className="font-rajdhani text-muted-text">
            The full methodology whitepaper is being developed and will include:
          </p>
          <ul className="mt-4 space-y-2 text-left font-rajdhani text-sm text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-accent-gold">*</span>
              Detailed mathematical formulas for each metric
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-gold">*</span>
              Calibration methodology and validation targets
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-gold">*</span>
              Real-world data sources and research references
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-gold">*</span>
              Limitations and assumptions of the model
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-gold">*</span>
              Historical context of reservation policies
            </li>
          </ul>
        </div>

        {/* Preview Section */}
        <section className="mb-12">
          <h2 className="mb-4 font-orbitron text-lg font-bold text-white">
            Model Overview
          </h2>
          <div className="space-y-4 font-rajdhani text-muted-text">
            <p>
              The Reservation Simulator uses a dynamic systems model to project
              how reservation policies affect socio-economic outcomes over a
              100-year period. The model tracks five key metrics:
            </p>
            <ul className="ml-4 space-y-1 list-disc list-inside">
              <li>
                <strong className="text-white">Education Access</strong> -
                Percentage with access to education
              </li>
              <li>
                <strong className="text-white">Employment Rate</strong> -
                Percentage with formal employment
              </li>
              <li>
                <strong className="text-white">Wealth Share</strong> - Share of
                total economic wealth
              </li>
              <li>
                <strong className="text-white">Poverty Rate</strong> - Percentage
                below poverty threshold
              </li>
              <li>
                <strong className="text-white">Life Expectancy</strong> - Average
                lifespan in years
              </li>
            </ul>
            <p>
              Each metric is calculated annually based on the previous year's
              values and the current reservation policy settings. The model
              includes feedback loops where improvements in one metric (like
              education) lead to improvements in others (like employment and
              income).
            </p>
          </div>
        </section>

        {/* Key Formula Preview */}
        <section className="mb-12">
          <h2 className="mb-4 font-orbitron text-lg font-bold text-white">
            Key Formulas (Preview)
          </h2>
          <div className="space-y-4 rounded-lg border border-white/10 bg-cosmic-blue/30 p-4 font-mono text-sm text-muted-text">
            <div>
              <span className="text-accent-gold">Education:</span>
              <br />
              E(t+1) = E(t) + R * 0.003 * t
            </div>
            <div>
              <span className="text-accent-gold">Employment:</span>
              <br />
              Emp(t+1) = Emp(t) + (dE * 0.6) + (R * 0.002)
            </div>
            <div>
              <span className="text-accent-gold">Poverty:</span>
              <br />
              P(t+1) = P(t) - (dE * 0.008) - (dEmp * 0.012) - (dW * 0.003)
            </div>
          </div>
          <p className="mt-2 font-rajdhani text-xs text-muted-text italic">
            Where R = reservation percentage, t = years since policy, d = change
          </p>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link href="/simulate">
            <Button variant="primary" size="lg">
              Return to Simulation
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
