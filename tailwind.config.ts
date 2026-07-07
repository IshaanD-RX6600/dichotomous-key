import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0c1817",          // deep botanical ink-teal / charcoal (page bg)
        "ink-2": "#102523",      // raised panel
        "ink-3": "#16302d",      // hover panel
        parchment: "#e9dfc6",    // aged parchment
        "parchment-2": "#f5eeda",// lighter parchment
        "parchment-line": "#d8caa6",
        copper: "#c67b47",       // the single warm accent
        "copper-soft": "#dc9b6d",
        "copper-deep": "#7a4a24",
        cream: "#dce4de",        // body text on dark
        "cream-dim": "#9fb2ab",  // muted text on dark
        "teal-line": "#2c4a47",  // hairline on dark
        bodyink: "#2c2418",      // text on parchment
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 2px rgba(198,123,71,.9), 0 14px 40px rgba(198,123,71,.35)",
        plate: "0 12px 34px rgba(0,0,0,.45)",
      },
    },
  },
  plugins: [],
};

export default config;
