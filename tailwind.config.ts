import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Header
        header: {
          DEFAULT: "hsl(var(--header))",
          foreground: "hsl(var(--header-foreground))",
          border: "hsl(var(--header-border))",
          nav: "hsl(var(--header-nav))",
          "nav-hover": "hsl(var(--header-nav-hover))",
          badge: "hsl(var(--header-badge))",
          "badge-foreground": "hsl(var(--header-badge-foreground))",
          search: "hsl(var(--header-search))",
          "search-border": "hsl(var(--header-search-border))",
          "search-placeholder": "hsl(var(--header-search-placeholder))",
          "search-icon": "hsl(var(--header-search-icon))",
        },
        // Sidebar
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          section: "hsl(var(--sidebar-section))",
          hover: "hsl(var(--sidebar-hover))",
          active: "hsl(var(--sidebar-active))",
          border: "hsl(var(--sidebar-border))",
        },
        // Table of Contents
        toc: {
          foreground: "hsl(var(--toc-foreground))",
          hover: "hsl(var(--toc-hover))",
          active: "hsl(var(--toc-active))",
          border: "hsl(var(--toc-border))",
        },
        // Code
        code: {
          DEFAULT: "hsl(var(--code))",
          foreground: "hsl(var(--code-foreground))",
          header: "hsl(var(--code-header))",
          border: "hsl(var(--code-border))",
          language: "hsl(var(--code-language))",
        },
        // Callouts
        callout: {
          info: "hsl(var(--callout-info))",
          "info-border": "hsl(var(--callout-info-border))",
          "info-foreground": "hsl(var(--callout-info-foreground))",
          warning: "hsl(var(--callout-warning))",
          "warning-border": "hsl(var(--callout-warning-border))",
          "warning-foreground": "hsl(var(--callout-warning-foreground))",
          tip: "hsl(var(--callout-tip))",
          "tip-border": "hsl(var(--callout-tip-border))",
          "tip-foreground": "hsl(var(--callout-tip-foreground))",
          danger: "hsl(var(--callout-danger))",
          "danger-border": "hsl(var(--callout-danger-border))",
          "danger-foreground": "hsl(var(--callout-danger-foreground))",
        },
        // Accent
        "accent-primary": "hsl(var(--accent-primary))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
