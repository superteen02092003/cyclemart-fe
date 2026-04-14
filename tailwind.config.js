/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // ─── CycleMart × Airbnb Design System ───────────────────────
      // Primary brand: Deep Navy (replaces Airbnb's Rausch Red)
      // Surface: Pure White (Airbnb foundation)
      // Text: Near-Black #222222 (warm, Airbnb standard)
      colors: {
        // Brand — Navy scale
        navy: {
          DEFAULT: '#0A1628',  // primary brand navy (hero, primary CTA)
          dark:    '#060e1a',  // pressed / darkest
          medium:  '#1e3a5f',  // hover states
          light:   '#2d5a8e',  // secondary navy
          muted:   '#4a6fa5',  // subtle navy for icons
          subtle:  '#dde8f5',  // very light navy tint (hover surfaces)
        },

        // Accent — Verified Green (trust / Verified badge)
        green: {
          DEFAULT: '#006c49',
          dark:    '#004d35',
          light:   '#e6f4ef',
          container: '#6cf8bb',
        },

        // Text scale (Airbnb)
        content: {
          primary:   '#222222',  // warm near-black
          secondary: '#6a6a6a',  // descriptions
          tertiary:  '#b0b0b0',  // placeholders, disabled
          inverse:   '#ffffff',
        },

        // Surface (Airbnb white canvas)
        surface: {
          DEFAULT:    '#ffffff',
          secondary:  '#f7f7f7',
          tertiary:   '#f2f2f2',  // circular nav buttons, chips
          overlay:    'rgba(255,255,255,0.92)',
        },

        // Borders
        border: {
          DEFAULT: '#dddddd',
          light:   '#ebebeb',
          focus:   '#0A1628',  // navy focus ring
        },

        // Semantic
        error:   '#c13515',
        warning: '#ffc107',
        success: '#006c49',
      },

      // Airbnb border-radius scale
      borderRadius: {
        none:   '0',
        xs:     '4px',
        sm:     '8px',    // buttons, tabs
        DEFAULT:'12px',   // chips, tags
        md:     '14px',   // badges
        lg:     '20px',   // cards
        xl:     '32px',   // large containers, hero
        '2xl':  '40px',
        full:   '9999px', // pills, avatars
      },

      // Typography — Inter (web-safe substitute for Airbnb Cereal)
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'xs':   ['0.75rem',  { lineHeight: '1rem',    fontWeight: '400' }],
        'sm':   ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'base': ['1rem',     { lineHeight: '1.5rem',  fontWeight: '500' }],
        'lg':   ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }],
        'xl':   ['1.25rem',  { lineHeight: '1.5rem',  fontWeight: '600', letterSpacing: '-0.18px' }],
        '2xl':  ['1.375rem', { lineHeight: '1.625rem',fontWeight: '600', letterSpacing: '-0.44px' }],
        '3xl':  ['1.75rem',  { lineHeight: '2.25rem', fontWeight: '700' }],
        '4xl':  ['2.25rem',  { lineHeight: '2.75rem', fontWeight: '700' }],
        '5xl':  ['3rem',     { lineHeight: '3.5rem',  fontWeight: '700' }],
      },

      // Airbnb three-layer card shadow system
      boxShadow: {
        // Level 1 — listing cards, search bar
        'card': 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.10) 0px 4px 8px',
        // Level 2 — hover lift
        'card-hover': 'rgba(0,0,0,0.08) 0px 4px 12px',
        // Level 3 — focus / active
        'focus': '0 0 0 2px #0A1628',
        // Navbar
        'nav': '0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
        // Subtle ambient (existing components)
        'ambient': '0 8px 32px 0 rgba(0,0,0,0.06)',
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
