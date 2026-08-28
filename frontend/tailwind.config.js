/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f3e4e4',
        foreground: '#2f4f4f',
        primary: {
          DEFAULT: '#2f4f4f',
          foreground: '#ffffff',
        },
        action: '#2f4f4f',
        'gray-primary': '#5a5a5a',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#2f4f4f',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#2f4f4f',
        },
        secondary: {
          DEFAULT: '#cabdff',
          foreground: '#2f4f4f',
        },
        muted: {
          DEFAULT: '#f7ebeb',
          foreground: '#5a5a5a',
        },
        accent: {
          DEFAULT: '#3b82f6',
          foreground: '#3447aa',
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },
        border: '#f0d9d9',
        input: '#f0d9d9',
        ring: '#2f4f4f',
      },
      borderRadius: {
        lg: '0.625rem',
        md: 'calc(0.625rem - 2px)',
        sm: 'calc(0.625rem - 4px)',
      },
      keyframes: {
        aurora: {
          '0%': { backgroundPosition: '0% 50%', transform: 'rotate(-5deg) scale(0.9)' },
          '25%': { backgroundPosition: '50% 100%', transform: 'rotate(5deg) scale(1.1)' },
          '50%': { backgroundPosition: '100% 50%', transform: 'rotate(-3deg) scale(0.95)' },
          '75%': { backgroundPosition: '50% 0%', transform: 'rotate(3deg) scale(1.05)' },
          '100%': { backgroundPosition: '0% 50%', transform: 'rotate(-5deg) scale(0.9)' },
        },
      },
      animation: {
        aurora: 'aurora 8s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
};
