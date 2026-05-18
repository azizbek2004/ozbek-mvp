import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../design-system/Colors";
import { Typography } from "../design-system/Typography";
import { Spacing } from "../design-system/Spacing";
import { Button } from "../design-system/Button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "📋",
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xxxl,
  },
  icon: { fontSize: 48, marginBottom: Spacing.base },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  button: { minWidth: 200 },
});
