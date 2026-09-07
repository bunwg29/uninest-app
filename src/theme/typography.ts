export const TYPOGRAPHY_TOKENS = {
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    BASE: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    TITLE: 30,
  },

  FONT_WEIGHTS: {
    REGULAR: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
  },
} as const;

export type TypographyTokens = typeof TYPOGRAPHY_TOKENS;
