
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Legacy colors
				'badge-kai': '#5BAFFF',
				'badge-coach': '#A8A8A8',
				'row-alt': '#FAFAFA',
				'chart-green': '#4ade80',
				'chart-blue': '#60a5fa',
				'chart-purple': '#c084fc',
				// Glass morphism design tokens
				surface: {
					light: 'rgba(249, 249, 251, 0.9)',
					dark: 'rgba(15, 17, 23, 0.9)'
				},
				'glass-card': {
					light: 'rgba(255, 255, 255, 0.6)',
					dark: 'rgba(255, 255, 255, 0.08)'
				},
				'glass-primary': {
					light: 'rgba(99, 102, 241, 0.1)',
					dark: 'rgba(99, 102, 241, 0.2)'
				},
				'glass-secondary': {
					light: 'rgba(139, 92, 246, 0.1)',
					dark: 'rgba(139, 92, 246, 0.2)'
				},
				// Semantic colors
				'theme-accent': '#00ff7b',
				'theme-danger': '#f43f5e',
				'theme-info': '#38bdf8',
				'theme-success': '#22c55e',
				'theme-warning': '#fbbf24',
				// Chart colors with light/dark variants
				'chart-emerald': {
					light: '#10b981',
					dark: '#34d399'
				},
				'chart-sky': {
					light: '#0ea5e9',
					dark: '#38bdf8'
				},
				'chart-violet': {
					light: '#8b5cf6',
					dark: '#a78bfa'
				},
				'chart-amber': {
					light: '#f59e0b',
					dark: '#fbbf24'
				},
				'chart-rose': {
					light: '#f43f5e',
					dark: '#fb7185'
				}
			},
			boxShadow: {
				card: '0 2px 6px rgba(0,0,0,0.06)',
				glass: "inset 0 1px 1px rgba(255,255,255,0.15), 0 4px 14px rgba(0,0,0,0.25)",
				'glass-sm': '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.1)',
				'glass-md': '0 4px 16px rgba(0,0,0,0.15), inset 0 1px 3px rgba(255,255,255,0.1)',
				'glass-lg': '0 8px 32px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.1)',
				'glass-xl': '0 16px 64px rgba(0,0,0,0.25), inset 0 2px 6px rgba(255,255,255,0.1)'
			},
			backdropBlur: {
				'xs': '2px',
				'glass': '12px',
				'glass-md': '16px',
				'glass-lg': '24px'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				card: '1rem'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				shimmer: {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(100%)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				shimmer: 'shimmer 2s infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
