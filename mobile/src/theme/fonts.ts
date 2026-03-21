export const fonts = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semibold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
  // Noto Sans Variable — fallback for all scripts (CJK, Arabic, Hindi, etc.)
  noto: 'NotoSans-Variable',
} as const;

export const fontSizes = {
  xs: 12,    // Minimum (WCAG)
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;
