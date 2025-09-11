export const colors = {
  // Primary brand gradient anchors inspired by the provided logo
  brandMagenta: '#ff2fd2',
  brandViolet: '#a400ff',
  brandIndigo: '#1e28ff',
  brandCyan: '#27f2ff',
  brandGold: '#ffcf38',
  brandDeep: '#0b0214',

  // Neutrals
  white: '#ffffff',
  black: '#000000',
  gray100: '#f5f6fa',
  gray200: '#e6e8ee',
  gray400: '#a1a7b3',
  gray600: '#5b6270',
  gray800: '#2b2f38',
};

export const gradients = {
  brandRadial: [
    '#27f2ff',
    '#1e28ff',
    '#a400ff',
    '#ff2fd2',
  ],
};

export type ColorName = keyof typeof colors;

