// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Exactement les mêmes couleurs que dans le CSS original
        'ifm-primary': {
          DEFAULT: '#33a2e5',
          dark: '#1c96e0',
          darker: '#1b8ed3',
          darkest: '#1675ae',
          light: '#4cade8',
          lighter: '#58b3ea',
          lightest: '#7ec4ee',
        },
        'ifm-background': '#141619',
        'ifm-surface': '#202226',
        'ifm-border': '#2c3235',
        'ifm-text': '#c7d0d9',
        'ifm-muted': '#8e9297',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config