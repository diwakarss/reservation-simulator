'use client';

/**
 * Footer - Attribution footer shown at the bottom of content
 *
 * Simple inline footer, not fixed positioning.
 * Links to @1nimit on X (Twitter)
 */

export function Footer() {
  return (
    <footer className="w-full py-4 px-4 text-center">
      <a
        href="https://x.com/1nimit"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-rajdhani text-sm text-white/50 hover:text-white/80 transition-colors"
      >
        built by
        <span className="font-semibold text-white/60 hover:text-accent-cyan">@1nimit</span>
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
    </footer>
  );
}

export default Footer;
