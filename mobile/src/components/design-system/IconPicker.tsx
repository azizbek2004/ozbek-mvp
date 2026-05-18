import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "./Colors";
import { Spacing } from "./Spacing";
import { PICKER_ICONS, ICON_MAP } from "../../utils/constants";

interface IconPickerProps {
  selected: string;
  onSelect: (icon: string) => void;
}

export function IconPicker({ selected, onSelect }: IconPickerProps) {
  return (
    <View style={styles.grid}>
      {PICKER_ICONS.map((icon) => (
        <TouchableOpacity
          key={icon}
          onPress={() => onSelect(icon)}
          style={[styles.item, selected === icon && styles.itemSelected]}
        >
          <Text style={styles.emoji}>{ICON_MAP[icon] || "⭐"}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceOverlay,
    borderRadius: 16,
    padding: Spacing.md,
  },
  item: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  itemSelected: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  emoji: { fontSize: 22 },
});
