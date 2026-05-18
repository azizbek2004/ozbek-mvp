/**
 * O'ZEK Design System — Spacing Scale
 *
 * 4-point grid system for consistent spacing throughout the app.
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const HitSlop = {
  top: 8,
  bottom: 8,
  left: 8,
  right: 8,
} as const;

// Minimum touch target per accessibility guidelines (48dp)
export const MIN_TOUCH_TARGET = 48;
