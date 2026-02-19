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
        // Dark cosmic sci-fi palette
        "deep-purple": "#1a1a2e",
        "cosmic-blue": "#16213e",
        "accent-gold": "#e2b714",
        "highlight-red": "#e94560",
        "muted-text": "#a7a7c4",
        // Class-specific colors
        "class-upper": "#e2b714",   // Gold — Upper
        "class-noble": "#2dd4bf",   // Teal — Noble
        "class-middle": "#60a5fa",  // Blue — Middle
        "class-common": "#a78bfa",  // Purple — Common
        "class-lower": "#e94560",   // Red — Lower
      },
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "monospace"],
        rajdhani: ["var(--font-rajdhani)", "sans-serif"],
      },
      backgroundImage: {
        "cosmic-gradient": "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
      },
      animation: {
        "star-twinkle": "twinkle 3s ease-in-out infinite",
        "glow-pulse": "glow 2s ease-in-out infinite",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(226, 183, 20, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(226, 183, 20, 0.8)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
