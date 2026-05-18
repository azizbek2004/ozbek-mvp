import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Colors } from "./Colors";

interface ToggleProps {
  value: boolean;
  onToggle: (v: boolean) => void;
}

export function Toggle({ value, onToggle }: ToggleProps) {
  return (
    <TouchableOpacity
      onPress={() => onToggle(!value)}
      activeOpacity={0.8}
      style={[styles.track, value && styles.trackActive]}
    >
      <View style={[styles.thumb, value && styles.thumbActive]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceOverlay,
    padding: 2,
    justifyContent: "center",
  },
  trackActive: { backgroundColor: Colors.primary },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
  },
  thumbActive: { alignSelf: "flex-end" },
});
