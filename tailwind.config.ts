import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        serif: ["var(--font-crimson)"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Organic garden curves
        "garden-sm": "8px",
        "garden-md": "12px",
        "garden-lg": "16px",
        "garden-xl": "24px",
      },
      spacing: {
        // Garden rhythm spacing
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      boxShadow: {
        // Soft, organic shadows
        "garden-sm": "0 2px 8px rgba(0, 0, 0, 0.06)",
        "garden-md": "0 4px 16px rgba(0, 0, 0, 0.08)",
        "garden-lg": "0 8px 24px rgba(0, 0, 0, 0.12)",
        "garden-inner": "inset 0 2px 4px rgba(0, 0, 0, 0.04)",
      },
      colors: {
        // Garden palette
        sage: {
          50: "#f6f7f5",
          100: "#e3e7df",
          200: "#c7cfc0",
          300: "#a5b099",
          400: "#8b9a7e",
          500: "#6d7d5e",
          600: "#566349",
          700: "#454e3c",
          800: "#3a4032",
          900: "#32362c",
        },
        cream: {
          50: "#fffcf9",
          100: "#fef9f3",
          200: "#fdf3e7",
          300: "#fbe9d5",
          400: "#f7d9b8",
          500: "#f0c089",
          600: "#e49b4d",
          700: "#d67d2a",
          800: "#b26022",
          900: "#90501f",
        },
        plum: {
          50: "#faf8fb",
          100: "#f3eff6",
          200: "#e8e0ed",
          300: "#d5c5df",
          400: "#bfa3cb",
          500: "#a78bba",
          600: "#8a6b9f",
          700: "#735885",
          800: "#614a6e",
          900: "#51405c",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Garden semantic tokens
        "text-emphasis": "hsl(var(--text-emphasis))",
        "text-primary": "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary))",
        "text-tertiary": "hsl(var(--text-tertiary))",
        "bg-canvas": "hsl(var(--bg-canvas))",
        "bg-surface": "hsl(var(--bg-surface))",
        "bg-muted": "hsl(var(--bg-muted))",
        "bg-subtle": "hsl(var(--bg-subtle))",
        "border-default": "hsl(var(--border-default))",
        "border-subtle": "hsl(var(--border-subtle))",
        "border-emphasis": "hsl(var(--border-emphasis))",
        "interactive-primary": "hsl(var(--interactive-primary))",
        "interactive-primary-foreground": "hsl(var(--interactive-primary-foreground))",
        "interactive-hover": "hsl(var(--interactive-hover))",
        "interactive-active": "hsl(var(--interactive-active))",
        "interactive-disabled": "hsl(var(--interactive-disabled))",
        "gradient-start": "hsl(var(--gradient-start))",
        "gradient-end": "hsl(var(--gradient-end))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
