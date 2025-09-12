export const typography = {
  fonts: {
    heading: 'System',
    body: 'System',
    mono: 'Menlo',
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export type FontSizeName = keyof typeof typography.sizes;

