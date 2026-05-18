import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors } from "./Colors";
import { Typography } from "./Typography";

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
}

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  label = "TARTIB",
  color = Colors.success,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.surfaceElevated}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.value}>
          {Math.round(value)}
          <Text style={styles.percent}>%</Text>
        </Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  svg: { position: "absolute" },
  center: { alignItems: "center" },
  value: { ...Typography.statNumber, color: Colors.textPrimary },
  percent: { fontSize: 20 },
  label: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
});
