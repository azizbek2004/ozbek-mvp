import React from "react";
import { Tabs } from "expo-router";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { ICON_MAP } from "../../src/utils/constants";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../src/components/design-system/Colors";
import { Typography } from "../../src/components/design-system/Typography";
import { useTranslation } from "react-i18next";
import { useLayout } from "../../src/hooks/useLayout";

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={[styles.tabIcon, { color }]}>{emoji}</Text>;
}

export default function TabLayout() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isTablet } = useLayout();
  const tabBarHeight = 56 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: Math.max(insets.bottom, 8),
            maxWidth: isTablet ? 560 : undefined,
            alignSelf: isTablet ? "center" : undefined,
            width: isTablet ? "100%" : undefined,
          },
        ],
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),
          tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t("stats"),
          tabBarIcon: ({ color }) => <TabIcon emoji="📊" color={color} />,
        }}
      />
      <Tabs.Screen
        name="fab"
        options={{
          title: "",
          tabBarButton: (props) => {
            const { delayLongPress, ...rest } = props as any;
            return (
              <TouchableOpacity
                {...rest}
                delayLongPress={delayLongPress ?? undefined}
                style={[styles.fab, props.style]}
                accessibilityRole="button"
                accessibilityLabel={t("newHabit")}
              >
                <Text style={styles.fabIcon}>+</Text>
              </TouchableOpacity>
            );
          },
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/habit/new");
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("profile"),
          tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { height: -2, width: 0 },
      },
      android: { elevation: 8 },
    }),
  },
  tabLabel: { ...Typography.caption, marginTop: 2 },
  tabIcon: { fontSize: 22 },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: "700",
    marginTop: -2,
  },
});
