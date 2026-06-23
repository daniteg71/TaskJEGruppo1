import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Identità JESAP (figma.css del CRM)
        brand: {
          DEFAULT: '#8A3B86',
          ink: '#6F2F6B',
          light: '#B569B0',
          accent: '#B569B0',
          good: '#22C55E',
          warn: '#F59E0B',
          bad: '#EF4444',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #B569B0 0%, #6F2F6B 100%)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
