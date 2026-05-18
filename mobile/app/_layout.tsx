import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/providers/AuthProvider";
import { AuthGate } from "../src/components/auth/AuthGate";
import { useAuthStore } from "../src/stores/authStore";
import { useHabitStore } from "../src/stores/habitStore";
import { useNetworkStatus } from "../src/hooks/useNetworkStatus";
import { useOfflineSync } from "../src/hooks/useOfflineSync";
import { Colors } from "../src/components/design-system/Colors";
import { ErrorBoundary } from "../src/components/feedback/ErrorBoundary";
import "../src/utils/i18n";

SplashScreen.preventAutoHideAsync();

function AppHooks() {
  useNetworkStatus();
  useOfflineSync();
  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [appReady, setAppReady] = useState(false);
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);
  const hydrateHabitStore = useHabitStore((s) => s.hydrate);

  useEffect(() => {
    async function prepare() {
      loadFromStorage();
      await hydrateHabitStore();
      setAppReady(true);
      if (fontsLoaded) await SplashScreen.hideAsync();
    }
    prepare();
  }, [fontsLoaded, loadFromStorage, hydrateHabitStore]);

  if (!fontsLoaded || !appReady) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <AppHooks />
          <AuthGate>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
                animation: "fade",
              }}
            >
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="habit/new"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="habit/edit"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
            </Stack>
          </AuthGate>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
