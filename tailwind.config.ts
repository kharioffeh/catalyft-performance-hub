import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  safelist: [
    'ring-readiness',
    'ring-sleep', 
    'ring-load',
    'ring-strain',
    'text-readiness',
    'text-sleep',
    'text-load', 
    'text-strain',
    'bg-readiness',
    'bg-sleep',
    'bg-load',
    'bg-strain',
    'hover:bg-readiness/90',
    'hover:bg-sleep/90',
    'hover:bg-load/90',
    'hover:bg-strain/90'
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        base: '#0D0B20',
        card: 'rgba(255,255,255,0.04)',
        border: 'rgba(255,255,255,0.08)',
        
        // Enhanced dual-tone design system (WCAG AA compliant)
        'theme-primary': {
          light: '#1E40AF',
          dark: '#3B82F6',
          'light-surface': '#EFF6FF',
          'dark-surface': '#1E3A8A'
        },
        'theme-secondary': {
          light: '#1E3A8A',
          dark: '#60A5FA',
          'light-surface': '#DBEAFE',
          'dark-surface': '#1E40AF'
        },
        'theme-accent': {
          light: '#D97706',
          dark: '#F59E0B',
          'light-surface': '#FEF3C7',
          'dark-surface': '#B45309'
        },
        'theme-success': {
          light: '#059669',
          dark: '#10B981',
          'light-surface': '#D1FAE5',
          'dark-surface': '#047857'
        },
        'theme-danger': {
          light: '#DC2626',
          dark: '#EF4444',
          'light-surface': '#FEE2E2',
          'dark-surface': '#B91C1C'
        },
        'theme-warning': {
          light: '#D97706',
          dark: '#F59E0B',
          'light-surface': '#FEF3C7',
          'dark-surface': '#B45309'
        },
        'theme-info': {
          light: '#0284C7',
          dark: '#0EA5E9',
          'light-surface': '#E0F2FE',
          'dark-surface': '#0369A1'
        },
        
        // Glass morphism with theme awareness
        'glass-card': {
          light: 'rgba(255, 255, 255, 0.8)',
          dark: 'rgba(30, 41, 59, 0.8)'
        },
        'glass-surface': {
          light: 'rgba(248, 250, 252, 0.9)',
          dark: 'rgba(15, 23, 42, 0.9)'
        },
        'surface-light': '#FFFFFF',
        'surface-dark': '#1F2937',
        
        // Keep existing colors for backward compatibility
        readiness: {
          DEFAULT: '#10B981',
          ring: '#34D399'
        },
        sleep: {
          DEFAULT: '#6366F1', 
          ring: '#818CF8'
        },
        load: {
          DEFAULT: '#F59E0B',
          ring: '#FBBF24'  
        },
        strain: {
          DEFAULT: '#F43F5E',
          ring: '#FB7185'
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "rgba(255,255,255,0.04)",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 2px 8px 0 rgba(31, 38, 135, 0.2)',
        'glass-md': '0 8px 24px 0 rgba(0, 0, 0, 0.25)',
        'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.35)',
        'glass-xl': '0 24px 64px 0 rgba(0, 0, 0, 0.45)',
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
        "wiggle": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-3deg)" },
          "75%": { transform: "rotate(3deg)" },
        },
        "pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "wiggle": "wiggle 0.8s ease-in-out infinite",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require('@tailwindcss/forms')],
} satisfies Config;

export default config;
