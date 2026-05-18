import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../src/components/design-system/Colors";
import { Typography } from "../../src/components/design-system/Typography";
import { Spacing } from "../../src/components/design-system/Spacing";
import { useAuthStore } from "../../src/stores/authStore";
import { useLayout } from "../../src/hooks/useLayout";
import { useAppAuth } from "../../src/providers/AuthProvider";
import {
  syncUser,
  checkIsUserOnboarded,
  updateUserProfile,
} from "../../src/services/firestoreService";
import { isAuthConfigured } from "../../src/lib/env";
import { getFirebaseAuth } from "../../src/lib/firebase";
import i18n from "../../src/utils/i18n";

export default function OnboardingWelcome() {
  const router = useRouter();
  const { t } = useTranslation();
  const [lang, setLang] = useState<"uz" | "ru">("uz");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { signIn } = useAppAuth();
  const { setProfile, setOnboarded } = useAuthStore();
  const { horizontalPadding, contentMaxWidth, isTablet } = useLayout();

  const toggleLang = (newLang: "uz" | "ru") => {
    setLang(newLang);
    i18n.changeLanguage(newLang);
  };

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);

    try {
      if (!isAuthConfigured()) {
        Alert.alert(t("authError"), t("googleNotConfigured"));
        setIsSigningIn(false);
        return;
      }

      await signIn();

      const fbUser = getFirebaseAuth().currentUser;
      if (!fbUser) {
        throw new Error("USER_PROFILE_MISSING");
      }

      // Check Firestore to see if this is an existing onboarded user
      const wasOnboarded = await checkIsUserOnboarded(fbUser.uid);

      await syncUser({
        userId: fbUser.uid,
        email: fbUser.email ?? "",
        name: fbUser.displayName ?? "User",
        image: fbUser.photoURL ?? undefined,
        language: lang,
      });

      setProfile({
        userId: fbUser.uid,
        userName: fbUser.displayName ?? "User",
        userEmail: fbUser.email ?? "",
        userAvatar: fbUser.photoURL ?? undefined,
      });

      if (wasOnboarded) {
        setOnboarded(true);
        // Ensure flag is persisted in their Firestore profile as well
        await updateUserProfile(fbUser.uid, { isOnboarded: true });
        router.replace("/(tabs)");
      } else {
        router.push("/onboarding/habits");
      }
    } catch (error) {
      const code = error instanceof Error ? error.message : "UNKNOWN";
      if (code === "USER_CANCELLED") {
        setIsSigningIn(false);
        return;
      }
      Alert.alert(t("authError"), t("signInFailed"));
      console.error("Google sign-in error:", error);
      setIsSigningIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: contentMaxWidth,
            alignSelf: "center",
            width: "100%",
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoCheck}>✓</Text>
          </View>
          <Text style={styles.appName}>{t("appName")}</Text>
          <Text style={[styles.tagline, isTablet && styles.taglineTablet]}>
            {t("tagline")}
          </Text>
          <Text style={styles.subtitle}>{t("subtitle")}</Text>
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={!isAuthConfigured() || isSigningIn}
            style={[
              styles.googleBtn,
              (!isAuthConfigured() || isSigningIn) && styles.googleBtnDisabled,
            ]}
            activeOpacity={0.85}
          >
            {isSigningIn ? (
              <ActivityIndicator color={Colors.textPrimary} />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleBtnText}>
                  {t("signInWithGoogle")}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.gmailHint}>{t("gmailRequiredHint")}</Text>
          <View style={styles.langRow}>
            <Text style={styles.langLabel}>{t("changeLanguage")}:</Text>
            <TouchableOpacity onPress={() => toggleLang("uz")}>
              <Text
                style={[styles.langOption, lang === "uz" && styles.langActive]}
              >
                🇺🇿 O'zbek
              </Text>
            </TouchableOpacity>
            <Text style={styles.langDivider}>|</Text>
            <TouchableOpacity onPress={() => toggleLang("ru")}>
              <Text
                style={[styles.langOption, lang === "ru" && styles.langActive]}
              >
                🇷🇺 Русский
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: "space-between", minHeight: "100%" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.xxxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  logoCheck: { fontSize: 36, color: Colors.primary },
  appName: {
    ...Typography.display,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  taglineTablet: { fontSize: 28 },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
    maxWidth: 400,
  },
  dots: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.xxl },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceOverlay,
  },
  dotActive: { width: 24, backgroundColor: Colors.primary },
  bottom: { paddingBottom: Spacing.xxl, gap: Spacing.md },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    minHeight: 52,
  },
  googleBtnDisabled: { opacity: 0.6 },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    color: "#4285F4",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "700",
  },
  googleBtnText: { ...Typography.button, color: Colors.textPrimary },
  gmailHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: "center",
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  langLabel: { ...Typography.caption, color: Colors.textTertiary },
  langOption: { ...Typography.bodySmall, color: Colors.textSecondary },
  langActive: { color: Colors.textPrimary, fontWeight: "600" },
  langDivider: { color: Colors.textTertiary },
});
