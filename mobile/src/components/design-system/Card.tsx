import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Colors } from "./Colors";
import { BorderRadius, Spacing } from "./Spacing";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

export function Card({ children, style, elevated = false }: CardProps) {
  return (
    <View style={[styles.card, elevated && styles.elevated, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  elevated: { backgroundColor: Colors.surfaceElevated },
});
