import { colors } from './colors';
import { typography } from './typography';

export const theme = {
  colors,
  typography,
  spacing: (multiplier: number) => 8 * multiplier,
  radii: {
    sm: 8,
    md: 16,
    lg: 28,
    pill: 999,
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 24,
      elevation: 8,
    },
  },
};

export type Theme = typeof theme;

