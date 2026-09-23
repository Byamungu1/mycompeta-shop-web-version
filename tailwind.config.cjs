/** @type {import('tailwindcss').Config} */
module.exports = {
  // Class-based so the ported `dark:` classes keep working.
  darkMode: 'class',

  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Plus Jakarta Sans
        jakarta: ['PlusJakartaSans-Regular', 'sans-serif'],
        'jakarta-italic': ['PlusJakartaSans-Italic', 'sans-serif'],
        'jakarta-extralight': ['PlusJakartaSans-ExtraLight', 'sans-serif'],
        'jakarta-extralightitalic': ['PlusJakartaSans-ExtraLightItalic', 'sans-serif'],
        'jakarta-light': ['PlusJakartaSans-Light', 'sans-serif'],
        'jakarta-lightitalic': ['PlusJakartaSans-LightItalic', 'sans-serif'],
        'jakarta-medium': ['PlusJakartaSans-Medium', 'sans-serif'],
        'jakarta-mediumitalic': ['PlusJakartaSans-MediumItalic', 'sans-serif'],
        'jakarta-semibold': ['PlusJakartaSans-SemiBold', 'sans-serif'],
        'jakarta-semibolditalic': ['PlusJakartaSans-SemiBoldItalic', 'sans-serif'],
        'jakarta-bold': ['PlusJakartaSans-Bold', 'sans-serif'],
        'jakarta-bolditalic': ['PlusJakartaSans-BoldItalic', 'sans-serif'],
        'jakarta-extrabold': ['PlusJakartaSans-ExtraBold', 'sans-serif'],
        'jakarta-extrabolditalic': ['PlusJakartaSans-ExtraBoldItalic', 'sans-serif'],

        // DM Mono
        'dm-mono': ['DMMono-Regular', 'monospace'],
        'dm-mono-italic': ['DMMono-Italic', 'monospace'],
        'dm-mono-light': ['DMMono-Light', 'monospace'],
        'dm-mono-lightitalic': ['DMMono-LightItalic', 'monospace'],
        'dm-mono-medium': ['DMMono-Medium', 'monospace'],
        'dm-mono-mediumitalic': ['DMMono-MediumItalic', 'monospace'],

        // Syne
        syne: ['Syne-Regular', 'sans-serif'],
        'syne-medium': ['Syne-Medium', 'sans-serif'],
        'syne-semibold': ['Syne-SemiBold', 'sans-serif'],
        'syne-bold': ['Syne-Bold', 'sans-serif'],
        'syne-extrabold': ['Syne-ExtraBold', 'sans-serif'],
      },
      colors: {
        canvas: 'hsl(var(--background) / <alpha-value>)',
        ink: 'hsl(var(--foreground) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        primary: 'hsl(var(--primary) / <alpha-value>)',
        accent: 'hsl(var(--accent) / <alpha-value>)',
        brand: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B', // PRIMARY
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        market: {
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626', // SALE / URGENT
          700: '#B91C1C',
        },
        delivery: {
          400: '#34D399',
          500: '#10B981', // SUCCESS
          600: '#059669',
          700: '#047857',
        },
        sand: {
          50: '#FAFAF9', // PAGE BG
          100: '#F5F5F4', // CARD BG
          200: '#E7E5E4', // BORDERS
          300: '#D6D3D1',
          400: '#A8A29E', // PLACEHOLDER
          500: '#78716C',
          600: '#57534E', // SECONDARY TEXT
          700: '#44403C',
          800: '#292524', // BODY TEXT
          900: '#1C1917', // HEADINGS
          950: '#0C0A09', // DEEP BACKGROUND (DARK)
        },
        info: {
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
        },
      },
      // Tighter, flatter corner scale — the previous values (28/36px) read as
      // "fluffy" on web surfaces.
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
        full: '9999px',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        72: '18rem',
        84: '21rem',
        96: '24rem',
      },
    },
  },
  plugins: [],
};
