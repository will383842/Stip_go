export const colors = {
  primary: '#F5C518',       // Or — CTA, stamps, accents
  secondary: '#00D4FF',     // Cyan — liens, éléments secondaires
  accent: '#FF5745',        // Corail — erreurs, urgence

  bgLight: '#FFFEF5',       // Fond light mode
  bgDark: '#0D0D1A',        // Fond dark mode

  cardLight: '#FFFFFF',     // Cards light
  cardDark: '#1A1A2E',      // Cards dark

  textLight: '#1A1A2E',     // Texte sur fond clair
  textDark: '#FFFEF5',      // Texte sur fond sombre

  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  success: '#22C55E',
  warning: '#F59E0B',
  error: '#FF5745',
  info: '#00D4FF',
} as const;

// NEVER use #FFD60A — obsolete color
