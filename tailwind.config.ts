import type { Config } from "tailwindcss";

/**
 * Niyyah OS design system — premium "intention" aesthetic.
 *
 * Calm warm-paper canvas, evergreen as the primary accent (intention, growth),
 * and a restrained brass/gold as the premium accent (used sparingly for crests,
 * price, unlock). No loud or dopamine colors; violations use clay, not alarm red.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces
        canvas: "#F4F1EA", // warm paper
        surface: "#FFFFFF",
        raised: "#FBFAF6",
        sand: "#ECE5D8",
        sandsoft: "#F3EEE3",

        // Ink / text
        ink: "#1B1A16",
        muted: "#6C685F",
        faint: "#9A958A",

        // Lines
        line: "#E6E0D5",
        "line-strong": "#D6CEBE",

        // Accent — evergreen
        accent: {
          DEFAULT: "#2E4A40",
          hover: "#243a32",
          soft: "#E6EDE8",
          ink: "#192B25",
        },

        // Premium — brass / gold (used sparingly)
        gold: {
          DEFAULT: "#9C7C4D",
          soft: "#F1E8D6",
          ink: "#6B5331",
          line: "#D9C49C",
        },

        // Behavioral semantics
        affirm: "#4F7A5E",
        affirmsoft: "#E7F0EA",
        caution: "#9C7434",
        cautionsoft: "#F4ECDC",
        breach: "#A8584A",
        breachsoft: "#F4E4E0",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      fontSize: {
        hero: ["clamp(2.6rem, 6vw, 4.5rem)", { lineHeight: "1.0", letterSpacing: "-0.025em" }],
        display: ["clamp(2.2rem, 4.5vw, 3.4rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        title: ["clamp(1.6rem, 2.5vw, 2rem)", { lineHeight: "1.12", letterSpacing: "-0.015em" }],
      },
      letterSpacing: {
        kicker: "0.2em",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(27,26,22,0.04), 0 8px 28px -16px rgba(27,26,22,0.12)",
        lift: "0 2px 6px rgba(27,26,22,0.05), 0 24px 50px -28px rgba(27,26,22,0.22)",
        ring: "0 0 0 1px rgba(27,26,22,0.04), 0 1px 2px rgba(27,26,22,0.04)",
        glow: "0 0 0 1px rgba(46,74,64,0.08), 0 20px 60px -24px rgba(46,74,64,0.30)",
        gold: "0 0 0 1px rgba(156,124,77,0.18), 0 18px 50px -26px rgba(156,124,77,0.40)",
      },
      maxWidth: {
        reading: "44rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.6s ease both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
