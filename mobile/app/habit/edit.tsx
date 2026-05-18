import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLayout } from "../../src/hooks/useLayout";
import { Colors } from "../../src/components/design-system/Colors";
import { Typography } from "../../src/components/design-system/Typography";
import {
  Spacing,
  BorderRadius,
} from "../../src/components/design-system/Spacing";
import { Button } from "../../src/components/design-system/Button";
import { IconPicker } from "../../src/components/design-system/IconPicker";
import { ColorPicker } from "../../src/components/design-system/ColorPicker";
import {
  FREQUENCY_OPTIONS,
  TIME_OF_DAY,
  TARGET_TYPE_OPTIONS,
} from "../../src/utils/constants";
import { useAppAuth } from "../../src/providers/AuthProvider";
import { useHabitStore } from "../../src/stores/habitStore";
import {
  updateHabit,
  deleteHabit as deleteHabitRemote,
} from "../../src/services/firestoreService";
import {
  updateLocalHabit,
  deleteLocalHabit,
} from "../../src/db/habitRepository";
import { useAuthStore } from "../../src/stores/authStore";

export default function EditHabitModal() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAppAuth();
  const userId = useAuthStore((s) => s.userId);
  const triggerRefetch = useHabitStore((s) => s.triggerRefetch);
  const { horizontalPadding, contentMaxWidth } = useLayout();

  const params = useLocalSearchParams<{
    habitId: string;
    name: string;
    icon: string;
    color: string;
    targetType: string;
    targetValue: string;
    frequency: string;
    timeOfDay: string;
  }>();

  const [name, setName] = useState(params.name || "");
  const [icon, setIcon] = useState(params.icon || "book-open");
  const [color, setColor] = useState(params.color || "#0A84FF");
  const [frequency, setFrequency] = useState(params.frequency || "daily");
  const [timeOfDay, setTimeOfDay] = useState(params.timeOfDay || "morning");
  const [targetType, setTargetType] = useState<"binary" | "count" | "duration">(
    (params.targetType as "binary" | "count" | "duration") || "binary",
  );
  const [targetValue, setTargetValue] = useState(params.targetValue || "1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    const effectiveUserId = user?.uid || userId;
    if (!name.trim() || isSubmitting || !effectiveUserId || !params.habitId) return;
    setIsSubmitting(true);

    try {
      const updatedValue = targetType !== "binary"
        ? Math.max(1, parseInt(targetValue, 10) || 1)
        : undefined;

      // Update locally first and enqueue
      await updateLocalHabit(effectiveUserId, params.habitId, {
        name: name.trim(),
        icon,
        color,
        targetType,
        targetValue: updatedValue,
        frequencyType: frequency,
        timeOfDay,
      });

      triggerRefetch();
      router.back();

      // Trigger remote sync in the background
      if (user?.uid) {
        updateHabit(params.habitId, {
          name: name.trim(),
          icon,
          color,
          targetType,
          targetValue: updatedValue,
          frequencyType: frequency,
          timeOfDay,
        }).catch((err) => {
          console.warn("[offline-first] remote update delayed, queued in SQLite:", err);
        });
      }
    } catch (error) {
      console.error("Update habit error:", error);
      Alert.alert(t("authError"), t("signInFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(t("deleteHabit"), t("deleteHabitConfirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          const effectiveUserId = user?.uid || userId;
          if (!params.habitId || !effectiveUserId) return;
          setIsDeleting(true);
          try {
            // Delete locally first and enqueue delete operation
            await deleteLocalHabit(effectiveUserId, params.habitId);
            
            triggerRefetch();
            router.back();

            // Trigger remote delete in the background
            if (user?.uid) {
              deleteHabitRemote(params.habitId).catch((err) => {
                console.warn("[offline-first] remote delete delayed, queued in SQLite:", err);
              });
            }
          } catch (error) {
            console.error("Delete habit error:", error);
            Alert.alert(t("authError"), t("signInFailed"));
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[
          styles.flex,
          { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" },
        ]}
      >
        <View style={styles.handleBar} />
        <View style={styles.header}>
          <Text style={styles.title}>{t("editHabit")}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>{t("name")}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t("habitNamePlaceholder")}
            placeholderTextColor={Colors.textTertiary}
            style={styles.input}
          />

          <Text style={styles.label}>{t("icon")}</Text>
          <IconPicker selected={icon} onSelect={setIcon} />

          <Text style={styles.label}>{t("color")}</Text>
          <ColorPicker selected={color} onSelect={setColor} />

          <Text style={styles.label}>{t("targetType")}</Text>
          <View style={styles.chipRow}>
            {TARGET_TYPE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() =>
                  setTargetType(opt.key as "binary" | "count" | "duration")
                }
                style={[
                  styles.chip,
                  targetType === opt.key && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    targetType === opt.key && styles.chipTextActive,
                  ]}
                >
                  {t(opt.i18nKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {targetType !== "binary" && (
            <>
              <Text style={styles.label}>{t("targetValue")}</Text>
              <TextInput
                value={targetValue}
                onChangeText={(v) => {
                  const cleaned = v.replace(/[^0-9]/g, "");
                  const num = parseInt(cleaned, 10);
                  if (cleaned === "") setTargetValue("");
                  else if (num >= 1) setTargetValue(String(num));
                  else if (num === 0) setTargetValue("");
                }}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor={Colors.textTertiary}
                style={styles.input}
              />
            </>
          )}

          <Text style={styles.label}>{t("frequency")}</Text>
          <View style={styles.chipRow}>
            {FREQUENCY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setFrequency(opt.key)}
                style={[
                  styles.chip,
                  frequency === opt.key && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    frequency === opt.key && styles.chipTextActive,
                  ]}
                >
                  {opt.labelUz}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{t("timeOfDay")}</Text>
          <View style={styles.chipRow}>
            {Object.values(TIME_OF_DAY).map((tod) => (
              <TouchableOpacity
                key={tod.key}
                onPress={() => setTimeOfDay(tod.key)}
                style={[
                  styles.chip,
                  timeOfDay === tod.key && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    timeOfDay === tod.key && styles.chipTextActive,
                  ]}
                >
                  {tod.labelUz}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={[styles.bottom, { paddingHorizontal: horizontalPadding }]}>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteBtn}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={Colors.danger} />
            ) : (
              <Text style={styles.deleteText}>{t("deleteHabit")}</Text>
            )}
          </TouchableOpacity>
          <Button
            title={isSubmitting ? "..." : t("save")}
            onPress={handleSave}
            disabled={!name.trim() || isSubmitting}
            style={styles.saveBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  flex: { flex: 1 },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceOverlay,
    alignSelf: "center",
    marginTop: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  title: { ...Typography.h2, color: Colors.textPrimary },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceOverlay,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: { color: Colors.textSecondary, fontSize: 16 },
  scroll: { flex: 1, paddingHorizontal: Spacing.base },
  label: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  input: {
    height: 52,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipText: { ...Typography.bodySmall, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: "600" },
  bottom: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  saveBtn: { width: "100%" },
  deleteBtn: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  deleteText: {
    ...Typography.body,
    color: Colors.danger,
    fontWeight: "600",
  },
});
