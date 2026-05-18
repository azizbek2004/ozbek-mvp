/**
 * O'ZEK Design System — Color Palette
 *
 * Dark-first. AMOLED-friendly. Every hex code matches the blueprint exactly.
 * Do NOT deviate from these values.
 */
export const Colors = {
  // Brand
  primary: "#0A84FF",
  primaryPressed: "#0051D5",
  primaryLight: "rgba(10, 132, 255, 0.15)",

  // Semantic
  success: "#30D158",
  successLight: "rgba(48, 209, 88, 0.15)",
  warning: "#FF9F0A",
  warningLight: "rgba(255, 159, 10, 0.15)",
  danger: "#FF453A",
  dangerLight: "rgba(255, 69, 58, 0.15)",
  gold: "#FFD60A",
  goldLight: "rgba(255, 214, 10, 0.15)",

  // Islamic mode accent
  islamic: "#1E8F5E",
  islamicLight: "rgba(30, 143, 94, 0.15)",

  // Surfaces (dark mode — default)
  background: "#000000",
  surface: "#1C1C1E",
  surfaceElevated: "#2C2C2E",
  surfaceOverlay: "#3A3A3C",

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#8E8E93",
  textTertiary: "#636366",

  // Utilities
  divider: "#38383A",
  transparent: "transparent",
  white: "#FFFFFF",
  black: "#000000",

  // Light mode (stubbed for future)
  lightBackground: "#F2F2F7",
  lightSurface: "#FFFFFF",
  lightText: "#000000",
} as const;

// Habit color palette for the color picker (12 options)
export const HabitColors = [
  "#0A84FF", // Blue (primary)
  "#30D158", // Green
  "#FF9F0A", // Orange
  "#FF453A", // Red
  "#BF5AF2", // Purple
  "#64D2FF", // Cyan
  "#FF6482", // Pink
  "#FFD60A", // Yellow
  "#1E8F5E", // Emerald
  "#AC8E68", // Brown/Gold
  "#8E8E93", // Gray
  "#FF375F", // Hot pink
] as const;

export type ColorToken = keyof typeof Colors;
