import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Glassmorphism palette
        "deep-purple": "#0f172a",      // Slate-900 base
        "cosmic-blue": "#1e293b",      // Slate-800 cards
        "accent-gold": "#38bdf8",      // Cyan-400 accent
        "highlight-red": "#f472b6",    // Pink-400 alerts
        "muted-text": "#94a3b8",       // Slate-400 muted
        "text-primary": "#f1f5f9",     // Slate-100 primary text
        // Class-specific colors (updated)
        "class-upper": "#fbbf24",      // Amber-400 — Upper
        "class-noble": "#34d399",      // Emerald-400 — Noble
        "class-middle": "#60a5fa",     // Blue-400 — Middle
        "class-common": "#a78bfa",     // Violet-400 — Common
        "class-lower": "#f472b6",      // Pink-400 — Lower
      },
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "monospace"],
        rajdhani: ["var(--font-rajdhani)", "sans-serif"],
        grotesk: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      backgroundImage: {
        "cosmic-gradient": "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        "glass-glow": `
          radial-gradient(ellipse at 20% 20%, rgba(56, 189, 248, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(244, 114, 182, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(96, 165, 250, 0.08) 0%, transparent 70%)
        `,
      },
      borderRadius: {
        "glass": "20px",
      },
      backdropBlur: {
        "glass": "16px",
      },
      animation: {
        "star-twinkle": "twinkle 3s ease-in-out infinite",
        "glow-pulse": "glow 2s ease-in-out infinite",
        "neon-pulse": "neon 2s ease-in-out infinite",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(56, 189, 248, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(56, 189, 248, 0.6)" },
        },
        neon: {
          "0%, 100%": { textShadow: "0 0 5px rgba(56, 189, 248, 0.5)" },
          "50%": { textShadow: "0 0 20px rgba(56, 189, 248, 0.8), 0 0 30px rgba(56, 189, 248, 0.4)" },
        },
      },
      // Performance: will-change utilities
      willChange: {
        opacity: "opacity",
        transform: "transform",
        "opacity-transform": "opacity, transform",
      },
    },
  },
  plugins: [],
};

export default config;
