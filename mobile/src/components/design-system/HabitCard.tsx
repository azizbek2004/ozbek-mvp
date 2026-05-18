import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
  PanResponder,
} from "react-native";
import { Colors } from "./Colors";
import { Typography } from "./Typography";
import { BorderRadius, Spacing, MIN_TOUCH_TARGET } from "./Spacing";
import { ICON_MAP } from "../../utils/constants";
import * as Haptics from "expo-haptics";

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
  onShield?: () => void;
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
  onShield,
  onIncrement,
  onDecrement,
  onLongPress,
}: HabitCardProps) {
  const isCompleted = log?.status === "completed";
  const isShielded = log?.status === "shielded";
  const emoji = ICON_MAP[icon] || "⭐";

  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const checkScaleAnim = React.useRef(
    new Animated.Value(isCompleted || isShielded ? 1 : 0.8),
  ).current;
  const fillAnim = React.useRef(
    new Animated.Value(isCompleted ? 1 : 0),
  ).current;
  const lastHaptic = React.useRef(0);

  const pan = React.useRef(new Animated.ValueXY()).current;
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dy) < 8;
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        const threshold = 100;
        if (gestureState.dx > threshold) {
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          ).catch(() => {});
          Animated.timing(pan.x, {
            toValue: 400,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            onPress();
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gestureState.dx < -threshold) {
          if (onShield) {
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            ).catch(() => {});
            Animated.timing(pan.x, {
              toValue: -400,
              duration: 180,
              useNativeDriver: true,
            }).start(() => {
              onShield();
              pan.setValue({ x: 0, y: 0 });
            });
          } else {
            Animated.spring(pan.x, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        } else {
          Animated.spring(pan.x, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const handlePressIn = () => {
    if (isCompleted) return;
    lastHaptic.current = 0;
    Animated.timing(fillAnim, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (isCompleted) return;
    if (lastHaptic.current < 4) {
      Animated.timing(fillAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleCirclePress = () => {
    if (isCompleted) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      onPress();
    } else if (isShielded && onShield) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      onShield();
    }
  };

  React.useEffect(() => {
    const listenerId = fillAnim.addListener(({ value }) => {
      if (isCompleted || isShielded) return;
      if (value >= 0.25 && lastHaptic.current < 1) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        lastHaptic.current = 1;
      }
      if (value >= 0.5 && lastHaptic.current < 2) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        lastHaptic.current = 2;
      }
      if (value >= 0.75 && lastHaptic.current < 3) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        lastHaptic.current = 3;
      }
      if (value >= 0.98 && lastHaptic.current < 4) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        lastHaptic.current = 4;
        onPress();
      }
    });
    return () => {
      fillAnim.removeListener(listenerId);
    };
  }, [fillAnim, isCompleted, isShielded, onPress]);

  React.useEffect(() => {
    fillAnim.setValue(isCompleted ? 1 : 0);
  }, [isCompleted, fillAnim]);

  React.useEffect(() => {
    Animated.spring(checkScaleAnim, {
      toValue: isCompleted || isShielded ? 1 : 0.8,
      useNativeDriver: true,
      friction: 6,
      tension: 60,
    }).start();
  }, [isCompleted, isShielded, checkScaleAnim]);

  const renderCheckCircle = () => {
    return (
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={(e) => {
          e.stopPropagation();
          handleCirclePress();
        }}
        style={({ pressed }) => [
          styles.checkCircle,
          {
            borderColor: isCompleted
              ? color || Colors.success
              : isShielded
                ? Colors.gold
                : (color || Colors.textSecondary) + "66",
            backgroundColor: isCompleted
              ? color || Colors.success
              : isShielded
                ? Colors.goldLight
                : "transparent",
          },
          pressed &&
            !isCompleted &&
            !isShielded && { transform: [{ scale: 0.95 }] },
        ]}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={
          isCompleted
            ? "Unmark completed"
            : isShielded
              ? "Remove rest day"
              : "Hold to complete"
        }
      >
        {/* Expanding Liquid Fill Background */}
        {!isCompleted && !isShielded && (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: color || Colors.success,
                borderRadius: 999,
                transform: [{ scale: fillAnim }],
                opacity: 0.85,
              },
            ]}
          />
        )}

        {/* Content overlay */}
        <Animated.View style={{ transform: [{ scale: checkScaleAnim }] }}>
          {isCompleted ? (
            <Text style={styles.checkmark}>✓</Text>
          ) : isShielded ? (
            <Text style={styles.checkmark}>🛡️</Text>
          ) : targetType === "duration" ? (
            <Text
              style={[styles.timerIcon, { color: color || Colors.textPrimary }]}
            >
              ⏱
            </Text>
          ) : null}
        </Animated.View>
      </Pressable>
    );
  };

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
    <View style={styles.swipeWrapper}>
      {/* Swipe Action Backdrop */}
      <View style={StyleSheet.absoluteFillObject}>
        <Animated.View
          style={[
            styles.swipeBackdrop,
            {
              backgroundColor: pan.x.interpolate({
                inputRange: [-100, 0, 100],
                outputRange: [Colors.gold, "transparent", Colors.success],
              }),
            },
          ]}
        >
          {/* Left indicator (shown when swiping right -> completing) */}
          <Animated.View
            style={[
              styles.swipeIndicatorLeft,
              {
                opacity: pan.x.interpolate({
                  inputRange: [0, 60],
                  outputRange: [0, 1],
                  extrapolate: "clamp",
                }),
              },
            ]}
          >
            <Text style={styles.swipeText}>✓ Bajarildi</Text>
          </Animated.View>

          {/* Right indicator (shown when swiping left -> shielding) */}
          <Animated.View
            style={[
              styles.swipeIndicatorRight,
              {
                opacity: pan.x.interpolate({
                  inputRange: [-60, 0],
                  outputRange: [1, 0],
                  extrapolate: "clamp",
                }),
              },
            ]}
          >
            <Text style={styles.swipeText}>🛡️ Qalqon</Text>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Main Habit Card */}
      <Animated.View
        style={[
          {
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <AnimatedPressable
          onPress={handlePress}
          onLongPress={onLongPress}
          delayLongPress={400}
          style={({ pressed }) => [
            styles.container,
            pressed && styles.pressed,
            isCompleted && styles.completed,
            isCompleted && { borderLeftColor: Colors.success },
            isShielded && { borderLeftColor: Colors.gold },
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
              style={[
                styles.name,
                isCompleted && styles.nameCompleted,
                isShielded && styles.nameShielded,
              ]}
              numberOfLines={2}
            >
              {name}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle ||
                (isCompleted
                  ? completedLabel
                  : isShielded
                    ? "Bugun qalqon faol (dam olish)"
                    : `${targetValue || ""} ${targetType === "duration" ? "daqiqa" : ""}`.trim())}
            </Text>
          </View>

          {(targetType === "binary" || targetType === "duration") &&
            renderCheckCircle()}

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
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeWrapper: {
    position: "relative",
    overflow: "hidden",
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  swipeBackdrop: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  swipeIndicatorLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  swipeIndicatorRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  swipeText: {
    color: Colors.white,
    ...Typography.h3,
    fontWeight: "700",
  },
  container: {
    minHeight: 72,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
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
  nameShielded: { opacity: 0.6 },
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
