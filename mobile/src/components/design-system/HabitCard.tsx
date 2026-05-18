import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import { Colors } from "./Colors";
import { Typography } from "./Typography";
import { BorderRadius, Spacing, MIN_TOUCH_TARGET } from "./Spacing";
import { ICON_MAP } from "../../utils/constants";

interface HabitCardProps {
  name: string;
  icon: string;
  color: string;
  targetType: "binary" | "count" | "duration" | string;
  targetValue?: number;
  log?: { status: string; value?: number } | null;
  streak?: { currentStreak: number } | null;
  subtitle?: string;
  completedLabel?: string;
  onPress: () => void;
  onLongPress?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function HabitCard({
  name,
  icon,
  color,
  targetType,
  targetValue,
  log,
  subtitle,
  completedLabel = "Bajarildi",
  onPress,
  onIncrement,
  onDecrement,
  onLongPress,
}: HabitCardProps) {
  const isCompleted = log?.status === "completed";
  const emoji = ICON_MAP[icon] || "⭐";

  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const checkScaleAnim = React.useRef(new Animated.Value(isCompleted ? 1 : 0.8)).current;

  React.useEffect(() => {
    Animated.spring(checkScaleAnim, {
      toValue: isCompleted ? 1 : 0.8,
      useNativeDriver: true,
      friction: 6,
      tension: 60,
    }).start();
  }, [isCompleted]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        isCompleted && styles.completed,
        isCompleted && { borderLeftColor: Colors.success },
        { transform: [{ scale: scaleAnim }] },
      ]}
      accessibilityRole="button"
      accessibilityState={{ checked: isCompleted }}
      accessibilityLabel={name}
    >
      <View style={[styles.iconCircle, { backgroundColor: color + "33" }]}>
        <Text style={styles.iconEmoji}>{emoji}</Text>
      </View>

      <View style={styles.center}>
        <Text
          style={[styles.name, isCompleted && styles.nameCompleted]}
          numberOfLines={2}
        >
          {name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle ||
            (isCompleted
              ? completedLabel
              : `${targetValue || ""} ${targetType === "duration" ? "daqiqa" : ""}`.trim())}
        </Text>
      </View>

      {targetType === "binary" && (
        <Animated.View
          style={[
            styles.checkCircle,
            isCompleted && styles.checkCircleCompleted,
            { transform: [{ scale: checkScaleAnim }] },
          ]}
        >
          {isCompleted ? <Text style={styles.checkmark}>✓</Text> : null}
        </Animated.View>
      )}

      {targetType === "count" && (
        <View style={styles.countContainer}>
          {onDecrement ? (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                onDecrement();
              }}
              style={styles.countBtn}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Decrease"
            >
              <Text style={styles.countBtnText}>−</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.countText}>
            {log?.value ?? 0}
            {targetValue ? `/${targetValue}` : ""}
          </Text>
          {onIncrement ? (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                onIncrement();
              }}
              style={styles.countBtn}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Increase"
            >
              <Text style={styles.countBtnText}>+</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {targetType === "duration" && (
        <Animated.View
          style={[
            styles.checkCircle,
            isCompleted && styles.checkCircleCompleted,
            { transform: [{ scale: checkScaleAnim }] },
          ]}
        >
          {isCompleted ? (
            <Text style={styles.checkmark}>✓</Text>
          ) : (
            <Text style={styles.timerIcon}>⏱</Text>
          )}
        </Animated.View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  pressed: { opacity: 0.85 },
  completed: { backgroundColor: Colors.surfaceElevated },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: { fontSize: 20 },
  center: { flex: 1, marginLeft: Spacing.md, marginRight: Spacing.sm },
  name: { ...Typography.h3, color: Colors.textPrimary },
  nameCompleted: { textDecorationLine: "line-through", opacity: 0.6 },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  checkCircle: {
    width: MIN_TOUCH_TARGET - 20,
    height: MIN_TOUCH_TARGET - 20,
    borderRadius: (MIN_TOUCH_TARGET - 20) / 2,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkmark: { color: Colors.white, fontSize: 14, fontWeight: "700" },
  timerIcon: { fontSize: 14 },
  countContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceOverlay,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 4,
    minHeight: MIN_TOUCH_TARGET - 12,
  },
  countBtn: {
    width: MIN_TOUCH_TARGET - 16,
    height: MIN_TOUCH_TARGET - 16,
    alignItems: "center",
    justifyContent: "center",
  },
  countBtnText: { color: Colors.textPrimary, fontSize: 18, fontWeight: "600" },
  countText: {
    color: Colors.primary,
    ...Typography.h3,
    paddingHorizontal: Spacing.sm,
    minWidth: 32,
    textAlign: "center",
  },
});
