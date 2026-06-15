import type { Config } from "tailwindcss";

/**
 * Niyyah OS design system — built from first principles.
 *
 * Principle: the interface should feel calm, intentional, and quiet.
 * No dopamine colors, no alarmism. Warm paper canvas, evergreen accent
 * (intention / growth), muted clay for violations rather than red alarm.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces
        canvas: "#F6F4EF", // warm paper — the resting state of the app
        surface: "#FFFFFF",
        raised: "#FCFBF8",
        sand: "#EFE9DD", // soft block fills

        // Ink / text
        ink: "#1C1B17", // warm near-black
        muted: "#6E6A61",
        faint: "#9C968B",

        // Lines
        line: "#E7E2D8",
        "line-strong": "#D8D1C3",

        // Accent — evergreen: intention, steadiness, growth
        accent: {
          DEFAULT: "#2E4A40",
          hover: "#243a32",
          soft: "#E7EDE9",
          ink: "#1A2C26",
        },

        // Behavioral semantics (calm, not loud)
        affirm: "#4F7A5E", // disciplined / positive behavior
        affirmsoft: "#E8F0EA",
        caution: "#9C7434", // drift / watch
        cautionsoft: "#F4ECDD",
        breach: "#A8584A", // violation — clay, not red alarm
        breachsoft: "#F4E5E1",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      fontSize: {
        // A restrained type scale
        display: ["clamp(2.4rem, 5vw, 3.6rem)", { lineHeight: "1.04", letterSpacing: "-0.02em" }],
        title: ["1.75rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        // Whisper-soft shadows only
        soft: "0 1px 2px rgba(28,27,23,0.04), 0 6px 24px -12px rgba(28,27,23,0.10)",
        lift: "0 2px 6px rgba(28,27,23,0.05), 0 18px 40px -20px rgba(28,27,23,0.18)",
      },
      maxWidth: {
        reading: "44rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
