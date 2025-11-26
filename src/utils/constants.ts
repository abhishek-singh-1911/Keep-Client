// Google Keep color palette
export const KEEP_COLORS = {
  default: { name: 'Default', value: '#ffffff', dark: false },
  red: { name: 'Red', value: '#f28b82', dark: false },
  orange: { name: 'Orange', value: '#fbbc04', dark: false },
  yellow: { name: 'Yellow', value: '#fff475', dark: false },
  green: { name: 'Green', value: '#ccff90', dark: false },
  teal: { name: 'Teal', value: '#a7ffeb', dark: false },
  blue: { name: 'Blue', value: '#cbf0f8', dark: false },
  darkBlue: { name: 'Dark Blue', value: '#aecbfa', dark: false },
  purple: { name: 'Purple', value: '#d7aefb', dark: false },
  pink: { name: 'Pink', value: '#fdcfe8', dark: false },
  brown: { name: 'Brown', value: '#e6c9a8', dark: false },
  gray: { name: 'Gray', value: '#e8eaed', dark: false },
} as const;

export type KeepColorKey = keyof typeof KEEP_COLORS;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  mobile: '600px',
  tablet: '960px',
  desktop: '1280px',
  wide: '1920px',
};

// Grid layout columns based on screen size
export const GRID_COLUMNS = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  wide: 4,
};
