import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07100d',
        panel: '#0c1713',
        line: '#1b2b25',
        mint: '#61f2a7',
        muted: '#8ba39a',
      },
      boxShadow: {
        glow: '0 0 40px rgba(97, 242, 167, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;
