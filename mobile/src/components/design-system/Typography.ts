import { TextStyle } from "react-native";

/**
 * O'ZEK Design System — Typography Scale
 *
 * Font: Inter (via @expo-google-fonts/inter)
 * Uzbek Latin script requires Extended-A support — Inter handles this perfectly.
 * Minimum body: 16px for readability on budget Android phones.
 */
export const Typography: Record<string, TextStyle> = {
  display: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  h3: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  bodySmall: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  caption: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  button: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  statNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -1,
  },
} as const;
