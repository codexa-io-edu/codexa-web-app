import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CODEXA Brand
        "cx-orange": "#FF6B00",
        "cx-purple": "#8B5CF6",
        "cx-blue": "#3B82F6",

        // Dark Chrome / Surfaces
        "dark-bg": "#080810",
        "dark-nav": "#0A0A12",
        "dark-sidebar": "#0D0D18",
        "dark-card": "#13131F",
        "dark-surface": "#18182A",
        "dark-border": "#1E1E35",
        "dark-border2": "#2A2A45",

        // Light Reader Surfaces
        "light-bg": "#F8FAFC",
        "light-card": "#FFFFFF",
        "light-border": "#E2E8F0",
        "light-text": "#0F172A",
        "light-muted": "#64748B",

        // Semantic Callout / Status Colors
        "cx-success": "#22C55E",
        "cx-warning": "#F59E0B",
        "cx-danger": "#EF4444",
        "cx-info": "#3B82F6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      backgroundImage: {
        "cx-gradient": "linear-gradient(90deg, #FF6B00 0%, #8B5CF6 55%, #3B82F6 100%)",
        "cx-gradient-btn": "linear-gradient(135deg, #FF6B00 0%, #8B5CF6 100%)",
        "cx-gradient-surface": "linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, rgba(8, 8, 16, 0) 100%)",
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            maxWidth: "768px",
            color: theme("colors.slate.700"),
            "h1,h2,h3,h4": {
              color: theme("colors.slate.900"),
              fontWeight: "700",
              scrollMarginTop: "5rem",
            },
            code: {
              backgroundColor: theme("colors.slate.100"),
              borderRadius: "4px",
              padding: "2px 6px",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.875em",
              color: "#8B5CF6",
            },
            "code::before": { content: "none" },
            "code::after": { content: "none" },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
