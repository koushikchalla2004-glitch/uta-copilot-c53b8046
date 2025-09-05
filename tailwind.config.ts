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
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
				'inter-tight': ['Inter Tight', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					glow: 'hsl(var(--secondary-glow))'
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
					foreground: 'hsl(var(--card-foreground))',
					glass: 'hsl(var(--card-glass))'
				},
				carbon: {
					DEFAULT: 'hsl(var(--carbon))',
					foreground: 'hsl(var(--carbon-foreground))'
				},
				'electric-blue': {
					DEFAULT: 'hsl(var(--electric-blue))',
					foreground: 'hsl(var(--electric-blue-foreground))'
				},
				'neon-mint': {
					DEFAULT: 'hsl(var(--neon-mint))',
					foreground: 'hsl(var(--neon-mint-foreground))'
				},
				slate: {
					DEFAULT: 'hsl(var(--slate))',
					foreground: 'hsl(var(--slate-foreground))'
				},
				'soft-white': {
					DEFAULT: 'hsl(var(--soft-white))',
					foreground: 'hsl(var(--soft-white-foreground))'
				},
			},
			backgroundImage: {
				'gradient-hero': 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--primary)) 50%, hsl(var(--background)) 100%)',
				'gradient-card': 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)))',
				'gradient-professional': 'linear-gradient(135deg, hsl(var(--primary)) 0%, rgba(0, 0, 0, 0.1) 100%)',
				'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'hover-lift': {
					'0%': { transform: 'translateY(0) scale(1)' },
					'100%': { transform: 'translateY(-4px) scale(1.02)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'hover-lift': 'hover-lift 0.2s ease-out'
			},
			boxShadow: {
				'elegant': '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
				'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
				'floating': '0 20px 40px -10px rgba(0, 0, 0, 0.2)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
