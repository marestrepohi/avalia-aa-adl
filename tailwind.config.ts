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
			padding: {
				DEFAULT: '1rem',
				sm: '2rem',
				lg: '4rem',
				xl: '5rem',
				'2xl': '6rem',
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
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
					DEFAULT: '#6941C6',
					foreground: '#FFFFFF',
					hover: '#5D37B0',
					light: '#F9F5FF',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: '#EF4444',
					foreground: '#FFFFFF',
					hover: '#DC2626',
					light: '#FEF2F2',
				},
				success: {
					DEFAULT: '#10B981',
					foreground: '#FFFFFF',
					hover: '#059669',
					light: '#ECFDF5',
				},
				warning: {
					DEFAULT: '#F59E0B',
					foreground: '#FFFFFF',
					hover: '#D97706',
					light: '#FFFBEB',
				},
				danger: {
					DEFAULT: '#EF4444',
					foreground: '#FFFFFF',
					hover: '#DC2626',
					light: '#FEF2F2',
				},
				muted: {
					DEFAULT: '#F9FAFB',
					foreground: '#6B7280',
				},
				accent: {
					DEFAULT: '#E5E7EB',
					foreground: '#111827',
				},
				popover: {
					DEFAULT: '#FFFFFF',
					foreground: '#111827',
				},
				card: {
					DEFAULT: '#FFFFFF',
					foreground: '#111827',
				},
				sidebar: {
					DEFAULT: '#F9FAFB',
					foreground: '#6B7280',
					active: '#6941C6',
					hover: '#E5E7EB',
					border: '#E5E7EB',
				}
			},
			borderRadius: {
				lg: '0.5rem', // 8px
				md: '0.375rem', // 6px
				sm: '0.25rem' // 4px
			},
			fontFamily: {
				sans: ['Poppins', 'Inter', 'sans-serif'],
			},
			boxShadow: {
				'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
				'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0',
						opacity: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					},
					to: {
						height: '0',
						opacity: '0'
					}
				},
				'fade-in': {
					from: {
						opacity: '0',
						transform: 'translateY(8px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in-right': {
					from: {
						transform: 'translateX(100%)'
					},
					to: {
						transform: 'translateX(0)'
					}
				},
				'spinner': {
					from: {
						transform: 'rotate(0deg)'
					},
					to: {
						transform: 'rotate(360deg)'
					}
				},
				'scale': {
					from: {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					to: {
						transform: 'scale(1)',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'spinner': 'spinner 1s linear infinite',
				'scale': 'scale 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
