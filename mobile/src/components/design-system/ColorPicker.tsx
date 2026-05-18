import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { HabitColors } from "./Colors";
import { Spacing } from "./Spacing";

interface ColorPickerProps {
  selected: string;
  onSelect: (color: string) => void;
}

export function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  return (
    <View style={styles.row}>
      {HabitColors.map((c) => (
        <TouchableOpacity
          key={c}
          onPress={() => onSelect(c)}
          style={[
            styles.dot,
            { backgroundColor: c },
            selected === c && styles.dotSelected,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  dot: { width: 36, height: 36, borderRadius: 18 },
  dotSelected: { borderWidth: 3, borderColor: "#FFFFFF" },
});
