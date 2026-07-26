/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      // ── Type scale ──────────────────────────────────────────────────────────
      // '2xs' is the accessible floor for this app: labels, badges, and meta
      // text were previously set with arbitrary values as small as 8-10px
      // (text-[8px], text-[9px], text-[10px]) scattered across pages, which is
      // below comfortable reading size for a professional SaaS product. Every
      // such value should now resolve to text-2xs (11px) at minimum — nothing
      // in the app should render smaller than this.
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }], // 11px
      },
      // ── Brand / status colors ───────────────────────────────────────────────
      // Mirrors the CSS custom properties in index.css so components can reach
      // for e.g. `text-brand` / `bg-brand-light` instead of inline hex or
      // style={{ color: 'var(--brand)' }}, which were used interchangeably
      // with Tailwind slate/blue utilities for the same colors throughout the
      // app. New/updated components should prefer these named utilities.
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          hover:   '#1d4ed8',
          light:   '#eff6ff',
          muted:   '#bfdbfe',
          purple:  '#7c3aed',
        },
      },
    },
  },
  plugins: [],
};
