/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper:     '#F2EBE0',
        cream:     '#FAF6EE',
        ink:       '#1A1714',
        'ink-soft':'#3D362F',
        'ink-mute':'#7A6F63',
        line:      '#E5DCCC',
        sienna:    '#C8624A',
        'sienna-soft': '#E89A85',
        moss:      '#5C7355',
        ochre:     '#D4A24E',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans:    ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      transitionTimingFunction: {
        'out-soft':    'cubic-bezier(0.23, 1, 0.32, 1)',
        'in-out-soft': 'cubic-bezier(0.77, 0, 0.175, 1)',
        'drawer':      'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      animation: {
        'meteor':     'meteor 5s linear infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'scroll':     'scroll var(--duration) var(--direction) linear infinite',
        'tape':       'tape 2.4s linear infinite',
        'rise':       'rise 0.6s cubic-bezier(0.23, 1, 0.32, 1) both',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'drift':      'drift 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.6s ease-out infinite',
        'bar':        'bar 1.6s ease-in-out infinite',
        'rule-draw':  'rule-draw 0.9s cubic-bezier(0.77,0,0.175,1) forwards',
      },
      keyframes: {
        meteor: {
          '0%':   { transform: 'rotate(215deg) translateX(0)', opacity: '1' },
          '70%':  { opacity: '1' },
          '100%': { transform: 'rotate(215deg) translateX(-500px)', opacity: '0' },
        },
        shimmer: {
          from: { backgroundPosition: '0 0' },
          to:   { backgroundPosition: '-200% 0' },
        },
        tape: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        rise: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
        drift: {
          '0%, 100%': { transform: 'rotate(var(--from, -8deg))' },
          '50%':      { transform: 'rotate(var(--to, 8deg))' },
        },
        'pulse-ring': {
          '0%':   { boxShadow: '0 0 0 0 rgba(200, 98, 74, 0.35)' },
          '70%':  { boxShadow: '0 0 0 14px rgba(200, 98, 74, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(200, 98, 74, 0)' },
        },
        bar: {
          '0%, 100%': { transform: 'scaleY(0.6)' },
          '50%':      { transform: 'scaleY(1)' },
        },
        'rule-draw': {
          from: { transform: 'scaleX(0)' },
          to:   { transform: 'scaleX(1)' },
        },
      },
      boxShadow: {
        'card':  '0 1px 0 0 rgba(26,23,20,0.04), 0 1px 2px 0 rgba(26,23,20,0.04)',
        'lift':  '0 1px 0 0 rgba(26,23,20,0.04), 0 12px 32px -12px rgba(26,23,20,0.18)',
        'inset-line': 'inset 0 0 0 1px #E5DCCC',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
