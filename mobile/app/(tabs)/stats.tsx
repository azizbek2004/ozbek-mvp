import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../src/components/design-system/Colors";
import { Typography } from "../../src/components/design-system/Typography";
import { Spacing } from "../../src/components/design-system/Spacing";
import { Card } from "../../src/components/design-system/Card";
import { ProgressRing } from "../../src/components/design-system/ProgressRing";
import { SegmentedControl } from "../../src/components/design-system/SegmentedControl";
import { Button } from "../../src/components/design-system/Button";
import { ICON_MAP } from "../../src/utils/constants";
import { useLayout } from "../../src/hooks/useLayout";
import { useAppAuth } from "../../src/providers/AuthProvider";
import {
  getWeeklyStats,
  getMonthlyStats,
  type WeeklyStats,
  type MonthlyStats,
} from "../../src/services/firestoreService";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns";

export default function StatsScreen() {
  const { t } = useTranslation();
  const [segment, setSegment] = useState(0);
  const { horizontalPadding, contentMaxWidth, tabBarHeight } = useLayout();
  const { user } = useAppAuth();

  const [weeklyData, setWeeklyData] = useState<WeeklyStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    setIsLoading(true);

    const now = new Date();
    const weekStart = format(
      startOfWeek(now, { weekStartsOn: 1 }),
      "yyyy-MM-dd",
    );
    const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");

    Promise.all([
      getWeeklyStats(user.uid, weekStart, weekEnd),
      getMonthlyStats(user.uid, now.getFullYear(), now.getMonth() + 1),
    ])
      .then(([weekly, monthly]) => {
        setWeeklyData(weekly);
        setMonthlyData(monthly);
      })
      .catch((e) => console.error("[Stats] fetch error:", e))
      .finally(() => setIsLoading(false));
  }, [user?.uid]);

  const stats = segment === 0 ? weeklyData : monthlyData;
  const dailyRates = segment === 0 ? (weeklyData?.dailyRates ?? []) : [];
  const weeklyRates = segment === 1 ? (monthlyData?.weeklyRates ?? []) : [];
  const habitBreakdown = useMemo<WeeklyStats["habitBreakdown"]>(
    () => stats?.habitBreakdown ?? [],
    [stats],
  );
  const tartibScore = stats?.tartibScore ?? 0;
  const chartData = segment === 0 ? dailyRates : weeklyRates;
  const maxRate = Math.max(...chartData.map((d) => d.rate), 1);

  const handleShare = useCallback(async () => {
    const now = new Date();
    let dateRange: string;
    if (segment === 0) {
      const ws = startOfWeek(now, { weekStartsOn: 1 });
      const we = endOfWeek(now, { weekStartsOn: 1 });
      dateRange = `${format(ws, "dd.MM")} – ${format(we, "dd.MM")}`;
    } else {
      const ms = startOfMonth(now);
      const me = endOfMonth(now);
      dateRange = `${format(ms, "dd.MM")} – ${format(me, "dd.MM")}`;
    }

    let summary = `📊 Statistikam (${segment === 0 ? "hafta" : "oy"} — ${dateRange}):\n`;
    summary += `Tartib ball: ${tartibScore}%\n\n`;

    for (const habit of habitBreakdown) {
      const emoji = ICON_MAP[habit.icon] || "⭐";
      summary += `${emoji} ${habit.name}: ${habit.completionRate}%\n`;
    }

    summary += `\nOdat ilovasi orqali ulashildi 🌟`;

    const url = `https://t.me/share/url?url=${encodeURIComponent("https://odat.app")}&text=${encodeURIComponent(summary)}`;

    try {
      const supported = await Linking.canOpenURL(
        "https://t.me/share/url?url=https://odat.app",
      );
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t("shareError"), "");
      }
    } catch {
      Alert.alert(t("shareError"), "");
    }
  }, [segment, tartibScore, habitBreakdown, t]);

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
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
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
        <Text style={styles.title}>{t("stats")}</Text>

        <SegmentedControl
          segments={[t("week"), t("month")]}
          selectedIndex={segment}
          onSelect={setSegment}
        />

        <Card style={styles.scoreCard}>
          <ProgressRing value={tartibScore} label={t("tartibScore")} />
        </Card>

        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>
            {segment === 0 ? t("weeklyActivity") : t("monthlyActivity")}
          </Text>
          {chartData.length === 0 ? (
            <Text style={styles.emptyText}>{t("notEnoughData")}</Text>
          ) : (
            <View style={styles.barChart}>
              {chartData.map((item, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${(item.rate / maxRate) * 100}%`,
                          backgroundColor:
                            item.rate >= 80 ? Colors.success : Colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel} numberOfLines={1}>
                    {"dayName" in item ? item.dayName : `${item.week}`}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card style={styles.breakdownCard}>
          <Text style={styles.sectionTitle}>{t("habitIndicators")}</Text>
          {habitBreakdown.length === 0 ? (
            <Text style={styles.emptyText}>{t("noHabitsToday")}</Text>
          ) : (
            habitBreakdown.map((habit: any) => (
              <View key={habit.habitId} style={styles.habitRow}>
                <Text style={styles.habitIcon}>
                  {ICON_MAP[habit.icon] || "⭐"}
                </Text>
                <View style={styles.habitInfo}>
                  <Text style={styles.habitName} numberOfLines={1}>
                    {habit.name}
                  </Text>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${habit.completionRate}%`,
                          backgroundColor: habit.color,
                        },
                      ]}
                    />
                  </View>
                </View>
                <Text style={[styles.habitPercent, { color: habit.color }]}>
                  {habit.completionRate}%
                </Text>
              </View>
            ))
          )}
        </Card>

        <Button
          title={t("shareViaTelegram")}
          onPress={handleShare}
          variant="secondary"
          style={styles.shareBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: {},
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginVertical: Spacing.base,
  },
  scoreCard: {
    marginTop: Spacing.base,
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  chartCard: { marginTop: Spacing.base },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  barChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 120,
    alignItems: "flex-end",
    gap: 4,
  },
  barCol: { alignItems: "center", flex: 1, minWidth: 0 },
  barTrack: {
    width: "80%",
    maxWidth: 28,
    height: 100,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: { width: "100%", borderRadius: 12, minHeight: 4 },
  barLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 6,
    fontSize: 10,
  },
  breakdownCard: { marginTop: Spacing.base },
  emptyText: {
    ...Typography.body,
    color: Colors.textTertiary,
    textAlign: "center",
    paddingVertical: Spacing.lg,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  habitIcon: { fontSize: 20 },
  habitInfo: { flex: 1, minWidth: 0 },
  habitName: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 3,
  },
  progressBarFill: { height: "100%", borderRadius: 3 },
  habitPercent: { ...Typography.h3, minWidth: 44, textAlign: "right" },
  shareBtn: { marginTop: Spacing.xl },
});
