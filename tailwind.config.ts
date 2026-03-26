// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif:   ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:    ['Jost', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      colors: {
        gold: {
          DEFAULT: '#b8956a',
          light:   '#d4b896',
          dark:    '#8a6a42',
        },
        cream: {
          DEFAULT: '#faf7f2',
          2:       '#f2ede4',
        },
        ink: {
          DEFAULT: '#1a1510',
          2:       '#3d3328',
        },
        muted: '#8a7d6e',
        // Admin palette
        admin: {
          bg:      '#0d0f12',
          bg2:     '#141720',
          bg3:     '#1c2030',
          border:  '#2a3050',
          border2: '#3a4268',
          text:    '#e8ecf8',
          text2:   '#8b93b8',
          text3:   '#555e82',
        },
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
}

export default config
