import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Colors } from "./Colors";
import { Typography } from "./Typography";
import { Spacing } from "./Spacing";

interface DateItem {
  date: string;
  dayNumber: number;
  dayAbbr: string;
  isToday: boolean;
  hasCompletions?: boolean;
}

interface DateStripProps {
  dates: DateItem[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  weekLabel?: string;
}

export function DateStrip({
  dates,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  weekLabel,
}: DateStripProps) {
  const scrollRef = React.useRef<ScrollView>(null);

  // Auto-scroll to selected date
  React.useEffect(() => {
    if (scrollRef.current && dates.length > 0) {
      const selectedIndex = dates.findIndex((d) => d.date === selectedDate);
      if (selectedIndex >= 0) {
        scrollRef.current.scrollTo({
          x: selectedIndex * 48 - 100,
          animated: true,
        });
      }
    }
  }, [selectedDate, dates]);

  return (
    <View style={styles.wrapper}>
      {weekLabel && onPrevWeek && onNextWeek && (
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={onPrevWeek}
            style={styles.navBtn}
            accessibilityLabel="Previous week"
          >
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.weekLabel}>{weekLabel}</Text>
          <TouchableOpacity
            onPress={onNextWeek}
            style={styles.navBtn}
            accessibilityLabel="Next week"
          >
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {dates.map((item) => {
          const isSelected = item.date === selectedDate;
          const isToday = item.isToday;
          return (
            <TouchableOpacity
              key={item.date}
              onPress={() => onSelectDate(item.date)}
              style={styles.item}
              accessibilityRole="button"
              accessibilityLabel={`${item.dayAbbr} ${item.dayNumber}`}
            >
              <Text
                style={[
                  styles.dayAbbr,
                  isToday && styles.dayAbbrToday,
                  isSelected && styles.dayAbbrSelected,
                ]}
              >
                {item.dayAbbr}
              </Text>
              <View
                style={[
                  styles.circle,
                  isSelected && styles.circleSelected,
                  isToday && !isSelected && styles.circleToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayNum,
                    isSelected && styles.dayNumSelected,
                    isToday && !isSelected && styles.dayNumToday,
                  ]}
                >
                  {item.dayNumber}
                </Text>
              </View>
              {item.hasCompletions && <View style={styles.completionDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: Colors.background },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  navArrow: { color: Colors.textPrimary, fontSize: 22, fontWeight: "600" },
  weekLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  container: {
    flexDirection: "row",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  item: { alignItems: "center", width: 44 },
  dayAbbr: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dayAbbrToday: { color: Colors.primary, fontWeight: "700" },
  dayAbbrSelected: { color: Colors.white, fontWeight: "700" },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  circleSelected: { backgroundColor: Colors.primary },
  circleToday: { borderWidth: 2, borderColor: Colors.primary },
  dayNum: { ...Typography.h3, color: Colors.textSecondary },
  dayNumSelected: { color: Colors.white },
  dayNumToday: { color: Colors.primary },
  completionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginTop: 4,
  },
});
