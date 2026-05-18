import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "./Colors";
import { Typography } from "./Typography";

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function SegmentedControl({
  segments,
  selectedIndex,
  onSelect,
}: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {segments.map((seg, i) => (
        <TouchableOpacity
          key={seg}
          onPress={() => onSelect(i)}
          style={[styles.segment, i === selectedIndex && styles.segmentActive]}
        >
          <Text style={[styles.text, i === selectedIndex && styles.textActive]}>
            {seg}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 44,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 4,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  segmentActive: { backgroundColor: Colors.primary },
  text: { ...Typography.h3, color: Colors.textSecondary },
  textActive: { color: Colors.white },
});
