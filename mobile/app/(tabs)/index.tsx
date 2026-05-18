import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { addWeeks, subWeeks, format } from "date-fns";
import { Colors } from "../../src/components/design-system/Colors";
import { Typography } from "../../src/components/design-system/Typography";
import { Spacing } from "../../src/components/design-system/Spacing";
import { DateStrip } from "../../src/components/design-system/DateStrip";
import { HabitCard } from "../../src/components/design-system/HabitCard";
import { EmptyState } from "../../src/components/feedback/EmptyState";
import { NetworkBanner } from "../../src/components/layout/NetworkBanner";
import { useHabitStore } from "../../src/stores/habitStore";
import { useLayout } from "../../src/hooks/useLayout";
import { useHabitsForDate } from "../../src/hooks/useHabitsForDate";
import { getWeekDates, formatUzbekDate } from "../../src/utils/date";
import { TIME_OF_DAY } from "../../src/utils/constants";
import {
  SlideUp,
  FadeIn,
} from "../../src/components/design-system/AnimatedComponents";
import { impactLight, notificationSuccess } from "../../src/utils/haptics";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { selectedDate, setSelectedDate } = useHabitStore();
  const { horizontalPadding, contentMaxWidth, tabBarHeight } = useLayout();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDates = useMemo(() => {
    const baseDate =
      weekOffset === 0
        ? new Date()
        : weekOffset > 0
          ? addWeeks(new Date(), weekOffset)
          : subWeeks(new Date(), Math.abs(weekOffset));
    return getWeekDates(baseDate);
  }, [weekOffset]);

  const todayFormatted = formatUzbekDate(new Date());

  const {
    habits,
    isLoading,
    toggleHabit,
    shieldHabit,
    incrementHabit,
    refresh,
    remoteError,
  } = useHabitsForDate(selectedDate);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const bestStreak = habits.reduce(
    (max, h) => Math.max(max, h.streak?.currentStreak ?? 0),
    0,
  );

  const grouped = useMemo(() => {
    const groups: Record<string, typeof habits> = {
      morning: [],
      afternoon: [],
      evening: [],
      all_day: [],
    };
    habits.forEach((h) => {
      const key = h.timeOfDay || "all_day";
      if (groups[key]) groups[key].push(h);
    });
    return Object.entries(groups).filter(([, items]) => items.length > 0);
  }, [habits]);

  const handleToggle = useCallback(
    async (habitId: string) => {
      impactLight();
      await toggleHabit(habitId);
      notificationSuccess();
    },
    [toggleHabit],
  );

  const handleShield = useCallback(
    async (habitId: string) => {
      impactLight();
      await shieldHabit(habitId);
      notificationSuccess();
    },
    [shieldHabit],
  );

  const handleIncrement = useCallback(
    async (habitId: string, delta: number) => {
      impactLight();
      await incrementHabit(habitId, delta);
    },
    [incrementHabit],
  );

  const handleLongPress = useCallback(
    (habit: {
      _id: string;
      name: string;
      icon: string;
      color: string;
      targetType: string;
      targetValue?: number;
      timeOfDay: string;
      frequencyType: string;
    }) => {
      impactLight();
      Alert.alert(habit.name, t("habitActions"), [
        {
          text: t("edit"),
          onPress: () => {
            const params = new URLSearchParams({
              habitId: habit._id,
              name: habit.name,
              icon: habit.icon,
              color: habit.color,
              targetType: habit.targetType,
              targetValue: String(habit.targetValue ?? ""),
              frequency: habit.frequencyType || "daily",
              timeOfDay: habit.timeOfDay || "morning",
            });
            router.push(`/habit/edit?${params.toString()}` as any);
          },
        },
        { text: t("cancel"), style: "cancel" },
      ]);
    },
    [router, t],
  );

  const weekLabel = useMemo(() => {
    if (weekDates.length === 0) return "";
    const start = weekDates[0].date;
    const end = weekDates[weekDates.length - 1].date;
    const fmt = (d: string) => {
      const parts = d.split("-");
      return `${parseInt(parts[2], 10)}.${parseInt(parts[1], 10)}`;
    };
    return `${fmt(start)} – ${fmt(end)}`;
  }, [weekDates]);

  const handlePrevWeek = useCallback(() => {
    setWeekOffset((prev) => prev - 1);
  }, []);

  const handleNextWeek = useCallback(() => {
    setWeekOffset((prev) => Math.min(prev + 1, 4)); // Limit forward navigation
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <NetworkBanner />

      <FadeIn>
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: horizontalPadding,
              maxWidth: contentMaxWidth,
              alignSelf: "center",
              width: "100%",
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              impactLight();
              router.push("/(tabs)/profile");
            }}
            style={styles.headerBtn}
            accessibilityLabel={t("profile")}
          >
            <Text style={styles.headerIcon}>⚙️</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t("today")}</Text>
            <Text style={styles.headerDate}>{todayFormatted}</Text>
          </View>
          <TouchableOpacity
            style={styles.streakBadge}
            accessibilityLabel={t("bestStreak") + ": " + bestStreak}
            accessibilityRole="text"
          >
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakCount}>{bestStreak}</Text>
          </TouchableOpacity>
        </View>
      </FadeIn>

      <DateStrip
        dates={weekDates}
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          impactLight();
          setSelectedDate(date);
        }}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        weekLabel={weekLabel}
      />

      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: tabBarHeight + Spacing.lg,
            maxWidth: contentMaxWidth,
            alignSelf: "center",
            width: "100%",
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {grouped.length === 0 ? (
          <SlideUp delay={100}>
            <EmptyState
              icon="🧘"
              title={t("noHabitsToday")}
              subtitle={t("noHabitsSubtitle")}
              actionLabel={t("addFirstHabit")}
              onAction={() => {
                impactLight();
                router.push("/habit/new");
              }}
            />
          </SlideUp>
        ) : (
          grouped.map(([timeKey, items]) => {
            const config = TIME_OF_DAY[timeKey as keyof typeof TIME_OF_DAY];
            return (
              <SlideUp key={timeKey} delay={50}>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEmoji}>
                      {config?.icon || "🕐"}
                    </Text>
                    <Text style={styles.sectionTitle}>
                      {config?.labelUz || timeKey}
                    </Text>
                    {config?.range ? (
                      <Text style={styles.sectionRange}>{config.range}</Text>
                    ) : null}
                    <Text style={styles.sectionCount}>{items.length} ta</Text>
                  </View>
                  {items.map((habit) => (
                    <HabitCard
                      key={habit._id}
                      name={habit.name}
                      icon={habit.icon}
                      color={habit.color}
                      targetType={habit.targetType}
                      targetValue={habit.targetValue}
                      log={habit.log}
                      streak={habit.streak}
                      completedLabel={t("completed")}
                      subtitle={
                        habit.targetType === "duration"
                          ? `${habit.targetValue || 0} ${t("minutes")}`
                          : habit.targetType === "count"
                            ? `${habit.log?.value ?? 0}/${habit.targetValue} ${habit.name === "Suv ichish" ? t("glasses") : ""}`
                            : undefined
                      }
                      onPress={() => void handleToggle(habit._id)}
                      onShield={() => void handleShield(habit._id)}
                      onLongPress={() => handleLongPress(habit)}
                      onIncrement={
                        habit.targetType === "count"
                          ? () => void handleIncrement(habit._id, 1)
                          : undefined
                      }
                      onDecrement={
                        habit.targetType === "count"
                          ? () => void handleIncrement(habit._id, -1)
                          : undefined
                      }
                    />
                  ))}
                </View>
              </SlideUp>
            );
          })
        )}

        {remoteError ? (
          <FadeIn delay={200}>
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {remoteError}</Text>
            </View>
          </FadeIn>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  headerBtn: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: { fontSize: 22 },
  headerCenter: { alignItems: "center", flex: 1 },
  headerTitle: { ...Typography.h1, color: Colors.textPrimary },
  headerDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakIcon: { fontSize: 16, marginRight: 4 },
  streakCount: { ...Typography.h3, color: Colors.warning },
  scroll: { flex: 1 },
  scrollContent: {},
  section: { marginTop: Spacing.lg },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
    flexWrap: "wrap",
  },
  sectionEmoji: { fontSize: 16 },
  sectionTitle: { ...Typography.h2, color: Colors.textPrimary },
  sectionRange: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },
  sectionCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: "auto",
  },
  errorBanner: {
    backgroundColor: Colors.dangerLight,
    padding: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.base,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    textAlign: "center",
  },
});
