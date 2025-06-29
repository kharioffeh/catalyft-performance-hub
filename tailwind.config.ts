
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
				'badge-kai': '#5BAFFF',
				'badge-coach': '#A8A8A8',
				'row-alt': '#FAFAFA',
				'chart-green': '#4ade80',
				'chart-blue': '#60a5fa',
				'chart-purple': '#c084fc',
				// New glass morphism design tokens
				surface: 'rgba(30, 34, 44, 0.45)',
				stroke: 'rgba(255, 255, 255, 0.08)'
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
