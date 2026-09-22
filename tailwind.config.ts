import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand — driven by CSS var so changing --brand-primary is all that's needed
        primary: "var(--brand-primary)",
        "primary-hover": "var(--brand-primary-hover)",
        "primary-light": "var(--brand-primary-light)",
        "primary-muted": "var(--brand-primary-muted)",

        // Surface & background tokens (mirroring FE design-exports)
        page: "oklch(0.97 0.004 60)",
        surface: "#ffffff",
        "surface-2": "oklch(0.97 0.006 40)",
        "surface-3": "oklch(0.94 0.006 40)",

        // Text tokens
        ink: "oklch(0.16 0.015 40)",
        body: "oklch(0.3 0.01 40)",
        "body-strong": "oklch(0.25 0.01 40)",
        muted: "oklch(0.5 0.01 40)",
        "muted-2": "oklch(0.55 0.01 40)",
        faint: "oklch(0.82 0.006 40)",

        // Border tokens
        line: "oklch(0.9 0.006 40)",
        "line-strong": "oklch(0.85 0.006 40)",
        "line-soft": "oklch(0.93 0.006 40)",
        "line-head": "oklch(0.88 0.006 40)",

        // Status
        up: "oklch(0.5 0.13 150)",
        "up-bg": "oklch(0.93 0.05 145)",
        down: "oklch(0.5 0.18 25)",
        "down-bg": "oklch(0.93 0.01 40)",
        pending: "oklch(0.45 0.1 75)",
        "pending-bg": "oklch(0.94 0.05 85)",
      },
      fontFamily: {
        archivo: ["var(--font-archivo)", "Archivo", "sans-serif"],
        sans: ["var(--font-public-sans)", "'Public Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
