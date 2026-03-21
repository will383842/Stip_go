import type { Config } from 'tailwindcss';

export default {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#F5C518',
        secondary: '#00D4FF',
        accent: '#FF5745',
        'bg-light': '#FFFEF5',
        'bg-dark': '#0D0D1A',
        'card-light': '#FFFFFF',
        'card-dark': '#1A1A2E',
      },
      fontFamily: {
        sans: ['PlusJakartaSans-Regular'],
        'sans-medium': ['PlusJakartaSans-Medium'],
        'sans-semibold': ['PlusJakartaSans-SemiBold'],
        'sans-bold': ['PlusJakartaSans-Bold'],
      },
    },
  },
  plugins: [],
} satisfies Config;
