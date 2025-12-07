/**
 * AstroFlare Premium Design System
 * 2025 FinTech Dashboard Theme
 */

export const theme = {
  colors: {
    // Vibrant Neon Gradients
    primary: {
      50: '#f0e7ff',
      100: '#e0cfff',
      200: '#c29fff',
      300: '#a86fff',
      400: '#8f3fff',
      500: '#7c3aed', // Main purple
      600: '#6d28d9',
      700: '#5b21b6',
      800: '#4c1d95',
      900: '#3b1573',
    },
    
    secondary: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4', // Main cyan
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
    },
    
    accent: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899', // Main pink
      600: '#db2777',
      700: '#be185d',
      800: '#9f1239',
      900: '#831843',
    },
    
    // Backgrounds
    bg: {
      primary: '#0a0a0f',
      secondary: '#0f0f1a',
      tertiary: '#151520',
      card: 'rgba(255, 255, 255, 0.03)',
      cardHover: 'rgba(255, 255, 255, 0.05)',
      glass: 'rgba(255, 255, 255, 0.08)',
    },
    
    // Text
    text: {
      primary: '#ffffff',
      secondary: '#e5e7eb',
      tertiary: '#9ca3af',
      muted: '#6b7280',
    },
    
    // Status Colors
    success: {
      500: '#10b981',
      600: '#059669',
      glow: 'rgba(16, 185, 129, 0.5)',
    },
    
    warning: {
      500: '#f59e0b',
      600: '#d97706',
      glow: 'rgba(245, 158, 11, 0.5)',
    },
    
    error: {
      500: '#ef4444',
      600: '#dc2626',
      glow: 'rgba(239, 68, 68, 0.5)',
    },
    
    // Gradients
    gradients: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      secondary: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
      accent: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #fbbf24 100%)',
      dark: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
      glass: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      shimmer: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
    },
  },
  
  typography: {
    fontFamily: {
      sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'monospace'],
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    },
    
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.25rem', // 20px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
    
    // Glowing shadows
    glow: {
      sm: '0 0 10px rgba(102, 126, 234, 0.3)',
      md: '0 0 20px rgba(102, 126, 234, 0.4)',
      lg: '0 0 30px rgba(102, 126, 234, 0.5)',
      xl: '0 0 40px rgba(102, 126, 234, 0.6)',
    },
    
    neon: {
      purple: '0 0 20px rgba(118, 75, 162, 0.6), 0 0 40px rgba(118, 75, 162, 0.4)',
      cyan: '0 0 20px rgba(6, 182, 212, 0.6), 0 0 40px rgba(6, 182, 212, 0.4)',
      pink: '0 0 20px rgba(236, 72, 153, 0.6), 0 0 40px rgba(236, 72, 153, 0.4)',
    },
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

export default theme;

