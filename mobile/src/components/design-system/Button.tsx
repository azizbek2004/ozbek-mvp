import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Colors } from "./Colors";
import { Typography } from "./Typography";
import { BorderRadius } from "./Spacing";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        isPrimary && styles.primary,
        variant === "secondary" && styles.secondary,
        isDanger && styles.danger,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? Colors.white : Colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              isPrimary && styles.primaryText,
              variant === "secondary" && styles.secondaryText,
              isDanger && styles.dangerText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 24,
  },
  primary: { backgroundColor: Colors.primary },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.surfaceElevated,
    height: 48,
  },
  danger: { backgroundColor: Colors.dangerLight },
  disabled: { opacity: 0.4 },
  text: { ...Typography.button },
  primaryText: { color: Colors.white },
  secondaryText: { color: Colors.textPrimary },
  dangerText: { color: Colors.danger },
});
