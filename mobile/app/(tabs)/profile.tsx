import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../src/components/design-system/Colors";
import { Typography } from "../../src/components/design-system/Typography";
import { Spacing } from "../../src/components/design-system/Spacing";
import { Card } from "../../src/components/design-system/Card";
import { Toggle } from "../../src/components/design-system/Toggle";
import { useAppAuth } from "../../src/providers/AuthProvider";
import { useAuthStore } from "../../src/stores/authStore";
import { clearUserData } from "../../src/db/sqlite";
import { clearSyncQueue } from "../../src/db/sqlite";
import { useLayout } from "../../src/hooks/useLayout";
import { APP_VERSION } from "../../src/utils/constants";
import i18n from "../../src/utils/i18n";
import {
  getUser,
  updateUserProfile,
  deleteUserAccount,
  type FireUser,
} from "../../src/services/firestoreService";

interface SettingsRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  right,
  danger,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && !right}
      style={styles.settingsRow}
      accessibilityRole={onPress ? "button" : undefined}
    >
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, danger && styles.rowDanger]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? (
          <Text style={styles.rowValue} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {right}
        {onPress && !right ? <Text style={styles.rowArrow}>›</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { clearLocalSession, userId, userName, userEmail, userAvatar } =
    useAuthStore();
  const { user, signOut } = useAppAuth();
  const { horizontalPadding, contentMaxWidth, tabBarHeight } = useLayout();
  const [fireUser, setFireUser] = useState<FireUser | null>(null);

  useEffect(() => {
    if (user?.uid) {
      getUser(user.uid)
        .then(setFireUser)
        .catch((e) => console.error("[Profile] fetch error:", e));
    }
  }, [user?.uid]);

  const displayName = fireUser?.name ?? userName ?? "Foydalanuvchi";
  const displayEmail = fireUser?.email ?? userEmail ?? "";
  const avatarUrl = fireUser?.image ?? userAvatar;

  const currentLang = i18n.language;
  const langLabel =
    currentLang === "uz"
      ? "O'zbek"
      : currentLang === "ru"
        ? "Русский"
        : "English";

  const handleLanguageChange = async () => {
    const next =
      currentLang === "uz" ? "ru" : currentLang === "ru" ? "en" : "uz";
    i18n.changeLanguage(next);
    if (user?.uid) {
      try {
        await updateUserProfile(user.uid, { language: next });
      } catch (error) {
        console.error("Language update error:", error);
      }
    }
  };

  const handleSignOut = () => {
    Alert.alert(t("signOut"), "", [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("signOut"),
        style: "destructive",
        onPress: async () => {
          if (userId) await clearUserData(userId);
          await clearSyncQueue();
          await signOut();
          clearLocalSession();
          router.replace("/onboarding");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(t("deleteAccount"), "", [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            if (user?.uid) {
              await deleteUserAccount(user.uid);
            }
            if (userId) await clearUserData(userId);
            await clearSyncQueue();
            await signOut();
            clearLocalSession();
            router.replace("/onboarding");
          } catch (error) {
            console.error("Delete account error:", error);
            Alert.alert(t("authError"), t("signInFailed"));
          }
        },
      },
    ]);
  };

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
        <Text style={styles.title}>{t("profile")}</Text>

        <Card style={styles.userCard}>
          <View style={styles.avatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {(displayName || "U")[0].toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {displayEmail}
            </Text>
            {fireUser ? (
              <Text style={styles.userStats}>
                🔥 {fireUser.reminderEnabled ? "🔔" : "🔕"} • ⭐{" "}
                {user?.uid?.slice(0, 8)}...
              </Text>
            ) : null}
          </View>
        </Card>

        <Text style={styles.sectionTitle}>{t("settings").toUpperCase()}</Text>
        <Card>
          <SettingsRow
            icon="🌐"
            label={t("language")}
            value={langLabel}
            onPress={handleLanguageChange}
          />
          <View style={styles.divider} />
          <SettingsRow icon="🌙" label={t("theme")} value={t("darkTheme")} />
          <View style={styles.divider} />
          <SettingsRow
            icon="🔔"
            label={t("notifications")}
            right={
              <Toggle
                value={fireUser?.reminderEnabled ?? true}
                onToggle={() => {}}
              />
            }
          />
        </Card>

        <Text style={styles.sectionTitle}>{t("data").toUpperCase()}</Text>
        <Card>
          <SettingsRow icon="📦" label={t("exportData")} onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsRow
            icon="🗑️"
            label={t("deleteAccount")}
            onPress={handleDeleteAccount}
            danger
          />
        </Card>

        <Text style={styles.sectionTitle}>{t("aboutApp").toUpperCase()}</Text>
        <Card>
          <SettingsRow icon="❓" label={t("helpCenter")} onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsRow icon="📄" label={t("terms")} onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsRow icon="🔒" label={t("privacy")} onPress={() => {}} />
        </Card>

        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>{t("signOut")}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>
          {t("appName")} v{APP_VERSION}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: {},
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginVertical: Spacing.base,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: { width: 64, height: 64 },
  avatarText: { ...Typography.h1, color: Colors.primary },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { ...Typography.h2, color: Colors.textPrimary },
  userEmail: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userStats: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    letterSpacing: 1,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  rowIcon: { fontSize: 18, marginRight: Spacing.md },
  rowLabel: { ...Typography.body, color: Colors.textPrimary, flex: 1 },
  rowDanger: { color: Colors.danger },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    maxWidth: "50%",
  },
  rowValue: { ...Typography.bodySmall, color: Colors.textSecondary },
  rowArrow: { color: Colors.textTertiary, fontSize: 22 },
  divider: { height: 1, backgroundColor: Colors.divider },
  signOutBtn: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    marginTop: Spacing.xl,
  },
  signOutText: { ...Typography.body, color: Colors.danger },
  version: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: "center",
    marginTop: Spacing.base,
  },
});
