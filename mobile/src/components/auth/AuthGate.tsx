import React, { useEffect, useRef } from "react";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAppAuth } from "../../providers/AuthProvider";
import { useAuthStore } from "../../stores/authStore";
import { Colors } from "../design-system/Colors";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAppAuth();
  const userId = useAuthStore((s) => s.userId);
  const isOnboarded = useAuthStore((s) => s.isOnboarded);
  const clearLocalSession = useAuthStore((s) => s.clearLocalSession);
  const hasDispatched = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const root = segments[0];
    const inOnboarding = root === "onboarding";
    const onHabitsStep = inOnboarding && segments.includes("habits" as any);
    const inTabs = root === "(tabs)";

    if (!isAuthenticated) {
      if (userId && !hasDispatched.current) {
        hasDispatched.current = true;
        clearLocalSession();
      }

      if (!inOnboarding || onHabitsStep) {
        router.replace("/onboarding");
      }
      return;
    }

    if (!isOnboarded) {
      if (!onHabitsStep) {
        router.replace("/onboarding/habits");
      }
      return;
    }

    if (inOnboarding || inTabs === false) {
      router.replace("/(tabs)");
    }
  }, [
    isAuthenticated,
    isLoading,
    isOnboarded,
    userId,
    segments,
    router,
    clearLocalSession,
  ]);

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
