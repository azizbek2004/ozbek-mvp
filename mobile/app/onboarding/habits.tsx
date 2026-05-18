import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../src/components/design-system/Colors";
import { Typography } from "../../src/components/design-system/Typography";
import {
  Spacing,
  BorderRadius,
} from "../../src/components/design-system/Spacing";
import { Button } from "../../src/components/design-system/Button";
import { HABIT_TEMPLATES, ICON_MAP } from "../../src/utils/constants";
import { useAppAuth } from "../../src/providers/AuthProvider";
import { useAuthStore } from "../../src/stores/authStore";
import { useLayout } from "../../src/hooks/useLayout";
import {
  createBatchHabits,
  updateUserProfile,
} from "../../src/services/firestoreService";

export default function OnboardingHabits() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const { isAuthenticated, user } = useAppAuth();
  const { userName } = useAuthStore();
  const { horizontalPadding, gridItemWidth, gridGap, contentMaxWidth } =
    useLayout();

  const toggle = (index: number) => {
    const next = new Set(selected);
    if (next.has(index)) next.delete(index);
    else if (next.size < 3) next.add(index);
    setSelected(next);
  };

  const handleContinue = async () => {
    if (!isAuthenticated || !user?.uid) {
      router.replace("/onboarding");
      return;
    }
    const uid = user.uid;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const selectedHabits = Array.from(selected).map((i) => {
        const tmpl = HABIT_TEMPLATES[i];
        return {
          userId: uid,
          name: tmpl.name,
          nameRu: tmpl.nameRu,
          icon: tmpl.icon,
          color: tmpl.color,
          type: tmpl.type,
          targetType: tmpl.targetType,
          targetValue:
            "targetValue" in tmpl ? (tmpl.targetValue as number) : undefined,
          frequencyType: tmpl.frequencyType,
          timeOfDay: tmpl.timeOfDay,
          sortOrder: i,
          isArchived: false,
          reminderEnabled: true,
        };
      });

      if (selectedHabits.length > 0) {
        await createBatchHabits(selectedHabits);
      }

      await updateUserProfile(uid, { isOnboarded: true });
      setOnboarded(true);
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Onboarding error:", error);
      Alert.alert(t("authError"), t("signInFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View
        style={[
          styles.inner,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: contentMaxWidth,
            alignSelf: "center",
            width: "100%",
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t("pick3Habits")}</Text>
          <Text style={styles.subtitle}>
            {userName
              ? `${userName} — ${t("pickHabitsSubtitle")}`
              : t("pickHabitsSubtitle")}
          </Text>
          <Text style={styles.counter}>{selected.size}/3</Text>
        </View>

        <ScrollView
          contentContainerStyle={[styles.grid, { gap: gridGap }]}
          showsVerticalScrollIndicator={false}
        >
          {HABIT_TEMPLATES.map((tmpl, i) => {
            const isSelected = selected.has(i);
            const disabled = !isSelected && selected.size >= 3;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => !disabled && toggle(i)}
                disabled={disabled}
                style={[
                  styles.card,
                  { width: gridItemWidth },
                  isSelected && { borderColor: tmpl.color, borderWidth: 2 },
                  disabled && styles.cardDisabled,
                ]}
              >
                {isSelected && (
                  <View
                    style={[styles.checkBadge, { backgroundColor: tmpl.color }]}
                  >
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: tmpl.color + "33" },
                  ]}
                >
                  <Text style={styles.emoji}>
                    {ICON_MAP[tmpl.icon] || "⭐"}
                  </Text>
                </View>
                <Text style={styles.cardName} numberOfLines={2}>
                  {tmpl.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.bottom}>
          <Button
            title={isSubmitting ? "..." : t("continue")}
            onPress={handleContinue}
            disabled={selected.size === 0 || isSubmitting}
            style={styles.continueBtn}
          />
          <Button
            title={t("skipForNow")}
            onPress={async () => {
              if (user?.uid) {
                try {
                  await updateUserProfile(user.uid, { isOnboarded: true });
                } catch (e) {
                  console.error(
                    "Failed to update onboarding status in Firestore:",
                    e,
                  );
                }
              }
              setOnboarded(true);
              router.replace("/(tabs)");
            }}
            variant="secondary"
            disabled={isSubmitting}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1 },
  header: { paddingTop: Spacing.base },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.base,
  },
  backIcon: { fontSize: 20, color: Colors.textPrimary },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: { ...Typography.bodySmall, color: Colors.textSecondary },
  counter: {
    ...Typography.caption,
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 160,
    paddingTop: Spacing.base,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 2,
    borderColor: "transparent",
    minHeight: 140,
    justifyContent: "center",
  },
  cardDisabled: { opacity: 0.45 },
  checkBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: { color: Colors.white, fontSize: 14, fontWeight: "700" },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  emoji: { fontSize: 24 },
  cardName: { ...Typography.h3, color: Colors.textPrimary },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.base,
    backgroundColor: Colors.background,
    gap: Spacing.sm,
  },
  continueBtn: { width: "100%" },
});
